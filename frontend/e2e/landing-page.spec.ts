import { test, expect } from "@playwright/test";

test.describe("Landing Page E2E", () => {
  test("root path renders landing page (not redirect)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page).not.toHaveURL(/\/chat$/);
    
    // Check for landing page specific content
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("search")).toBeVisible();
  });

  test("hero section renders correctly", async ({ page }) => {
    await page.goto("/");
    
    // Headline
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/ค้นหาคณะ|Find the right faculty/i);
    
    // Search form
    const searchForm = page.locator('form[action="/explore"]');
    await expect(searchForm).toBeVisible();
    
    const searchInput = searchForm.locator('input[name="q"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute("type", "search");
    await expect(searchInput).toHaveAttribute("placeholder", /อยากเข้าคณะ|Which faculty/i);
    
    // CTA button
    const ctaButton = page.getByRole("link", { name: /เริ่มทดสอบ|Start Free/i });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute("href", "/riasec");
    
    // Decorative placeholder
    const placeholder = page.locator('section').filter({ has: page.getByRole('heading', { level: 1 }) }).locator('div[aria-hidden="true"]').first();
    await expect(placeholder).toBeVisible();
  });

  test("features section renders 3 cards", async ({ page }) => {
    await page.goto("/");
    
    const featuresHeading = page.getByRole("heading", { 
      name: /ทำไมนักเรียน|Why M6 students/i 
    });
    await expect(featuresHeading).toBeVisible();
    
    const cards = page.locator('section').filter({ has: featuresHeading }).locator('div[class*="rounded-2xl"]');
    await expect(cards).toHaveCount(3);
    
    // Check each card has icon, title, body
    for (let i = 0; i < 3; i++) {
      const card = cards.nth(i);
      await expect(card.locator('div[class*="rounded-full"]')).toBeVisible(); // icon
      await expect(card.locator('h3')).toBeVisible(); // title
      await expect(card.locator('p')).toBeVisible(); // body
    }
  });

  test("popular programs section renders horizontal scroll cards", async ({ page }) => {
    await page.goto("/");
    
    const programsHeading = page.getByRole("heading", { 
      name: /โปรแกรมที่กำลังได้รับความนิยม|Popular programs/i 
    });
    await expect(programsHeading).toBeVisible();
    
    const viewAllLink = page.getByRole("link", { name: /ดูทั้งหมด|View All/i });
    await expect(viewAllLink).toBeVisible();
    await expect(viewAllLink).toHaveAttribute("href", "/explore");
    
    // Horizontal scroll container
    const scrollContainer = page.locator('div[class*="overflow-x-auto"]');
    await expect(scrollContainer).toBeVisible();
    
    // Program cards
    const programCards = scrollContainer.locator('a[href^="/explore/"]');
    await expect(programCards).toHaveCount(4);
    
    // Check first card has match badge and heart button
    const firstCard = programCards.first();
    await expect(firstCard.locator('span[class*="bg-primary"]')).toBeVisible(); // match badge
    await expect(firstCard.locator('button[aria-label="บันทึก"]')).toBeVisible(); // heart button
  });

  test("how it works section renders 4 steps", async ({ page }) => {
    await page.goto("/");
    
    const howItWorksHeading = page.getByRole("heading", { 
      name: /ขั้นตอนการทำงาน|How KUru Works/i 
    });
    await expect(howItWorksHeading).toBeVisible();
    
    // Steps container
    const stepsContainer = page.locator('div[class*="flex-col md:flex-row"]');
    await expect(stepsContainer).toBeVisible();
    
    // Numbered circles
    const numberedCircles = page.locator('div[class*="rounded-full bg-primary"]');
    await expect(numberedCircles).toHaveCount(4);
    
    // Check step titles
    const stepTitles = page.locator('h3').filter({ hasText: /บอกความสนใจ|Share Interests|วิเคราะห์ AI|AI Analysis|ได้คำแนะนำ|Get Recommendations|เตรียมตัวสมัคร|Prepare to Apply/i });
    await expect(stepTitles).toHaveCount(4);
  });

  test("CTA banner renders with correct styling", async ({ page }) => {
    await page.goto("/");
    
    const ctaSection = page.locator('section[class*="bg-primary"]');
    await expect(ctaSection).toBeVisible();
    
    const ctaHeading = ctaSection.getByRole("heading", { 
      name: /พร้อมเริ่มต้นเส้นทาง|Ready to start/i 
    });
    await expect(ctaHeading).toBeVisible();
    
    const ctaButton = ctaSection.getByRole("link", { 
      name: /เริ่มใช้งาน KUru|Start Using KUru/i 
    });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute("href", "/riasec");
    await expect(ctaButton).toHaveClass(/bg-white.*text-primary/);
  });

  test("navbar includes home link and KuruLogo", async ({ page }) => {
    await page.goto("/");
    
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
    
    // KuruLogo in brand area
    const logoLink = nav.locator('a[aria-label="KUru Home"]');
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute("href", "/");
    
    // Check if mobile
    const isMobile = page.viewportSize()?.width && page.viewportSize()!.width < 768;
    
    if (!isMobile) {
      // On desktop, home nav item should be visible and active
      const homeNavItem = nav.getByRole("link", { name: /^หน้าแรก$|^Home$/i });
      await expect(homeNavItem).toBeVisible();
      await expect(homeNavItem).toHaveClass(/text-primary.*after:bg-primary/);
      
      // All nav items present (logo + 5 nav items)
      const navItems = nav.getByRole("link");
      await expect(navItems).toHaveCount(6); // Logo + 5 nav items
    } else {
      // On mobile, open menu first
      const menuButton = nav.getByRole("button", { name: /เมนู|Menu/i });
      await expect(menuButton).toBeVisible();
      await menuButton.click();
      
      // Now home link should be visible in mobile menu
      const homeNavItem = page.locator('#mobile-main-nav').getByRole("link", { name: /^หน้าแรก$|^Home$/i });
      await expect(homeNavItem).toBeVisible();
    }
  });

  test("footer renders with 3 columns", async ({ page }) => {
    await page.goto("/");
    
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    
    // 3-column grid on desktop
    const grid = footer.locator('div[class*="grid-cols-1 md:grid-cols-3"]');
    await expect(grid).toBeVisible();
    
    // Logo in footer
    const footerLogo = footer.locator('span[aria-label="KUru"]');
    await expect(footerLogo).toBeVisible();
    
    // Useful links heading
    await expect(footer.getByText("ลิ้งค์ที่เป็นประโยชน์")).toBeVisible();
    
    // Social buttons
    const socialButtons = footer.locator('button[aria-label]');
    await expect(socialButtons).toHaveCount(3);
    
    // Copyright
    await expect(footer.getByText("© 2026 KUru Academic Advisor")).toBeVisible();
  });

  test("mobile layout (375px) renders without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    
    // Check viewport width
    const viewportWidth = page.viewportSize()?.width;
    expect(viewportWidth).toBe(375);
    
    // Body should not have horizontal scroll
    const body = page.locator("body");
    const bodyBox = await body.boundingBox();
    expect(bodyBox?.width).toBeLessThanOrEqual(375);
    
    // Check hero section adapts
    const heroSection = page.locator('section[class*="grid-cols-1"]');
    await expect(heroSection).toBeVisible();
    
    // Features should stack
    const featuresCards = page.locator('section').filter({ has: page.getByRole('heading', { name: /ทำไมนักเรียน ม\.6 จึงชอบใช้ KUru|Why Grade 12 Students Love KUru/i }) }).locator('div[class*="grid-cols-1"]');
    await expect(featuresCards).toBeVisible();
  });

  test("search form submits to explore page", async ({ page }) => {
    await page.goto("/");
    
    const searchInput = page.locator('input[name="q"]');
    await searchInput.fill("วิศวกรรมคอมพิวเตอร์");
    
    const searchForm = page.locator('form[action="/explore"]');
    
    // Submit form and check navigation
    await Promise.all([
      page.waitForURL(/\/explore\?q=/),
      searchForm.evaluate(form => (form as HTMLFormElement).submit())
    ]);
    
    await expect(page).toHaveURL(/\/explore\?q=/);
  });

  test.skip("Thai and English locales render correctly", async ({ page }) => {
    // Test Thai (default)
    await page.goto("/");
    const htmlThai = page.locator("html");
    await expect(htmlThai).toHaveAttribute("lang", "th");
    
    // Check Thai content
    await expect(page.getByText("ค้นหาคณะที่ใช่สำหรับคุณ")).toBeVisible();
    
    // Switch to English by clicking the locale toggle button (exclude Next.js dev tools button)
    const localeToggle = page.getByRole("button", { name: /^EN$/i });
    await expect(localeToggle).toBeVisible();
    await localeToggle.click();
    
    // Wait a bit for cookie to be set, then reload
    await page.waitForTimeout(1000);
    await page.reload();
    
    const htmlEn = page.locator("html");
    await expect(htmlEn).toHaveAttribute("lang", "en");
    
    // Check English content
    await expect(page.getByText("Find the right faculty for you")).toBeVisible();
  });
});
