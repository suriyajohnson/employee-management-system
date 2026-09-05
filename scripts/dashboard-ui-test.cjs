const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
(async () => {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const base = "http://localhost:" + process.argv[2];
  const nav = async (name) => {
    await page.locator('.sidebar [data-page="' + name + '"]').click();
    await page.waitForTimeout(100);
  };
  const screenshot = async (name) => {
    fs.mkdirSync("docs", { recursive: true });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: "docs/" + name + ".png",
      fullPage: true,
      animations: "disabled",
    });
  };
  try {
    await page.goto(base + "/index.html");
    await page.locator("#username").fill("dashboard-test-admin");
    await page.locator("#password").fill("wrong");
    await page.locator("#loginButton").click();
    await page
      .locator("#loginError")
      .filter({ hasText: "Invalid Password" })
      .waitFor();
    await page.locator("#password").fill("test-only-password");
    await page.locator("#loginButton").click();
    await page.waitForURL("**/admin-dashboard.html");
    await page.locator(".stat-card").first().waitFor();
    assert.equal(await page.locator(".stat-value").first().textContent(), "12");
    await screenshot("dashboard-desktop");
    await nav("employees");
    assert.equal(await page.locator("tbody tr").count(), 8);
    await page.getByRole("button", { name: "Next", exact: true }).click();
    assert.equal(await page.locator("tbody tr").count(), 4);
    await page.locator("#employeeSearch").fill("Diya");
    assert.equal(await page.locator("tbody tr").count(), 1);
    await page.locator("#employeeSearch").fill("");
    await page.locator("#statusFilter").selectOption("INACTIVE");
    assert.equal(await page.locator("tbody tr").count(), 1);
    await page.locator("#statusFilter").selectOption("");
    await page.locator('[data-action="add-employee"]').first().click();
    const form = page.locator("#editorForm");
    await form.locator('[name="employeeCode"]').fill("UI-001");
    await form.locator('[name="name"]').fill("UI <script>Test</script>");
    await form.locator('[name="email"]').fill("ui-test@example.invalid");
    await form.locator('[name="designation"]').fill("QA engineer");
    await form.locator('[name="salary"]').fill("62000");
    await form
      .locator('[name="departmentId"]')
      .selectOption({ label: "Engineering" });
    await page.locator("#saveButton").click();
    await page.locator("#editor").waitFor({ state: "hidden" });
    await page.locator("#employeeSearch").fill("UI-001");
    await page
      .getByRole("button", {
        name: "View employee UI <script>Test</script>",
        exact: true,
      })
      .click();
    assert.equal(
      await page.locator("#dialogTitle").textContent(),
      "UI <script>Test</script>",
    );
    await page.locator("#closeDialog").click();
    await page
      .getByRole("button", {
        name: "Edit employee UI <script>Test</script>",
        exact: true,
      })
      .click();
    await form.locator('[name="salary"]').fill("65000");
    await page.locator("#saveButton").click();
    await page.locator("#editor").waitFor({ state: "hidden" });
    await page.getByText("₹65,000", { exact: true }).waitFor();
    const download = page.waitForEvent("download");
    await page.locator('[data-action="export-employees"]').click();
    const report = await download;
    const downloaded = fs.readFileSync(await report.path(), "utf8");
    assert(downloaded.includes("UI-001"));
    assert(!downloaded.includes("person1@example.invalid"));
    await nav("departments");
    await page.locator('[data-action="add-department"]').click();
    await form.locator('[name="name"]').fill("Operations");
    await form.locator('[name="manager"]').fill("Test lead");
    await page.locator("#saveButton").click();
    await page.locator("#editor").waitFor({ state: "hidden" });
    await page
      .getByRole("heading", { name: "Operations", exact: true })
      .waitFor();
    await page.locator('[data-action="add-department"]').click();
    await form.locator('[name="name"]').fill("Operations");
    await page.locator("#saveButton").click();
    await page
      .locator("#formError")
      .filter({ hasText: "already exists" })
      .waitFor();
    await page.locator("#cancelDialog").click();
    await nav("attendance");
    await page.locator(".attendance-status").first().waitFor();
    await page.locator('[data-action="mark-present"]').click();
    await page.locator(".attendance-status").first().selectOption("REMOTE");
    await page.locator('[data-action="save-attendance"]').click();
    await page
      .locator("#attendanceSummary")
      .filter({ hasText: "recorded" })
      .waitFor();
    await page.reload();
    await page.locator(".attendance-status").first().waitFor();
    assert.equal(
      await page.locator(".attendance-status").first().inputValue(),
      "REMOTE",
    );
    const attendanceDownload = page.waitForEvent("download");
    await page.locator('[data-action="export-attendance"]').click();
    assert(
      fs
        .readFileSync(await (await attendanceDownload).path(), "utf8")
        .includes("REMOTE"),
    );
    await nav("payroll");
    assert((await page.locator("#view").textContent()).includes("₹65,000"));
    await nav("reports");
    const payrollDownload = page.waitForEvent("download");
    await page.locator('[data-action="export-payroll"]').click();
    assert(
      fs
        .readFileSync(await (await payrollDownload).path(), "utf8")
        .includes("65000"),
    );
    await nav("settings");
    await page.locator('#settingsForm [name="name"]').fill("Alex Morgan");
    await page.locator('#settingsForm [name="company"]').fill("PeopleDesk");
    await page.locator('#settingsForm [name="theme"]').selectOption("dark");
    await page
      .getByRole("button", { name: "Save preferences", exact: true })
      .click();
    assert(
      await page.locator("body").evaluate((e) => e.classList.contains("dark")),
    );
    await page.reload();
    await page.locator("#settingsForm").waitFor();
    assert.equal(await page.locator("#adminName").textContent(), "Alex Morgan");
    await nav("dashboard");
    await screenshot("dashboard-dark");
    await page.locator("#themeToggle").click();
    await page.setViewportSize({ width: 390, height: 844 });
    await screenshot("dashboard-mobile");
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "Mobile page overflows",
    );
    await page.locator("#menuToggle").click();
    await page.locator('.sidebar [data-page="employees"]').click();
    assert(
      !(await page
        .locator("#sidebar")
        .evaluate((e) => e.classList.contains("open"))),
    );
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "Mobile directory overflows",
    );
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.locator("#employeeSearch").fill("UI-001");
    page.once("dialog", (dialog) => dialog.accept());
    await page
      .getByRole("button", {
        name: "Delete employee UI <script>Test</script>",
        exact: true,
      })
      .click();
    await page
      .getByRole("heading", { name: "No matching employees" })
      .waitFor();
    await nav("dashboard");
    await screenshot("dashboard-desktop");
    await page.setViewportSize({ width: 390, height: 844 });
    await screenshot("dashboard-mobile");
    await page.setViewportSize({ width: 1440, height: 1100 });
    await nav("employees");
    await page.route("**/api/admin/departments", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: '{"message":"Temporary test outage"}',
      }),
    );
    await page.reload();
    await page
      .locator("#loadError")
      .filter({ hasText: "Temporary test outage" })
      .waitFor();
    await page.unroute("**/api/admin/departments");
    await page.getByRole("button", { name: "Retry", exact: true }).click();
    await page.locator("#employeeSearch").waitFor();
    await page.locator("#logout").click();
    await page.waitForURL("**/index.html");
    await page.goto(base + "/admin-dashboard.html");
    await page.waitForURL("**/index.html");
    assert.deepEqual(errors, []);
    console.log(
      "PASS: desktop/mobile layout, login/logout, employee CRUD/filter/pagination, departments, attendance persistence, CSV reports, theme, and API failure recovery.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
