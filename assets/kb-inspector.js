(() => {
  'use strict';

  const root = document.getElementById('inspectorContent');
  if (!root) return;

  let manifest = null;
  let documents = [];
  let taxonomy = [];
  let documentsByPath = new Map();
  let taxonomyById = new Map();

  const normalize = value => String(value || '').trim().toLowerCase();
  const plural = (count, singular, pluralForm = `${singular}s`) => count === 1 ? singular : pluralForm;

  function flattenManifest(nextManifest) {
    manifest = nextManifest;
    taxonomy = manifest.graph?.taxonomy || [];
    taxonomyById = new Map(taxonomy.map(topic => [topic.id, topic]));
    documents = (manifest.sections || []).flatMap(section =>
      (section.documents || []).map(doc => ({ ...doc, sectionId: section.id, sectionTitle: section.title }))
    );
    documentsByPath = new Map(documents.map(doc => [doc.path, doc]));
  }

  function metaValue(term) {
    for (const row of root.querySelectorAll('.meta-row')) {
      if (row.querySelector('dt')?.textContent?.trim() === term) {
        return row.querySelector('dd')?.textContent?.trim() || '';
      }
    }
    return '';
  }

  function selection() {
    const eyebrow = root.querySelector(':scope > .eyebrow');
    const title = root.querySelector(':scope > h2');
    if (!eyebrow || !title) return null;
    return {
      type: eyebrow.textContent.trim(),
      title: title.textContent.trim(),
      path: metaValue('Path')
    };
  }

  function documentForSelection(selected) {
    return selected.path ? documentsByPath.get(selected.path) || null : null;
  }

  function taxonomyForSelection(selected) {
    if (selected.type !== 'Topics') return null;
    return taxonomy.find(topic => topic.title === selected.title) || null;
  }

  function documentsForEntity(selected) {
    const target = normalize(selected.title);
    if (!target) return [];

    if (selected.type === 'Authors') {
      return documents.filter(doc => (doc.authors || []).some(author => normalize(author) === target));
    }
    if (selected.type === 'Keywords') {
      return documents.filter(doc => [...(doc.keywords || []), ...(doc.tags || [])].some(keyword => normalize(keyword) === target));
    }
    if (selected.type === 'Venues') {
      return documents.filter(doc => normalize(doc.venue) === target);
    }
    if (selected.type === 'Years') {
      return documents.filter(doc => String(doc.year || '') === selected.title);
    }
    if (selected.type === 'Sections') {
      return documents.filter(doc => normalize(doc.sectionTitle) === target);
    }
    return [];
  }

  function topicChain(topic) {
    const ids = [];
    const seen = new Set();
    let current = topic;
    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      ids.unshift(current.id);
      current = current.parent ? taxonomyById.get(current.parent) : null;
    }
    return ids;
  }

  function topicIdsForSelection(selected) {
    const doc = documentForSelection(selected);
    if (doc) return [...new Set(doc.topics || [])];

    const topic = taxonomyForSelection(selected);
    if (topic) return topicChain(topic);

    const ids = [];
    const seen = new Set();
    for (const doc of documentsForEntity(selected)) {
      for (const topicId of doc.topics || []) {
        if (!seen.has(topicId)) {
          seen.add(topicId);
          ids.push(topicId);
        }
      }
    }
    return ids;
  }

  function topicLabel(topicId) {
    const topic = taxonomyById.get(topicId);
    if (topic?.title) return topic.title;
    return String(topicId).replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  function summaryForSelection(selected, topicIds) {
    const doc = documentForSelection(selected);
    if (doc?.description) return doc.description;

    const topic = taxonomyForSelection(selected);
    if (topic?.description) return topic.description;

    const linkedDocs = documentsForEntity(selected);
    const docCount = linkedDocs.length;
    const topicCount = topicIds.length;

    if (selected.type === 'Authors') {
      return `${selected.title} is represented by ${docCount} ${plural(docCount, 'paper or document')} spanning ${topicCount} ${plural(topicCount, 'topic')}.`;
    }
    if (selected.type === 'Keywords') {
      return `Keyword connected to ${docCount} ${plural(docCount, 'document')} across ${topicCount} ${plural(topicCount, 'topic')}.`;
    }
    if (selected.type === 'Venues') {
      return `Publication venue represented by ${docCount} ${plural(docCount, 'paper or document')} in this knowledge base.`;
    }
    if (selected.type === 'Years') {
      return `Publication year represented by ${docCount} ${plural(docCount, 'paper or document')} in this knowledge base.`;
    }
    if (selected.type === 'Sections') {
      const section = (manifest.sections || []).find(item => item.title === selected.title);
      return section?.description || `Repository section containing ${docCount} ${plural(docCount, 'document')}.`;
    }
    return `Knowledge-graph node connected to ${topicCount} ${plural(topicCount, 'topic')}.`;
  }

  function renderSummary(text) {
    let summary = root.querySelector(':scope > .summary');
    if (!summary) {
      summary = document.createElement('p');
      summary.className = 'summary';
      const title = root.querySelector(':scope > h2');
      title?.insertAdjacentElement('afterend', summary);
    }
    summary.classList.add('inspector-summary');
    summary.textContent = text;
    summary.title = text;
  }

  function renderTopics(topicIds) {
    root.querySelector(':scope > .inspector-topics')?.remove();

    const section = document.createElement('section');
    section.className = 'inspector-topics';
    const heading = document.createElement('h3');
    heading.textContent = 'Topics';
    section.appendChild(heading);

    if (topicIds.length) {
      const pills = document.createElement('div');
      pills.className = 'pills topic-pills';
      topicIds.forEach(topicId => {
        const pill = document.createElement('span');
        pill.className = 'pill topic-pill';
        pill.textContent = topicLabel(topicId);
        pill.title = topicId;
        pills.appendChild(pill);
      });
      section.appendChild(pills);
    } else {
      const empty = document.createElement('span');
      empty.className = 'topics-empty';
      empty.textContent = 'No topics assigned';
      section.appendChild(empty);
    }

    const summary = root.querySelector(':scope > .inspector-summary');
    if (summary) summary.insertAdjacentElement('afterend', section);
    else root.prepend(section);
  }

  function ensurePaperResourceActions(selected) {
    root.querySelectorAll('[data-paper-resource-action]').forEach(element => element.remove());
    const doc = documentForSelection(selected);
    if (!doc || doc.kind !== 'paper' || (!doc.abstractUrl && !doc.pdf)) return;

    let actions = root.querySelector(':scope > .inspector-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'inspector-actions';
      root.appendChild(actions);
    }

    const addLink = (label, href) => {
      if (!href) return;
      const link = document.createElement('a');
      link.className = 'button';
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = label;
      link.dataset.paperResourceAction = 'true';
      actions.appendChild(link);
    };

    addLink('Abstract', doc.abstractUrl);
    addLink('PDF', doc.pdf);
  }

  function moveConnectionsToBottom() {
    const connections = root.querySelector(':scope > .neighbors');
    if (!connections) return;
    const heading = connections.querySelector('h3');
    if (heading) heading.textContent = 'Connections';
    connections.classList.add('connections-bottom');
    if (root.lastElementChild !== connections) root.appendChild(connections);
  }

  function enhanceInspector() {
    if (!manifest) return;
    const selected = selection();
    if (!selected) return;

    const key = `${selected.type}|${selected.title}|${selected.path}`;
    const alreadyEnhanced = root.dataset.inspectorEnhancedKey === key
      && root.querySelector(':scope > .inspector-summary')
      && root.querySelector(':scope > .inspector-topics');

    if (!alreadyEnhanced) {
      const topicIds = topicIdsForSelection(selected);
      renderSummary(summaryForSelection(selected, topicIds));
      renderTopics(topicIds);
      root.dataset.inspectorEnhancedKey = key;
    }
    ensurePaperResourceActions(selected);
    moveConnectionsToBottom();
  }

  let scheduled = false;
  const scheduleEnhancement = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      enhanceInspector();
    });
  };

  new MutationObserver(scheduleEnhancement).observe(root, { childList: true });

  fetch('kb-manifest.json', { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(nextManifest => {
      flattenManifest(nextManifest);
      enhanceInspector();
    })
    .catch(error => console.warn('Inspector metadata unavailable:', error));
})();
