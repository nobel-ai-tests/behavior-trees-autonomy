(() => {
  'use strict';

  const reader = document.getElementById('reader');
  const article = document.getElementById('article');
  if (!reader || !article) return;

  let resetScheduled = false;

  function resetToTop() {
    reader.scrollTop = 0;
    if (resetScheduled) return;
    resetScheduled = true;
    requestAnimationFrame(() => {
      resetScheduled = false;
      reader.scrollTop = 0;
    });
  }

  // kb-graph.js historically called reader.scrollIntoView() after loading a
  // document. Keep that call local to the reader instead of moving the page.
  try {
    reader.scrollIntoView = () => resetToTop();
  } catch (_) {
    // Older engines may expose the method as non-writable; the mutation and
    // navigation hooks below still keep the internal reader at its top.
  }

  new MutationObserver(() => resetToTop()).observe(article, {
    childList: true,
    subtree: true
  });

  window.addEventListener('kb:content-opened', resetToTop);
  document.getElementById('openSelectedDoc')?.addEventListener('click', resetToTop, true);
  document.getElementById('contentBack')?.addEventListener('click', resetToTop, true);
  document.getElementById('contentForward')?.addEventListener('click', resetToTop, true);
  document.getElementById('contentHistoryTrail')?.addEventListener('click', resetToTop, true);

  window.KBReaderViewport = { resetToTop };
})();
