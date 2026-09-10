import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

const article = document.getElementById('article');

if (article) {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    flowchart: {
      htmlLabels: true,
      useMaxWidth: true,
      curve: 'linear',
      nodeSpacing: 18,
      rankSpacing: 26,
      diagramPadding: 4
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
      fontSize: '18px'
    }
  });

  let scheduled = false;
  let rendering = false;

  function convertMermaidBlocks() {
    const nodes = [];

    article.querySelectorAll('pre > code.language-mermaid').forEach(code => {
      const pre = code.parentElement;
      if (!pre || pre.dataset.kbDiagramConverted === 'true') return;

      const source = code.textContent || '';
      if (!source.trim()) return;

      const diagram = document.createElement('div');
      diagram.className = 'mermaid kb-diagram';
      diagram.textContent = source;
      diagram.setAttribute('role', 'img');
      diagram.setAttribute('aria-label', 'Structured technical diagram');
      pre.dataset.kbDiagramConverted = 'true';
      pre.replaceWith(diagram);
      nodes.push(diagram);
    });

    return nodes;
  }

  async function renderDiagrams() {
    if (rendering) return;
    rendering = true;
    try {
      const nodes = convertMermaidBlocks();
      if (nodes.length) {
        await mermaid.run({ nodes, suppressErrors: true });
      }
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
