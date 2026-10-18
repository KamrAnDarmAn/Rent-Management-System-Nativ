import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { MAX_BACKUP_BYTES } from "../domain/backup";

export async function saveBackupFile(contents: string, filename: string) {
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(
      new Blob([contents], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  // Store a durable copy even when the share sheet is dismissed.
  const file = new File(Paths.document, filename);
  file.create({ overwrite: true });
  file.write(contents);
  if ((await file.text()) !== contents)
    throw new Error("The backup could not be verified. Please try again.");
  if (await Sharing.isAvailableAsync())
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      UTI: "public.json",
      dialogTitle: "GMM Backup",
    });
}
export async function pickBackupFile(): Promise<{
  name: string;
  contents: string;
} | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory: true,
    multiple: false,
    base64: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if ((asset.size ?? 0) > MAX_BACKUP_BYTES)
    throw new Error("The backup file is too large.");
  const contents =
    Platform.OS === "web" && asset.file
      ? await asset.file.text()
      : await new File(asset.uri).text();
  if (contents.length > MAX_BACKUP_BYTES)
    throw new Error("The backup file is too large.");
  return { name: asset.name, contents };
}
