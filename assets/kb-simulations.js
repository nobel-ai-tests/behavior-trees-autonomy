(() => {
  'use strict';

  const article = document.getElementById('article');
  if (!article) return;

  const simulations = new Set();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function textElement(tag, className, value = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    const node = document.createTextNode(value);
    element.appendChild(node);
    return { element, node };
  }

  function positionObject(element, item, scene) {
    if (!item) {
      element.style.opacity = '0';
      return;
    }
    element.style.opacity = item.visible === false ? '0' : '1';
    element.style.left = `${(Number(item.x) / scene.width) * 100}%`;
    element.style.top = `${(Number(item.y) / scene.height) * 100}%`;
    if (Number.isFinite(Number(item.heading))) {
      element.style.transform = `translate(-50%, -50%) rotate(${Number(item.heading)}deg)`;
    }
  }

  function buildTree(node, nodeViews) {
    const li = document.createElement('li');
    const card = document.createElement('div');
    card.className = 'kb-sim-tree-node';
    card.dataset.kind = node.kind || 'action';
    card.dataset.status = 'IDLE';

    const label = textElement('span', 'kb-sim-node-label', node.label || node.id);
    const status = textElement('span', 'kb-sim-node-status', 'IDLE');
    card.append(label.element, status.element);
    li.appendChild(card);
    nodeViews.set(node.id, { card, status: status.node });

    if (Array.isArray(node.children) && node.children.length) {
      const list = document.createElement('ul');
      node.children.forEach(child => list.appendChild(buildTree(child, nodeViews)));
      li.appendChild(list);
    }
    return li;
  }

  function createSimulation(config, sourceBlock) {
    if (!config || !Array.isArray(config.phases) || !config.phases.length || !config.tree) return null;

    const wrapper = document.createElement('section');
    wrapper.className = 'kb-sim';
    wrapper.setAttribute('aria-label', config.title || 'Behavior tree execution simulation');

    const header = document.createElement('div');
    header.className = 'kb-sim-header';
    const title = textElement('div', 'kb-sim-title', config.title || 'Execution simulation');
    const phaseLabel = textElement('div', 'kb-sim-phase', '');
    header.append(title.element, phaseLabel.element);

    const layout = document.createElement('div');
    layout.className = 'kb-sim-layout';

    const scenePanel = document.createElement('section');
    scenePanel.className = 'kb-sim-panel';
    const sceneHeading = textElement('h4', '', 'Robot / environment');
    const scene = document.createElement('div');
    scene.className = 'kb-sim-scene';

    const sceneConfig = {
      width: Number(config.scene?.width) || 12,
      height: Number(config.scene?.height) || 8
    };

    (config.scene?.shelves || []).forEach(shelf => {
      const element = document.createElement('div');
      element.className = 'kb-sim-shelf';
      element.style.left = `${(shelf.x / sceneConfig.width) * 100}%`;
      element.style.top = `${(shelf.y / sceneConfig.height) * 100}%`;
      element.style.width = `${(shelf.w / sceneConfig.width) * 100}%`;
      element.style.height = `${(shelf.h / sceneConfig.height) * 100}%`;
      scene.appendChild(element);
    });

    const goal = document.createElement('div');
    goal.className = 'kb-sim-object kb-sim-goal';
    const goalLabel = textElement('span', 'kb-sim-label', config.scene?.goal?.label || 'goal');
    goalLabel.element.style.top = '18px';
    goal.appendChild(goalLabel.element);
    positionObject(goal, config.scene?.goal, sceneConfig);

    const obstacle = document.createElement('div');
    obstacle.className = 'kb-sim-object kb-sim-obstacle';
    const obstacleLabel = textElement('span', 'kb-sim-label', config.scene?.obstacleLabel || 'obstacle');
    obstacleLabel.element.style.top = '32px';
    obstacle.appendChild(obstacleLabel.element);

    const robot = document.createElement('div');
    robot.className = 'kb-sim-object kb-sim-robot';
    const robotGlyph = textElement('span', '', 'R');
    robot.appendChild(robotGlyph.element);

    scene.append(goal, obstacle, robot);
    const event = textElement('div', 'kb-sim-event', '');
    scenePanel.append(sceneHeading.element, scene, event.element);

    const treePanel = document.createElement('section');
    treePanel.className = 'kb-sim-panel';
    const blackboardHeading = textElement('h4', '', 'Blackboard — current tick');
    const blackboard = document.createElement('div');
    blackboard.className = 'kb-sim-blackboard';

    const blackboardKeys = [...new Set(config.phases.flatMap(phase => Object.keys(phase.blackboard || {})))];
    const blackboardViews = new Map();
    blackboardKeys.forEach(key => {
      const row = document.createElement('div');
      row.className = 'kb-sim-blackboard-row';
      const keyView = textElement('span', 'kb-sim-blackboard-key', key);
      const valueView = textElement('span', 'kb-sim-blackboard-value', '—');
      row.append(keyView.element, valueView.element);
      blackboard.appendChild(row);
      blackboardViews.set(key, valueView.node);
    });

    const treeHeading = textElement('h4', '', 'Behavior tree — current tick status');
    const treeList = document.createElement('ul');
    treeList.className = 'kb-sim-tree';
    const nodeViews = new Map();
    treeList.appendChild(buildTree(config.tree, nodeViews));
    treePanel.append(blackboardHeading.element, blackboard, treeHeading.element, treeList);

    layout.append(scenePanel, treePanel);

    const footer = document.createElement('div');
    footer.className = 'kb-sim-footer';
    const controls = document.createElement('div');
    controls.className = 'kb-sim-controls';
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.textContent = '←';
    previous.title = 'Previous phase';
    const play = document.createElement('button');
    play.type = 'button';
    const playText = document.createTextNode('Pause');
    play.appendChild(playText);
    play.title = 'Pause simulation';
    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = '→';
    next.title = 'Next phase';
    controls.append(previous, play, next);

    const progress = document.createElement('div');
    progress.className = 'kb-sim-progress';
    const progressBar = document.createElement('span');
    progress.appendChild(progressBar);

    const legend = document.createElement('div');
    legend.className = 'kb-sim-legend';
    [['#3f8b57', 'Success'], ['#c94a4a', 'Failure'], ['#2f6fbd', 'Running'], ['#8a6a16', 'Halted'], ['#aeb8c3', 'Idle / not ticked']].forEach(([color, labelText]) => {
      const item = document.createElement('span');
      const swatch = document.createElement('i');
      swatch.style.background = color;
      const labelNode = document.createTextNode(labelText);
      item.append(swatch, labelNode);
      legend.appendChild(item);
    });
    footer.append(controls, progress, legend);

    wrapper.append(header, layout, footer);
    sourceBlock.replaceWith(wrapper);

    let index = 0;
    let timer = null;
    let playing = !reducedMotion.matches;
    const phaseMs = Math.max(900, Number(config.phaseMs) || 2200);

    function update() {
      const phase = config.phases[index];
      phaseLabel.node.data = `${index + 1}/${config.phases.length} · ${phase.title || ''}`;
      event.node.data = phase.event || '';

      positionObject(robot, phase.robot, sceneConfig);
      positionObject(obstacle, phase.obstacle, sceneConfig);

      blackboardKeys.forEach(key => {
        const value = phase.blackboard?.[key];
        blackboardViews.get(key).data = value === undefined ? '—' : String(value);
      });

      nodeViews.forEach((view, id) => {
        const status = String(phase.statuses?.[id] || 'IDLE').toUpperCase();
        view.card.dataset.status = status;
        view.status.data = status;
      });

      progressBar.style.width = `${((index + 1) / config.phases.length) * 100}%`;
      playText.data = playing ? 'Pause' : 'Play';
      play.title = playing ? 'Pause simulation' : 'Play simulation';
    }

    function clearTimer() {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    }

    function schedule() {
      clearTimer();
      if (!playing || !wrapper.isConnected) return;
      timer = window.setTimeout(() => {
        if (index < config.phases.length - 1) {
          index += 1;
        } else if (config.loop !== false) {
          index = 0;
        } else {
          playing = false;
        }
        update();
        schedule();
      }, phaseMs);
    }

    function setIndex(nextIndex) {
      index = Math.max(0, Math.min(config.phases.length - 1, nextIndex));
      update();
      schedule();
    }

    previous.addEventListener('click', () => {
      playing = false;
      setIndex(index - 1);
    });
    next.addEventListener('click', () => {
      playing = false;
      setIndex(index + 1);
    });
    play.addEventListener('click', () => {
      playing = !playing;
      update();
      schedule();
    });

    const onReducedMotion = event => {
      if (event.matches) {
        playing = false;
        clearTimer();
        update();
      }
    };
    reducedMotion.addEventListener?.('change', onReducedMotion);

    update();
    schedule();

    return {
      wrapper,
      stop() {
        clearTimer();
        reducedMotion.removeEventListener?.('change', onReducedMotion);
      }
    };
  }

  function convertSimulationBlocks() {
    article.querySelectorAll('pre > code.language-kb-sim').forEach(code => {
      const pre = code.parentElement;
      if (!pre || pre.dataset.kbSimulationConverted === 'true') return;
      pre.dataset.kbSimulationConverted = 'true';
      try {
        const config = JSON.parse(code.textContent || '{}');
        const simulation = createSimulation(config, pre);
        if (simulation) simulations.add(simulation);
      } catch (error) {
        console.warn('Simulation definition could not be parsed:', error);
      }
    });

    simulations.forEach(simulation => {
      if (!simulation.wrapper.isConnected) {
        simulation.stop();
        simulations.delete(simulation);
      }
    });
  }

  let scheduled = false;
  function scheduleConversion() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      convertSimulationBlocks();
    });
  }

  new MutationObserver(scheduleConversion).observe(article, { childList: true, subtree: true });
  scheduleConversion();
  window.KBSimulations = { refresh: convertSimulationBlocks };
})();
