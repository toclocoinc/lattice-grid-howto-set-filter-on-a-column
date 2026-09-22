# How to add an Excel-style set filter to a column

Twelve support tickets, one Status column. `filter: 'set'` on the column definition is all it
takes: the grid reads the column's own distinct values and builds a checkbox list under the
heading's funnel icon, with a search box above it for a longer list. Tick or clear a value and the
table narrows to match, the same pattern a spreadsheet user already knows from AutoFilter.

Live demo: https://toclocoinc.github.io/lattice-grid-howto-set-filter-on-a-column/

**Read the how-to:** https://www.latticegrid.dev/docs/how-to/set-filter-on-a-column/

## The full source

Two files: `index.html` loads the grid and declares the mount point, `demo.js` configures and creates it. Copy both as they are below and it runs.

### index.html

```html
<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>How to add an Excel-style set filter to a column</title>
    <meta
      name="description"
      content="Tick the statuses you want from a checkbox list built from the column's own distinct values, the way a spreadsheet filter works. Twelve support tickets, one Status column, one funnel icon. Built with Lattice Grid loaded by script tag, no install and no build."
    />
    <link rel="icon" href="data:," />
    <!--
      The grid's stylesheet, from jsDelivr. The address names the exact
      release, 1.68.2, and carries the hash of the file it expects, so the
      page can never quietly pick up a different build than the one it was
      checked against.
    -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.css"
      integrity="sha384-mcpd7S8C5nz58bZDAXdYH6rzezEhfN7B4u2SlW426dSe20GnkxTu4TygyOILnCth"
      crossorigin="anonymous"
    />
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #f4f6f9; color: #131a24; }
      header { padding: 1.5rem 1.5rem 0.5rem; max-width: 960px; margin: 0 auto; }
      header p { color: #4a5568; }
      header a { color: #2d6bff; }
      main { max-width: 960px; margin: 0 auto; padding: 0 1.5rem 2.5rem; }
      #toolbar { margin: 0 0 0.75rem; display: flex; gap: 0.5rem; }
      #toolbar button { font: inherit; padding: 0.4rem 0.75rem; border: 1px solid #ccd3dc; border-radius: 4px; background: #fff; cursor: pointer; }
      #grid { height: 300px; }
      #stat { font-size: 0.9rem; color: #4a5568; margin: 0.75rem 0 0; }
    </style>
  </head>
  <body>
    <header>
      <h1>How to add an Excel-style set filter to a column</h1>
      <p>
        Twelve support tickets, one Status column. Click the funnel icon on the Status heading and a
        checkbox list of its distinct values opens, with a search box above it for when there are
        many. Tick or clear values and the table narrows to match. Read the
        <a href="https://www.latticegrid.dev/docs/how-to/set-filter-on-a-column/">full how-to</a>
        on latticegrid.dev.
      </p>
    </header>
    <main>
      <div id="toolbar">
        <button id="codeFilter" type="button">Filter to Open + Blocked (from code)</button>
        <button id="clearFilter" type="button">Clear filter</button>
      </div>
      <div id="grid"></div>
      <p id="stat"></p>
    </main>

    <!--
      The library, as a classic script tag. No npm install, no bundler, no
      type="module": the file runs as it arrives and leaves the LatticeGrid
      global behind.
    -->
    <script
      src="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.js"
      integrity="sha384-vCzLyFYn0T0lz/vkdH4x0JpJZkOazZgI2LiGui7lm5uerdZd0Z46G9hr3Aq1FFPS"
      crossorigin="anonymous"
    ></script>
    <script src="./demo.js"></script>
  </body>
</html>
```

### demo.js

