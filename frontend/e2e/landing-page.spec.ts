import { test, expect } from "@playwright/test";

test.describe("Landing Page E2E", () => {
  test("root path renders landing page (not redirect)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page).not.toHaveURL(/\/chat$/);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("hero section renders correctly", async ({ page }) => {
    await page.goto("/");

    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/เลือกคณะ/);

    // Primary CTA — hero link (first match)
    const ctaButton = page
      .getByRole("link", { name: /เริ่มทดสอบ RIASEC/i })
      .first();
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute("href", "/riasec");

    // Secondary CTA — explore all programs
    const exploreLink = page.getByRole("link", {
      name: /ดูคณะทั้งหมด/i,
    });
    await expect(exploreLink).toBeVisible();
    await expect(exploreLink).toHaveAttribute("href", "/explore");
  });

  test("how it works section renders 3 feature cards", async ({ page }) => {
    await page.goto("/");

    const howHeading = page.getByRole("heading", { name: /จากคำถาม/i });
    await expect(howHeading).toBeVisible();

    // Feature cards inside #how
    const featureCards = page.locator("#how .feature-card");
    await expect(featureCards).toHaveCount(3);

    // Feature card CTA links (scoped to avoid nav "เริ่มเลย")
    await expect(
      page.locator("#how").getByRole("link", { name: "เริ่มเลย" })
    ).toBeVisible();
    await expect(
      page.locator("#how").getByRole("link", { name: "ลองค้นหา" })
    ).toBeVisible();
    await expect(
      page.locator("#how").getByRole("link", { name: "อัปโหลดพอร์ต" })
    ).toBeVisible();
  });

  test("trending section renders program cards", async ({ page }) => {
    await page.goto("/");

    const trendingHeading = page.getByRole("heading", {
      name: /กำลังพูดถึง/i,
    });
    await expect(trendingHeading).toBeVisible();

    // "ดูทั้งหมด" link to explore
    const viewAllLink = page.getByRole("link", {
      name: /ดูทั้งหมด.*หลักสูตร/i,
    });
    await expect(viewAllLink).toBeVisible();
    await expect(viewAllLink).toHaveAttribute("href", "/explore");

    // 5 program cards total (1 hero + 4 smaller)
    const programCards = page
      .locator("#trending")
      .locator('a[href^="/explore/"]');
    await expect(programCards).toHaveCount(5);
  });

  test("CTA banner renders with correct content", async ({ page }) => {
    await page.goto("/");

    const ctaHeading = page.getByRole("heading", { name: /เริ่มหา/i });
    await expect(ctaHeading).toBeVisible();

    // RIASEC CTA button (last occurrence — in CTA banner)
    const ctaButton = page
      .getByRole("link", { name: /เริ่มทดสอบ RIASEC/i })
      .last();
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute("href", "/riasec");

    // Chat CTA
    const chatButton = page.getByRole("link", { name: /ถาม KUru เลย/i });
    await expect(chatButton).toBeVisible();
    await expect(chatButton).toHaveAttribute("href", "/chat");
  });

  test("navbar includes logo and mobile menu", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();

    // KuruLogo brand link
    const logoLink = nav.locator('a[aria-label="KUru Home"]');
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute("href", "/");

    const isMobile =
      page.viewportSize()?.width && page.viewportSize()!.width < 768;

    if (!isMobile) {
      // Desktop: nav links visible
      await expect(
        nav.getByRole("link", { name: /ค้นหา/i })
      ).toBeVisible();
    } else {
      // Mobile: hamburger button present (menu toggle tested at unit level)
      const menuButton = page.locator('button[aria-controls="mobile-nav"]');
      await expect(menuButton).toBeVisible();
    }
  });

  test("footer renders with 4 columns", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // 4-column grid
    const grid = footer.locator('div[class*="grid-cols-2"]');
    await expect(grid).toBeVisible();

    // Brand text
    await expect(footer.getByText("KUru").first()).toBeVisible();

    // Product links
    await expect(
      footer.getByRole("link", { name: "Program Explorer" })
    ).toBeVisible();

    // Copyright
    await expect(
      footer.getByText(/© 2026 KUru · Kasetsart University/)
    ).toBeVisible();
  });

  test("mobile layout (375px) renders without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    expect(page.viewportSize()?.width).toBe(375);

    // Body should not overflow horizontally
    const bodyBox = await page.locator("body").boundingBox();
    expect(bodyBox?.width).toBeLessThanOrEqual(375);

    // Hero is visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // How-it-works section renders below hero
    await expect(
      page.getByRole("heading", { name: /จากคำถาม/i })
    ).toBeVisible();
  });

  test.skip("Thai and English locales render correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "th");
    await expect(page.getByText("เลือกคณะ")).toBeVisible();

    const localeToggle = page.getByRole("button", { name: /^EN$/i });
    await expect(localeToggle).toBeVisible();
    await localeToggle.click();

    await page.waitForTimeout(1000);
    await page.reload();

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByText("Find the right faculty for you")).toBeVisible();
  });
});
