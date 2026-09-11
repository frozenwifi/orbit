import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";

const require = createRequire(import.meta.url);
const sharp = require("/Users/omarparreira/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");
const { chromium } = require("/Users/omarparreira/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const project = "/Users/omarparreira/Documents/Codex/2026-08-21/h/outputs/orbit-app";
const screenshots = `${project}/screenshots`;
const references = "/Users/omarparreira/Documents/Codex/2026-08-21/h/work/figma-admin-customers";
const baseUrl = "http://127.0.0.1:4173";
const customerUrl = `${baseUrl}/admin/customers`;
const states = ["list", "delete-confirmation", "delete-success", "new-modal", "detail"];
const referenceIndex = { list: "01", "delete-confirmation": "02", "delete-success": "03", "new-modal": "04", detail: "05" };

await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 1920, height: 1397 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
const page = await context.newPage();
const consoleErrors = [];
const failedResponses = [];
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", (error) => consoleErrors.push(error.message));
page.on("response", (response) => { if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`); });

async function loadCustomers(theme) {
  await page.goto(customerUrl, { waitUntil: "networkidle" });
  await page.evaluate((nextTheme) => window.localStorage.setItem("orbit-theme", nextTheme), theme);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(80);
}

async function shot(name) {
  await page.screenshot({ path: `${screenshots}/${name}.png`, fullPage: false, type: "png" });
}

async function captureTheme(theme) {
  await loadCustomers(theme);
  await shot(`admin-customers-list-${theme}`);

  await page.getByRole("button", { name: "Add customer" }).click();
  await page.waitForTimeout(80);
  await shot(`admin-customers-new-modal-${theme}`);
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.getByRole("button", { name: "Delete Jane Doe" }).first().click();
  await page.waitForTimeout(80);
  await shot(`admin-customers-delete-confirmation-${theme}`);
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.getByRole("button", { name: "Jane Doe", exact: true }).first().click();
  await page.waitForURL(/\/admin\/customers\?customer=/);
  await page.waitForTimeout(80);
  await shot(`admin-customers-detail-${theme}`);

  await loadCustomers(theme);
  await page.getByRole("button", { name: "Delete Jane Doe" }).first().click();
  await page.getByRole("button", { name: "Confirm" }).click();
  await page.getByRole("status").waitFor({ state: "visible" });
  await shot(`admin-customers-delete-success-${theme}`);
}

await captureTheme("light");
await captureTheme("dark");

const comparisonMetrics = {};
for (const theme of ["light", "dark"]) {
  for (const state of states) {
    const reference = `${references}/${theme}-${referenceIndex[state]}.png`;
    const implementation = `${screenshots}/admin-customers-${state}-${theme}.png`;
    const referenceBuffer = await sharp(reference).resize(1920, 1397, { fit: "fill" }).removeAlpha().raw().toBuffer();
    const implementationBuffer = await sharp(implementation).resize(1920, 1397, { fit: "fill" }).removeAlpha().raw().toBuffer();
    let total = 0;
    let changed = 0;
    for (let index = 0; index < referenceBuffer.length; index += 1) {
      const delta = Math.abs(referenceBuffer[index] - implementationBuffer[index]);
      total += delta;
      if (delta > 16) changed += 1;
    }
    comparisonMetrics[`${theme}-${state}`] = {
      meanAbsoluteChannelDelta: Number((total / referenceBuffer.length).toFixed(3)),
      changedChannelsOver16Percent: Number((changed / referenceBuffer.length * 100).toFixed(3)),
    };
    const header = Buffer.from(`<svg width="3840" height="54" xmlns="http://www.w3.org/2000/svg"><rect width="3840" height="54" fill="#101312"/><text x="28" y="35" fill="#fff" font-size="22" font-family="Arial" font-weight="700">FIGMA · ${theme.toUpperCase()} ${state.toUpperCase()}</text><text x="1948" y="35" fill="#fff" font-size="22" font-family="Arial" font-weight="700">IMPLEMENTATION · ${theme.toUpperCase()} ${state.toUpperCase()}</text><rect x="1919" width="2" height="54" fill="#8bc34a"/></svg>`);
    await sharp({ create: { width: 3840, height: 1451, channels: 3, background: "#101312" } })
      .composite([
        { input: header, left: 0, top: 0 },
        { input: await sharp(reference).resize(1920, 1397, { fit: "fill" }).png().toBuffer(), left: 0, top: 54 },
        { input: await sharp(implementation).resize(1920, 1397, { fit: "fill" }).png().toBuffer(), left: 1920, top: 54 },
      ])
      .png({ compressionLevel: 9 })
      .toFile(`${screenshots}/admin-customers-${state}-${theme}-comparison.png`);
  }
}

const responsive = [];
for (const theme of ["light", "dark"]) {
  await page.setViewportSize({ width: 390, height: 844 });
  await loadCustomers(theme);
  const listOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await shot(`admin-customers-mobile-${theme}`);
  await page.getByRole("button", { name: "Add customer" }).click();
  const modal = await page.locator(".admin-customer-form-modal").boundingBox();
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.goto(`${customerUrl}?customer=CUS-1048`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Customer details" }).waitFor({ state: "visible" });
  await page.waitForTimeout(80);
  const detailOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  responsive.push({ theme, listOverflow, detailOverflow, modal });
}

await page.setViewportSize({ width: 1920, height: 1397 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.evaluate(() => window.localStorage.setItem("orbit-theme", "light"));

const protectedRoutes = [
  ["/admin", "regression-admin-dashboard-after-admin-customers"],
  ["/admin/esims", "regression-admin-esims-after-admin-customers"],
  ["/", "regression-superadmin-dashboard-after-admin-customers"],
  ["/esims", "regression-superadmin-esims-after-admin-customers"],
];
const protectedResults = [];
for (const [route, filename] of protectedRoutes) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.screenshot({ path: `${screenshots}/${filename}.png`, fullPage: false, type: "png" });
  protectedResults.push({ route, overflow, title: await page.title() });
}

await browser.close();
console.log(JSON.stringify({ comparisonMetrics, responsive, protectedResults, consoleErrors, failedResponses }, null, 2));