```js
/**
 * An Excel-style set filter on the Status column.
 *
 * `filter: 'set'` is all a column needs: the grid reads the column's own
 * distinct values, builds the checkbox list and the search box above it, and
 * keeps the list ticked in step with whatever else changed the filter,
 * including code. Nothing else on the grid has to know a set filter is there.
 */

// Tied to toclocoinc.github.io only; has no effect anywhere else and needs
// no key at all to run this page from a local copy.
LatticeGrid.setLicence(
  'LG1.eyJ2IjoxLCJwIjoibGF0dGljZS1ncmlkIiwidCI6IlRPQ0xPQ08gSW5jIC0gcHVibGljIGRlbW9zIiwiZSI6IjIwMzAtMDEtMDEiLCJkIjpbInRvY2xvY29pbmMuZ2l0aHViLmlvIl19.9De42ua3aCGpiMB6EVRP7Tv-upUlDI-0T07rlSPzvCrsqg8t4YJi7SRnStEpAg48uzmcG7il1fR_TfwkUE7iCA'
);

const TICKETS = [
  { id: 'T-101', title: 'Checkout button unresponsive on Safari', status: 'Open', owner: 'Amara Chen' },
  { id: 'T-102', title: 'Add CSV export to reports', status: 'In progress', owner: 'Ben Oduya' },
  { id: 'T-103', title: 'Search index rebuild fails nightly', status: 'Blocked', owner: 'Carla Nunes' },
  { id: 'T-104', title: 'Dark mode contrast on labels', status: 'Done', owner: 'Dev Patel' },
  { id: 'T-105', title: 'Webhook retries not backing off', status: 'Open', owner: 'Elin Karlsson' },
  { id: 'T-106', title: 'Pagination off by one on last page', status: 'Done', owner: 'Faisal Rahman' },
  { id: 'T-107', title: 'SSO login redirect loop', status: 'Blocked', owner: 'Grace Kim' },
  { id: 'T-108', title: 'Timezone shown wrong in audit log', status: 'In progress', owner: 'Hugo Alves' },
  { id: 'T-109', title: 'Bulk delete missing confirmation', status: 'Open', owner: 'Ines Moreau' },
  { id: 'T-110', title: 'Slow query on invoices view', status: 'In progress', owner: 'Jonas Weber' },
  { id: 'T-111', title: 'Broken favicon on staging', status: 'Done', owner: 'Keiko Sato' },
  { id: 'T-112', title: 'Duplicate email on signup', status: 'Open', owner: 'Liam Sullivan' },
];

const grid = LatticeGrid.createGrid(document.getElementById('grid'), {
  rowKey: 'id',
  columnDefaults: { sort: true },
  columns: [
    { field: 'id', title: 'Ticket', layout: { width: 90 } },
    { field: 'title', title: 'Title', layout: { flex: 1, min: 220 } },
    { field: 'status', title: 'Status', filter: 'set', layout: { width: 140 } },
    { field: 'owner', title: 'Owner', layout: { width: 150 } },
  ],
  rows: TICKETS,
});
window.__demoGrid = grid; // read by tools/verify.mjs

const stat = document.getElementById('stat');
function updateStat() {
  stat.textContent = `${grid.rows.matchCount()} of ${TICKETS.length} tickets shown`;
}
grid.on('filter:changed', updateStat);
updateStat();

// The same set filter, applied from code rather than by ticking boxes: the
// menu reopens already showing these two values checked.
document.getElementById('codeFilter').addEventListener('click', () => {
  grid.filters.set({ col: 'status', op: 'in', value: ['Open', 'Blocked'] });
});
document.getElementById('clearFilter').addEventListener('click', () => {
  grid.filters.clear();
});
```

`op: 'in'` is a set-membership condition: it matches a column value against a list, exactly what
the checkbox list itself produces when ticked. `grid.filters.set()` and the funnel's checkbox list
merge into the one filter tree, so setting it from code and then opening the menu shows the same
values checked, and clearing it clears both.

## Running it yourself

Open `index.html` in a browser, or serve the folder with any static file server. The grid loads
from jsDelivr by script tag, so there is no install and no build step. It runs keyless on
`localhost`; the licence key in `demo.js` is bound to `toclocoinc.github.io` and has no effect
anywhere else.

## Licence

MIT, see [LICENSE](./LICENSE). Lattice Grid itself is licensed separately per domain:
https://www.latticegrid.dev/pricing/
