# How to add an Excel-style set filter to a column

Twelve support tickets, one Status column. `filter: 'set'` on the column definition is all it
takes: the grid reads the column's own distinct values and builds a checkbox list under the
heading's funnel icon, with a search box above it for a longer list. Tick or clear a value and the
table narrows to match, the same pattern a spreadsheet user already knows from AutoFilter.

Live demo: https://toclocoinc.github.io/lattice-grid-howto-set-filter-on-a-column/

**Read the how-to:** https://www.latticegrid.dev/docs/how-to/set-filter-on-a-column/

## The snippet

```js
const grid = LatticeGrid.createGrid(document.getElementById('grid'), {
  rowKey: 'id',
  columns: [
    { field: 'id', title: 'Ticket' },
    { field: 'title', title: 'Title' },
    { field: 'status', title: 'Status', filter: 'set' },
    { field: 'owner', title: 'Owner' },
  ],
  rows, // twelve tickets
});

// The same filter, set from code rather than by ticking boxes:
grid.filters.set({ col: 'status', op: 'in', value: ['Open', 'Blocked'] });
grid.filters.clear(); // back to everything
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
