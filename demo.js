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
