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

  const NAV_LIMIT = 100;
  const TRAIL_LIMIT = 5;

  // Browser-style model: one ordered history plus a cursor.
  // Opening new content truncates the forward branch, then appends.
  const entries = [];
  let currentIndex = -1;
  let pendingNavigationKey = null;
  const recentKeys = [];

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

  function currentEntry() {
    return currentIndex >= 0 ? entries[currentIndex] : null;
  }

  function sameEntry(a, b) {
    return Boolean(a && b && a.key === b.key);
  }

  function rememberRecent(entry) {
    if (!entry?.key) return;
    const existing = recentKeys.indexOf(entry.key);
    if (existing >= 0) recentKeys.splice(existing, 1);
    recentKeys.push(entry.key);
    if (recentKeys.length > TRAIL_LIMIT) recentKeys.splice(0, recentKeys.length - TRAIL_LIMIT);
  }

  function trimPast() {
    // A newly created branch keeps at most 100 reachable Back steps.
    if (currentIndex <= NAV_LIMIT) return;
    const removeCount = currentIndex - NAV_LIMIT;
    entries.splice(0, removeCount);
    currentIndex -= removeCount;
  }

  function recordEntry(entry) {
    if (!entry?.key) return;

    const current = currentEntry();

    // During Back/Forward, async document loading briefly mutates the reader
    // before the target document is fully rendered. Ignore any intermediate
    // capture until the requested target arrives.
    if (pendingNavigationKey) {
      if (entry.key !== pendingNavigationKey) return;
      entries[currentIndex] = { ...current, ...entry };
      pendingNavigationKey = null;
      rememberRecent(entries[currentIndex]);
      render();
      return;
    }

    if (sameEntry(current, entry)) {
      entries[currentIndex] = { ...current, ...entry };
      rememberRecent(entries[currentIndex]);
      render();
      return;
    }

    // Standard browser rule: copy the current branch up to the cursor,
    // discard anything ahead, then append the newly opened item.
    if (currentIndex < entries.length - 1) entries.splice(currentIndex + 1);
    entries.push(entry);
    currentIndex = entries.length - 1;
    trimPast();
    rememberRecent(entry);
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

  function navigateToIndex(nextIndex) {
    if (nextIndex < 0 || nextIndex >= entries.length || nextIndex === currentIndex) return;
    const target = entries[nextIndex];
    currentIndex = nextIndex;
    pendingNavigationKey = target.key;
    rememberRecent(target);
    render();

    if (!openEntry(target)) {
      pendingNavigationKey = null;
      render();
    }
  }

  function goBack() {
    if (currentIndex <= 0) return;
    navigateToIndex(currentIndex - 1);
  }

  function goForward() {
    if (currentIndex < 0 || currentIndex >= entries.length - 1) return;
    navigateToIndex(currentIndex + 1);
  }

  function jumpTo(entry) {
    if (!entry?.key) return;
    let targetIndex = -1;
    for (let index = entries.length - 1; index >= 0; index -= 1) {
      if (entries[index]?.key === entry.key) {
        targetIndex = index;
        break;
      }
    }
    if (targetIndex >= 0) navigateToIndex(targetIndex);
  }

  function recentEntries() {
    return recentKeys
      .map(key => {
        for (let index = entries.length - 1; index >= 0; index -= 1) {
          if (entries[index]?.key === key) return entries[index];
        }
        return null;
      })
      .filter(Boolean)
      .slice(-TRAIL_LIMIT);
  }

  function renderTrail() {
    trail.replaceChildren();
    const recent = recentEntries();

    if (!recent.length) {
      const empty = document.createElement('span');
      empty.className = 'content-history-empty';
      empty.textContent = 'History appears as you browse the graph and documents.';
      trail.appendChild(empty);
      return;
    }

    recent.forEach(entry => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'content-history-item';
      button.textContent = entry.title;
      button.title = entry.title;
      if (sameEntry(entry, currentEntry())) button.setAttribute('aria-current', 'page');
      button.addEventListener('click', () => jumpTo(entry));
      trail.appendChild(button);
    });
  }

  function render() {
    const backCount = Math.min(NAV_LIMIT, Math.max(0, currentIndex));
    const forwardCount = Math.min(NAV_LIMIT, Math.max(0, entries.length - currentIndex - 1));
    const previous = currentIndex > 0 ? entries[currentIndex - 1] : null;
    const next = currentIndex >= 0 && currentIndex < entries.length - 1 ? entries[currentIndex + 1] : null;

    backButton.disabled = !previous;
    forwardButton.disabled = !next;
    backButton.title = previous ? `Back to ${previous.title} (${backCount} available)` : 'No previous content';
    forwardButton.title = next ? `Forward to ${next.title} (${forwardCount} available)` : 'No forward content';
    backButton.setAttribute('aria-label', `Back${backCount ? `, ${backCount} item${backCount === 1 ? '' : 's'} available` : ''}`);
    forwardButton.setAttribute('aria-label', `Forward${forwardCount ? `, ${forwardCount} item${forwardCount === 1 ? '' : 's'} available` : ''}`);
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
    if (event.key === 'ArrowLeft' && currentIndex > 0) {
      event.preventDefault();
      goBack();
    } else if (event.key === 'ArrowRight' && currentIndex >= 0 && currentIndex < entries.length - 1) {
      event.preventDefault();
      goForward();
    }
  });

  render();
  scheduleDocumentCapture();
})();