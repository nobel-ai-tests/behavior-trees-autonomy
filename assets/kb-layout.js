(() => {
  'use strict';

  const workspace = document.getElementById('splitWorkspace');
  const splitter = document.getElementById('splitter');
  const inspector = document.getElementById('inspector');
  const inspectorButton = document.getElementById('openInspector');
  const controls = document.getElementById('controls');
  const controlsButton = document.getElementById('openControls');

  if (!workspace || !splitter) return;

  const DEFAULT_CONTENT_PERCENT = 70;
  const MIN_CONTENT_PERCENT = 30;
  const MAX_CONTENT_PERCENT = 82;
  const STORAGE_KEY = 'behavior-trees-kb-content-width';
  let activePointer = null;
  let workspaceRect = null;
  let resizeDispatchTimer = null;

  function clamp(value) {
    return Math.min(MAX_CONTENT_PERCENT, Math.max(MIN_CONTENT_PERCENT, value));
  }

  function applyContentWidth(percent, persist = false) {
    const next = clamp(percent);
    document.documentElement.style.setProperty('--content-width', `${next}%`);
    splitter.setAttribute('aria-valuenow', String(Math.round(next)));
    splitter.setAttribute('aria-valuetext', `${Math.round(next)}% content, ${Math.round(100 - next)}% graph`);
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch (_) { /* storage can be unavailable */ }
    }
    return next;
  }

  function currentContentWidth() {
    const inline = getComputedStyle(document.documentElement).getPropertyValue('--content-width').trim();
    const parsed = Number.parseFloat(inline);
    return Number.isFinite(parsed) ? parsed : DEFAULT_CONTENT_PERCENT;
  }

  function notifyGraphResize() {
    clearTimeout(resizeDispatchTimer);
    resizeDispatchTimer = setTimeout(() => window.dispatchEvent(new Event('resize')), 30);
  }

  function finishResize() {
    if (activePointer === null) return;
    const pointerId = activePointer;
    activePointer = null;
    workspaceRect = null;
    if (splitter.hasPointerCapture?.(pointerId)) {
      try { splitter.releasePointerCapture(pointerId); } catch (_) { /* already released */ }
    }
    document.body.classList.remove('resizing-columns');
    applyContentWidth(currentContentWidth(), true);
    notifyGraphResize();
  }

  splitter.setAttribute('aria-valuemin', String(MIN_CONTENT_PERCENT));
  splitter.setAttribute('aria-valuemax', String(MAX_CONTENT_PERCENT));

  let initial = DEFAULT_CONTENT_PERCENT;
  try {
    const saved = Number.parseFloat(localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(saved)) initial = saved;
  } catch (_) {
    // Use the default split when storage is unavailable.
  }
  applyContentWidth(initial);

  splitter.addEventListener('pointerdown', event => {
    if (window.matchMedia('(max-width: 760px)').matches) return;
    activePointer = event.pointerId;
    workspaceRect = workspace.getBoundingClientRect();
    splitter.setPointerCapture?.(event.pointerId);
    document.body.classList.add('resizing-columns');
    event.preventDefault();
  });

  splitter.addEventListener('pointermove', event => {
    if (event.pointerId !== activePointer || !workspaceRect?.width) return;
    const relativeX = event.clientX - workspaceRect.left;
    applyContentWidth((relativeX / workspaceRect.width) * 100);
  });

  splitter.addEventListener('pointerup', finishResize);
  splitter.addEventListener('pointercancel', finishResize);
  splitter.addEventListener('lostpointercapture', finishResize);

  splitter.addEventListener('dblclick', () => {
    applyContentWidth(DEFAULT_CONTENT_PERCENT, true);
    notifyGraphResize();
  });

  splitter.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return;
    event.preventDefault();
    const current = currentContentWidth();
    const next = event.key === 'Home'
      ? DEFAULT_CONTENT_PERCENT
      : current + (event.key === 'ArrowRight' ? 2 : -2);
    applyContentWidth(next, true);
    notifyGraphResize();
  });

  function syncInspectorState() {
    if (!inspector || !inspectorButton) return;
    const isOpen = inspector.classList.contains('open');
    inspectorButton.setAttribute('aria-expanded', String(isOpen));
    inspectorButton.textContent = isOpen ? 'Hide inspector' : 'Inspector';
  }

  function syncControlsState() {
    if (!controls || !controlsButton) return;
    controlsButton.setAttribute('aria-expanded', String(controls.classList.contains('open')));
  }

  if (inspector && inspectorButton) {
    new MutationObserver(syncInspectorState).observe(inspector, { attributes: true, attributeFilter: ['class'] });
    inspectorButton.addEventListener('click', () => queueMicrotask(syncInspectorState));
    syncInspectorState();
  }

  if (controls && controlsButton) {
    new MutationObserver(syncControlsState).observe(controls, { attributes: true, attributeFilter: ['class'] });
    controlsButton.addEventListener('click', () => queueMicrotask(syncControlsState));
    syncControlsState();
  }
})();
