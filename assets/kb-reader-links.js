(() => {
  'use strict';

  const article = document.getElementById('article');
  const docSelect = document.getElementById('docSelect');
  const openSelectedDoc = document.getElementById('openSelectedDoc');

  if (!article) return;

  function loadDiagramSupport() {
    if (!document.querySelector('link[data-kb-diagrams]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = new URL('assets/kb-diagrams.css', document.baseURI).href;
      stylesheet.dataset.kbDiagrams = 'true';
      document.head.appendChild(stylesheet);
    }

    const moduleUrl = new URL('assets/kb-diagrams.js', document.baseURI).href;
    import(moduleUrl).catch(error => console.warn('Structured diagram support unavailable:', error));
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
  loadDiagramSupport();
})();
