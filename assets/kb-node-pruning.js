(() => {
  'use strict';

  const HIDDEN_NODE_TYPES = new Set(['author', 'venue', 'year', 'section']);
  const HIDDEN_RELATIONS = new Set(['authored-by', 'published-in', 'published', 'contains']);

  const typeFilters = document.getElementById('typeFilters');
  const edgeFilters = document.getElementById('edgeFilters');
  const legend = document.querySelector('.legend');
  if (!typeFilters || !edgeFilters) return;

  let enforcing = false;

  function disableRows(container, dataKey, hiddenValues) {
    let firstChanged = null;
    container.querySelectorAll('input').forEach(input => {
      const value = input.dataset[dataKey];
      if (!hiddenValues.has(value)) return;

      const row = input.closest('.check');
      if (row) row.hidden = true;

      if (input.checked) {
        input.checked = false;
        if (!firstChanged) firstChanged = input;
      }
    });
    return firstChanged;
  }

  function pruneLegend() {
    if (!legend) return;
    HIDDEN_NODE_TYPES.forEach(type => {
      legend.querySelectorAll(`.dot.${type}`).forEach(marker => marker.closest('span')?.remove());
    });
  }

  function enforce() {
    if (enforcing) return;
    enforcing = true;

    const changedType = disableRows(typeFilters, 'type', HIDDEN_NODE_TYPES);
    const changedRelation = disableRows(edgeFilters, 'relation', HIDDEN_RELATIONS);
    pruneLegend();

    const changed = changedType || changedRelation;
    enforcing = false;

    if (changed) {
      changed.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  const filterObserver = new MutationObserver(enforce);
  filterObserver.observe(typeFilters, { childList: true, subtree: true });
  filterObserver.observe(edgeFilters, { childList: true, subtree: true });

  if (legend) {
    const legendObserver = new MutationObserver(pruneLegend);
    legendObserver.observe(legend, { childList: true, subtree: true });
  }

  document.querySelectorAll('[data-preset]').forEach(button => {
    button.addEventListener('click', () => setTimeout(enforce, 0));
  });
  document.getElementById('resetView')?.addEventListener('click', () => setTimeout(enforce, 0));

  enforce();
})();
