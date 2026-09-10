(() => {
  'use strict';

  const TYPE_LABELS = {
    topic: 'Topics',
    knowledge: 'General knowledge',
    paper: 'Papers',
    keyword: 'Keywords',
    author: 'Authors',
    venue: 'Venues',
    year: 'Years',
    section: 'Sections'
  };

  const RELATION_LABELS = {
    subtopic: 'Topic hierarchy',
    contains: 'Section contains',
    about: 'Document about topic',
    keyword: 'Tagged / keyword',
    'authored-by': 'Authored by',
    'published-in': 'Published in',
    published: 'Publication year',
    related: 'Related document'
  };

  const state = {
    manifest: null,
    nodes: [],
    links: [],
    nodeById: new Map(),
    selectedId: null,
    simulation: null,
    zoom: null,
    zoomTransform: d3.zoomIdentity,
    activePreset: 'concepts',
    visibleNodes: [],
    visibleLinks: []
  };

  const els = {};

  const presetDefs = {
    concepts: {
      types: ['topic', 'knowledge', 'paper', 'keyword'],
      relations: ['subtopic', 'about', 'keyword', 'related'],
      layout: 'force',
      labelMode: 'smart'
    },
    literature: {
      types: ['topic', 'paper', 'author', 'venue', 'year'],
      relations: ['about', 'authored-by', 'published-in', 'published', 'related', 'subtopic'],
      layout: 'layered',
      labelMode: 'smart'
    },
    papers: {
      types: ['paper', 'author', 'venue', 'year', 'keyword'],
      relations: ['authored-by', 'published-in', 'published', 'keyword', 'related'],
      layout: 'force',
      labelMode: 'smart'
    },
    taxonomy: {
      types: ['topic', 'keyword'],
      relations: ['subtopic', 'keyword'],
      layout: 'radial',
      labelMode: 'all'
    },
    everything: {
      types: Object.keys(TYPE_LABELS),
      relations: Object.keys(RELATION_LABELS),
      layout: 'force',
      labelMode: 'smart'
    }
  };

  function cacheElements() {
    const ids = [
      'title', 'description', 'search', 'searchMode', 'typeFilters', 'edgeFilters',
      'layout', 'labelMode', 'nodeSizeMode', 'depth', 'depthValue', 'maxNodes',
      'maxNodesValue', 'minKeywordFrequency', 'minKeywordFrequencyValue',
      'linkDistance', 'linkDistanceValue', 'charge', 'chargeValue', 'localOnly',
      'graph', 'graphStatus', 'graphEmpty', 'inspectorContent', 'reader',
      'readerTitle', 'article', 'docSelect', 'openSelectedDoc', 'controls', 'inspector'
    ];
    ids.forEach(id => { els[id] = document.getElementById(id); });
  }

  function slug(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function endpointId(endpoint) {
    return typeof endpoint === 'object' && endpoint ? endpoint.id : endpoint;
  }

  function addNode(map, node) {
    if (!node || !node.id) return null;
    const existing = map.get(node.id);
    if (existing) {
      Object.assign(existing, Object.fromEntries(Object.entries(node).filter(([, v]) => v !== undefined && v !== null)));
      return existing;
    }
    const created = { ...node, degree: 0, docCount: 0 };
    map.set(created.id, created);
    return created;
  }

  function buildGraph(manifest) {
    const nodeMap = new Map();
    const links = [];
    const linkKeys = new Set();

    const addLink = (source, target, relation, extra = {}) => {
      if (!source || !target || source === target) return;
      const key = `${source}|${target}|${relation}`;
      const reverseKey = `${target}|${source}|${relation}`;
      if (linkKeys.has(key) || linkKeys.has(reverseKey)) return;
      linkKeys.add(key);
      links.push({ source, target, relation, ...extra });
    };

    const taxonomy = manifest.graph?.taxonomy || [];
    taxonomy.forEach(topic => {
      const id = `topic:${topic.id || slug(topic.title)}`;
      addNode(nodeMap, {
        id,
        type: 'topic',
        label: topic.title,
        summary: topic.description || '',
        topicId: topic.id || slug(topic.title),
        aliases: topic.aliases || []
      });
      if (topic.parent) addLink(`topic:${topic.parent}`, id, 'subtopic');
      (topic.keywords || []).forEach(keyword => {
        const keywordId = `keyword:${slug(keyword)}`;
        addNode(nodeMap, { id: keywordId, type: 'keyword', label: keyword });
        addLink(id, keywordId, 'keyword');
      });
    });

    for (const section of manifest.sections || []) {
      const sectionId = `section:${section.id}`;
      addNode(nodeMap, {
        id: sectionId,
        type: 'section',
        label: section.title,
        summary: section.description || '',
        sectionId: section.id
      });

      for (const doc of section.documents || []) {
        const meta = { ...(doc.graph || {}), ...doc };
        const inferredKind = section.id === 'papers' ? 'paper' : 'knowledge';
        const kind = meta.kind || inferredKind;
        const nodeType = kind === 'paper' ? 'paper' : 'knowledge';
        const docId = `doc:${doc.path}`;
        const docNode = addNode(nodeMap, {
          id: docId,
          type: nodeType,
          label: doc.shortTitle || doc.title,
          fullTitle: doc.title,
          path: doc.path,
          summary: doc.description || meta.description || '',
          sectionId: section.id,
          sectionTitle: section.title,
          tags: doc.tags || [],
          authors: meta.authors || [],
          year: meta.year || null,
          venue: meta.venue || null,
          doi: meta.doi || null,
          url: meta.url || null
        });
        addLink(sectionId, docId, 'contains');

        const topicRefs = meta.topics || [];
        topicRefs.forEach(topicRef => {
          const topicId = `topic:${slug(topicRef)}`;
          if (!nodeMap.has(topicId)) {
            addNode(nodeMap, { id: topicId, type: 'topic', label: String(topicRef).replace(/-/g, ' '), topicId: slug(topicRef) });
          }
          addLink(docId, topicId, 'about');
        });

        const keywords = [...new Set([...(doc.tags || []), ...(meta.keywords || [])])];
        keywords.forEach(keyword => {
          const keywordId = `keyword:${slug(keyword)}`;
          const keywordNode = addNode(nodeMap, { id: keywordId, type: 'keyword', label: keyword });
          keywordNode.docCount += 1;
          addLink(docId, keywordId, 'keyword');
        });

        (meta.authors || []).forEach(author => {
          const authorId = `author:${slug(author)}`;
          addNode(nodeMap, { id: authorId, type: 'author', label: author });
          addLink(docId, authorId, 'authored-by');
        });

        if (meta.venue) {
          const venueId = `venue:${slug(meta.venue)}`;
          addNode(nodeMap, { id: venueId, type: 'venue', label: meta.venue });
          addLink(docId, venueId, 'published-in');
        }

        if (meta.year) {
          const yearId = `year:${meta.year}`;
          addNode(nodeMap, { id: yearId, type: 'year', label: String(meta.year), year: meta.year });
          addLink(docId, yearId, 'published');
        }

        (meta.related || []).forEach(targetPath => addLink(docId, `doc:${targetPath}`, 'related'));
      }
    }

    links.forEach(link => {
      const source = nodeMap.get(endpointId(link.source));
      const target = nodeMap.get(endpointId(link.target));
      if (source) source.degree += 1;
      if (target) target.degree += 1;
    });

    state.nodes = [...nodeMap.values()];
    state.links = links.filter(link => nodeMap.has(endpointId(link.source)) && nodeMap.has(endpointId(link.target)));
    state.nodeById = nodeMap;
  }

  function renderFilterControls() {
    els.typeFilters.replaceChildren();
    Object.entries(TYPE_LABELS).forEach(([type, label]) => {
      const wrap = document.createElement('div');
      wrap.className = 'check';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `type-${type}`;
      input.dataset.type = type;
      input.addEventListener('change', () => { state.activePreset = null; updatePresetButtons(); render(); });
      const dot = document.createElement('span');
      dot.className = `dot ${type}`;
      const text = document.createElement('label');
      text.htmlFor = input.id;
      text.textContent = label;
      wrap.append(input, dot, text);
      els.typeFilters.appendChild(wrap);
    });

    els.edgeFilters.replaceChildren();
    Object.entries(RELATION_LABELS).forEach(([relation, label]) => {
      const wrap = document.createElement('div');
      wrap.className = 'check';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `edge-${slug(relation)}`;
      input.dataset.relation = relation;
      input.addEventListener('change', () => { state.activePreset = null; updatePresetButtons(); render(); });
      const text = document.createElement('label');
      text.htmlFor = input.id;
      text.textContent = label;
      wrap.append(input, text);
      els.edgeFilters.appendChild(wrap);
    });
  }

  function checkedTypes() {
    return new Set([...els.typeFilters.querySelectorAll('input:checked')].map(el => el.dataset.type));
  }

  function checkedRelations() {
    return new Set([...els.edgeFilters.querySelectorAll('input:checked')].map(el => el.dataset.relation));
  }

  function setCheckedByData(container, key, enabled) {
    [...container.querySelectorAll('input')].forEach(input => {
      input.checked = enabled.includes(input.dataset[key]);
    });
  }

  function applyPreset(name) {
    const preset = presetDefs[name];
    if (!preset) return;
    state.activePreset = name;
    setCheckedByData(els.typeFilters, 'type', preset.types);
    setCheckedByData(els.edgeFilters, 'relation', preset.relations);
    els.layout.value = preset.layout;
    els.labelMode.value = preset.labelMode;
    els.localOnly.checked = false;
    updatePresetButtons();
    render();
  }

  function updatePresetButtons() {
    document.querySelectorAll('[data-preset]').forEach(button => {
      button.classList.toggle('active', button.dataset.preset === state.activePreset);
    });
  }

  function matchingNodeIds(query) {
    const q = query.trim().toLowerCase();
    if (!q) return new Set();
    return new Set(state.nodes.filter(node => {
      const haystack = [
        node.label, node.fullTitle, node.path, node.summary,
        ...(node.tags || []), ...(node.authors || []), ...(node.aliases || [])
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    }).map(node => node.id));
  }

  function neighborhood(seedIds, allowedNodeIds, relations, depth) {
    const visible = new Set(seedIds);
    let frontier = new Set(seedIds);
    for (let level = 0; level < depth; level += 1) {
      const next = new Set();
      state.links.forEach(link => {
        if (!relations.has(link.relation)) return;
        const s = endpointId(link.source);
        const t = endpointId(link.target);
        if (!allowedNodeIds.has(s) || !allowedNodeIds.has(t)) return;
        if (frontier.has(s) && !visible.has(t)) next.add(t);
        if (frontier.has(t) && !visible.has(s)) next.add(s);
      });
      next.forEach(id => visible.add(id));
      frontier = next;
      if (!frontier.size) break;
    }
    return visible;
  }

  function getVisibleGraph() {
    const types = checkedTypes();
    const relations = checkedRelations();
    const minKeyword = Number(els.minKeywordFrequency.value);
    const maxNodes = Number(els.maxNodes.value);
    const depth = Number(els.depth.value);
    const query = els.search.value.trim();
    const searchMatches = matchingNodeIds(query);

    let candidates = state.nodes.filter(node => {
      if (!types.has(node.type)) return false;
      if (node.type === 'keyword' && node.docCount < minKeyword) return false;
      return true;
    });
    let candidateIds = new Set(candidates.map(node => node.id));

    const useSearchFocus = query && els.searchMode.value === 'focus';
    const seeds = useSearchFocus
      ? [...searchMatches].filter(id => candidateIds.has(id))
      : (els.localOnly.checked && state.selectedId && candidateIds.has(state.selectedId) ? [state.selectedId] : []);

    if (seeds.length) {
      const neighborhoodIds = neighborhood(seeds, candidateIds, relations, depth);
      candidates = candidates.filter(node => neighborhoodIds.has(node.id));
      candidateIds = neighborhoodIds;
    } else if (useSearchFocus && query) {
      candidates = [];
      candidateIds = new Set();
    }

    let links = state.links.filter(link => {
      const s = endpointId(link.source);
      const t = endpointId(link.target);
      return relations.has(link.relation) && candidateIds.has(s) && candidateIds.has(t);
    });

    if (candidates.length > maxNodes) {
      const localDegree = new Map(candidates.map(node => [node.id, 0]));
      links.forEach(link => {
        const s = endpointId(link.source);
        const t = endpointId(link.target);
        localDegree.set(s, (localDegree.get(s) || 0) + 1);
        localDegree.set(t, (localDegree.get(t) || 0) + 1);
      });
      const keep = new Set(candidates
        .slice()
        .sort((a, b) => {
          if (a.id === state.selectedId) return -1;
          if (b.id === state.selectedId) return 1;
          const matchDelta = Number(searchMatches.has(b.id)) - Number(searchMatches.has(a.id));
          if (matchDelta) return matchDelta;
          return (localDegree.get(b.id) || 0) - (localDegree.get(a.id) || 0);
        })
        .slice(0, maxNodes)
        .map(node => node.id));
      candidates = candidates.filter(node => keep.has(node.id));
      links = links.filter(link => keep.has(endpointId(link.source)) && keep.has(endpointId(link.target)));
    }

    return {
      nodes: candidates,
      links: links.map(link => ({ ...link, source: endpointId(link.source), target: endpointId(link.target) })),
      searchMatches
    };
  }

  function nodeRadius(node) {
    const base = { topic: 8, knowledge: 8, paper: 9, keyword: 5, author: 6, venue: 6, year: 6, section: 8 }[node.type] || 6;
    if (els.nodeSizeMode.value === 'fixed') return base;
    return Math.min(base + Math.sqrt(Math.max(0, node.degree)) * 1.7, 18);
  }

  function shouldShowLabel(node, searchMatches) {
    const mode = els.labelMode.value;
    if (mode === 'none') return false;
    if (mode === 'all') return true;
    if (node.id === state.selectedId || searchMatches.has(node.id)) return true;
    return ['topic', 'paper', 'knowledge'].includes(node.type) && node.degree >= 2;
  }

  function initializeSvg() {
    const svg = d3.select(els.graph);
    svg.selectAll('*').remove();
    const viewport = svg.append('g').attr('class', 'viewport');
    viewport.append('g').attr('class', 'links');
    viewport.append('g').attr('class', 'nodes');

    state.zoom = d3.zoom()
      .scaleExtent([0.18, 5])
      .on('zoom', event => {
        state.zoomTransform = event.transform;
        viewport.attr('transform', event.transform);
      });
    svg.call(state.zoom).on('dblclick.zoom', null);
  }

  function render() {
    if (!state.manifest) return;
    const graph = getVisibleGraph();
    state.visibleNodes = graph.nodes;
    state.visibleLinks = graph.links;

    els.graphStatus.textContent = `${graph.nodes.length} nodes · ${graph.links.length} relationships`;
    els.graphEmpty.hidden = graph.nodes.length > 0;
    if (!graph.nodes.length) {
      if (state.simulation) state.simulation.stop();
      d3.select(els.graph).select('.links').selectAll('*').remove();
      d3.select(els.graph).select('.nodes').selectAll('*').remove();
      return;
    }

    const bounds = els.graph.getBoundingClientRect();
    const width = Math.max(420, bounds.width);
    const height = Math.max(480, bounds.height);
    const svg = d3.select(els.graph).attr('viewBox', [0, 0, width, height]);
    const linkLayer = svg.select('.links');
    const nodeLayer = svg.select('.nodes');

    const linkSel = linkLayer.selectAll('line')
      .data(graph.links, d => `${endpointId(d.source)}|${endpointId(d.target)}|${d.relation}`)
      .join('line')
      .attr('class', d => `edge ${d.relation}`)
      .attr('data-relation', d => d.relation);

    const nodeSel = nodeLayer.selectAll('g.node')
      .data(graph.nodes, d => d.id)
      .join(
        enter => {
          const group = enter.append('g')
            .attr('class', d => `node ${d.type}`)
            .attr('tabindex', 0)
            .attr('role', 'button')
            .attr('aria-label', d => `${TYPE_LABELS[d.type] || d.type}: ${d.label}`)
            .on('click', (event, d) => {
              event.stopPropagation();
              selectNode(d.id);
            })
            .on('dblclick', (event, d) => {
              event.stopPropagation();
              if (d.path) openDocument(d.path, d.fullTitle || d.label);
            })
            .on('keydown', (event, d) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectNode(d.id);
              }
            });
          group.append('circle');
          group.append('text').attr('x', 11).attr('dy', '.34em');
          group.append('title');
          return group;
        },
        update => update,
        exit => exit.remove()
      )
      .attr('class', d => `node ${d.type}`)
      .classed('selected', d => d.id === state.selectedId)
      .classed('search-match', d => graph.searchMatches.has(d.id));

    nodeSel.select('circle').attr('r', d => nodeRadius(d));
    nodeSel.select('text')
      .text(d => d.label)
      .style('display', d => shouldShowLabel(d, graph.searchMatches) ? null : 'none');
    nodeSel.select('title').text(d => `${d.label}\n${TYPE_LABELS[d.type] || d.type}`);

    const q = els.search.value.trim();
    const highlightOnly = q && els.searchMode.value === 'highlight';
    if (highlightOnly) {
      const neighbors = neighborhood([...graph.searchMatches], new Set(graph.nodes.map(n => n.id)), checkedRelations(), 1);
      nodeSel.classed('dimmed', d => !neighbors.has(d.id));
      linkSel.classed('dimmed', d => !neighbors.has(endpointId(d.source)) || !neighbors.has(endpointId(d.target)));
    } else {
      nodeSel.classed('dimmed', false);
      linkSel.classed('dimmed', false);
    }

    if (state.simulation) state.simulation.stop();

    const linkDistance = Number(els.linkDistance.value);
    const charge = Number(els.charge.value);
    const layout = els.layout.value;
    const simulation = d3.forceSimulation(graph.nodes)
      .force('link', d3.forceLink(graph.links).id(d => d.id).distance(linkDistance).strength(.45))
      .force('charge', d3.forceManyBody().strength(charge))
      .force('collision', d3.forceCollide().radius(d => nodeRadius(d) + 5).iterations(2));

    if (layout === 'radial') {
      const radius = Math.min(width, height) * .36;
      const rings = { section: .12, topic: .28, knowledge: .5, paper: .55, keyword: .76, author: .78, venue: .9, year: .9 };
      simulation
        .force('radial', d3.forceRadial(d => radius * (rings[d.type] || .6), width / 2, height / 2).strength(.8))
        .force('center', d3.forceCenter(width / 2, height / 2).strength(.08));
    } else if (layout === 'layered') {
      const layers = { section: 0, topic: 1, knowledge: 2, paper: 2, keyword: 3, author: 3, venue: 4, year: 4 };
      simulation
        .force('x', d3.forceX(d => 70 + (layers[d.type] || 2) * ((width - 140) / 4)).strength(.72))
        .force('y', d3.forceY(height / 2).strength(.07));
    } else {
      simulation.force('center', d3.forceCenter(width / 2, height / 2));
    }

    const drag = d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(.24).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
    nodeSel.call(drag);

    simulation.on('tick', () => {
      linkSel
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      nodeSel.attr('transform', d => `translate(${d.x || width / 2},${d.y || height / 2})`);
    });

    state.simulation = simulation;
    renderInspector();
  }

  function selectNode(id) {
    state.selectedId = id;
    renderInspector();
    render();
    if (window.innerWidth <= 1120) els.inspector.classList.add('open');
  }

  function connectedNeighbors(id) {
    const rows = [];
    state.links.forEach(link => {
      const s = endpointId(link.source);
      const t = endpointId(link.target);
      if (s === id && state.nodeById.has(t)) rows.push({ node: state.nodeById.get(t), relation: link.relation });
      if (t === id && state.nodeById.has(s)) rows.push({ node: state.nodeById.get(s), relation: link.relation });
    });
    return rows.sort((a, b) => (b.node.degree || 0) - (a.node.degree || 0));
  }

  function renderInspector() {
    const node = state.selectedId ? state.nodeById.get(state.selectedId) : null;
    els.inspectorContent.replaceChildren();

    if (!node) {
      const p = document.createElement('p');
      p.className = 'inspector-placeholder';
      p.textContent = 'Select a node to inspect its metadata and relationships. Double-click a paper or knowledge node to open its Markdown document.';
      els.inspectorContent.appendChild(p);
      return;
    }

    const eyebrow = document.createElement('div');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = TYPE_LABELS[node.type] || node.type;
    const title = document.createElement('h2');
    title.textContent = node.fullTitle || node.label;
    els.inspectorContent.append(eyebrow, title);

    if (node.summary) {
      const summary = document.createElement('p');
      summary.className = 'summary';
      summary.textContent = node.summary;
      els.inspectorContent.appendChild(summary);
    }

    const dl = document.createElement('dl');
    dl.className = 'meta';
    const addMeta = (term, value) => {
      if (!value || (Array.isArray(value) && !value.length)) return;
      const row = document.createElement('div');
      row.className = 'meta-row';
      const dt = document.createElement('dt');
      dt.textContent = term;
      const dd = document.createElement('dd');
      if (Array.isArray(value)) {
        const pills = document.createElement('div');
        pills.className = 'pills';
        value.forEach(item => {
          const pill = document.createElement('span');
          pill.className = 'pill';
          pill.textContent = item;
          pills.appendChild(pill);
        });
        dd.appendChild(pills);
      } else {
        dd.textContent = String(value);
      }
      row.append(dt, dd);
      dl.appendChild(row);
    };
    addMeta('Path', node.path);
    addMeta('Authors', node.authors);
    addMeta('Year', node.year);
    addMeta('Venue', node.venue);
    addMeta('Tags', node.tags);
    addMeta('Degree', node.degree);
    els.inspectorContent.appendChild(dl);

    const actions = document.createElement('div');
    actions.className = 'inspector-actions';
    if (node.path) {
      const open = document.createElement('button');
      open.className = 'primary';
      open.textContent = 'Open document';
      open.addEventListener('click', () => openDocument(node.path, node.fullTitle || node.label));
      actions.appendChild(open);
    }
    const focus = document.createElement('button');
    focus.textContent = 'Focus neighborhood';
    focus.addEventListener('click', () => {
      els.localOnly.checked = true;
      render();
    });
    actions.appendChild(focus);
    if (node.doi || node.url) {
      const external = document.createElement('a');
      external.className = 'button';
      external.href = node.doi ? `https://doi.org/${node.doi}` : node.url;
      external.target = '_blank';
      external.rel = 'noopener noreferrer';
      external.textContent = node.doi ? 'DOI' : 'Source';
      actions.appendChild(external);
    }
    els.inspectorContent.appendChild(actions);

    const neighbors = connectedNeighbors(node.id).slice(0, 14);
    if (neighbors.length) {
      const section = document.createElement('div');
      section.className = 'neighbors';
      const heading = document.createElement('h3');
      heading.textContent = 'Connected nodes';
      section.appendChild(heading);
      neighbors.forEach(({ node: neighbor, relation }) => {
        const button = document.createElement('button');
        button.className = 'neighbor-button';
        button.textContent = `${neighbor.label} · ${RELATION_LABELS[relation] || relation}`;
        button.addEventListener('click', () => selectNode(neighbor.id));
        section.appendChild(button);
      });
      els.inspectorContent.appendChild(section);
    }
  }

  function safePath(path) {
    if (!/^[a-zA-Z0-9_./-]+\.md$/.test(path) || path.includes('..')) throw new Error('Invalid Markdown path');
    return path;
  }

  async function openDocument(path, title) {
    els.reader.hidden = false;
    els.readerTitle.textContent = title || path;
    els.article.innerHTML = '<p>Loading…</p>';
    try {
      const response = await fetch(safePath(path), { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const markdown = await response.text();
      const html = marked.parse(markdown);
      els.article.innerHTML = window.DOMPurify ? DOMPurify.sanitize(html) : html;
      document.title = `${title || path} · Behavior Trees Knowledge Base`;
      history.replaceState(null, '', `#${encodeURIComponent(path)}`);
      els.reader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      els.article.textContent = `Could not load ${path}: ${error.message}`;
    }
  }

  function populateDocumentSelect() {
    els.docSelect.replaceChildren();
    (state.manifest.sections || []).forEach(section => {
      const group = document.createElement('optgroup');
      group.label = section.title;
      (section.documents || []).forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.path;
        option.textContent = doc.title;
        group.appendChild(option);
      });
      els.docSelect.appendChild(group);
    });
    els.openSelectedDoc.addEventListener('click', () => {
      const path = els.docSelect.value;
      const node = state.nodeById.get(`doc:${path}`);
      const doc = state.manifest.sections.flatMap(s => s.documents).find(item => item.path === path);
      if (node) selectNode(node.id);
      if (doc) openDocument(path, doc.title);
    });
  }

  function fitGraph() {
    const svg = d3.select(els.graph);
    const viewport = svg.select('.viewport').node();
    if (!viewport) return;
    const bounds = viewport.getBBox();
    const width = els.graph.clientWidth;
    const height = els.graph.clientHeight;
    if (!bounds.width || !bounds.height) return;
    const scale = Math.min(.95, 0.86 / Math.max(bounds.width / width, bounds.height / height));
    const tx = width / 2 - scale * (bounds.x + bounds.width / 2);
    const ty = height / 2 - scale * (bounds.y + bounds.height / 2);
    d3.select(els.graph).transition().duration(280).call(state.zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  }

  function zoomBy(factor) {
    d3.select(els.graph).transition().duration(180).call(state.zoom.scaleBy, factor);
  }

  function resetView() {
    state.selectedId = null;
    els.search.value = '';
    els.searchMode.value = 'highlight';
    els.localOnly.checked = false;
    const defaults = state.manifest.graph?.defaults || {};
    els.depth.value = defaults.depth || 2;
    els.maxNodes.value = defaults.maxNodes || 160;
    els.minKeywordFrequency.value = defaults.minKeywordFrequency || 1;
    els.linkDistance.value = defaults.linkDistance || 80;
    els.charge.value = defaults.charge || -190;
    syncRangeLabels();
    applyPreset(defaults.preset || 'concepts');
    renderInspector();
    requestAnimationFrame(() => d3.select(els.graph).call(state.zoom.transform, d3.zoomIdentity));
  }

  function syncRangeLabels() {
    els.depthValue.textContent = els.depth.value;
    els.maxNodesValue.textContent = els.maxNodes.value;
    els.minKeywordFrequencyValue.textContent = els.minKeywordFrequency.value;
    els.linkDistanceValue.textContent = els.linkDistance.value;
    els.chargeValue.textContent = els.charge.value;
  }

  function bindControls() {
    document.querySelectorAll('[data-preset]').forEach(button => {
      button.addEventListener('click', () => applyPreset(button.dataset.preset));
    });

    ['layout', 'labelMode', 'nodeSizeMode', 'searchMode'].forEach(id => {
      els[id].addEventListener('change', () => { state.activePreset = null; updatePresetButtons(); render(); });
    });
    ['depth', 'maxNodes', 'minKeywordFrequency', 'linkDistance', 'charge'].forEach(id => {
      els[id].addEventListener('input', () => { syncRangeLabels(); render(); });
    });
    els.localOnly.addEventListener('change', render);
    els.search.addEventListener('input', render);
    els.search.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        const match = [...matchingNodeIds(els.search.value)][0];
        if (match) selectNode(match);
      }
    });

    document.getElementById('resetView').addEventListener('click', resetView);
    document.getElementById('fitGraph').addEventListener('click', fitGraph);
    document.getElementById('zoomIn').addEventListener('click', () => zoomBy(1.3));
    document.getElementById('zoomOut').addEventListener('click', () => zoomBy(0.77));
    document.getElementById('closeReader').addEventListener('click', () => { els.reader.hidden = true; });
    document.getElementById('openControls').addEventListener('click', () => els.controls.classList.toggle('open'));
    document.getElementById('openInspector').addEventListener('click', () => els.inspector.classList.toggle('open'));

    d3.select(els.graph).on('click', () => {
      state.selectedId = null;
      if (els.localOnly.checked) els.localOnly.checked = false;
      renderInspector();
      render();
    });

    window.addEventListener('keydown', event => {
      if (event.key === '/' && document.activeElement !== els.search) {
        event.preventDefault();
        els.search.focus();
      } else if (event.key === 'Escape') {
        els.search.value = '';
        state.selectedId = null;
        els.localOnly.checked = false;
        els.controls.classList.remove('open');
        els.inspector.classList.remove('open');
        render();
      }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(render, 120);
    });
  }

  async function init() {
    cacheElements();
    initializeSvg();
    try {
      const response = await fetch('kb-manifest.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.manifest = await response.json();
      buildGraph(state.manifest);
      els.title.textContent = state.manifest.title;
      els.description.textContent = state.manifest.description;
      renderFilterControls();
      populateDocumentSelect();
      bindControls();
      resetView();

      const requestedPath = decodeURIComponent(location.hash.slice(1));
      if (requestedPath && state.nodeById.has(`doc:${requestedPath}`)) {
        const node = state.nodeById.get(`doc:${requestedPath}`);
        selectNode(node.id);
        openDocument(node.path, node.fullTitle || node.label);
      }
    } catch (error) {
      els.description.textContent = 'Unable to load the knowledge-base manifest.';
      els.graphEmpty.hidden = false;
      els.graphEmpty.textContent = `Initialization failed: ${error.message}`;
    }
  }

  init();
})();
