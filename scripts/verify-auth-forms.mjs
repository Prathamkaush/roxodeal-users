import { chromium } from "playwright-core";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage();
const calls = [];
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = process.env.USERS_URL || "http://localhost:3000";
await page.route("**/api/auth/**", async (route) => {
  const path = new URL(route.request().url()).pathname;
  const data = route.request().postDataJSON();
  calls.push({ path, data });
  let status = 201,
    body = { message: "Code sent to your email." };
  if (path.endsWith("/login")) {
    status = 401;
    body = { message: "Email verification is required" };
  }
  if (path.endsWith("/register")) body = { id: "ui-test-account" };
  if (path.endsWith("/email/verify")) body = { verified: true };
  if (path.endsWith("/forgot-password"))
    body = {
      message: "If this account exists, reset instructions have been sent.",
    };
  if (path.endsWith("/reset-password"))
    body = { message: "Password reset. Sign in with your new password." };
  if (path.endsWith("/email/send") && data.email === "limited@example.com") {
    status = 429;
    body = { message: "Hourly verification limit reached.", retryAfter: 3600 };
  }
  await route.fulfill({
    status,
    contentType: "application/json",
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(body),
  });
});
try {
  await page.goto(base + "/register", { waitUntil: "networkidle" });
  await page.getByLabel("Name", { exact: true }).fill("Ravi Kumar");
  const phone = page.getByLabel("Mobile number", { exact: true });
  await phone.fill("+9198abc76543210");
  assert.equal(await phone.inputValue(), "+919876543210");
  await page.getByLabel("Email", { exact: true }).fill("invalid");
  await page.getByLabel("Password", { exact: true }).fill("short");
  await page.getByLabel("Confirm password", { exact: true }).fill("different");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await page
    .getByText("Enter a valid email address.", { exact: true })
    .waitFor();
  await page
    .getByText("Use at least 10 characters for your password.", { exact: true })
    .waitFor();
  assert.equal(
    calls.length,
    0,
    "Invalid registration must not call authentication API",
  );
  await page.getByLabel("Email", { exact: true }).fill("buyer@example.com");
  await page
    .getByLabel("Password", { exact: true })
    .fill("Ui-test-password-123");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  assert.equal(
    await page.getByLabel("Password", { exact: true }).getAttribute("type"),
    "text",
  );
  await page
    .getByRole("button", { name: "Hide password", exact: true })
    .click();
  assert.equal(
    await page.getByLabel("Password", { exact: true }).getAttribute("type"),
    "password",
  );
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await page.getByText("Passwords do not match.", { exact: true }).waitFor();
  assert.equal(calls.length, 0);
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("Ui-test-password-123");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Verify your email", exact: true })
    .waitFor();
  const code = page.getByLabel("Verification code", { exact: true });
  assert.equal(await code.inputValue(), "");
  assert.equal(await page.locator('input[name="password"]').count(), 0);
  assert.equal(
    await page.getByLabel("Email address", { exact: true }).inputValue(),
    "buyer@example.com",
  );
  assert.equal("confirmPassword" in calls[0].data, false);
  await page
    .getByRole("button", { name: "Send email verification code", exact: true })
    .click();
  await page.getByRole("status").filter({ hasText: "Code sent" }).waitFor();
  assert.equal(
    await page.getByRole("button", { name: /^Resend in/ }).isDisabled(),
    true,
  );
  assert.equal(calls.filter((c) => c.path.endsWith("/email/send")).length, 1);
  await code.fill("12ab34");
  assert.equal(await code.inputValue(), "1234");
  await page.getByRole("button", { name: "Verify email", exact: true }).click();
  await page
    .getByText("Enter the 6-digit code from your email.", { exact: true })
    .waitFor();
  assert.equal(calls.filter((c) => c.path.endsWith("/email/verify")).length, 0);
  await code.fill("123456");
  await page.getByRole("button", { name: "Verify email", exact: true }).click();
  await page
    .getByRole("heading", { name: "Sign in to Roxodeal", exact: true })
    .waitFor();
  assert.equal(
    await page.getByLabel("Password", { exact: true }).inputValue(),
    "",
  );
  assert.equal(
    await page.getByLabel("Password", { exact: true }).getAttribute("type"),
    "password",
  );
  await page
    .getByLabel("Password", { exact: true })
    .fill("Ui-test-password-123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page
    .getByRole("heading", { name: "Verify your email", exact: true })
    .waitFor();
  assert.equal(
    await page.getByLabel("Verification code", { exact: true }).inputValue(),
    "",
  );
  await page
    .getByRole("button", { name: "Back to sign in", exact: true })
    .click();
  assert.equal(
    await page.getByLabel("Password", { exact: true }).inputValue(),
    "",
  );
  await page
    .getByRole("button", { name: "Forgot password?", exact: true })
    .click();
  assert.equal(await page.locator('input[name="password"]').count(), 0);
  await page
    .getByRole("button", { name: "Send reset link", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Check your inbox" })
    .waitFor();
  assert.deepEqual(
    calls.find((c) => c.path.endsWith("/forgot-password")).data,
    { email: "buyer@example.com" },
  );
  assert.equal(
    await page.getByRole("button", { name: /^Resend in/ }).isDisabled(),
    true,
  );
  await page.goto(base + "/login", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Verify email", exact: true }).click();
  await page
    .getByLabel("Email address", { exact: true })
    .fill("buyer@example.com");
  assert.equal(
    await page.getByRole("button", { name: /^Resend in/ }).isDisabled(),
    true,
    "Cooldown must survive reloading the page",
  );
  await page
    .getByLabel("Email address", { exact: true })
    .fill("limited@example.com");
  await page
    .getByRole("button", { name: "Send email verification code", exact: true })
    .click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Hourly verification limit reached" })
    .waitFor();
  await page.getByRole("button", { name: /^Resend in .*m/ }).waitFor();
  assert.equal(
    await page.getByRole("button", { name: /^Resend in/ }).isDisabled(),
    true,
  );
  await page.goto(base + "/reset-password?token=ui-test-token", {
    waitUntil: "networkidle",
  });
  await page
    .getByRole("heading", { name: "Choose a new password", exact: true })
    .waitFor();
  await page
    .getByLabel("New password", { exact: true })
    .fill("New-ui-password-123");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("New-ui-password-123");
  await page
    .getByRole("button", { name: "Save new password", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Sign in to Roxodeal", exact: true })
    .waitFor();
  assert.equal(
    await page.getByLabel("Password", { exact: true }).inputValue(),
    "",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: input validation, numeric sanitization, password visibility, clean verification transitions and email reset UI (mocked auth responses; no real mail sent)",
  );
} finally {
  await browser.close();
}
