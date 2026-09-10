import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@12/dist/mermaid.esm.min.mjs';

const article = document.getElementById('article');

if (article) {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    layout: 'elk',
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    flowchart: {
      htmlLabels: true,
      useMaxWidth: false,
      curve: 'linear',
      nodeSpacing: 28,
      rankSpacing: 40,
      diagramPadding: 8
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
    hint.textContent = 'Drag to pan · Ctrl/⌘ + wheel to zoom';

    const controls = document.createElement('div');
    controls.className = 'kb-diagram-controls';

    const zoomOut = button('−', 'Zoom out');
    const zoomLabel = document.createElement('span');
    zoomLabel.className = 'kb-diagram-zoom-label';
    zoomLabel.textContent = '100%';
    const zoomIn = button('+', 'Zoom in');
    const fit = button('Fit', 'Fit diagram to viewport');

    controls.append(zoomOut, zoomLabel, zoomIn, fit);
    toolbar.append(hint, controls);

    const viewport = document.createElement('div');
    viewport.className = 'kb-diagram-viewport';
    viewport.tabIndex = 0;
    viewport.setAttribute('aria-label', 'Zoomable Mermaid diagram');

    const canvas = document.createElement('div');
    canvas.className = 'kb-diagram-canvas';

    const diagram = document.createElement('div');
    diagram.className = 'mermaid kb-diagram';
    diagram.textContent = source;
    diagram.dataset.kbDiagramId = `kb-mermaid-${++diagramCounter}`;

    canvas.appendChild(diagram);
    viewport.appendChild(canvas);
    shell.append(toolbar, viewport);

    return { shell, diagram, viewport, canvas, zoomOut, zoomIn, fit, zoomLabel };
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
    const { viewport, canvas, diagram, zoomOut, zoomIn, fit, zoomLabel } = entry;
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
    viewport.style.height = `${Math.round(Math.max(340, Math.min(620, viewport.clientWidth * aspect + 72)))}px`;

    let scale = 1;
    let x = 0;
    let y = 0;
    let manual = false;
    let dragging = false;
    let dragStart = null;

    function clampScale(value) {
      return Math.max(0.35, Math.min(4, value));
    }

    function apply() {
      canvas.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      zoomLabel.textContent = `${Math.round(scale * 100)}%`;
    }

    function fitToViewport() {
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

    zoomOut.addEventListener('click', () => zoomAt(0.82));
    zoomIn.addEventListener('click', () => zoomAt(1.22));
    fit.addEventListener('click', fitToViewport);

    viewport.addEventListener('wheel', event => {
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      zoomAt(event.deltaY < 0 ? 1.12 : 0.89, event.clientX, event.clientY);
    }, { passive: false });

    viewport.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      dragging = true;
      dragStart = { clientX: event.clientX, clientY: event.clientY, x, y };
      viewport.setPointerCapture?.(event.pointerId);
      viewport.classList.add('is-panning');
    });

    viewport.addEventListener('pointermove', event => {
      if (!dragging || !dragStart) return;
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
    viewport.addEventListener('dblclick', fitToViewport);

    const observer = new ResizeObserver(() => {
      viewport.style.height = `${Math.round(Math.max(340, Math.min(620, viewport.clientWidth * aspect + 72)))}px`;
      if (!manual) fitToViewport();
    });
    observer.observe(viewport);

    fitToViewport();
  }

  async function renderDiagrams() {
    if (rendering) return;
    rendering = true;

    try {
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch (_) {
          // Continue with fallback metrics if the Font Loading API rejects.
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

  new MutationObserver(scheduleRender).observe(article, {
    childList: true,
    subtree: true
  });

  scheduleRender();
  window.KBDiagrams = { render: renderDiagrams };
}
