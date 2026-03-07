/**
 * mobile-table-expand.js
 *
 * On mobile (< 768 px), tapping a table row reveals a detail row containing
 * the data from any columns that are currently hidden (whether via Bootstrap's
 * d-none d-md-table-cell classes or a CSS nth-child rule in theme.css).
 * Tapping the row a second time collapses the detail row.
 *
 * Works with every .table-responsive table.table on the page.
 * Links and buttons inside rows still fire normally and do not trigger the expand.
 * Opening the page at desktop width, or resizing to ≥ 768 px, collapses any
 * open detail rows automatically.
 */
(function () {
  'use strict';

  var DETAIL_CLASS     = 'table-row-detail';
  var EXPANDABLE_CLASS = 'table-row-expandable';

  /** Return the 0-based column indices whose header cell is currently display:none */
  function hiddenIndices(headerRow) {
    return Array.from(headerRow.cells).reduce(function (acc, th, i) {
      if (window.getComputedStyle(th).display === 'none') { acc.push(i); }
      return acc;
    }, []);
  }

  /** Build a <tr> containing one <td> that spans all columns and lists hidden field values.
   *  Each hidden field appears on its own line.  Cell innerHTML is used (not textContent) so
   *  that links, buttons and other interactive elements (e.g. "View Photos" collapse triggers)
   *  remain functional inside the detail row. */
  function buildDetailRow(row, indices, headerRow) {
    var lines = indices.map(function (i) {
      var label = (headerRow.cells[i] && headerRow.cells[i].textContent.trim()) || '';
      var value = (row.cells[i]       && row.cells[i].innerHTML.trim())         || '\u2014';
      return '<div><strong>' + label + ':</strong>\u00a0' + value + '</div>';
    });

    var tr = document.createElement('tr');
    tr.className = DETAIL_CLASS;

    var td = document.createElement('td');
    td.colSpan = row.cells.length;
    td.innerHTML = lines.join('');

    tr.appendChild(td);
    return tr;
  }

  /** Remove the detail row that follows this row, if present */
  function collapse(row) {
    var next = row.nextElementSibling;
    if (next && next.classList.contains(DETAIL_CLASS)) { next.remove(); }
    row.removeAttribute('aria-expanded');
  }

  /** Toggle the detail row for a data row */
  function toggle(row, headerRow) {
    var indices = hiddenIndices(headerRow);

    // On desktop nothing is hidden — clean up any stale detail rows and bail
    if (indices.length === 0) { collapse(row); return; }

    var next = row.nextElementSibling;
    if (next && next.classList.contains(DETAIL_CLASS)) {
      collapse(row);
    } else {
      row.after(buildDetailRow(row, indices, headerRow));
      row.setAttribute('aria-expanded', 'true');
    }
  }

  function initTable(table) {
    var thead = table.querySelector('thead tr');
    if (!thead) { return; }
    var tbody = table.querySelector('tbody');
    if (!tbody) { return; }

    // Auto-collapse open rows when the viewport grows to desktop width
    var mq = window.matchMedia('(min-width: 768px)');
    mq.addEventListener('change', function (e) {
      if (!e.matches) { return; }
      tbody.querySelectorAll('.' + DETAIL_CLASS).forEach(function (r) { r.remove(); });
      tbody.querySelectorAll('[aria-expanded]').forEach(function (r) {
        r.removeAttribute('aria-expanded');
      });
    });

    Array.from(tbody.rows).forEach(function (row) {
      row.classList.add(EXPANDABLE_CLASS);
      row.setAttribute('tabindex', '0');
      // Screen readers announce this as a button; aria-label is overridden once expanded
      row.setAttribute('aria-label', 'Row — tap to expand hidden details');

      function handleActivate(e) {
        // Let clicks on links / buttons inside the row pass through unchanged
        if (e.target.closest('a, button')) { return; }
        toggle(row, thead);
      }

      row.addEventListener('click', handleActivate);
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleActivate(e); }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.table-responsive table.table').forEach(initTable);
  });
}());
