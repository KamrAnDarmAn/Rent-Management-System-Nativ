import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.PREVIEW_URL || "http://localhost:8087";
const output = path.resolve("artifacts/visual");
await mkdir(output, { recursive: true });
const registry = await readFile("src/data/screenReferences.ts", "utf8");
const screens = [
  ...registry.matchAll(
    /id:\s*["']([^"']+)["'],\s*title:\s*["']([^"']+)["'],\s*file:\s*["']([^"']+)["']/g,
  ),
].map(([, id, title, file]) => ({ id, title, file }));
if (screens.length !== 31)
  throw new Error(`Expected 31 reference designs, found ${screens.length}`);
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const results = [];
try {
  for (const screen of screens) {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      colorScheme: "light",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        /Element type is invalid|Uncaught|Error:/.test(message.text())
      )
        errors.push(message.text());
    });
    try {
      await page.goto(`${baseURL}/?screen=${screen.id}`, {
        waitUntil: "domcontentloaded",
        timeout: 120000,
      });
      await page.waitForFunction(
        () => (document.body.textContent || "").trim().length > 30,
        { timeout: 90000 },
      );
      await page.evaluate(() => document.fonts.ready);
      if (screen.id !== "splash")
        await page
          .getByTestId("screen-scroll")
          .first()
          .waitFor({ state: "visible" });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(output, `${screen.id}.png`) });
      const body = await page.locator("body").innerText();
      if (/Uncaught Error|Unable to resolve module|Bundling failed/.test(body))
        errors.push(body.slice(0, 500));
      if (body.includes("minified React error")) errors.push(body);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      if (overflow) errors.push("Horizontal document overflow");
      await page.getByTestId("screen-scroll").evaluateAll((nodes) =>
        nodes.forEach((n) => {
          n.scrollTop = n.scrollHeight;
        }),
      );
      await page.screenshot({
        path: path.join(output, `${screen.id}-bottom.png`),
      });
      results.push({ ...screen, errors, textLength: body.length });
      console.log(
        `${errors.length ? "FAIL" : "PASS"} ${screen.id}${errors.length ? `: ${errors.join("; ")}` : ""}`,
      );
    } catch (error) {
      results.push({ ...screen, errors: [String(error)] });
      console.log(`FAIL ${screen.id}: ${error}`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
await writeFile(
  path.join(output, "results.json"),
  JSON.stringify(results, null, 2),
);
if (results.some((r) => r.errors.length)) process.exitCode = 1;
