import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const base = process.env.PREVIEW_URL || "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
await mkdir("users/artifacts", { recursive: true });
try {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /ROXODEAL: YOUR DIRECT/ }).waitFor();
  assert.match(await page.title(), /Roxodeal/);
  await page.locator(".rx-hero-photo").evaluate(image => image.decode());
  for (const link of await page.locator(".rx-header-sell, .rx-nav-sell, .rx-hero-actions .rx-gold").all()) assert.equal(await link.getAttribute("href"), "https://mandisetu-sellers.vercel.app/seller/dashboard");
  await page.screenshot({ path: "users/artifacts/roxodeal-desktop.png", fullPage: true });
  const rfq = page.locator(".rx-rfq");
  await rfq.getByLabel("Product name").fill("Cotton corporate uniforms");
  await rfq.getByLabel("Industry", { exact: true }).selectOption("Raw Textiles");
  await rfq.getByLabel("Quantity", { exact: true }).fill("750");
  await rfq.getByLabel("Delivery city").fill("Mumbai");
  await rfq.getByRole("button", { name: "Get supplier quotes" }).click();
  await page.getByLabel("What are you looking for?").waitFor();
  assert.equal(await page.getByLabel("What are you looking for?").inputValue(), "Cotton corporate uniforms");
  assert.equal(await page.getByLabel("Category", { exact: true }).inputValue(), "Raw Textiles");
  assert.equal(await page.getByLabel("Quantity", { exact: true }).inputValue(), "750");
  assert.equal(await page.getByLabel("Delivery city").inputValue(), "Mumbai");
  console.log("PASS: quick RFQ carries product, category, quantity and delivery city into the full request.");
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "Search products and suppliers" }).fill("cotton");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.getByRole("heading", { name: "Premium cotton T-shirts" }).waitFor();
  console.log("PASS: marketplace search.");
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator(".rx-category-menu summary").click();
  await page.locator(".rx-category-menu").getByRole("link", { name: "Raw Textiles", exact: true }).click();
  await page.getByRole("heading", { name: "Premium cotton T-shirts" }).waitFor();
  console.log("PASS: industry navigation.");
  for (const width of [768, 390, 375]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(base, { waitUntil: "networkidle" });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false, `Viewport ${width}px fits`);
    if (width === 390) {
      await page.screenshot({ path: "users/artifacts/roxodeal-mobile.png", fullPage: true });
      await page.getByRole("button", { name: "Open menu" }).click();
      await page.getByRole("navigation", { name: "Marketplace navigation" }).getByRole("link", { name: "Browse products", exact: true }).click();
      await page.getByRole("heading", { name: "Discover products & manufacturers" }).waitFor();
    }
  }
  assert.deepEqual(errors, [], "No unhandled frontend errors");
  console.log("PASS: Roxodeal branding, factory image, seller destinations, tablet/mobile layout and navigation.");
} finally { await browser.close(); }
