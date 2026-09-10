(() => {
  'use strict';

  const article = document.getElementById('article');
  const readerTitle = document.getElementById('readerTitle');
  const docSelect = document.getElementById('docSelect');
  const openSelectedDoc = document.getElementById('openSelectedDoc');
  const backButton = document.getElementById('contentBack');
  const forwardButton = document.getElementById('contentForward');
  const trail = document.getElementById('contentHistoryTrail');

  if (!article || !backButton || !forwardButton || !trail) return;

  const STACK_LIMIT = 100;
  const TRAIL_LIMIT = 5;

  const backStack = [];
  const forwardStack = [];
  let currentEntry = null;
  let pendingNavigationKey = null;

  function trimStack(stack) {
    if (stack.length > STACK_LIMIT) stack.splice(0, stack.length - STACK_LIMIT);
  }

  function pushStack(stack, entry) {
    if (!entry) return;
    stack.push(entry);
    trimStack(stack);
  }

  function cleanTitle(value, fallback) {
    const title = String(value || '').replace(/\s+/g, ' ').trim();
    return title || fallback;
  }

  function documentEntryFromLocation() {
    const rawHash = location.hash.slice(1);
    if (!rawHash || rawHash.startsWith('node=')) return null;

    let path;
    try {
      path = decodeURIComponent(rawHash);
    } catch (_) {
      return null;
    }

    if (!/^[a-zA-Z0-9_./-]+\.md$/.test(path) || path.includes('..')) return null;

    const heading = article.querySelector('h1')?.textContent;
    const title = cleanTitle(readerTitle?.textContent || heading, path);
    return {
      kind: 'document',
      key: `document:${path}`,
      title,
      path
    };
  }

  function sameEntry(a, b) {
    return Boolean(a && b && a.key === b.key);
  }

  function recordEntry(entry) {
    if (!entry?.key) return;

    if (pendingNavigationKey === entry.key) {
      currentEntry = { ...currentEntry, ...entry };
      pendingNavigationKey = null;
      render();
      return;
    }

    if (sameEntry(currentEntry, entry)) {
      currentEntry = { ...currentEntry, ...entry };
      render();
      return;
    }

    pushStack(backStack, currentEntry);
    currentEntry = entry;
    forwardStack.length = 0;
    render();
  }

  function openEntry(entry) {
    if (!entry) return false;

    if (entry.kind === 'document') {
      if (!docSelect || !openSelectedDoc) return false;
      const option = [...docSelect.options].find(item => item.value === entry.path);
      if (!option) return false;
      docSelect.value = entry.path;
      openSelectedDoc.click();
      return true;
    }

    if (entry.kind === 'node' && entry.node && window.KBNodeContent?.open) {
      window.KBNodeContent.open(entry.node);
      return true;
    }

    return false;
  }

  function goBack() {
    if (!backStack.length) return;
    const previous = backStack.pop();
    pushStack(forwardStack, currentEntry);
    currentEntry = previous;
    pendingNavigationKey = previous.key;
    render();
    if (!openEntry(previous)) pendingNavigationKey = null;
  }

  function goForward() {
    if (!forwardStack.length) return;
    const next = forwardStack.pop();
    pushStack(backStack, currentEntry);
    currentEntry = next;
    pendingNavigationKey = next.key;
    render();
    if (!openEntry(next)) pendingNavigationKey = null;
  }

  function jumpTo(entry) {
    if (!entry || sameEntry(currentEntry, entry)) return;
    pushStack(backStack, currentEntry);
    currentEntry = entry;
    forwardStack.length = 0;
    pendingNavigationKey = entry.key;
    render();
    if (!openEntry(entry)) pendingNavigationKey = null;
  }

  function recentEntries() {
    const result = [];
    const seen = new Set();
    const source = [...backStack, currentEntry].filter(Boolean);

    for (let index = source.length - 1; index >= 0 && result.length < TRAIL_LIMIT; index -= 1) {
      const entry = source[index];
      if (!entry?.key || seen.has(entry.key)) continue;
      seen.add(entry.key);
      result.unshift(entry);
    }
    return result;
  }

  function renderTrail() {
    trail.replaceChildren();
    const entries = recentEntries();

    if (!entries.length) {
      const empty = document.createElement('span');
      empty.className = 'content-history-empty';
      empty.textContent = 'History appears as you browse the graph and documents.';
      trail.appendChild(empty);
      return;
    }

    entries.forEach(entry => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'content-history-item';
      button.textContent = entry.title;
      button.title = entry.title;
      if (sameEntry(entry, currentEntry)) button.setAttribute('aria-current', 'page');
      button.addEventListener('click', () => jumpTo(entry));
      trail.appendChild(button);
    });
  }

  function render() {
    backButton.disabled = backStack.length === 0;
    forwardButton.disabled = forwardStack.length === 0;
    backButton.title = backStack.length
      ? `Back to ${backStack[backStack.length - 1].title} (${backStack.length} in stack)`
      : 'No previous content';
    forwardButton.title = forwardStack.length
      ? `Forward to ${forwardStack[forwardStack.length - 1].title} (${forwardStack.length} in stack)`
      : 'No forward content';
    backButton.setAttribute('aria-label', `Back${backStack.length ? `, ${backStack.length} item${backStack.length === 1 ? '' : 's'} available` : ''}`);
    forwardButton.setAttribute('aria-label', `Forward${forwardStack.length ? `, ${forwardStack.length} item${forwardStack.length === 1 ? '' : 's'} available` : ''}`);
    renderTrail();
  }

  backButton.addEventListener('click', goBack);
  forwardButton.addEventListener('click', goForward);

  window.addEventListener('kb:content-opened', event => {
    const detail = event.detail;
    if (!detail?.key || detail.kind !== 'node') return;
    recordEntry({
      kind: 'node',
      key: detail.key,
      title: cleanTitle(detail.title, detail.key),
      node: detail.node
    });
  });

  let captureScheduled = false;
  function scheduleDocumentCapture() {
    if (captureScheduled) return;
    captureScheduled = true;
    queueMicrotask(() => {
      captureScheduled = false;
      const entry = documentEntryFromLocation();
      if (entry) recordEntry(entry);
    });
  }

  new MutationObserver(scheduleDocumentCapture).observe(article, { childList: true, subtree: true });

  window.addEventListener('keydown', event => {
    if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' && backStack.length) {
      event.preventDefault();
      goBack();
    } else if (event.key === 'ArrowRight' && forwardStack.length) {
      event.preventDefault();
      goForward();
    }
  });

  render();
  scheduleDocumentCapture();
})();