// Run against a local users server: node users/artifacts/buyer-ui-smoke.cjs
// All API writes are intercepted; no real messages or reviews are submitted.
const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  fs.mkdirSync("users/artifacts", { recursive: true });
  const browser = await chromium.launch({
    executablePath:
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    await context.addInitScript(() =>
      sessionStorage.setItem(
        "roxodeal-session",
        JSON.stringify({
          accessToken: "test",
          user: { id: "buyer-ui", role: "BUYER", name: "Sample Buyer" },
        }),
      ),
    );
    const state = {
      sellers: [
        {
          id: "s1",
          company: "Northstar Textiles",
          name: "Supplier",
          city: "Delhi",
          category: "Raw Textiles",
          kyc: "Approved",
          years: 2002,
          plan: "free",
          credits: 0,
          active: true,
          email: "",
        },
      ],
      products: [1, 2, 3].map((i) => ({
        id: "p" + i,
        name: i === 1 ? "Premium cotton shirt" : "Cotton fabric " + i,
        description:
          "Quality cotton products available for bulk orders and customisation.",
        category: "Raw Textiles",
        sellerId: "s1",
        price: 120,
        moq: 100,
        unit: "pieces",
        image: "/fixture-product.svg",
        images: ["/fixture-product.svg", "/fixture-broken.svg"],
        status: "Active",
        specifications: { Material: "Cotton", Colour: "Custom" },
      })),
      buyers: [],
      leads: [],
      plans: [],
      categories: [{ id: "c1", name: "Raw Textiles", leadPrice: 19900 }],
      payments: [],
      claims: [],
      activity: [],
      notifications: [
        {
          id: "n1",
          message: "A supplier replied to your enquiry.",
          read: false,
          createdAt: "2026-10-15T00:00:00Z",
        },
      ],
      profile: {
        name: "Sample Buyer",
        email: "buyer@test.com",
        phone: "9000000000",
        company: "Buyer Co",
        city: "Delhi",
      },
      saved: [],
      documents: [],
      enquiries: [],
      protections: [],
      cms: {},
    };
    const posts = [];
    let reviews = [];
    await context.route("**/*", async (route) => {
      const request = route.request(),
        url = new URL(request.url());
      if (url.pathname === "/fixture-product.svg") {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return route.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="500" height="500" fill="#edf5fb"/><path d="M140 130L210 85H290L360 130L320 220L290 200V390H210V200L180 220Z" fill="#123e60"/><text x="250" y="450" text-anchor="middle" fill="#718093" font-size="22">Cotton shirt</text></svg>',
        });
      }
      if (url.pathname === "/fixture-broken.svg")
        return route.fulfill({ status: 404, body: "Missing" });
      if (["fetch", "xhr"].includes(request.resourceType())) {
        if (/\/workspace$|\/catalogue$/.test(url.pathname))
          return route.fulfill({ json: state });
        if (url.pathname.endsWith("/reviews") && request.method() === "GET")
          return route.fulfill({
            json: {
              items: reviews,
              total: reviews.length,
              average: reviews.length ? 4 : null,
              page: 1,
              pageSize: 10,
            },
          });
        if (request.method() === "POST") {
          const data = request.postDataJSON();
          posts.push({ path: url.pathname, data });
          if (url.pathname.endsWith("/workspace/actions")) {
            if (data.action === "NOTIFICATION_DELETE")
              state.notifications = state.notifications.filter(
                (item) => item.id !== data.id,
              );
            if (data.action === "ENQUIRY_CREATE")
              state.enquiries.push({
                id: "e" + posts.length,
                ...data.data,
                response: null,
                buyer: {
                  name: "Buyer",
                  email: "buyer@test.com",
                  phone: "9000000000",
                },
                seller: { company: "Northstar Textiles" },
              });
            return route.fulfill({ json: { ok: true, id: "saved" } });
          }
          if (url.pathname.endsWith("/reviews"))
            reviews = [
              {
                id: "review1",
                message: data.message,
                rating: data.rating,
                createdAt: "2026-10-15T00:00:00Z",
                user: { name: "Sample Buyer", city: "Delhi" },
              },
            ];
          return route.fulfill({ json: { ok: true, id: "reference-1" } });
        }
      }
      if (url.hostname.startsWith("fonts.")) return route.abort();
      return route.continue();
    });
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const goto = (path) =>
      page.goto("http://127.0.0.1:3100" + path, {
        waitUntil: "domcontentloaded",
      });
    await goto("/suppliers/s1");
    await page
      .getByRole("heading", { name: "Northstar Textiles", exact: true })
      .waitFor();
    assert.match(
      await page.locator(".rx-supplier-hero").innerText(),
      /Established in 2002/,
    );
    assert.equal(
      await page.locator(".rx-store-layout .ms-product-card").count(),
      3,
    );
    await page
      .getByRole("status", { name: "Loading image", exact: true })
      .first()
      .waitFor();
    await page
      .locator(".rx-store-layout .rx-loading-image.loaded")
      .first()
      .waitFor();
    await page.screenshot({
      path: "users/artifacts/supplier-storefront.png",
      fullPage: true,
    });
    await goto("/products/p1");
    await page
      .getByRole("heading", { name: "Premium cotton shirt", exact: true })
      .waitFor();
    await page
      .locator(".rx-product-main-image .rx-loading-image.loaded")
      .waitFor();
    assert.ok(
      await page
        .locator(".rx-product-main-image")
        .evaluate((el) => el.getBoundingClientRect().height <= 360),
    );
    await page.screenshot({
      path: "users/artifacts/product-details.png",
      fullPage: true,
    });
    await page.getByRole("button", { name: "View product image 2" }).click();
    await page
      .locator(".rx-product-main-image")
      .getByText("Image unavailable", { exact: true })
      .waitFor();
    await page
      .getByRole("link", { name: /Request a quote/ })
      .first()
      .click();
    await page
      .getByRole("heading", { name: "Request a quote", exact: true })
      .waitFor();
    assert.match(page.url(), /buyer\/quotes\/create/);
    assert.equal(
      await page.getByLabel("Product", { exact: true }).inputValue(),
      "p1",
    );
    await page.getByLabel("Quantity", { exact: true }).fill("150");
    await page
      .getByLabel("Quote details", { exact: true })
      .fill("Please quote 150 shirts for delivery in Delhi.");
    await page
      .getByRole("button", { name: "Send quote request", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Quote request sent", exact: true })
      .waitFor();
    const quote = posts.find((item) => item.data.action === "ENQUIRY_CREATE")
      .data.data;
    assert.deepEqual(
      {
        kind: quote.kind,
        sellerId: quote.sellerId,
        productId: quote.productId,
        quantity: quote.quantity,
      },
      { kind: "QUOTE", sellerId: "s1", productId: "p1", quantity: 150 },
    );
    assert.equal(
      posts.filter((item) => item.data.action === "LEAD_CREATE").length,
      0,
    );
    await goto("/buyer/enquiries/create?sellerId=s1");
    await page
      .getByRole("heading", { name: "Send an enquiry", exact: true })
      .waitFor();
    assert.equal(await page.getByLabel("Quantity", { exact: true }).count(), 0);
    await page
      .getByLabel("Your question", { exact: true })
      .fill("Do you support custom embroidery on your clothing?");
    await page
      .getByRole("button", { name: "Send enquiry", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Enquiry sent", exact: true })
      .waitFor();
    assert.equal(
      posts.filter((item) => item.data.action === "ENQUIRY_CREATE").at(-1).data
        .data.kind,
      "ENQUIRY",
    );
    await page
      .getByRole("link", { name: "View quotes & enquiries", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Quotes & enquiries", exact: true })
      .waitFor();
    assert.match(
      await page.locator("main .ms-table").innerText(),
      /Quote request/,
    );
    assert.match(
      await page.locator("main .ms-table").innerText(),
      /Business enquiry/,
    );
    assert.equal(
      await page.locator(".ms-breadcrumb,.ms-preview-notice").count(),
      0,
    );
    await page
      .getByRole("button", { name: "View notifications", exact: true })
      .click();
    await page.getByRole("button", { name: /Delete notification/ }).click();
    await page
      .getByText("No notifications. You're all caught up.", { exact: true })
      .waitFor();
    assert.equal(state.notifications.length, 0);
    await page
      .getByRole("button", { name: "Close notifications", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Search buyer workspace", exact: true })
      .click();
    const form = page.getByRole("search");
    await form.getByRole("searchbox").fill("cotton");
    await form.getByRole("button", { name: "Search", exact: true }).click();
    await page
      .getByRole("heading", { name: "Search your workspace", exact: true })
      .waitFor();
    await page
      .locator(".rx-buyer-search-results")
      .getByRole("heading", { name: "Premium cotton shirt", exact: true })
      .waitFor();
    assert.match(page.url(), /buyer\/search\?q=cotton/);
    await goto("/contact");
    await page
      .getByRole("heading", { name: "Let's talk business.", exact: true })
      .waitFor();
    await page
      .getByLabel("Subject", { exact: true })
      .fill("Help with sourcing");
    await page
      .getByLabel("Message", { exact: true })
      .fill("Please help with finding the right supplier.");
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    await page.getByText(/Your message has been received/).waitFor();
    assert.ok(posts.find((item) => item.path.endsWith("/contact")));
    await goto("/buyer/feedback");
    await page
      .getByRole("heading", { name: "Feedback & reviews", exact: true })
      .waitFor();
    await page
      .getByLabel("Your feedback", { exact: true })
      .fill("Please add more product categories to the marketplace.");
    await page
      .getByRole("button", { name: "Send feedback", exact: true })
      .click();
    await page
      .getByText("Thank you. Your feedback has been received.", { exact: true })
      .waitFor();
    await page.getByLabel("Rating", { exact: true }).selectOption("4");
    await page
      .getByLabel("Your review", { exact: true })
      .fill("Helpful marketplace and easy supplier conversations.");
    await page
      .getByRole("button", { name: "Publish review", exact: true })
      .click();
    await page
      .getByText("Your review has been saved.", { exact: true })
      .waitFor();
    assert.ok(posts.find((item) => item.path.endsWith("/feedback")));
    assert.equal(reviews[0].rating, 4);
    await page.setViewportSize({ width: 390, height: 844 });
    await goto("/suppliers/s1");
    await page
      .getByRole("heading", { name: "Northstar Textiles", exact: true })
      .waitFor();
    await page.waitForTimeout(300);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await page
      .locator(".rx-store-layout .rx-loading-image.loaded")
      .first()
      .waitFor();
    await page.screenshot({
      path: "users/artifacts/supplier-mobile.png",
      fullPage: true,
    });
    await goto("/products/p1");
    await page
      .getByRole("heading", { name: "Premium cotton shirt", exact: true })
      .waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: storefront; compact gallery/fallback; single-seller quote; separate enquiry; history/search; notification delete; contact/feedback/review submissions; mobile width; no runtime errors.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
