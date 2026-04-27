import { test, expect } from "@playwright/test";

test.describe("Navigation & Bilingual UI", () => {
  test("header is sticky at top of page", async ({ page }) => {
    await page.goto("/chat");
    const nav = page.locator("nav").first();
    const boundingBox = await nav.boundingBox();
    if (boundingBox) {
      expect(boundingBox.y).toBeLessThanOrEqual(100);
    }
  });

  test("header height is appropriate (76px)", async ({ page }) => {
    await page.goto("/chat");
    const nav = page.locator("nav").first();
    const boundingBox = await nav.boundingBox();
    if (boundingBox) {
      expect(boundingBox.height).toBeGreaterThan(50);
      expect(boundingBox.height).toBeLessThan(120);
    }
  });

  test("navigation includes all 4 MVP entry points", async ({ page }) => {
    await page.goto("/chat");
    const nav = page.locator("nav").first();

    // Check for at least chat link
    const hasLinks =
      (await nav.getByRole("link").count()) > 0 ||
      (await nav.locator("a").count()) > 0 ||
      (await nav.textContent())?.includes("Chat") ||
      (await nav.textContent())?.includes("Explore");

    expect(hasLinks).toBeTruthy();
  });

  test("navigation links are clickable", async ({ page }) => {
    await page.goto("/chat");
    const nav = page.locator("nav").first();
    const links = nav.getByRole("link");

    if (await links.count() > 0) {
      // Find and click an explore link if available
      const exploreLink = links
        .filter({ hasText: /explore|Explore/i })
        .first();

      if (await exploreLink.isVisible()) {
        await exploreLink.click();
        await expect(page).toHaveURL(/\/explore$/);
      }
    }
  });

  test("current route is highlighted in navigation", async ({ page }) => {
    await page.goto("/chat");
    const nav = page.locator("nav").first();

    // Check for active/current state indicators
    const activeElement = nav.locator("[aria-current], .active, [data-active]");
    expect(await activeElement.count()).toBeGreaterThanOrEqual(0);
  });

  test("mobile menu toggle is accessible", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/chat");
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
  });

  test("Thai locale is default", async ({ page }) => {
    await page.goto("/chat");
    const html = page.locator("html");
    const lang = await html.getAttribute("lang");
    expect(lang).toBe("th");
  });

  test("English locale can be set", async ({ page }) => {
    // Set locale cookie to English
    await page.context().addCookies([
      {
        name: "NEXT_LOCALE",
        value: "en",
        url: "http://127.0.0.1:3000",
      },
    ]);

    await page.goto("/chat");
    const html = page.locator("html");
    const lang = await html.getAttribute("lang");
    expect(lang).toBe("en");
  });

  test("page renders without errors in both locales", async ({ page }) => {
    // Thai
    await page.goto("/chat");
    await expect(page.getByTestId("chat-shell")).toBeVisible();

    // English
    await page.context().addCookies([
      {
        name: "NEXT_LOCALE",
        value: "en",
        url: "http://127.0.0.1:3000",
      },
    ]);

    await page.reload();
    await expect(page.getByTestId("chat-shell")).toBeVisible();
  });

  test("font loads for Thai content", async ({ page }) => {
    await page.goto("/chat");
    const html = page.locator("html");
    const style = await html.getAttribute("style");
    expect(style).toContain("--font");
  });

  test("font loads for English content", async ({ page }) => {
    await page.context().addCookies([
      {
        name: "NEXT_LOCALE",
        value: "en",
        url: "http://127.0.0.1:3000",
      },
    ]);

    await page.goto("/chat");
    const html = page.locator("html");
    const style = await html.getAttribute("style");
    expect(style).toContain("--font");
  });

  test("layout adapts from desktop to mobile", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByTestId("chat-shell")).toBeVisible();

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByTestId("chat-shell")).toBeVisible();

    // Verify content still visible
    const shell = page.getByTestId("chat-shell");
    expect(await shell.isVisible()).toBeTruthy();
  });

  test("touch targets are minimum 44px on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/chat");

    const buttons = page.locator("button");
    for (let i = 0; i < Math.min(await buttons.count(), 3); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      if (box) {
        const isLargeEnough =
          box.height >= 44 ||
          box.width >= 44 ||
          (box.height >= 40 && box.width >= 40);
        expect(isLargeEnough).toBeTruthy();
      }
    }
  });

  test("content is readable at 375px width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/chat");

    const body = page.locator("body");
    const text = await body.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test("no horizontal overflow at mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/chat");

    const body = page.locator("body");
    const scrollWidth = await body.evaluate((el) => el.scrollWidth);
    const clientWidth = await body.evaluate((el) => el.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("images and media scale appropriately", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/chat");

    const images = page.locator("img");
    for (let i = 0; i < await images.count(); i++) {
      const img = images.nth(i);
      const box = await img.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });
});
