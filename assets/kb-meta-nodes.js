(() => {
  'use strict';

  const META_PATHS = new Set([
    'notes/knowledge-graph-explorer.md',
    'references.md'
  ]);

  const graph = document.getElementById('graph');
  const typeFilters = document.getElementById('typeFilters');
  const legend = document.querySelector('.legend');
  const inspector = document.getElementById('inspectorContent');
  const controls = document.getElementById('controls');
  if (!graph || !typeFilters) return;

  let metaToggle = null;
  let syncQueued = false;

  function isMetaNode(node) {
    if (!node?.path || node.type !== 'knowledge') return false;
    return META_PATHS.has(node.path) || /(^|\/)README\.md$/i.test(node.path);
  }

  function nodeRadius(node) {
    const base = 8;
    if (document.getElementById('nodeSizeMode')?.value === 'fixed') return base;
    return Math.min(base + Math.sqrt(Math.max(0, node?.degree || 0)) * 1.7, 18);
  }

  function metaPath(radius) {
    const top = radius * .78;
    const bottom = radius * 1.18;
    const h = radius;
    return `M${-top},${-h}L${top},${-h}L${bottom},${h}L${-bottom},${h}Z`;
  }

  function installStyles() {
    if (document.getElementById('kb-meta-node-styles')) return;
    const style = document.createElement('style');
    style.id = 'kb-meta-node-styles';
    style.textContent = `
      :root { --repo-meta: #64748b; }
      .node[data-repo-meta="true"] .kb-node-shape { fill: var(--repo-meta) !important; }
      .dot.repo-meta {
        background: var(--repo-meta);
        border-radius: 0;
        clip-path: polygon(18% 0,82% 0,100% 100%,0 100%);
      }
    `;
    document.head.appendChild(style);
  }

  function makeMetaFilter() {
    const existing = typeFilters.querySelector('input[data-visual-type="repo-meta"]');
    if (existing) {
      metaToggle = existing;
      return true;
    }

    const knowledgeRow = typeFilters.querySelector('.kb-knowledge-filter:last-of-type')
      || typeFilters.querySelector('input[data-type="knowledge"]')?.closest('.check');
    if (!knowledgeRow) return false;

    const row = document.createElement('div');
    row.className = 'check kb-meta-filter';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = false;
    input.dataset.visualType = 'repo-meta';
    input.id = 'type-repo-meta';

    const marker = document.createElement('span');
    marker.className = 'dot repo-meta';

    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.textContent = 'Repository / meta';

    row.append(input, marker, label);
    knowledgeRow.after(row);
    metaToggle = input;

    input.addEventListener('change', () => {
      if (input.checked) {
        const originalKnowledge = typeFilters.querySelector('input[data-type="knowledge"]');
        if (originalKnowledge && !originalKnowledge.checked) {
          originalKnowledge.checked = true;
          originalKnowledge.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      queueSync();
    });

    return true;
  }

  function ensureLegendEntry() {
    if (!legend || legend.querySelector('.dot.repo-meta')) return;
    const item = document.createElement('span');
    const marker = document.createElement('i');
    marker.className = 'dot repo-meta';
    item.append(marker, document.createTextNode('repository / meta'));
    legend.appendChild(item);
  }

  function decorateMetaNodes() {
    const enabled = metaToggle?.checked === true;

    graph.querySelectorAll('g.node').forEach(group => {
      const node = group.__data__;
      const meta = isMetaNode(node);
      if (!meta) {
        if (group.dataset.repoMeta === 'true') delete group.dataset.repoMeta;
        return;
      }

      group.dataset.repoMeta = 'true';
      group.style.display = enabled ? '' : 'none';
      group.setAttribute('aria-label', `Repository / meta: ${node.label}`);

      const shape = group.querySelector('path.kb-node-shape');
      if (shape) {
        const path = metaPath(nodeRadius(node));
        if (shape.getAttribute('d') !== path) shape.setAttribute('d', path);
      }

      const title = group.querySelector('title');
      if (title) title.textContent = `${node.label}\nRepository / meta`;
    });

    graph.querySelectorAll('.links line').forEach(line => {
      const link = line.__data__;
      const source = typeof link?.source === 'object' ? link.source : null;
      const target = typeof link?.target === 'object' ? link.target : null;
      if (!isMetaNode(source) && !isMetaNode(target)) return;
      line.style.display = enabled ? '' : 'none';
    });
  }

  function syncInspector() {
    if (!inspector) return;
    const selected = graph.querySelector('g.node.selected[data-repo-meta="true"]');
    if (!selected) return;
    const eyebrow = inspector.querySelector('.eyebrow');
    if (eyebrow) eyebrow.textContent = 'Repository / meta';
  }

  function syncStatus() {
    const status = document.getElementById('graphStatus');
    if (!status) return;
    const visibleNodes = [...graph.querySelectorAll('g.node')]
      .filter(node => getComputedStyle(node).display !== 'none').length;
    const visibleLinks = [...graph.querySelectorAll('.links line')]
      .filter(line => getComputedStyle(line).display !== 'none').length;
    status.textContent = `${visibleNodes} nodes · ${visibleLinks} relationships`;
  }

  function sync() {
    syncQueued = false;
    if (!makeMetaFilter()) return;
    ensureLegendEntry();
    decorateMetaNodes();
    syncInspector();
    syncStatus();
  }

  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(sync);
  }

  installStyles();

  const graphObserver = new MutationObserver(queueSync);
  graphObserver.observe(graph, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });

  const filterObserver = new MutationObserver(queueSync);
  filterObserver.observe(typeFilters, { childList: true, subtree: true });

  if (inspector) {
    const inspectorObserver = new MutationObserver(queueSync);
    inspectorObserver.observe(inspector, { childList: true, subtree: true });
  }

  controls?.addEventListener('change', queueSync);
  controls?.addEventListener('input', queueSync);

  document.querySelectorAll('[data-preset]').forEach(button => {
    button.addEventListener('click', () => setTimeout(() => {
      if (metaToggle) metaToggle.checked = button.dataset.preset === 'everything';
      queueSync();
    }, 0));
  });

  document.getElementById('resetView')?.addEventListener('click', () => setTimeout(() => {
    if (metaToggle) metaToggle.checked = false;
    queueSync();
  }, 0));

  queueSync();
})();
