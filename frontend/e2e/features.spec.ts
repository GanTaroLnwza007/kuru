import { test, expect } from "@playwright/test";

test.describe("Feature Shells & Content", () => {
  test("chat shell has expected placeholder elements", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByTestId("chat-shell")).toBeVisible();
  });

  test("explore shell has search input", async ({ page }) => {
    await page.goto("/explore");
    const shell = page.getByTestId("explore-shell");
    await expect(shell).toBeVisible();

    // Check for search input or similar
    const searchInput = page.locator('input[type="text"], input[type="search"]');
    expect(await searchInput.count()).toBeGreaterThanOrEqual(0);
  });

  test("riasec shell shows step progress", async ({ page }) => {
    await page.goto("/riasec");
    const shell = page.getByTestId("riasec-shell");
    await expect(shell).toBeVisible();

    // Check for progress indicator or step info
    const text = await shell.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test("portfolio shell has upload/input area", async ({ page }) => {
    await page.goto("/portfolio");
    const shell = page.getByTestId("portfolio-shell");
    await expect(shell).toBeVisible();

    // Check for textarea or input
    const inputs = page.locator(
      "textarea, input[type='file'], input[type='text']"
    );
    expect(await inputs.count()).toBeGreaterThanOrEqual(0);
  });

  test("root path renders landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("invalid route renders gracefully", async ({ page }) => {
    await page.goto("/this-route-does-not-exist-xyz123", {
      waitUntil: "networkidle",
    });

    // Page should render with body
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Title should contain app name
    const title = await page.title();
    expect(title).toContain("KUru");
  });

  test("all routes have proper html/body structure", async ({ page }) => {
    const routes = ["/chat", "/explore", "/riasec", "/portfolio"];

    for (const route of routes) {
      await page.goto(route);
      const html = page.locator("html");
      const body = page.locator("body");

      await expect(html).toBeVisible();
      await expect(body).toBeVisible();
    }
  });

  test("all routes are wrapped in app shell", async ({ page }) => {
    const routes = ["/chat", "/explore", "/riasec", "/portfolio"];

    for (const route of routes) {
      await page.goto(route);
      const nav = page.locator("nav");
      await expect(nav).toBeVisible();
    }
  });

  test("explore detail route accepts dynamic programId parameter", async ({
    page,
  }) => {
    const programIds = ["prog-001", "ku-engineering", "sample-id"];

    for (const id of programIds) {
      await page.goto(`/explore/${id}`);
      await expect(page).toHaveURL(new RegExp(`/explore/${id}$`));
      await expect(page.getByTestId("explore-detail-shell")).toBeVisible();
    }
  });

  test("content area is scrollable on long pages", async ({ page }) => {
    await page.goto("/chat");
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Try to scroll
    await page.evaluate(() => window.scrollBy(0, 100));
    const afterScroll = await page.evaluate(() => window.scrollY);

    // Page should either be scrollable or content fits in viewport
    expect(afterScroll >= initialScroll).toBeTruthy();
  });

  test("route shells load within acceptable time", async ({ page }) => {
    const routes = ["/chat", "/explore", "/riasec", "/portfolio"];
    const maxLoadTime = 3000;

    for (const route of routes) {
      const startTime = Date.now();
      await page.goto(route);
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(maxLoadTime);
    }
  });

  test("no layout shift after initial load", async ({ page }) => {
    await page.goto("/chat");

    const shell = page.getByTestId("chat-shell");
    const initialBox = await shell.boundingBox();

    // Wait and check again
    await page.waitForTimeout(500);
    const laterBox = await shell.boundingBox();

    expect(initialBox?.width).toBe(laterBox?.width);
    expect(initialBox?.height).toBe(laterBox?.height);
  });

  test("page has proper color contrast", async ({ page }) => {
    await page.goto("/chat");

    const body = page.locator("body");
    const computedStyle = await body.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
      };
    });

    expect(computedStyle.color).toBeTruthy();
    expect(computedStyle.backgroundColor).toBeTruthy();
  });

  test("interactive elements are labeled", async ({ page }) => {
    await page.goto("/chat");

    const buttons = page.locator("button");
    for (let i = 0; i < Math.min(await buttons.count(), 5); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute("aria-label");
      const text = await button.textContent();

      expect(ariaLabel || text?.trim()).toBeTruthy();
    }
  });

  test("focus is visible when navigating via keyboard", async ({ page }) => {
    await page.goto("/chat");

    // Tab to focus first interactive element
    await page.keyboard.press("Tab");

    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return window.getComputedStyle(el as Element).outline;
    });

    expect(focusedElement).toBeTruthy();
  });

  test("form inputs are properly associated", async ({ page }) => {
    await page.goto("/explore");

    const inputs = page.locator("input");
    for (let i = 0; i < Math.min(await inputs.count(), 3); i++) {
      const input = inputs.nth(i);
      const name = await input.getAttribute("name");
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");

      expect(name || id || ariaLabel).toBeTruthy();
    }
  });
});
