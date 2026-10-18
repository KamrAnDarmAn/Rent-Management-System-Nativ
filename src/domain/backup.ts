import { gcm } from "@noble/ciphers/aes";
import { pbkdf2Async } from "@noble/hashes/pbkdf2";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/hashes/utils";
import { validateLedger } from "./ledgerValidation";
import type { LedgerData } from "../types/ledger";

export type BackupPreferences = {
  language: "en" | "ps";
  theme: "light" | "dark" | "system";
  rentViewCalendar: "gregorian" | "shamsi";
  reminders: boolean;
  reminderDay: number;
};
export type BackupPayload = {
  format: "GMM_BACKUP";
  version: 1;
  createdAt: string;
  data: LedgerData;
  preferences: BackupPreferences;
};
const ITERATIONS = 210000;
export const MAX_BACKUP_BYTES = 20 * 1024 * 1024;
const invalid = () =>
  new Error("This is not a valid GMM backup, or the file is damaged.");
export function backupPayload(
  data: LedgerData,
  preferences: BackupPreferences,
): BackupPayload {
  return {
    format: "GMM_BACKUP",
    version: 1,
    createdAt: new Date().toISOString(),
    data: validateLedger(data),
    preferences,
  };
}
export function validateBackup(value: unknown): BackupPayload {
  if (!value || typeof value !== "object") throw invalid();
  const p = value as BackupPayload;
  if (
    p.format !== "GMM_BACKUP" ||
    p.version !== 1 ||
    typeof p.createdAt !== "string" ||
    !Number.isFinite(Date.parse(p.createdAt))
  )
    throw invalid();
  const s = p.preferences;
  if (
    !s ||
    !["en", "ps"].includes(s.language) ||
    !["light", "dark", "system"].includes(s.theme) ||
    !["gregorian", "shamsi"].includes(s.rentViewCalendar) ||
    typeof s.reminders !== "boolean" ||
    !Number.isInteger(s.reminderDay) ||
    s.reminderDay < 1 ||
    s.reminderDay > 28
  )
    throw invalid();
  return {
    format: "GMM_BACKUP",
    version: 1,
    createdAt: p.createdAt,
    data: validateLedger(p.data),
    preferences: {
      language: s.language,
      theme: s.theme,
      rentViewCalendar: s.rentViewCalendar,
      reminders: s.reminders,
      reminderDay: s.reminderDay,
    },
  };
}
export async function encodeBackup(
  payload: BackupPayload,
  password = "",
  randomBytes?: (size: number) => Uint8Array,
): Promise<string> {
  const text = JSON.stringify(validateBackup(payload));
  const data = utf8ToBytes(text);
  if (!password)
    return fileEnvelope({
      format: "GMM_BACKUP_FILE",
      version: 1,
      encrypted: false,
      checksum: bytesToHex(sha256(data)),
      payload: text,
    });
  if (password.length < 10)
    throw new Error("Use a backup password with at least 10 characters.");
  if (!randomBytes) throw invalid();
  const salt = randomBytes(16),
    iv = randomBytes(12);
  const key = await pbkdf2Async(sha256, utf8ToBytes(password), salt, {
    c: ITERATIONS,
    dkLen: 32,
    asyncTick: 10,
  });
  try {
    const encrypted = gcm(key, iv).encrypt(data);
    return fileEnvelope({
      format: "GMM_BACKUP_FILE",
      version: 1,
      encrypted: true,
      kdf: "PBKDF2-SHA256",
      iterations: ITERATIONS,
      salt: bytesToHex(salt),
      iv: bytesToHex(iv),
      payload: bytesToHex(encrypted),
    });
  } finally {
    key.fill(0);
  }
}
export async function decodeBackup(
  file: string,
  password = "",
): Promise<BackupPayload> {
  if (
    file.length > MAX_BACKUP_BYTES ||
    utf8ToBytes(file).length > MAX_BACKUP_BYTES
  )
    throw invalid();
  try {
    const envelope = JSON.parse(file);
    if (
      envelope.format !== "GMM_BACKUP_FILE" ||
      envelope.version !== 1 ||
      typeof envelope.payload !== "string"
    )
      throw invalid();
    let text: string;
    if (envelope.encrypted === true) {
      if (!password) throw new Error("Enter the password for this backup.");
      if (
        envelope.kdf !== "PBKDF2-SHA256" ||
        envelope.iterations !== ITERATIONS ||
        !/^[a-f0-9]{32}$/.test(envelope.salt) ||
        !/^[a-f0-9]{24}$/.test(envelope.iv)
      )
        throw invalid();
      const key = await pbkdf2Async(
        sha256,
        utf8ToBytes(password),
        hexToBytes(envelope.salt),
        { c: ITERATIONS, dkLen: 32, asyncTick: 10 },
      );
      try {
        text = new TextDecoder().decode(
          gcm(key, hexToBytes(envelope.iv)).decrypt(
            hexToBytes(envelope.payload),
          ),
        );
      } catch {
        throw new Error("The password is incorrect, or the backup is damaged.");
      } finally {
        key.fill(0);
      }
    } else if (envelope.encrypted === false) {
      text = envelope.payload;
      if (bytesToHex(sha256(utf8ToBytes(text))) !== envelope.checksum)
        throw invalid();
    } else throw invalid();
    return validateBackup(JSON.parse(text));
  } catch (error) {
    if (
      error instanceof Error &&
      [
        "Enter the password for this backup.",
        "The password is incorrect, or the backup is damaged.",
      ].includes(error.message)
    )
      throw error;
    throw invalid();
  }
}

function fileEnvelope(value: object) {
  const file = JSON.stringify(value);
  if (utf8ToBytes(file).length > MAX_BACKUP_BYTES)
    throw new Error("The backup file is too large.");
  return file;
}
