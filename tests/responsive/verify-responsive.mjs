import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(SCRIPT_DIR, '..', 'reports');
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const ROUTES = ['/', '/login', '/signup'];
const VIEWPORT_WIDTHS = [360, 768, 1024, 1920];
const HEIGHT = 900;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const route of ROUTES) {
      for (const width of VIEWPORT_WIDTHS) {
        const page = await browser.newPage({
          viewport: { width, height: HEIGHT },
        });
        const pageErrors = [];

        page.on('pageerror', (error) => pageErrors.push(error.message));

        try {
          const response = await page.goto(new URL(route, BASE_URL).toString(), {
            waitUntil: 'load',
            timeout: 30000,
          });

          const layout = await page.evaluate(() => ({
            viewportWidth: window.innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            bodyWidth: document.body.scrollWidth,
            horizontalOverflow:
              document.documentElement.scrollWidth > window.innerWidth + 1 ||
              document.body.scrollWidth > window.innerWidth + 1,
          }));

          const result = {
            route,
            width,
            height: HEIGHT,
            httpStatus: response?.status() ?? null,
            ...layout,
            pageErrors,
            passed:
              Boolean(response) &&
              response.status() >= 200 &&
              response.status() < 400 &&
              !layout.horizontalOverflow &&
              pageErrors.length === 0,
          };

          results.push(result);
          console.log(
            `${result.passed ? 'PASS' : 'FAIL'} ${route} at ${width}px ` +
            `(HTTP ${result.httpStatus}, document ${result.documentWidth}px)`
          );
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    routes: ROUTES,
    viewportWidths: VIEWPORT_WIDTHS,
    results,
    overallPassed: results.length === ROUTES.length * VIEWPORT_WIDTHS.length &&
      results.every((result) => result.passed),
  };

  await mkdir(DIR, { recursive: true });
  await writeFile(
    path.join(DIR, 'responsive-results.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );

  const rows = results.map((result) =>
    `| ${result.route} | ${result.width} | ${result.httpStatus} | ` +
    `${result.documentWidth} | ${result.horizontalOverflow ? 'YES' : 'NO'} | ` +
    `${result.pageErrors.length} | ${result.passed ? 'PASS' : 'FAIL'} |`
  );

  const markdown = `# EMS-NFR-03 Responsive Browser Test Report

- Generated: ${report.generatedAt}
- Base URL: ${BASE_URL}
- Browser: Playwright Chromium (headless)
- Viewport heights: ${HEIGHT}px
- Tested routes: ${ROUTES.join(', ')}
- Tested widths: ${VIEWPORT_WIDTHS.join(', ')}px

| Route | Width (px) | HTTP | Document width (px) | Horizontal overflow | Page errors | Result |
|---|---:|---:|---:|---|---:|---|
${rows.join('\n')}

**Overall: ${report.overallPassed ? 'PASS' : 'FAIL'}**

This script checks the landing, login and signup routes only. It does not prove layout correctness for authenticated dashboards or every browser engine. Those routes require authenticated test setup and separate cross-browser execution.
`;

  await writeFile(path.join(DIR, 'responsive-report.md'), markdown);

  console.log(`Overall: ${report.overallPassed ? 'PASS' : 'FAIL'}`);
  console.log('Raw results: tests/reports/responsive-results.json');
  console.log('Report: tests/reports/responsive-report.md');

  if (!report.overallPassed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Responsive test failed:', error.message);
  process.exitCode = 1;
});

