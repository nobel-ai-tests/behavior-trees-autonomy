(() => {
  'use strict';

  const reader = document.getElementById('reader');
  const article = document.getElementById('article');
  const contentPane = document.querySelector('.content-pane');
  const graphPane = document.getElementById('graphPane');
  const splitter = document.getElementById('splitter');
  const header = document.querySelector('.app-header');
  const controls = document.getElementById('controls');
  if (!reader || !article) return;

  let resetScheduled = false;
  let heightScheduled = false;

  function resetToTop() {
    reader.scrollTop = 0;
    if (resetScheduled) return;
    resetScheduled = true;
    requestAnimationFrame(() => {
      resetScheduled = false;
      reader.scrollTop = 0;
    });
  }

  function syncPaneHeight() {
    if (!contentPane || !graphPane) return;

    if (window.matchMedia('(max-width: 760px)').matches) {
      document.documentElement.style.removeProperty('--kb-pane-height');
      return;
    }

    const documentTop = contentPane.getBoundingClientRect().top + window.scrollY;
    const bottomGap = 14;
    const available = Math.max(420, Math.floor(window.innerHeight - documentTop - bottomGap));
    document.documentElement.style.setProperty('--kb-pane-height', `${available}px`);
  }

  function schedulePaneHeightSync() {
    if (heightScheduled) return;
    heightScheduled = true;
    requestAnimationFrame(() => {
      heightScheduled = false;
      syncPaneHeight();
    });
  }

  // kb-graph.js historically called reader.scrollIntoView() after loading a
  // document. Keep that call local to the reader instead of moving the page.
  try {
    reader.scrollIntoView = () => resetToTop();
  } catch (_) {
    // Older engines may expose the method as non-writable. Explicit content
    // navigation hooks below still reset only when navigation actually occurs.
  }

  // Do not reset reader.scrollTop from an article MutationObserver. Diagram
  // renderers, simulations, syntax highlighting, and other enhancements mutate
  // the article after content loads; treating those mutations as navigation can
  // continuously force the reader back to the top and make scrolling unusable.

  if ('ResizeObserver' in window) {
    const paneObserver = new ResizeObserver(schedulePaneHeightSync);
    [header, controls].filter(Boolean).forEach(element => paneObserver.observe(element));
  }

  window.addEventListener('resize', schedulePaneHeightSync);
  window.visualViewport?.addEventListener('resize', schedulePaneHeightSync);
  window.addEventListener('load', schedulePaneHeightSync, { once: true });

  window.addEventListener('kb:content-opened', resetToTop);
  document.getElementById('openSelectedDoc')?.addEventListener('click', resetToTop, true);
  document.getElementById('contentBack')?.addEventListener('click', resetToTop, true);
  document.getElementById('contentForward')?.addEventListener('click', resetToTop, true);
  document.getElementById('contentHistoryTrail')?.addEventListener('click', resetToTop, true);

  syncPaneHeight();

  window.KBReaderViewport = {
    resetToTop,
    syncPaneHeight
  };
})();
