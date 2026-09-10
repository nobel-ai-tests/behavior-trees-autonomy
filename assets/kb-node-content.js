(() => {
  'use strict';

  const graph = document.getElementById('graph');
  const reader = document.getElementById('reader');
  const article = document.getElementById('article');
  const readerTitle = document.getElementById('readerTitle');
  const docSelect = document.getElementById('docSelect');
  const openSelectedDoc = document.getElementById('openSelectedDoc');

  if (!graph || !reader || !article) return;

  let manifest = null;
  let documents = [];
  let taxonomy = [];
  let taxonomyById = new Map();

  const normalize = value => String(value || '').trim().toLowerCase();

  function flattenManifest(nextManifest) {
    manifest = nextManifest;
    taxonomy = manifest.graph?.taxonomy || [];
    taxonomyById = new Map(taxonomy.map(topic => [topic.id, topic]));
    documents = (manifest.sections || []).flatMap(section =>
      (section.documents || []).map(doc => ({ ...doc, sectionId: section.id, sectionTitle: section.title }))
    );
  }

  function registeredDocument(path) {
    return documents.find(doc => doc.path === path) || null;
  }

  function topicForNode(node) {
    if (node.type !== 'topic') return null;
    const id = node.topicId || String(node.id || '').replace(/^topic:/, '');
    return taxonomyById.get(id) || null;
  }

  function documentsForNode(node) {
    const target = normalize(node.label);
    if (!target) return [];

    if (node.type === 'topic') {
      const topic = topicForNode(node);
      return topic ? documents.filter(doc => (doc.topics || []).includes(topic.id)) : [];
    }
    if (node.type === 'author') {
      return documents.filter(doc => (doc.authors || []).some(author => normalize(author) === target));
    }
    if (node.type === 'keyword') {
      return documents.filter(doc => [...(doc.keywords || []), ...(doc.tags || [])].some(keyword => normalize(keyword) === target));
    }
    if (node.type === 'venue') {
      return documents.filter(doc => normalize(doc.venue) === target);
    }
    if (node.type === 'year') {
      return documents.filter(doc => String(doc.year || '') === String(node.label));
    }
    if (node.type === 'section') {
      return documents.filter(doc => doc.sectionId === node.sectionId || normalize(doc.sectionTitle) === target);
    }
    return [];
  }

  function topicLabelsForDocuments(docs) {
    const ids = [];
    const seen = new Set();
    docs.forEach(doc => (doc.topics || []).forEach(id => {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }));
    return ids.map(id => taxonomyById.get(id)?.title || id.replace(/-/g, ' '));
  }

  function nodeSummary(node, linkedDocs) {
    if (node.summary) return node.summary;
    const topic = topicForNode(node);
    if (topic?.description) return topic.description;
    if (node.type === 'author') return `${node.label} is represented by ${linkedDocs.length} publication${linkedDocs.length === 1 ? '' : 's'} in this knowledge base.`;
    if (node.type === 'keyword') return `Keyword used by ${linkedDocs.length} document${linkedDocs.length === 1 ? '' : 's'} in this knowledge base.`;
    if (node.type === 'venue') return `Publication venue represented by ${linkedDocs.length} paper${linkedDocs.length === 1 ? '' : 's'} in this knowledge base.`;
    if (node.type === 'year') return `Publication year represented by ${linkedDocs.length} paper${linkedDocs.length === 1 ? '' : 's'} in this knowledge base.`;
    if (node.type === 'section') {
      const section = (manifest?.sections || []).find(item => item.id === node.sectionId || item.title === node.label);
      return section?.description || `Repository section containing ${linkedDocs.length} document${linkedDocs.length === 1 ? '' : 's'}.`;
    }
    return 'Knowledge-graph entity in the behavior-tree knowledge base.';
  }

  function appendPills(parent, values) {
    if (!values.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'content-pills';
    values.forEach(value => {
      const pill = document.createElement('span');
      pill.className = 'pill';
      pill.textContent = value;
      wrap.appendChild(pill);
    });
    parent.appendChild(wrap);
  }

  function openRegisteredDocument(path) {
    if (!docSelect || !openSelectedDoc) return false;
    const option = [...docSelect.options].find(item => item.value === path);
    if (!option) return false;
    docSelect.value = path;
    openSelectedDoc.click();
    return true;
  }

  function makeDocumentLink(doc) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'content-document-link';
    button.textContent = doc.shortTitle || doc.title;
    button.addEventListener('click', () => openRegisteredDocument(doc.path));
    item.appendChild(button);
    if (doc.description) {
      const summary = document.createElement('span');
      summary.className = 'content-document-summary';
      summary.textContent = doc.description;
      item.appendChild(summary);
    }
    return item;
  }

  function navigationSnapshot(node) {
    return {
      id: node.id,
      type: node.type,
      label: node.label,
      fullTitle: node.fullTitle,
      topicId: node.topicId,
      sectionId: node.sectionId,
      summary: node.summary
    };
  }

  function announceGeneratedContent(node) {
    window.dispatchEvent(new CustomEvent('kb:content-opened', {
      detail: {
        kind: 'node',
        key: `node:${node.id}`,
        title: node.fullTitle || node.label,
        node: navigationSnapshot(node)
      }
    }));
  }

  function renderGeneratedContent(node) {
    if (!manifest) return;
    const linkedDocs = documentsForNode(node);
    const topic = topicForNode(node);

    reader.hidden = false;
    if (readerTitle) readerTitle.textContent = node.fullTitle || node.label;
    article.replaceChildren();

    const heading = document.createElement('h1');
    heading.textContent = node.fullTitle || node.label;
    article.appendChild(heading);

    const summary = document.createElement('p');
    summary.className = 'node-content-summary';
    summary.textContent = nodeSummary(node, linkedDocs);
    article.appendChild(summary);

    if (topic) {
      const topicMeta = document.createElement('section');
      const metaHeading = document.createElement('h2');
      metaHeading.textContent = 'Topic';
      topicMeta.appendChild(metaHeading);
      appendPills(topicMeta, topic.keywords || []);

      const childTopics = taxonomy.filter(item => item.parent === topic.id);
      if (childTopics.length) {
        const childHeading = document.createElement('h3');
        childHeading.textContent = 'Subtopics';
        topicMeta.appendChild(childHeading);
        const list = document.createElement('ul');
        childTopics.forEach(child => {
          const li = document.createElement('li');
          li.textContent = child.title;
          if (child.description) li.title = child.description;
          list.appendChild(li);
        });
        topicMeta.appendChild(list);
      }
      article.appendChild(topicMeta);
    } else {
      const topicLabels = topicLabelsForDocuments(linkedDocs);
      if (topicLabels.length) {
        const topicSection = document.createElement('section');
        const topicHeading = document.createElement('h2');
        topicHeading.textContent = 'Topics';
        topicSection.appendChild(topicHeading);
        appendPills(topicSection, topicLabels);
        article.appendChild(topicSection);
      }
    }

    if (linkedDocs.length) {
      const related = document.createElement('section');
      const relatedHeading = document.createElement('h2');
      relatedHeading.textContent = 'Related content';
      related.appendChild(relatedHeading);
      const list = document.createElement('ul');
      list.className = 'content-document-list';
      linkedDocs
        .slice()
        .sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title))
        .forEach(doc => list.appendChild(makeDocumentLink(doc)));
      related.appendChild(list);
      article.appendChild(related);
    }

    history.replaceState(null, '', `#node=${encodeURIComponent(node.id)}`);
    announceGeneratedContent(node);
  }

  function openNodeContent(node) {
    if (!node) return;
    if (node.path && registeredDocument(node.path) && openRegisteredDocument(node.path)) return;
    renderGeneratedContent(node);
  }

  function boundNodeFromEvent(event) {
    const element = event.target.closest?.('g.node');
    return element && graph.contains(element) ? element.__data__ : null;
  }

  graph.addEventListener('click', event => {
    const node = boundNodeFromEvent(event);
    if (!node) return;
    setTimeout(() => openNodeContent(node), 0);
  }, true);

  graph.addEventListener('keydown', event => {
    if (!['Enter', ' '].includes(event.key)) return;
    const node = boundNodeFromEvent(event);
    if (!node) return;
    setTimeout(() => openNodeContent(node), 0);
  }, true);

  window.KBNodeContent = {
    open(node) {
      openNodeContent(node);
    }
  };

  fetch('kb-manifest.json', { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(flattenManifest)
    .catch(error => console.warn('Node content metadata unavailable:', error));
})();