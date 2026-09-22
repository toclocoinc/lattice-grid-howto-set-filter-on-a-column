/**
 * Load the demo in a real headless browser and check that it works.
 *
 * Serves the project locally and drives it with the same minimal Chrome
 * driver the grid's own test suite uses (tools/browser.js), so this needs no
 * dependency beyond Chrome itself.
 *
 * Checks:
 *   - the library arrived and left the LatticeGrid global behind;
 *   - all 12 tickets land in the grid (grid.rows.matchCount(), not a DOM
 *     count) before any filter is set;
 *   - clicking the Status column's funnel icon opens the set-filter popup,
 *     with a search box (`.lat-filter__search`) above the checkbox list;
 *   - clearing every tick and then ticking just "Open" narrows the grid to
 *     the 4 tickets whose status is Open;
 *   - the "Filter from code" button applies the equivalent
 *     `grid.filters.set({ col: 'status', op: 'in', value: [...] })` and
 *     narrows the grid to the 6 Open-or-Blocked tickets;
 *   - "Clear filter" removes it and all 12 tickets return;
 *   - nothing logged a console error or threw while the page ran.
 *
 * Exits non-zero on any failure, so it can gate a deployment.
 *
 * Usage: node tools/verify.mjs
 */

import { startServer } from './serve.mjs';
import { Browser, available } from './browser.js';

if (!available()) {
  console.log('No headless browser on this machine; skipping verify.mjs.');
  process.exit(0);
}

// The same 12 tickets demo.js loads, so every expected count is computed
// here rather than hard-coded, and stays honest if the data ever changes.
const TICKETS = [
  { id: 'T-101', status: 'Open' },
  { id: 'T-102', status: 'In progress' },
  { id: 'T-103', status: 'Blocked' },
  { id: 'T-104', status: 'Done' },
  { id: 'T-105', status: 'Open' },
  { id: 'T-106', status: 'Done' },
  { id: 'T-107', status: 'Blocked' },
  { id: 'T-108', status: 'In progress' },
  { id: 'T-109', status: 'Open' },
  { id: 'T-110', status: 'In progress' },
  { id: 'T-111', status: 'Done' },
  { id: 'T-112', status: 'Open' },
];
const openCount = TICKETS.filter((t) => t.status === 'Open').length;
const openOrBlockedCount = TICKETS.filter((t) => t.status === 'Open' || t.status === 'Blocked').length;

const { server, port } = await startServer();
const browser = new Browser();

try {
  await browser.start();

  await browser.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__errs = [];
      addEventListener('error', (e) => window.__errs.push(String(e.message || e)));
      addEventListener('unhandledrejection', (e) => window.__errs.push('unhandledrejection: ' + String(e.reason)));
      const origError = console.error.bind(console);
      console.error = (...args) => { window.__errs.push('console.error: ' + args.map(String).join(' ')); origError(...args); };
    `,
  });

  await browser.open(`http://127.0.0.1:${port}/`);
  await new Promise((r) => setTimeout(r, 500));

  const failures = [];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const hasGrid = await browser.evaluate(`typeof LatticeGrid !== 'undefined' && typeof LatticeGrid.createGrid === 'function'`);
  if (!hasGrid) failures.push('LatticeGrid.createGrid was not found on the page');

  const initialCount = await browser.evaluate(`window.__demoGrid.rows.matchCount()`);
  if (initialCount !== 12) failures.push(`expected 12 tickets before any filter, grid reports ${initialCount}`);

  // Open the Status column's funnel.
  await browser.evaluate(`document.querySelector('.lat-header-cell[data-col="status"] .lat-header-filter').click()`);
  await wait(200);

  const popupOpen = await browser.evaluate(`!!document.querySelector('.lat-filter-popup .lat-filter--set')`);
  if (!popupOpen) failures.push('the set-filter popup did not open on the Status column');

  const hasSearchBox = await browser.evaluate(`!!document.querySelector('.lat-filter-popup .lat-filter__search')`);
  if (!hasSearchBox) failures.push('the set-filter popup has no search box (.lat-filter__search)');

  // Clear every tick, then tick just "Open".
  await browser.evaluate(`document.querySelector('.lat-filter-popup .lat-filter__none').click()`);
  await wait(100);
  const afterNone = await browser.evaluate(`window.__demoGrid.rows.matchCount()`);
  if (afterNone !== 0) failures.push(`expected 0 tickets with every value cleared, grid reports ${afterNone}`);

  // The checkbox list activates on mousedown (it calls preventDefault to stop
  // a focus-and-select drag), not click, so a real click() would do nothing.
  const tickedOpen = await browser.evaluate(`
    (() => {
      const rows = [...document.querySelectorAll('.lat-filter-popup .lat-list__option')];
      const row = rows.find((r) => r.textContent.trim() === 'Open');
      if (!row) return false;
      row.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      return true;
    })()
  `);
  if (!tickedOpen) failures.push('could not find an "Open" row in the checkbox list to tick');
  await wait(150);

  const afterTickOpen = await browser.evaluate(`window.__demoGrid.rows.matchCount()`);
  if (afterTickOpen !== openCount) {
    failures.push(`ticking "Open" alone: expected ${openCount} tickets, grid reports ${afterTickOpen}`);
  }

  // "Clear filter" resets to everything.
  await browser.evaluate(`document.getElementById('clearFilter').click()`);
  await wait(150);
  const afterClear = await browser.evaluate(`window.__demoGrid.rows.matchCount()`);
  if (afterClear !== 12) failures.push(`"Clear filter" should restore all 12 tickets, grid reports ${afterClear}`);

  // The same filter, set from code.
  await browser.evaluate(`document.getElementById('codeFilter').click()`);
  await wait(150);
  const afterCodeFilter = await browser.evaluate(`window.__demoGrid.rows.matchCount()`);
  if (afterCodeFilter !== openOrBlockedCount) {
    failures.push(`"Filter from code" (Open + Blocked): expected ${openOrBlockedCount} tickets, grid reports ${afterCodeFilter}`);
  }

  await browser.evaluate(`document.getElementById('clearFilter').click()`);
  await wait(150);
  const afterFinalClear = await browser.evaluate(`window.__demoGrid.rows.matchCount()`);
  if (afterFinalClear !== 12) failures.push(`final "Clear filter" should restore all 12 tickets, grid reports ${afterFinalClear}`);

  const errors = await browser.evaluate('window.__errs');
  if (errors.length) failures.push(`console/window errors: ${errors.join(' | ')}`);

  if (failures.length) {
    console.error('FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log(
      'OK: 12 tickets loaded, the Status funnel opened a checkbox list with a search box, ' +
      `ticking "Open" alone narrowed to ${openCount}, clearing restored 12, the code-set filter ` +
      `narrowed to ${openOrBlockedCount} (Open + Blocked), and clearing again restored 12. 0 console errors.`
    );
  }
} finally {
  await browser.close();
  server.close();
}
