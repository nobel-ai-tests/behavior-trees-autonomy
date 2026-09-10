(() => {
  'use strict';

  const article = document.getElementById('article');
  if (!article) return;

  const d3 = window.d3;
  const simulations = new Set();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const STATUS = Object.freeze({
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
    RUNNING: 'RUNNING',
    HALTED: 'HALTED',
    IDLE: 'IDLE'
  });

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function textElement(tag, className, value = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    const node = document.createTextNode(value);
    element.appendChild(node);
    return { element, node };
  }

  function findActionNode(node, label) {
    if (!node) return null;
    if (node.kind === 'action' && node.label === label) return node;
    for (const child of node.children || []) {
      const found = findActionNode(child, label);
      if (found) return found;
    }
    return null;
  }

  function createRoadEngine(config) {
    const road = {
      width: Number(config.road?.width) || 120,
      height: Number(config.road?.height) || 80,
      mainY: Number(config.road?.mainY) || 40,
      crossX: Number(config.road?.crossX) || 60,
      laneWidth: Number(config.road?.laneWidth) || 9,
      intersectionHalf: Number(config.road?.intersectionHalf) || 7,
      stopLineX: Number(config.road?.stopLineX) || 49,
      goalX: Number(config.road?.goalX) || 108
    };

    const egoConfig = {
      x: Number(config.ego?.x) || 12,
      y: Number(config.ego?.y) || road.mainY + road.laneWidth * 0.25,
      speed: Number(config.ego?.speed) || 6.2,
      length: Number(config.ego?.length) || 4.4,
      width: Number(config.ego?.width) || 1.9,
      maxSpeed: Number(config.ego?.maxSpeed) || 9,
      accel: Number(config.ego?.accel) || 2,
      comfortBrake: Number(config.ego?.comfortBrake) || 3.4,
      emergencyBrake: Number(config.ego?.emergencyBrake) || 7
    };

    const crossConfig = {
      x: Number(config.crossTraffic?.x) || road.crossX + road.laneWidth * 0.24,
      y: Number(config.crossTraffic?.y) || 72,
      speed: Number(config.crossTraffic?.speed) || 5,
      resetY: Number(config.crossTraffic?.resetY) || 74,
      exitY: Number(config.crossTraffic?.exitY) || 5,
      length: Number(config.crossTraffic?.length) || 4.6,
      width: Number(config.crossTraffic?.width) || 2,
      label: config.crossTraffic?.label || 'cross traffic'
    };

    const control = {
      dt: clamp(Number(config.control?.dt) || 0.04, 0.02, 0.1),
      btHz: clamp(Number(config.control?.btHz) || 10, 2, 30),
      conflictHorizon: Number(config.control?.conflictHorizon) || 2.4,
      approachStartX: Number(config.control?.approachStartX) || 25,
      clearanceY: Number(config.control?.clearanceY) || 24,
      goalTolerance: Number(config.control?.goalTolerance) || 1.2,
      resetDelay: Number(config.control?.resetDelay) || 2.5
    };

    let state;
    let lastTickTime = -Infinity;
    let previousActiveAction = null;
    let terminalAt = null;

    function timeToIntersectionForEgo() {
      const remaining = road.crossX - state.ego.x;
      if (remaining <= 0) return -1;
      return remaining / Math.max(state.ego.speed, 1.2);
    }

    function timeToIntersectionForCross() {
      const remaining = state.cross.y - road.mainY;
      if (remaining < -road.intersectionHalf) return -1;
      return remaining / Math.max(crossConfig.speed, 0.1);
    }

    function updateBlackboard() {
      const egoTti = timeToIntersectionForEgo();
      const crossTti = timeToIntersectionForCross();
      const crossInConflictZone = Math.abs(state.cross.y - road.mainY) <= road.intersectionHalf + 4;
      const predictedConflict =
        state.ego.x >= control.approachStartX &&
        state.ego.x <= road.stopLineX + 1 &&
        crossTti >= -0.5 &&
        (crossInConflictZone || Math.abs(egoTti - crossTti) <= control.conflictHorizon);

      const dx = state.cross.x - state.ego.x;
      const dy = state.cross.y - state.ego.y;
      const nearCollision = Math.hypot(dx, dy) < 3.2 &&
        Math.abs(state.ego.x - road.crossX) < road.intersectionHalf + 3 &&
        Math.abs(state.cross.y - road.mainY) < road.intersectionHalf + 3;

      state.blackboard = {
        collision_imminent: nearCollision,
        crossing_conflict: predictedConflict,
        goal_valid: true,
        at_goal: state.ego.x >= road.goalX - control.goalTolerance,
        ego_speed_mps: state.ego.speed,
        ego_tti_s: egoTti,
        cross_tti_s: crossTti,
        cross_y_m: state.cross.y,
        active_skill: state.activeAction,
        root_status: state.rootStatus,
        tick: state.tick
      };
    }

    function reset() {
      state = {
        time: 0,
        tick: 0,
        ego: { x: egoConfig.x, y: egoConfig.y, speed: egoConfig.speed },
        cross: { x: crossConfig.x, y: crossConfig.y },
        statuses: new Map(),
        activeAction: 'none',
        rootStatus: STATUS.IDLE,
        event: 'Road scenario initialized. Both vehicles advance from their simulated state.',
        blackboard: {}
      };
      lastTickTime = -Infinity;
      previousActiveAction = null;
      terminalAt = null;
      updateBlackboard();
      tickBehaviorTree(true);
      return state;
    }

    function setStatus(id, status) {
      state.statuses.set(id, status);
      return status;
    }

    function conditionStatus(name) {
      if (name === 'collisionImminent') return state.blackboard.collision_imminent ? STATUS.SUCCESS : STATUS.FAILURE;
      if (name === 'crossingConflict') return state.blackboard.crossing_conflict ? STATUS.SUCCESS : STATUS.FAILURE;
      if (name === 'goalValid') return state.blackboard.goal_valid ? STATUS.SUCCESS : STATUS.FAILURE;
      if (name === 'atGoal') return state.blackboard.at_goal ? STATUS.SUCCESS : STATUS.FAILURE;
      return STATUS.FAILURE;
    }

    function actionStatus(name) {
      if (name === 'emergencyBrake') {
        state.activeAction = 'EmergencyBrake';
        return STATUS.RUNNING;
      }
      if (name === 'yieldAtStopLine') {
        state.activeAction = 'YieldAtStopLine';
        return STATUS.RUNNING;
      }
      if (name === 'driveLane') {
        if (state.blackboard.at_goal) return STATUS.SUCCESS;
        state.activeAction = 'DriveLane';
        return STATUS.RUNNING;
      }
      return STATUS.FAILURE;
    }

    function evaluate(node) {
      if (!node) return STATUS.FAILURE;
      const kind = node.kind || 'action';

      if (kind === 'condition') return setStatus(node.id, conditionStatus(node.condition));
      if (kind === 'action') return setStatus(node.id, actionStatus(node.action));

      if (kind === 'sequence') {
        for (const child of node.children || []) {
          const status = evaluate(child);
          if (status === STATUS.FAILURE || status === STATUS.RUNNING) {
            return setStatus(node.id, status);
          }
        }
        return setStatus(node.id, STATUS.SUCCESS);
      }

      if (kind === 'fallback' || kind === 'control') {
        for (const child of node.children || []) {
          const status = evaluate(child);
          if (status === STATUS.SUCCESS || status === STATUS.RUNNING) {
            return setStatus(node.id, status);
          }
        }
        return setStatus(node.id, STATUS.FAILURE);
      }

      return setStatus(node.id, STATUS.FAILURE);
    }

    function tickBehaviorTree(force = false) {
      const interval = 1 / control.btHz;
      if (!force && state.time - lastTickTime < interval - 1e-8) return;
      lastTickTime = state.time;
      state.tick += 1;
      state.statuses = new Map();
      state.activeAction = 'none';

      updateBlackboard();
      state.rootStatus = evaluate(config.tree);

      if (previousActiveAction && previousActiveAction !== state.activeAction) {
        const haltedNode = findActionNode(config.tree, previousActiveAction);
        if (haltedNode && !state.statuses.has(haltedNode.id)) {
          state.statuses.set(haltedNode.id, STATUS.HALTED);
        }
      }

      if (state.activeAction === 'EmergencyBrake') {
        state.event = `Tick ${state.tick}: emergency branch active; braking at ${state.ego.speed.toFixed(1)} m/s.`;
      } else if (state.activeAction === 'YieldAtStopLine') {
        const stopDistance = Math.max(0, road.stopLineX - state.ego.x);
        state.event = `Tick ${state.tick}: crossing traffic conflicts with the ego arrival window. Yielding ${stopDistance.toFixed(1)} m before the stop line.`;
      } else if (state.activeAction === 'DriveLane') {
        state.event = `Tick ${state.tick}: no higher-priority conflict is active. Ego vehicle proceeds at ${state.ego.speed.toFixed(1)} m/s.`;
      } else if (state.rootStatus === STATUS.SUCCESS) {
        state.event = `Tick ${state.tick}: AtGoal? succeeded; the mission and root return Success.`;
      }

      if (state.activeAction !== 'none') previousActiveAction = state.activeAction;
      updateBlackboard();
    }

    function targetSpeed() {
      if (state.activeAction === 'EmergencyBrake') return 0;
      if (state.activeAction === 'YieldAtStopLine') {
        const remaining = road.stopLineX - state.ego.x - 0.8;
        if (remaining <= 0) return 0;
        return Math.min(
          egoConfig.maxSpeed,
          Math.sqrt(Math.max(0, 2 * egoConfig.comfortBrake * remaining))
        );
      }
      if (state.activeAction === 'DriveLane') {
        const distanceToGoal = Math.max(0, road.goalX - state.ego.x);
        return Math.min(egoConfig.maxSpeed, Math.max(1.5, distanceToGoal * 0.9));
      }
      return 0;
    }

    function integrateEgo(dt) {
      const desired = targetSpeed();
      const braking = desired < state.ego.speed;
      const maxDelta = (braking
        ? (state.activeAction === 'EmergencyBrake' ? egoConfig.emergencyBrake : egoConfig.comfortBrake)
        : egoConfig.accel) * dt;

      state.ego.speed += clamp(desired - state.ego.speed, -maxDelta, maxDelta);
      if (state.activeAction === 'YieldAtStopLine' && state.ego.x >= road.stopLineX - 0.6) {
        state.ego.speed = Math.min(state.ego.speed, 0.15);
      }

      state.ego.x = Math.min(road.goalX, state.ego.x + state.ego.speed * dt);
    }

    function integrateCrossTraffic(dt) {
      state.cross.y -= crossConfig.speed * dt;
      if (state.cross.y < crossConfig.exitY) {
        state.cross.y = crossConfig.resetY;
      }
    }

    function step(dt = control.dt) {
      integrateCrossTraffic(dt);
      updateBlackboard();
      tickBehaviorTree();
      integrateEgo(dt);
      state.time += dt;
      updateBlackboard();

      if (state.blackboard.at_goal) {
        if (terminalAt === null) terminalAt = state.time;
        if (config.loop !== false && state.time - terminalAt >= control.resetDelay) reset();
      } else {
        terminalAt = null;
      }

      return state;
    }

    reset();
    return { state: () => state, road, egoConfig, crossConfig, control, reset, step };
  }

  function createRoadRenderer(canvas, engine) {
    const context = canvas.getContext('2d');
    let cssWidth = 720;
    let cssHeight = 390;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      cssWidth = Math.max(360, rect.width || 720);
      cssHeight = Math.max(260, rect.height || cssWidth * 0.54);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const worldToCanvas = point => {
      const pad = 18;
      return {
        x: pad + (point.x / engine.road.width) * (cssWidth - pad * 2),
        y: pad + (point.y / engine.road.height) * (cssHeight - pad * 2)
      };
    };

    function pxX(value) {
      return value / engine.road.width * (cssWidth - 36);
    }

    function pxY(value) {
      return value / engine.road.height * (cssHeight - 36);
    }

    function drawRoads() {
      const road = engine.road;
      const left = worldToCanvas({ x: 0, y: road.mainY - road.laneWidth / 2 });
      const right = worldToCanvas({ x: road.width, y: road.mainY + road.laneWidth / 2 });
      const top = worldToCanvas({ x: road.crossX - road.laneWidth / 2, y: 0 });
      const bottom = worldToCanvas({ x: road.crossX + road.laneWidth / 2, y: road.height });

      context.fillStyle = '#eef3ee';
      context.fillRect(0, 0, cssWidth, cssHeight);

      context.fillStyle = '#d9dde2';
      context.fillRect(left.x, left.y, right.x - left.x, right.y - left.y);
      context.fillRect(top.x, top.y, bottom.x - top.x, bottom.y - top.y);

      context.fillStyle = 'rgba(213, 176, 86, 0.13)';
      const conflictA = worldToCanvas({
        x: road.crossX - road.intersectionHalf,
        y: road.mainY - road.intersectionHalf
      });
      context.fillRect(
        conflictA.x,
        conflictA.y,
        pxX(road.intersectionHalf * 2),
        pxY(road.intersectionHalf * 2)
      );

      context.strokeStyle = '#ffffff';
      context.lineWidth = 2;
      context.setLineDash([14, 12]);

      const mainCenterA = worldToCanvas({ x: 0, y: road.mainY });
      const mainCenterB = worldToCanvas({ x: road.width, y: road.mainY });
      context.beginPath();
      context.moveTo(mainCenterA.x, mainCenterA.y);
      context.lineTo(mainCenterB.x, mainCenterB.y);
      context.stroke();

      const crossCenterA = worldToCanvas({ x: road.crossX, y: 0 });
      const crossCenterB = worldToCanvas({ x: road.crossX, y: road.height });
      context.beginPath();
      context.moveTo(crossCenterA.x, crossCenterA.y);
      context.lineTo(crossCenterB.x, crossCenterB.y);
      context.stroke();
      context.setLineDash([]);

      const stopA = worldToCanvas({ x: road.stopLineX, y: road.mainY });
      context.strokeStyle = '#ffffff';
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(stopA.x, stopA.y);
      context.lineTo(stopA.x, stopA.y + pxY(road.laneWidth / 2));
      context.stroke();

      context.fillStyle = '#687483';
      context.font = '12px system-ui, sans-serif';
      context.fillText('yield line', stopA.x - 24, stopA.y + 30);
      context.fillText('conflict zone', conflictA.x + 8, conflictA.y + 18);
    }

    function drawGoal() {
      const p = worldToCanvas({ x: engine.road.goalX, y: engine.road.mainY + engine.road.laneWidth * 0.25 });
      context.strokeStyle = '#28775f';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(p.x, p.y - 20);
      context.lineTo(p.x, p.y + 20);
      context.stroke();
      context.fillStyle = '#28775f';
      context.beginPath();
      context.moveTo(p.x, p.y - 20);
      context.lineTo(p.x + 18, p.y - 13);
      context.lineTo(p.x, p.y - 6);
      context.closePath();
      context.fill();
      context.fillStyle = '#285e4d';
      context.font = '12px system-ui, sans-serif';
      context.fillText('goal', p.x + 20, p.y - 8);
    }

    function drawCar(point, lengthM, widthM, heading, fill, stroke, label) {
      const p = worldToCanvas(point);
      const lengthPx = Math.max(24, pxX(lengthM));
      const widthPx = Math.max(13, pxY(widthM));

      context.save();
      context.translate(p.x, p.y);
      context.rotate(heading);
      context.fillStyle = fill;
      context.strokeStyle = stroke;
      context.lineWidth = 2;
      context.fillRect(-lengthPx / 2, -widthPx / 2, lengthPx, widthPx);
      context.strokeRect(-lengthPx / 2, -widthPx / 2, lengthPx, widthPx);
      context.fillStyle = stroke;
      context.fillRect(lengthPx * 0.05, -widthPx * 0.32, lengthPx * 0.23, widthPx * 0.64);
      context.restore();

      context.fillStyle = stroke;
      context.font = '12px system-ui, sans-serif';
      context.fillText(label, p.x + 14, p.y - 15);
    }

    function drawTelemetry(state) {
      context.fillStyle = 'rgba(255,255,255,.92)';
      context.strokeStyle = '#cbd2da';
      context.lineWidth = 1;
      context.fillRect(12, 12, 215, 58);
      context.strokeRect(12, 12, 215, 58);
      context.fillStyle = '#273445';
      context.font = '12px ui-monospace, monospace';
      context.fillText(`ego: ${state.ego.speed.toFixed(1)} m/s`, 22, 33);
      context.fillText(`action: ${state.activeAction}`, 22, 51);
      context.fillText(`conflict: ${state.blackboard.crossing_conflict ? 'true' : 'false'}`, 22, 67);
    }

    function render() {
      const state = engine.state();
      context.clearRect(0, 0, cssWidth, cssHeight);
      drawRoads();
      drawGoal();

      drawCar(
        { x: state.ego.x, y: state.ego.y },
        engine.egoConfig.length,
        engine.egoConfig.width,
        0,
        '#dce9f6',
        '#245b88',
        'ego'
      );

      drawCar(
        { x: state.cross.x, y: state.cross.y },
        engine.crossConfig.length,
        engine.crossConfig.width,
        -Math.PI / 2,
        '#f2cdcf',
        '#a84451',
        engine.crossConfig.label
      );

      drawTelemetry(state);
    }

    return { render, stop: () => observer.disconnect() };
  }

  function createTreeRenderer(host, tree, engine) {
    if (!d3) {
      host.textContent = 'Live tree view requires D3.';
      return { update() {}, stop() {} };
    }

    const svg = d3.select(host)
      .append('svg')
      .attr('class', 'kb-sim-tree-svg')
      .attr('role', 'img')
      .attr('aria-label', 'Live behavior tree execution state');

    const hierarchy = d3.hierarchy(tree);
    const leaves = Math.max(1, hierarchy.leaves().length);
    const depth = hierarchy.height + 1;
    const width = Math.max(620, leaves * 150);
    const height = Math.max(300, depth * 92);
    const layout = d3.tree().size([width - 150, height - 90]).separation((a, b) => a.parent === b.parent ? 1.05 : 1.3);
    layout(hierarchy);

    const nodes = hierarchy.descendants();
    const links = hierarchy.links();
    const minX = Math.min(...nodes.map(node => node.x));
    const maxX = Math.max(...nodes.map(node => node.x));
    const shiftX = 75 - minX;
    const viewWidth = Math.max(width, maxX - minX + 150);

    svg.attr('viewBox', `0 0 ${viewWidth} ${height}`);

    const linkViews = svg.append('g')
      .attr('class', 'kb-sim-tree-links')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', link => {
        const sx = link.source.x + shiftX;
        const sy = link.source.y + 38;
        const tx = link.target.x + shiftX;
        const ty = link.target.y + 38;
        const mid = (sy + ty) / 2;
        return `M${sx},${sy} C${sx},${mid} ${tx},${mid} ${tx},${ty}`;
      });

    const nodeViews = new Map();
    const nodeGroups = svg.append('g')
      .attr('class', 'kb-sim-tree-nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'kb-sim-tree-node')
      .attr('transform', node => `translate(${node.x + shiftX},${node.y + 38})`);

    nodeGroups.append('rect')
      .attr('x', -62)
      .attr('y', -23)
      .attr('width', 124)
      .attr('height', 46);

    nodeGroups.each(function(node) {
      const group = d3.select(this);
      const words = String(node.data.label || node.data.id).split(/\s+/);
      let first = words.join(' ');
      let second = '';
      if (first.length > 18 && words.length > 1) {
        const cut = Math.ceil(words.length / 2);
        first = words.slice(0, cut).join(' ');
        second = words.slice(cut).join(' ');
      }

      const label = group.append('text').attr('class', 'kb-sim-tree-label').attr('text-anchor', 'middle');
      label.append('tspan').attr('x', 0).attr('dy', second ? '-0.2em' : '0.2em').text(first);
      if (second) label.append('tspan').attr('x', 0).attr('dy', '1.1em').text(second);
      const status = group.append('text')
        .attr('class', 'kb-sim-tree-status')
        .attr('text-anchor', 'middle')
        .attr('y', 35)
        .text(STATUS.IDLE);

      nodeViews.set(node.data.id, { group, status });
    });

    function update() {
      const state = engine.state();
      nodeViews.forEach((view, id) => {
        const status = state.statuses.get(id) || STATUS.IDLE;
        view.group.attr('data-status', status);
        view.status.text(status);
      });

      linkViews.attr('data-active', link => {
        const sourceStatus = state.statuses.get(link.source.data.id) || STATUS.IDLE;
        const targetStatus = state.statuses.get(link.target.data.id) || STATUS.IDLE;
        return sourceStatus !== STATUS.IDLE && targetStatus !== STATUS.IDLE ? 'true' : 'false';
      });
    }

    update();
    return { update, stop() {} };
  }

  function createSimulation(config, sourceBlock) {
    if (!config?.tree || !config?.road) return null;

    const engine = createRoadEngine(config);
    const wrapper = document.createElement('section');
    wrapper.className = 'kb-sim';
    wrapper.setAttribute('aria-label', config.title || 'Road behavior-tree simulation');

    const header = document.createElement('div');
    header.className = 'kb-sim-header';
    const title = textElement('div', 'kb-sim-title', config.title || 'Road simulation');
    const clock = textElement('div', 'kb-sim-phase', '');
    header.append(title.element, clock.element);

    const layout = document.createElement('div');
    layout.className = 'kb-sim-layout';

    const scenePanel = document.createElement('section');
    scenePanel.className = 'kb-sim-panel';
    const sceneHeading = textElement('h4', '', 'Simulated road / vehicles');
    const canvas = document.createElement('canvas');
    canvas.className = 'kb-sim-canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Road intersection simulation with ego car, crossing traffic, yield line, and conflict zone');
    const event = textElement('div', 'kb-sim-event', '');
    scenePanel.append(sceneHeading.element, canvas, event.element);

    const decisionPanel = document.createElement('section');
    decisionPanel.className = 'kb-sim-panel';
    const blackboardHeading = textElement('h4', '', 'Blackboard — computed from simulation');
    const blackboard = document.createElement('div');
    blackboard.className = 'kb-sim-blackboard';
    const blackboardKeys = ['crossing_conflict', 'collision_imminent', 'ego_speed_mps', 'ego_tti_s', 'cross_tti_s', 'active_skill', 'root_status', 'tick'];
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

    const treeHeading = textElement('h4', '', 'Live BT decisions — evaluated each tick');
    const treeHost = document.createElement('div');
    treeHost.className = 'kb-sim-tree-host';
    decisionPanel.append(blackboardHeading.element, blackboard, treeHeading.element, treeHost);
    layout.append(scenePanel, decisionPanel);

    const footer = document.createElement('div');
    footer.className = 'kb-sim-footer';
    const controls = document.createElement('div');
    controls.className = 'kb-sim-controls';

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.textContent = 'Reset';

    const play = document.createElement('button');
    play.type = 'button';
    const playText = document.createTextNode(reducedMotion.matches ? 'Play' : 'Pause');
    play.appendChild(playText);

    const step = document.createElement('button');
    step.type = 'button';
    step.textContent = 'Step';
    controls.append(reset, play, step);

    const legend = document.createElement('div');
    legend.className = 'kb-sim-legend';
    [
      ['#3f8b57', 'Success'],
      ['#c94a4a', 'Failure'],
      ['#2f6fbd', 'Running'],
      ['#8a6a16', 'Halted'],
      ['#aeb8c3', 'Idle / not ticked']
    ].forEach(([color, labelText]) => {
      const item = document.createElement('span');
      const swatch = document.createElement('i');
      swatch.style.background = color;
      item.append(swatch, document.createTextNode(labelText));
      legend.appendChild(item);
    });

    footer.append(controls, legend);
    wrapper.append(header, layout, footer);
    sourceBlock.replaceWith(wrapper);

    const roadRenderer = createRoadRenderer(canvas, engine);
    const treeRenderer = createTreeRenderer(treeHost, config.tree, engine);

    let playing = !reducedMotion.matches;
    let raf = null;
    let lastFrame = performance.now();
    let accumulator = 0;
    const fixedDt = engine.control.dt;

    const formatValue = (key, value) => {
      if (typeof value !== 'number') return String(value);
      if (key === 'tick') return String(Math.round(value));
      if (value < 0) return 'passed';
      return value.toFixed(2);
    };

    function updateView() {
      const state = engine.state();
      clock.node.data = `t=${state.time.toFixed(1)} s · tick ${state.tick} · ${state.activeAction}`;
      event.node.data = state.event;

      blackboardKeys.forEach(key => {
        const value = state.blackboard[key];
        blackboardViews.get(key).data = value === undefined ? '—' : formatValue(key, value);
      });

      roadRenderer.render();
      treeRenderer.update();
      playText.data = playing ? 'Pause' : 'Play';
    }

    function frame(now) {
      if (!wrapper.isConnected) return;
      const elapsed = Math.min(0.2, Math.max(0, (now - lastFrame) / 1000));
      lastFrame = now;

      if (playing) {
        accumulator += elapsed;
        let guard = 0;
        while (accumulator >= fixedDt && guard < 8) {
          engine.step(fixedDt);
          accumulator -= fixedDt;
          guard += 1;
        }
        updateView();
      }

      raf = requestAnimationFrame(frame);
    }

    reset.addEventListener('click', () => {
      engine.reset();
      accumulator = 0;
      updateView();
    });

    play.addEventListener('click', () => {
      playing = !playing;
      lastFrame = performance.now();
      updateView();
    });

    step.addEventListener('click', () => {
      playing = false;
      engine.step(fixedDt);
      updateView();
    });

    const onReducedMotion = event => {
      if (event.matches) playing = false;
      updateView();
    };
    reducedMotion.addEventListener?.('change', onReducedMotion);

    updateView();
    raf = requestAnimationFrame(frame);

    return {
      wrapper,
      stop() {
        if (raf !== null) cancelAnimationFrame(raf);
        reducedMotion.removeEventListener?.('change', onReducedMotion);
        roadRenderer.stop();
        treeRenderer.stop();
      }
    };
  }

  function convertSimulationBlocks() {
    article.querySelectorAll('pre > code.language-kb-sim').forEach(code => {
      const pre = code.parentElement;
      if (!pre || pre.dataset.kbSimulationConverted === 'true') return;
      pre.dataset.kbSimulationConverted = 'true';

      try {
        const simulation = createSimulation(JSON.parse(code.textContent || '{}'), pre);
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