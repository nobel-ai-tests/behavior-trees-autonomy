import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@12/dist/mermaid.esm.min.mjs';

const article = document.getElementById('article');

if (article) {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    look: 'classic',
    layout: 'elk',
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    flowchart: {
      htmlLabels: false,
      useMaxWidth: false,
      curve: 'linear',
      nodeSpacing: 22,
      rankSpacing: 32,
      diagramPadding: 8,
      wrappingWidth: 180,
      padding: 12
    },
    themeVariables: {
      background: '#ffffff',
      primaryColor: '#e7eff6',
      primaryTextColor: '#17202a',
      primaryBorderColor: '#245b88',
      secondaryColor: '#eef8f3',
      secondaryTextColor: '#17202a',
      secondaryBorderColor: '#28775f',
      tertiaryColor: '#fff7e8',
      tertiaryTextColor: '#17202a',
      tertiaryBorderColor: '#a95a13',
      lineColor: '#657383',
      textColor: '#17202a',
      mainBkg: '#ffffff',
      nodeBorder: '#718096',
      clusterBkg: '#fbfcfd',
      clusterBorder: '#cbd2da',
      edgeLabelBackground: '#ffffff',
      fontSize: '17px'
    }
  });

  let scheduled = false;
  let rendering = false;
  let diagramCounter = 0;

  function button(label, title) {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    element.title = title;
    element.setAttribute('aria-label', title);
    return element;
  }

  function createDiagramShell(source) {
    const shell = document.createElement('section');
    shell.className = 'kb-diagram-shell';

    const toolbar = document.createElement('div');
    toolbar.className = 'kb-diagram-toolbar';

    const hint = document.createElement('span');
    hint.className = 'kb-diagram-hint';
    hint.textContent = 'Scroll page normally · use Pan to drag diagram · Ctrl/⌘+wheel to zoom';

    const controls = document.createElement('div');
    controls.className = 'kb-diagram-controls';

    const zoomOut = button('−', 'Zoom out');
    const zoomLabel = document.createElement('span');
    zoomLabel.className = 'kb-diagram-zoom-label';
    zoomLabel.textContent = '100%';
    const zoomIn = button('+', 'Zoom in');
    const fit = button('Fit', 'Fit diagram to viewport');
    const pan = button('Pan', 'Toggle diagram pan mode');
    pan.setAttribute('aria-pressed', 'false');

    controls.append(zoomOut, zoomLabel, zoomIn, fit, pan);
    toolbar.append(hint, controls);

    const viewport = document.createElement('div');
    viewport.className = 'kb-diagram-viewport';
    viewport.tabIndex = -1;
    viewport.setAttribute('aria-label', 'Mermaid diagram. Use the toolbar to zoom or enable pan mode.');

    const canvas = document.createElement('div');
    canvas.className = 'kb-diagram-canvas';

    const diagram = document.createElement('div');
    diagram.className = 'mermaid kb-diagram';
    diagram.textContent = source;
    diagram.dataset.kbDiagramId = `kb-mermaid-${++diagramCounter}`;

    canvas.appendChild(diagram);
    viewport.appendChild(canvas);
    shell.append(toolbar, viewport);

    return { shell, diagram, viewport, canvas, zoomOut, zoomIn, fit, pan, zoomLabel };
  }

  function convertMermaidBlocks() {
    const entries = [];

    article.querySelectorAll('pre > code.language-mermaid').forEach(code => {
      const pre = code.parentElement;
      if (!pre || pre.dataset.kbDiagramConverted === 'true') return;

      const source = code.textContent || '';
      if (!source.trim()) return;

      const entry = createDiagramShell(source);
      pre.dataset.kbDiagramConverted = 'true';
      pre.replaceWith(entry.shell);
      entries.push(entry);
    });

    return entries;
  }

  function setupInteraction(entry) {
    const { shell, viewport, canvas, diagram, zoomOut, zoomIn, fit, pan, zoomLabel } = entry;
    const svg = diagram.querySelector('svg');
    if (!svg) return;

    const viewBox = svg.viewBox?.baseVal;
    let naturalWidth = viewBox?.width || Number(svg.getAttribute('width')) || 900;
    let naturalHeight = viewBox?.height || Number(svg.getAttribute('height')) || 520;

    if (!Number.isFinite(naturalWidth) || naturalWidth <= 0) naturalWidth = 900;
    if (!Number.isFinite(naturalHeight) || naturalHeight <= 0) naturalHeight = 520;

    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.style.width = `${naturalWidth}px`;
    svg.style.height = `${naturalHeight}px`;
    svg.style.maxWidth = 'none';
    svg.style.display = 'block';

    const aspect = naturalHeight / naturalWidth;
    let scale = 1;
    let x = 0;
    let y = 0;
    let manual = false;
    let panMode = false;
    let dragging = false;
    let dragStart = null;

    function clampScale(value) {
      return Math.max(0.35, Math.min(4, value));
    }

    function updateViewportHeight() {
      const width = Math.max(320, viewport.clientWidth || shell.clientWidth || 900);
      viewport.style.height = `${Math.round(Math.max(340, Math.min(620, width * aspect + 72)))}px`;
    }

    function apply() {
      canvas.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      zoomLabel.textContent = `${Math.round(scale * 100)}%`;
    }

    function fitToViewport() {
      updateViewportHeight();
      const padding = 24;
      const width = Math.max(100, viewport.clientWidth - padding * 2);
      const height = Math.max(100, viewport.clientHeight - padding * 2);
      scale = clampScale(Math.min(width / naturalWidth, height / naturalHeight));
      x = (viewport.clientWidth - naturalWidth * scale) / 2;
      y = (viewport.clientHeight - naturalHeight * scale) / 2;
      manual = false;
      apply();
    }

    function zoomAt(factor, clientX, clientY) {
      const rect = viewport.getBoundingClientRect();
      const anchorX = clientX === undefined ? rect.left + rect.width / 2 : clientX;
      const anchorY = clientY === undefined ? rect.top + rect.height / 2 : clientY;
      const localX = anchorX - rect.left;
      const localY = anchorY - rect.top;
      const nextScale = clampScale(scale * factor);
      const ratio = nextScale / scale;
      x = localX - (localX - x) * ratio;
      y = localY - (localY - y) * ratio;
      scale = nextScale;
      manual = true;
      apply();
    }

    function setPanMode(enabled) {
      panMode = Boolean(enabled);
      pan.setAttribute('aria-pressed', String(panMode));
      pan.textContent = panMode ? 'Pan on' : 'Pan';
      viewport.classList.toggle('pan-enabled', panMode);
      viewport.tabIndex = panMode ? 0 : -1;

      if (panMode) {
        viewport.focus({ preventScroll: true });
      } else {
        dragging = false;
        dragStart = null;
        viewport.classList.remove('is-panning');
      }
    }

    function panBy(dx, dy) {
      x += dx;
      y += dy;
      manual = true;
      apply();
    }

    zoomOut.addEventListener('click', () => zoomAt(0.82));
    zoomIn.addEventListener('click', () => zoomAt(1.22));
    fit.addEventListener('click', fitToViewport);
    pan.addEventListener('click', () => setPanMode(!panMode));

    // The shell, not the diagram viewport, receives modified wheel zoom. This
    // keeps ordinary wheel events completely available to the reader.
    shell.addEventListener('wheel', event => {
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      zoomAt(event.deltaY < 0 ? 1.12 : 0.89, event.clientX, event.clientY);
    }, { passive: false });

    viewport.addEventListener('pointerdown', event => {
      if (!panMode || event.button !== 0) return;
      event.preventDefault();
      dragging = true;
      dragStart = { clientX: event.clientX, clientY: event.clientY, x, y };
      viewport.setPointerCapture?.(event.pointerId);
      viewport.classList.add('is-panning');
    });

    viewport.addEventListener('pointermove', event => {
      if (!panMode || !dragging || !dragStart) return;
      event.preventDefault();
      x = dragStart.x + event.clientX - dragStart.clientX;
      y = dragStart.y + event.clientY - dragStart.clientY;
      manual = true;
      apply();
    });

    const endDrag = event => {
      if (!dragging) return;
      dragging = false;
      dragStart = null;
      viewport.releasePointerCapture?.(event.pointerId);
      viewport.classList.remove('is-panning');
    };

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    viewport.addEventListener('keydown', event => {
      if (!panMode) return;

      if (event.key === 'Escape' || event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setPanMode(false);
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        zoomAt(1.22);
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        zoomAt(0.82);
      } else if (event.key === '0' || event.key.toLowerCase() === 'f') {
        event.preventDefault();
        fitToViewport();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        panBy(28, 0);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        panBy(-28, 0);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        panBy(0, 28);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        panBy(0, -28);
      }
    });

    const observer = new ResizeObserver(() => {
      updateViewportHeight();
      if (!manual) fitToViewport();
    });
    observer.observe(viewport);

    updateViewportHeight();
    requestAnimationFrame(fitToViewport);
  }

  async function renderDiagrams() {
    if (rendering) return;
    rendering = true;

    try {
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch (_) {
          // Continue with fallback metrics if font loading fails.
        }
      }

      const entries = convertMermaidBlocks();
      if (!entries.length) return;

      await mermaid.run({
        nodes: entries.map(entry => entry.diagram),
        suppressErrors: true
      });

      entries.forEach(setupInteraction);
    } catch (error) {
      console.warn('Mermaid diagram rendering failed:', error);
    } finally {
      rendering = false;
    }
  }

  function scheduleRender() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      renderDiagrams();
    });
  }

  // Markdown documents are inserted dynamically. Observe only for unconverted
  // Mermaid code blocks; Mermaid's own SVG mutations must not recursively
  // trigger rendering work.
  new MutationObserver(() => {
    if (article.querySelector('pre > code.language-mermaid')) scheduleRender();
  }).observe(article, {
    childList: true,
    subtree: true
  });

  window.addEventListener('kb:content-opened', scheduleRender);
  scheduleRender();
  window.KBDiagrams = { render: renderDiagrams };
}
