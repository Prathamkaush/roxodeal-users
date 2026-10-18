import { chromium } from "playwright-core";
import assert from "node:assert/strict";
const base = process.env.PREVIEW_URL || "http://localhost:3000";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /ROXODEAL: YOUR DIRECT/ }).waitFor();
  await page.goto(base + "/pricing");
  await page
    .getByRole("heading", { name: "Plans for growing businesses" })
    .waitFor();
  await page.goto(base + "/buyer/dashboard");
  await page.getByRole("heading", { name: "Sign in required" }).waitFor();
  await page.goto(base + "/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "Public marketplace and authenticated buyer-route smoke checks passed.",
  );
} finally {
  await browser.close();
}
