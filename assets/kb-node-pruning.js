(() => {
  'use strict';

  const HIDDEN_NODE_TYPES = new Set(['author', 'venue', 'year', 'section']);
  const HIDDEN_RELATIONS = new Set(['authored-by', 'published-in', 'published', 'contains']);

  const typeFilters = document.getElementById('typeFilters');
  const edgeFilters = document.getElementById('edgeFilters');
  const graph = document.getElementById('graph');
  const legend = document.querySelector('.legend');
  if (!typeFilters || !edgeFilters || !graph) return;

  let queued = false;
  let enforcing = false;

  function removeFilterRows(container, dataKey, hiddenValues) {
    const removedInputs = [];
    container.querySelectorAll('input').forEach(input => {
      const value = input.dataset[dataKey];
      if (!hiddenValues.has(value)) return;
      input.checked = false;
      removedInputs.push(input);
    });
    removedInputs.forEach(input => input.closest('.check')?.remove());
    return removedInputs;
  }

  function removeLegendItems() {
    if (!legend) return;
    HIDDEN_NODE_TYPES.forEach(type => {
      legend.querySelectorAll(`.dot.${type}`).forEach(marker => marker.closest('span')?.remove());
    });
  }

  function nodeType(endpoint) {
    if (!endpoint) return null;
    if (typeof endpoint === 'object') return endpoint.type || null;
    const group = [...graph.querySelectorAll('g.node')].find(node => node.__data__?.id === endpoint);
    return group?.__data__?.type || null;
  }

  function pruneRenderedGraph() {
    graph.querySelectorAll('g.node').forEach(group => {
      if (HIDDEN_NODE_TYPES.has(group.__data__?.type)) group.remove();
    });

    graph.querySelectorAll('.links line').forEach(line => {
      const link = line.__data__;
      if (!link) return;
      if (HIDDEN_RELATIONS.has(link.relation) ||
          HIDDEN_NODE_TYPES.has(nodeType(link.source)) ||
          HIDDEN_NODE_TYPES.has(nodeType(link.target))) {
        line.remove();
      }
    });
  }

  function updateStatus() {
    const status = document.getElementById('graphStatus');
    if (!status) return;
    const nodeCount = graph.querySelectorAll('g.node').length;
    const edgeCount = graph.querySelectorAll('.links line').length;
    status.textContent = `${nodeCount} nodes · ${edgeCount} relationships`;
  }

  function enforce() {
    queued = false;
    if (enforcing) return;
    enforcing = true;

    const removedTypes = removeFilterRows(typeFilters, 'type', HIDDEN_NODE_TYPES);
    const removedRelations = removeFilterRows(edgeFilters, 'relation', HIDDEN_RELATIONS);
    removeLegendItems();
    pruneRenderedGraph();
    updateStatus();

    enforcing = false;

    const trigger = removedTypes[0] || removedRelations[0];
    if (trigger) {
      // The original graph registered its change listener directly on these inputs.
      // Dispatching after removal forces one clean rerender using only remaining filters.
      trigger.dispatchEvent(new Event('change'));
      requestAnimationFrame(() => {
        pruneRenderedGraph();
        removeLegendItems();
        updateStatus();
      });
    }
  }

  function queueEnforce() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(enforce);
  }

  const filterObserver = new MutationObserver(queueEnforce);
  filterObserver.observe(typeFilters, { childList: true, subtree: true });
  filterObserver.observe(edgeFilters, { childList: true, subtree: true });

  const graphObserver = new MutationObserver(queueEnforce);
  graphObserver.observe(graph, { childList: true, subtree: true });

  if (legend) {
    const legendObserver = new MutationObserver(queueEnforce);
    legendObserver.observe(legend, { childList: true, subtree: true });
  }

  document.querySelectorAll('[data-preset]').forEach(button => {
    button.addEventListener('click', () => setTimeout(queueEnforce, 0));
  });
  document.getElementById('resetView')?.addEventListener('click', () => setTimeout(queueEnforce, 0));

  enforce();

  import(new URL('assets/kb-meta-nodes.js?v=1', document.baseURI).href)
    .catch(error => console.warn('Repository meta node support unavailable:', error));
})();
