(() => {
  'use strict';

  const article = document.getElementById('article');
  const docSelect = document.getElementById('docSelect');
  const openSelectedDoc = document.getElementById('openSelectedDoc');

  if (!article) return;

  function loadStructuredVisualSupport() {
    const assets = [
      ['assets/kb-diagrams.css', 'kbDiagrams'],
      ['assets/kb-simulations.css', 'kbSimulations']
    ];

    assets.forEach(([href, dataKey]) => {
      if (document.querySelector(`link[data-${dataKey.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}]`)) return;
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = new URL(href, document.baseURI).href;
      stylesheet.dataset[dataKey] = 'true';
      document.head.appendChild(stylesheet);
    });

    import(new URL('assets/kb-diagrams.js', document.baseURI).href)
      .catch(error => console.warn('Structured diagram support unavailable:', error));

    import(new URL('assets/kb-simulations.js', document.baseURI).href)
      .catch(error => console.warn('Structured simulation support unavailable:', error));
  }

  function currentDocumentPath() {
    try {
      const value = decodeURIComponent(location.hash.slice(1));
      return /^[a-zA-Z0-9_./-]+\.md$/.test(value) && !value.includes('..') ? value : null;
    } catch (_) {
      return null;
    }
  }

  function isRelativeReference(value) {
    if (!value || value.startsWith('#') || value.startsWith('/') || value.startsWith('//')) return false;
    return !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value);
  }

  function resolveReference(value, sourcePath) {
    const base = new URL(sourcePath, 'https://knowledge-base.local/');
    const target = new URL(value, base);
    return {
      path: decodeURIComponent(target.pathname.replace(/^\//, '')),
      search: target.search,
      hash: target.hash
    };
  }

  function repositoryUrl(resolved) {
    return new URL(`${resolved.path}${resolved.search}${resolved.hash}`, document.baseURI).href;
  }

  function isRegisteredDocument(path) {
    return Boolean(docSelect && [...docSelect.options].some(option => option.value === path));
  }

  function rewriteLinks() {
    const sourcePath = currentDocumentPath();
    if (!sourcePath) return;

    article.querySelectorAll('a[href]').forEach(link => {
      const original = link.getAttribute('href');
      if (!isRelativeReference(original)) return;

      let resolved;
      try {
        resolved = resolveReference(original, sourcePath);
      } catch (_) {
        return;
      }

      if (resolved.path.toLowerCase().endsWith('.md') && isRegisteredDocument(resolved.path)) {
        link.dataset.kbDocumentPath = resolved.path;
        link.href = `#${encodeURIComponent(resolved.path)}`;
        return;
      }

      link.href = repositoryUrl(resolved);
    });

    article.querySelectorAll('img[src]').forEach(image => {
      const original = image.getAttribute('src');
      if (!isRelativeReference(original)) return;
      try {
        image.src = repositoryUrl(resolveReference(original, sourcePath));
      } catch (_) {
        // Leave malformed image references untouched.
      }
    });

    article.querySelectorAll('source[src], video[src], audio[src]').forEach(media => {
      const original = media.getAttribute('src');
      if (!isRelativeReference(original)) return;
      try {
        media.src = repositoryUrl(resolveReference(original, sourcePath));
      } catch (_) {
        // Leave malformed media references untouched.
      }
    });
  }

  article.addEventListener('click', event => {
    const link = event.target.closest('a[data-kb-document-path]');
    if (!link || !article.contains(link)) return;

    const path = link.dataset.kbDocumentPath;
    if (!path || !docSelect || !openSelectedDoc) return;

    event.preventDefault();
    docSelect.value = path;
    openSelectedDoc.click();
  });

  const observer = new MutationObserver(() => queueMicrotask(rewriteLinks));
  observer.observe(article, { childList: true, subtree: true });

  rewriteLinks();
  loadStructuredVisualSupport();
})();

(() => {
  'use strict';

  const RELATED_PATHS = new Set([
    'topics/fast-decision-architectures.md',
    'topics/finite-state-machines.md',
    'topics/reactive-architectures-subsumption.md',
    'topics/utility-action-selection.md',
    'topics/learned-policies.md',
    'topics/model-predictive-control.md'
  ]);

  const TYPE_LABELS = {
    topic: 'Topics',
    'core-knowledge': 'Core knowledge',
    'related-knowledge': 'Related knowledge',
    paper: 'Papers',
    survey: 'Survey papers',
    'program-library': 'Program libraries',
    keyword: 'Keywords',
    author: 'Authors',
    venue: 'Venues',
    year: 'Years',
    section: 'Sections'
  };

  const graph = document.getElementById('graph');
  const typeFilters = document.getElementById('typeFilters');
  const inspector = document.getElementById('inspectorContent');
  if (!graph || !typeFilters) return;

  let coreToggle = null;
  let relatedToggle = null;
  let originalKnowledgeToggle = null;
  let syncQueued = false;

  function installStyles() {
    if (document.getElementById('kb-node-shape-overrides')) return;
    const style = document.createElement('style');
    style.id = 'kb-node-shape-overrides';
    style.textContent = `
      :root {
        --core-knowledge: var(--knowledge, #287a63);
        --related-knowledge: #4f6f9f;
        --survey: #b05a89;
      }
      .node .kb-node-shape { stroke: var(--panel); stroke-width: 1.8px; vector-effect: non-scaling-stroke; }
      .node.topic .kb-node-shape { fill: var(--topic); }
      .node.core-knowledge .kb-node-shape { fill: var(--core-knowledge); }
      .node.related-knowledge .kb-node-shape { fill: var(--related-knowledge); }
      .node.paper .kb-node-shape { fill: var(--paper); }
      .node.survey .kb-node-shape { fill: var(--survey); }
      .node.program-library .kb-node-shape { fill: var(--program-library); }
      .node.keyword .kb-node-shape { fill: var(--keyword); }
      .node.author .kb-node-shape { fill: var(--author); }
      .node.venue .kb-node-shape { fill: var(--venue); }
      .node.year .kb-node-shape { fill: var(--year); }
      .node.section .kb-node-shape { fill: var(--section); }
      .node.selected .kb-node-shape { stroke: var(--text); stroke-width: 3px; }
      .node.search-match .kb-node-shape { stroke: var(--accent); stroke-width: 3px; }

      .dot { border-radius: 0; }
      .dot.topic { background: var(--topic); border-radius: 50%; }
      .dot.core-knowledge { background: var(--core-knowledge); border-radius: 1px; }
      .dot.related-knowledge { background: var(--related-knowledge); clip-path: polygon(50% 0,100% 50%,50% 100%,0 50%); }
      .dot.paper { background: var(--paper); clip-path: polygon(50% 0,100% 100%,0 100%); }
      .dot.survey { background: var(--survey); clip-path: polygon(50% 0,61% 34%,98% 35%,68% 56%,79% 92%,50% 71%,21% 92%,32% 56%,2% 35%,39% 34%); }
      .dot.program-library { background: var(--program-library); clip-path: polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%); }
      .dot.keyword { background: var(--keyword); clip-path: polygon(35% 0,65% 0,65% 35%,100% 35%,100% 65%,65% 65%,65% 100%,35% 100%,35% 65%,0 65%,0 35%,35% 35%); }
      .dot.author { background: var(--author); border-radius: 50% / 35%; width: 12px; }
      .dot.venue { background: var(--venue); clip-path: polygon(50% 0,100% 38%,82% 100%,18% 100%,0 38%); }
      .dot.year { background: var(--year); clip-path: polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%); }
      .dot.section { background: var(--section); clip-path: polygon(0 15%,70% 15%,100% 50%,70% 85%,0 85%); }
      .kb-knowledge-original-filter { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  function visualTypeForNode(node) {
    if (!node) return null;
    if (node.type !== 'knowledge') return node.type;
    return RELATED_PATHS.has(node.path) ? 'related-knowledge' : 'core-knowledge';
  }

  function radiusForNode(node) {
    const visualType = visualTypeForNode(node);
    const base = {
      topic: 8,
      'core-knowledge': 8,
      'related-knowledge': 8,
      paper: 9,
      survey: 10,
      'program-library': 9,
      keyword: 5,
      author: 6,
      venue: 6,
      year: 6,
      section: 8
    }[visualType] || 6;
    const mode = document.getElementById('nodeSizeMode')?.value;
    if (mode === 'fixed') return base;
    return Math.min(base + Math.sqrt(Math.max(0, node.degree || 0)) * 1.7, 18);
  }

  function polygonPath(sides, radius, rotation = -Math.PI / 2) {
    const points = Array.from({ length: sides }, (_, index) => {
      const angle = rotation + index * Math.PI * 2 / sides;
      return [Math.cos(angle) * radius, Math.sin(angle) * radius];
    });
    return `M${points.map(point => point.join(',')).join('L')}Z`;
  }

  function tagPath(radius) {
    const w = radius * 1.35;
    const h = radius * .82;
    return `M${-w},${-h}L${w * .55},${-h}L${w},0L${w * .55},${h}L${-w},${h}Z`;
  }

  function capsulePath(radius) {
    const rx = radius * 1.3;
    const ry = radius * .78;
    return `M${-rx},0A${rx},${ry} 0 1 0 ${rx},0A${rx},${ry} 0 1 0 ${-rx},0Z`;
  }

  function shapePath(type, radius) {
    const area = Math.max(28, Math.PI * radius * radius);
    const symbol = d3.symbol().size(area);
    const symbolTypes = {
      topic: d3.symbolCircle,
      'core-knowledge': d3.symbolSquare,
      'related-knowledge': d3.symbolDiamond,
      paper: d3.symbolTriangle,
      survey: d3.symbolStar,
      keyword: d3.symbolCross
    };
    if (symbolTypes[type]) return symbol.type(symbolTypes[type])();
    if (type === 'program-library') return polygonPath(6, radius * 1.08);
    if (type === 'author') return capsulePath(radius);
    if (type === 'venue') return polygonPath(5, radius * 1.08);
    if (type === 'year') return polygonPath(8, radius * 1.04, Math.PI / 8);
    if (type === 'section') return tagPath(radius);
    return symbol.type(d3.symbolCircle)();
  }

  function makeFilterRow(type, label, checked) {
    const wrap = document.createElement('div');
    wrap.className = 'check kb-knowledge-filter';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.dataset.visualType = type;
    const marker = document.createElement('span');
    marker.className = `dot ${type}`;
    const text = document.createElement('label');
    text.textContent = label;
    text.addEventListener('click', () => input.click());
    wrap.append(input, marker, text);
    return { wrap, input };
  }

  function ensureKnowledgeFilters() {
    if (coreToggle && relatedToggle && originalKnowledgeToggle?.isConnected) return true;
    originalKnowledgeToggle = typeFilters.querySelector('input[data-type="knowledge"]');
    if (!originalKnowledgeToggle) return false;

    const originalRow = originalKnowledgeToggle.closest('.check');
    if (!originalRow) return false;
    originalRow.classList.add('kb-knowledge-original-filter');

    typeFilters.querySelectorAll('.kb-knowledge-filter').forEach(row => row.remove());
    const initial = originalKnowledgeToggle.checked;
    const core = makeFilterRow('core-knowledge', 'Core knowledge', initial);
    const related = makeFilterRow('related-knowledge', 'Related knowledge', initial);
    originalRow.before(core.wrap, related.wrap);
    coreToggle = core.input;
    relatedToggle = related.input;

    const updateCombinedFilter = () => {
      const shouldShowKnowledge = coreToggle.checked || relatedToggle.checked;
      if (originalKnowledgeToggle.checked !== shouldShowKnowledge) {
        originalKnowledgeToggle.checked = shouldShowKnowledge;
        originalKnowledgeToggle.dispatchEvent(new Event('change', { bubbles: true }));
      }
      queueSync();
    };
    coreToggle.addEventListener('change', updateCombinedFilter);
    relatedToggle.addEventListener('change', updateCombinedFilter);

    document.querySelectorAll('[data-preset]').forEach(button => {
      if (button.dataset.kbKnowledgePresetBound) return;
      button.dataset.kbKnowledgePresetBound = 'true';
      button.addEventListener('click', () => {
        setTimeout(() => {
          const includesKnowledge = ['concepts', 'everything'].includes(button.dataset.preset);
          coreToggle.checked = includesKnowledge;
          relatedToggle.checked = includesKnowledge;
          queueSync();
        }, 0);
      });
    });

    return true;
  }

  function renderLegend() {
    const legend = document.querySelector('.legend');
    if (!legend || legend.dataset.kbShapeLegend === 'true') return;
    legend.dataset.kbShapeLegend = 'true';
    legend.replaceChildren();
    Object.entries(TYPE_LABELS).forEach(([type, label]) => {
      const item = document.createElement('span');
      const marker = document.createElement('i');
      marker.className = `dot ${type}`;
      item.append(marker, document.createTextNode(label.toLowerCase()));
      legend.appendChild(item);
    });
  }

  function classifyAndShapeNodes() {
    graph.querySelectorAll('g.node').forEach(group => {
      const node = group.__data__;
      if (!node) return;
      const type = visualTypeForNode(node);
      group.dataset.visualType = type;
      group.classList.remove('core-knowledge', 'related-knowledge');
      if (type === 'core-knowledge' || type === 'related-knowledge') group.classList.add(type);

      let shape = group.querySelector('path.kb-node-shape');
      const circle = group.querySelector(':scope > circle');
      if (!shape) {
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        shape.classList.add('kb-node-shape');
        if (circle) circle.replaceWith(shape);
        else group.insertBefore(shape, group.firstChild);
      } else if (circle) {
        circle.remove();
      }
      const radius = radiusForNode(node);
      shape.setAttribute('d', shapePath(type, radius));
      const text = group.querySelector(':scope > text');
      if (text) text.setAttribute('x', String(radius + 5));
    });
  }

  function knowledgeVisible(node) {
    if (!node || node.type !== 'knowledge') return true;
    const type = visualTypeForNode(node);
    return type === 'related-knowledge' ? relatedToggle?.checked !== false : coreToggle?.checked !== false;
  }

  function applyKnowledgeVisibility() {
    graph.querySelectorAll('g.node').forEach(group => {
      const node = group.__data__;
      group.style.display = knowledgeVisible(node) ? '' : 'none';
    });
    graph.querySelectorAll('.links line').forEach(line => {
      const link = line.__data__;
      const source = typeof link?.source === 'object' ? link.source : null;
      const target = typeof link?.target === 'object' ? link.target : null;
      line.style.display = knowledgeVisible(source) && knowledgeVisible(target) ? '' : 'none';
    });

    const status = document.getElementById('graphStatus');
    if (status) {
      const visibleNodes = [...graph.querySelectorAll('g.node')].filter(node => node.style.display !== 'none').length;
      const visibleLinks = [...graph.querySelectorAll('.links line')].filter(line => line.style.display !== 'none').length;
      status.textContent = `${visibleNodes} nodes · ${visibleLinks} relationships`;
    }
  }

  function syncInspectorType() {
    if (!inspector) return;
    const selected = graph.querySelector('g.node.selected');
    const eyebrow = inspector.querySelector('.eyebrow');
    if (!selected || !eyebrow) return;
    const type = selected.dataset.visualType;
    if (type && TYPE_LABELS[type]) eyebrow.textContent = TYPE_LABELS[type];
  }

  function syncAll() {
    syncQueued = false;
    if (!ensureKnowledgeFilters()) return;
    renderLegend();
    classifyAndShapeNodes();
    applyKnowledgeVisibility();
    syncInspectorType();
  }

  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(syncAll);
  }

  installStyles();
  const graphObserver = new MutationObserver(queueSync);
  graphObserver.observe(graph, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  const filterObserver = new MutationObserver(queueSync);
  filterObserver.observe(typeFilters, { childList: true, subtree: true });
  if (inspector) {
    const inspectorObserver = new MutationObserver(queueSync);
    inspectorObserver.observe(inspector, { childList: true, subtree: true });
  }
  document.getElementById('nodeSizeMode')?.addEventListener('change', queueSync);
  document.getElementById('resetView')?.addEventListener('click', () => setTimeout(() => {
    if (coreToggle && relatedToggle) {
      coreToggle.checked = true;
      relatedToggle.checked = true;
    }
    queueSync();
  }, 0));

  queueSync();
})();
