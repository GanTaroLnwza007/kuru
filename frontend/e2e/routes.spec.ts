import { test, expect } from "@playwright/test";

test.describe("Route Navigation & Structure", () => {
  test("redirects from / to /chat", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/chat$/);
    await expect(page.getByTestId("chat-shell")).toBeVisible();
  });

  test("chat route renders correctly", async ({ page }) => {
    await page.goto("/chat");
    await expect(page).toHaveURL(/\/chat$/);
    await expect(page.getByTestId("chat-shell")).toBeVisible();
  });

  test("chat route mobile layout", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/chat");
    await expect(page.getByTestId("chat-shell")).toBeVisible();
  });

  test("explore route renders correctly", async ({ page }) => {
    await page.goto("/explore");
    await expect(page).toHaveURL(/\/explore$/);
    await expect(page.getByTestId("explore-shell")).toBeVisible();
  });

  test("explore route mobile layout", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/explore");
    await expect(page.getByTestId("explore-shell")).toBeVisible();
  });

  test("explore detail route with dynamic params", async ({ page }) => {
    await page.goto("/explore/prog-001");
    await expect(page).toHaveURL(/\/explore\/prog-001$/);
    await expect(page.getByTestId("explore-detail-shell")).toBeVisible();
  });

  test("riasec route renders correctly", async ({ page }) => {
    await page.goto("/riasec");
    await expect(page).toHaveURL(/\/riasec$/);
    await expect(page.getByTestId("riasec-shell")).toBeVisible();
  });

  test("riasec route mobile layout", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/riasec");
    await expect(page.getByTestId("riasec-shell")).toBeVisible();
  });

  test("portfolio route renders correctly", async ({ page }) => {
    await page.goto("/portfolio");
    await expect(page).toHaveURL(/\/portfolio$/);
    await expect(page.getByTestId("portfolio-shell")).toBeVisible();
  });

  test("portfolio route mobile layout", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/portfolio");
    await expect(page.getByTestId("portfolio-shell")).toBeVisible();
  });

  test("navigation bar is persistent across routes", async ({ page }) => {
    // Start at /chat
    await page.goto("/chat");
    let nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Navigate to /explore
    await page.goto("/explore");
    nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Navigate to /riasec
    await page.goto("/riasec");
    nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("page has proper meta tags", async ({ page }) => {
    await page.goto("/chat");
    const title = await page.title();
    expect(title).toContain("KUru");
  });

  test("all routes have proper language attribute", async ({ page }) => {
    const routes = ["/chat", "/explore", "/riasec", "/portfolio"];
    for (const route of routes) {
      await page.goto(route);
      const html = page.locator("html");
      const lang = await html.getAttribute("lang");
      expect(lang).toBeTruthy();
    }
  });

  test("page does not have console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/chat");
    await page.waitForLoadState("networkidle");

    // Filter out known non-breaking warnings
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("Failed to parse SourceMap") &&
        !e.includes("ENVIRONMENT_FALLBACK")
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("frontend loads without throwing on missing NEXT_PUBLIC_API_BASE_URL",
    async ({ page }) => {
      await page.goto("/chat");
      await expect(page.getByTestId("chat-shell")).toBeVisible();
    }
  );
});
