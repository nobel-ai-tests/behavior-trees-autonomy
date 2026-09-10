(() => {
  'use strict';

  const article = document.getElementById('article');
  if (!article) return;

  const simulations = new Set();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const STATUS = Object.freeze({ SUCCESS: 'SUCCESS', FAILURE: 'FAILURE', RUNNING: 'RUNNING', HALTED: 'HALTED', IDLE: 'IDLE' });
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const normalizeAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));

  function textElement(tag, className, value = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    const node = document.createTextNode(value);
    element.appendChild(node);
    return { element, node };
  }

  function buildTree(node, nodeViews) {
    const li = document.createElement('li');
    const card = document.createElement('div');
    card.className = 'kb-sim-tree-node';
    card.dataset.kind = node.kind || 'action';
    card.dataset.status = STATUS.IDLE;
    const label = textElement('span', 'kb-sim-node-label', node.label || node.id);
    const status = textElement('span', 'kb-sim-node-status', STATUS.IDLE);
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

  function pointInsideInflatedRect(point, rect, inflate) {
    return point.x >= rect.x - inflate && point.x <= rect.x + rect.w + inflate &&
      point.y >= rect.y - inflate && point.y <= rect.y + rect.h + inflate;
  }

  function segmentClear(a, b, obstacles, inflate) {
    const length = distance(a, b);
    const steps = Math.max(2, Math.ceil(length / 0.12));
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      if (obstacles.some(rect => pointInsideInflatedRect(p, rect, inflate))) return false;
    }
    return true;
  }

  function simplifyPath(path, obstacles, inflate) {
    if (path.length <= 2) return path;
    const result = [path[0]];
    let anchor = 0;
    while (anchor < path.length - 1) {
      let candidate = path.length - 1;
      while (candidate > anchor + 1 && !segmentClear(path[anchor], path[candidate], obstacles, inflate)) candidate -= 1;
      result.push(path[candidate]);
      anchor = candidate;
    }
    return result;
  }

  function planPathAStar(world, start, goal, robotRadius, cellSize) {
    const cols = Math.max(2, Math.ceil(world.width / cellSize));
    const rows = Math.max(2, Math.ceil(world.height / cellSize));
    const toCell = point => ({ x: clamp(Math.floor(point.x / cellSize), 0, cols - 1), y: clamp(Math.floor(point.y / cellSize), 0, rows - 1) });
    const toPoint = cell => ({ x: Math.min(world.width - robotRadius, (cell.x + 0.5) * cellSize), y: Math.min(world.height - robotRadius, (cell.y + 0.5) * cellSize) });
    const key = cell => `${cell.x},${cell.y}`;
    const startCell = toCell(start);
    const goalCell = toCell(goal);
    const obstacles = world.obstacles || [];
    const blocked = cell => {
      const point = toPoint(cell);
      if (point.x < robotRadius || point.y < robotRadius || point.x > world.width - robotRadius || point.y > world.height - robotRadius) return true;
      return obstacles.some(rect => pointInsideInflatedRect(point, rect, robotRadius + cellSize * 0.18));
    };
    const open = [{ ...startCell, f: 0 }];
    const cameFrom = new Map();
    const gScore = new Map([[key(startCell), 0]]);
    const closed = new Set();
    const neighbors = [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[-1,-1,Math.SQRT2]];
    const heuristic = cell => Math.hypot(cell.x - goalCell.x, cell.y - goalCell.y);

    while (open.length) {
      open.sort((a, b) => a.f - b.f);
      const current = open.shift();
      const currentKey = key(current);
      if (closed.has(currentKey)) continue;
      closed.add(currentKey);
      if (current.x === goalCell.x && current.y === goalCell.y) {
        const cells = [current];
        let cursor = currentKey;
        while (cameFrom.has(cursor)) {
          const previous = cameFrom.get(cursor);
          cells.push(previous);
          cursor = key(previous);
        }
        cells.reverse();
        const path = cells.map(toPoint);
        path[0] = { x: start.x, y: start.y };
        path[path.length - 1] = { x: goal.x, y: goal.y };
        return simplifyPath(path, obstacles, robotRadius);
      }
      for (const [dx, dy, cost] of neighbors) {
        const next = { x: current.x + dx, y: current.y + dy };
        if (next.x < 0 || next.y < 0 || next.x >= cols || next.y >= rows || blocked(next)) continue;
        if (dx && dy && (blocked({ x: current.x + dx, y: current.y }) || blocked({ x: current.x, y: current.y + dy }))) continue;
        const nextKey = key(next);
        const tentative = (gScore.get(currentKey) ?? Infinity) + cost;
        if (tentative >= (gScore.get(nextKey) ?? Infinity)) continue;
        cameFrom.set(nextKey, { x: current.x, y: current.y });
        gScore.set(nextKey, tentative);
        open.push({ ...next, f: tentative + heuristic(next) });
      }
    }
    return [{ x: start.x, y: start.y }, { x: goal.x, y: goal.y }];
  }

  function createEngine(config) {
    const world = {
      width: Number(config.world?.width) || 12,
      height: Number(config.world?.height) || 8,
      obstacles: Array.isArray(config.world?.obstacles) ? config.world.obstacles : [],
      goal: { x: Number(config.world?.goal?.x) || 10.5, y: Number(config.world?.goal?.y) || 2, label: config.world?.goal?.label || 'goal' }
    };
    const robotConfig = {
      x: Number(config.robot?.x) || 1.2, y: Number(config.robot?.y) || 5.4, theta: Number(config.robot?.theta) || 0,
      radius: Number(config.robot?.radius) || 0.26, maxLinear: Number(config.robot?.maxLinear) || 0.8, maxAngular: Number(config.robot?.maxAngular) || 1.8
    };
    const dynamicConfig = {
      x: Number(config.dynamicObstacle?.x) || 5.4, yMin: Number(config.dynamicObstacle?.yMin) || 1.2,
      yMax: Number(config.dynamicObstacle?.yMax) || 6.8, speed: Number(config.dynamicObstacle?.speed) || 0.72,
      radius: Number(config.dynamicObstacle?.radius) || 0.38, label: config.dynamicObstacle?.label || 'moving obstacle'
    };
    const control = {
      dt: clamp(Number(config.control?.dt) || 0.05, 0.02, 0.2), btHz: clamp(Number(config.control?.btHz) || 10, 2, 30),
      sensorRange: Number(config.control?.sensorRange) || 1.35, goalTolerance: Number(config.control?.goalTolerance) || 0.34,
      cellSize: Number(config.control?.cellSize) || 0.38, waypointTolerance: Number(config.control?.waypointTolerance) || 0.32,
      resetDelay: Number(config.control?.resetDelay) || 2.5
    };

    let state;
    let lastTickTime = -Infinity;
    let goalReachedAt = null;
    let previousActiveAction = null;

    function updateBlackboard() {
      const robot = state.robot;
      const obstacleDistance = distance(robot, state.obstacle) - robotConfig.radius - dynamicConfig.radius;
      const goalDistance = distance(robot, world.goal);
      const forward = { x: Math.cos(robot.theta), y: Math.sin(robot.theta) };
      const toObstacle = { x: state.obstacle.x - robot.x, y: state.obstacle.y - robot.y };
      const obstacleNorm = Math.max(0.0001, Math.hypot(toObstacle.x, toObstacle.y));
      const inFront = (forward.x * toObstacle.x + forward.y * toObstacle.y) / obstacleNorm > -0.15;
      state.blackboard = {
        critical_fault: false,
        goal_valid: true,
        at_goal: goalDistance <= control.goalTolerance,
        crossing_conflict: obstacleDistance < control.sensorRange && inFront,
        obstacle_distance_m: Math.max(0, obstacleDistance),
        goal_distance_m: goalDistance,
        active_skill: state.activeAction,
        root_status: state.rootStatus,
        robot_x: robot.x,
        robot_y: robot.y,
        sim_time_s: state.time,
        tick: state.tick
      };
    }

    function reset() {
      state = {
        time: 0, tick: 0,
        robot: { x: robotConfig.x, y: robotConfig.y, theta: robotConfig.theta, v: 0, omega: 0 },
        obstacle: { x: dynamicConfig.x, y: dynamicConfig.yMin, direction: 1 },
        path: planPathAStar(world, robotConfig, world.goal, robotConfig.radius, control.cellSize),
        pathIndex: 1, statuses: new Map(), activeAction: 'none', rootStatus: STATUS.IDLE,
        event: 'Simulation initialized. A* generated the nominal path from the static map.', blackboard: {}
      };
      lastTickTime = -Infinity;
      goalReachedAt = null;
      previousActiveAction = null;
      updateBlackboard();
      tickBehaviorTree(true);
      return state;
    }

    function updateDynamicObstacle(dt) {
      state.obstacle.y += dynamicConfig.speed * state.obstacle.direction * dt;
      if (state.obstacle.y >= dynamicConfig.yMax) { state.obstacle.y = dynamicConfig.yMax; state.obstacle.direction = -1; }
      else if (state.obstacle.y <= dynamicConfig.yMin) { state.obstacle.y = dynamicConfig.yMin; state.obstacle.direction = 1; }
    }

    function setStatus(id, status) { state.statuses.set(id, status); return status; }
    function conditionStatus(name) {
      if (name === 'criticalFault') return state.blackboard.critical_fault ? STATUS.SUCCESS : STATUS.FAILURE;
      if (name === 'crossingConflict') return state.blackboard.crossing_conflict ? STATUS.SUCCESS : STATUS.FAILURE;
      if (name === 'goalValid') return state.blackboard.goal_valid ? STATUS.SUCCESS : STATUS.FAILURE;
      if (name === 'atGoal') return state.blackboard.at_goal ? STATUS.SUCCESS : STATUS.FAILURE;
      return STATUS.FAILURE;
    }
    function actionStatus(name) {
      if (name === 'stopRobot') { state.activeAction = 'StopRobot'; return STATUS.RUNNING; }
      if (name === 'yieldToCrossing') { state.activeAction = 'YieldToCrossing'; return STATUS.RUNNING; }
      if (name === 'followPath') {
        if (state.blackboard.at_goal) return STATUS.SUCCESS;
        state.activeAction = 'FollowPath'; return STATUS.RUNNING;
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
          if (status === STATUS.FAILURE || status === STATUS.RUNNING) return setStatus(node.id, status);
        }
        return setStatus(node.id, STATUS.SUCCESS);
      }
      if (kind === 'fallback' || kind === 'control') {
        for (const child of node.children || []) {
          const status = evaluate(child);
          if (status === STATUS.SUCCESS || status === STATUS.RUNNING) return setStatus(node.id, status);
        }
        return setStatus(node.id, STATUS.FAILURE);
      }
      return setStatus(node.id, STATUS.FAILURE);
    }
    function findActionNode(node, label) {
      if (!node) return null;
      if (node.kind === 'action' && node.label === label) return node;
      for (const child of node.children || []) { const found = findActionNode(child, label); if (found) return found; }
      return null;
    }
    function tickBehaviorTree(force = false) {
      const interval = 1 / control.btHz;
      if (!force && state.time - lastTickTime < interval - 1e-6) return;
      lastTickTime = state.time;
      state.tick += 1;
      state.statuses = new Map();
      state.activeAction = 'none';
      updateBlackboard();
      state.rootStatus = evaluate(config.tree);
      if (previousActiveAction && previousActiveAction !== state.activeAction) {
        const haltedNode = findActionNode(config.tree, previousActiveAction);
        if (haltedNode && !state.statuses.has(haltedNode.id)) state.statuses.set(haltedNode.id, STATUS.HALTED);
      }
      if (state.activeAction === 'YieldToCrossing') {
        state.event = `Tick ${state.tick}: crossing conflict at ${state.blackboard.obstacle_distance_m.toFixed(2)} m. FollowPath is preempted and the robot yields.`;
      } else if (state.activeAction === 'FollowPath') {
        state.event = `Tick ${state.tick}: nominal mission active. Following the A* path; goal distance ${state.blackboard.goal_distance_m.toFixed(2)} m.`;
      } else if (state.rootStatus === STATUS.SUCCESS) {
        state.event = `Tick ${state.tick}: AtGoal? succeeded, so the mission and root return Success.`;
      } else if (state.activeAction === 'StopRobot') {
        state.event = `Tick ${state.tick}: critical-fault branch active; commanded velocity is zero.`;
      }
      previousActiveAction = state.activeAction === 'none' ? previousActiveAction : state.activeAction;
      updateBlackboard();
    }

    function followPathCommand() {
      if (!state.path.length || state.blackboard.at_goal) return { v: 0, omega: 0 };
      while (state.pathIndex < state.path.length - 1 && distance(state.robot, state.path[state.pathIndex]) < control.waypointTolerance) state.pathIndex += 1;
      const target = state.path[Math.min(state.pathIndex, state.path.length - 1)];
      const desired = Math.atan2(target.y - state.robot.y, target.x - state.robot.x);
      const error = normalizeAngle(desired - state.robot.theta);
      const omega = clamp(error * 2.4, -robotConfig.maxAngular, robotConfig.maxAngular);
      const headingScale = clamp(1 - Math.abs(error) / 1.35, 0.12, 1);
      const slowNearGoal = clamp(state.blackboard.goal_distance_m / 1.2, 0.2, 1);
      return { v: robotConfig.maxLinear * headingScale * slowNearGoal, omega };
    }
    function commandForActiveAction() { return state.activeAction === 'FollowPath' ? followPathCommand() : { v: 0, omega: 0 }; }
    function integrateRobot(dt) {
      const command = commandForActiveAction();
      state.robot.v = command.v; state.robot.omega = command.omega;
      state.robot.theta = normalizeAngle(state.robot.theta + command.omega * dt);
      const next = { x: state.robot.x + Math.cos(state.robot.theta) * command.v * dt, y: state.robot.y + Math.sin(state.robot.theta) * command.v * dt };
      const collision = world.obstacles.some(rect => pointInsideInflatedRect(next, rect, robotConfig.radius));
      if (!collision) {
        state.robot.x = clamp(next.x, robotConfig.radius, world.width - robotConfig.radius);
        state.robot.y = clamp(next.y, robotConfig.radius, world.height - robotConfig.radius);
      } else state.robot.v = 0;
    }
    function step(dt = control.dt) {
      updateDynamicObstacle(dt);
      updateBlackboard();
      tickBehaviorTree();
      integrateRobot(dt);
      state.time += dt;
      updateBlackboard();
      if (state.blackboard.at_goal) {
        if (goalReachedAt === null) goalReachedAt = state.time;
        if (config.loop !== false && state.time - goalReachedAt >= control.resetDelay) reset();
      } else goalReachedAt = null;
      return state;
    }

    reset();
    return { state: () => state, world, robotConfig, dynamicConfig, control, reset, step };
  }

  function createCanvasRenderer(canvas, engine) {
    const context = canvas.getContext('2d');
    let cssWidth = 640;
    let cssHeight = 360;
    function resize() {
      const rect = canvas.getBoundingClientRect();
      cssWidth = Math.max(320, rect.width || 640);
      cssHeight = Math.max(220, rect.height || cssWidth * 0.56);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(cssWidth * dpr); canvas.height = Math.round(cssHeight * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(canvas); resize();
    const worldToCanvas = point => {
      const pad = 22;
      return { x: pad + (point.x / engine.world.width) * (cssWidth - pad * 2), y: pad + (point.y / engine.world.height) * (cssHeight - pad * 2) };
    };
    function drawGrid() {
      context.strokeStyle = '#e7ebef'; context.lineWidth = 1;
      for (let x = 0; x <= engine.world.width; x += 1) {
        const a = worldToCanvas({ x, y: 0 }), b = worldToCanvas({ x, y: engine.world.height });
        context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
      }
      for (let y = 0; y <= engine.world.height; y += 1) {
        const a = worldToCanvas({ x: 0, y }), b = worldToCanvas({ x: engine.world.width, y });
        context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
      }
    }
    function drawObstacles() {
      context.fillStyle = '#e7ebef'; context.strokeStyle = '#9aa6b2';
      engine.world.obstacles.forEach(rect => {
        const a = worldToCanvas({ x: rect.x, y: rect.y }), b = worldToCanvas({ x: rect.x + rect.w, y: rect.y + rect.h });
        context.fillRect(a.x, a.y, b.x - a.x, b.y - a.y); context.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
      });
    }
    function drawPath(state) {
      if (!state.path?.length) return;
      context.strokeStyle = '#718da8'; context.lineWidth = 2.5; context.setLineDash([7, 6]); context.beginPath();
      state.path.forEach((point, index) => { const p = worldToCanvas(point); if (!index) context.moveTo(p.x, p.y); else context.lineTo(p.x, p.y); });
      context.stroke(); context.setLineDash([]);
    }
    function drawGoal() {
      const p = worldToCanvas(engine.world.goal);
      context.strokeStyle = '#28775f'; context.fillStyle = '#dff0e5'; context.lineWidth = 2;
      context.beginPath(); context.arc(p.x, p.y, 10, 0, Math.PI * 2); context.fill(); context.stroke();
      context.fillStyle = '#285e4d'; context.font = '12px system-ui, sans-serif'; context.fillText(engine.world.goal.label, p.x + 14, p.y - 10);
    }
    function drawDynamicObstacle(state) {
      const p = worldToCanvas(state.obstacle);
      context.save(); context.translate(p.x, p.y);
      context.fillStyle = '#f2cdcf'; context.strokeStyle = '#a84451'; context.lineWidth = 2;
      context.fillRect(-16, -11, 32, 22); context.strokeRect(-16, -11, 32, 22);
      context.fillStyle = '#6b7280'; context.fillRect(-20, -8, 4, 16); context.fillRect(16, -8, 4, 16); context.restore();
      context.fillStyle = '#8f3543'; context.font = '12px system-ui, sans-serif'; context.fillText(engine.dynamicConfig.label, p.x + 20, p.y + 4);
    }
    function drawRobot(state) {
      const p = worldToCanvas(state.robot);
      const rangePx = engine.control.sensorRange / engine.world.width * (cssWidth - 44);
      context.strokeStyle = state.blackboard.crossing_conflict ? '#c94a4a' : '#9fb0c1'; context.lineWidth = 1.4; context.setLineDash([4, 5]);
      context.beginPath(); context.arc(p.x, p.y, rangePx, 0, Math.PI * 2); context.stroke(); context.setLineDash([]);
      context.save(); context.translate(p.x, p.y); context.rotate(state.robot.theta);
      context.fillStyle = '#dce9f6'; context.strokeStyle = '#245b88'; context.lineWidth = 2;
      context.fillRect(-15, -11, 30, 22); context.strokeRect(-15, -11, 30, 22);
      context.beginPath(); context.moveTo(15, 0); context.lineTo(7, -6); context.lineTo(7, 6); context.closePath(); context.fillStyle = '#245b88'; context.fill(); context.restore();
      context.fillStyle = '#245b88'; context.font = '12px system-ui, sans-serif'; context.fillText('robot', p.x - 14, p.y - 18);
    }
    function render() {
      const state = engine.state();
      context.clearRect(0, 0, cssWidth, cssHeight); context.fillStyle = '#fbfcfd'; context.fillRect(0, 0, cssWidth, cssHeight);
      drawGrid(); drawObstacles(); drawPath(state); drawGoal(); drawDynamicObstacle(state); drawRobot(state);
    }
    return { render, stop: () => observer.disconnect() };
  }

  function createSimulation(config, sourceBlock) {
    if (!config?.tree || !config?.world) return null;
    const engine = createEngine(config);
    const wrapper = document.createElement('section');
    wrapper.className = 'kb-sim'; wrapper.setAttribute('aria-label', config.title || 'Robot behavior-tree simulation');
    const header = document.createElement('div'); header.className = 'kb-sim-header';
    const title = textElement('div', 'kb-sim-title', config.title || 'Robot simulation');
    const clock = textElement('div', 'kb-sim-phase', ''); header.append(title.element, clock.element);
    const layout = document.createElement('div'); layout.className = 'kb-sim-layout';

    const scenePanel = document.createElement('section'); scenePanel.className = 'kb-sim-panel';
    const sceneHeading = textElement('h4', '', 'Simulated robot / environment');
    const canvas = document.createElement('canvas'); canvas.className = 'kb-sim-canvas'; canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', '2D warehouse simulation with robot, static shelves, moving pallet truck, generated path, and sensor range');
    const event = textElement('div', 'kb-sim-event', ''); scenePanel.append(sceneHeading.element, canvas, event.element);

    const treePanel = document.createElement('section'); treePanel.className = 'kb-sim-panel';
    const blackboardHeading = textElement('h4', '', 'Blackboard — computed state');
    const blackboard = document.createElement('div'); blackboard.className = 'kb-sim-blackboard';
    const blackboardKeys = ['crossing_conflict','obstacle_distance_m','goal_distance_m','active_skill','root_status','robot_x','robot_y','tick'];
    const blackboardViews = new Map();
    blackboardKeys.forEach(key => {
      const row = document.createElement('div'); row.className = 'kb-sim-blackboard-row';
      const keyView = textElement('span', 'kb-sim-blackboard-key', key), valueView = textElement('span', 'kb-sim-blackboard-value', '—');
      row.append(keyView.element, valueView.element); blackboard.appendChild(row); blackboardViews.set(key, valueView.node);
    });
    const treeHeading = textElement('h4', '', 'Behavior tree — evaluated each tick');
    const treeList = document.createElement('ul'); treeList.className = 'kb-sim-tree';
    const nodeViews = new Map(); treeList.appendChild(buildTree(config.tree, nodeViews));
    treePanel.append(blackboardHeading.element, blackboard, treeHeading.element, treeList); layout.append(scenePanel, treePanel);

    const footer = document.createElement('div'); footer.className = 'kb-sim-footer';
    const controls = document.createElement('div'); controls.className = 'kb-sim-controls';
    const reset = document.createElement('button'); reset.type = 'button'; reset.textContent = 'Reset';
    const play = document.createElement('button'); play.type = 'button'; const playText = document.createTextNode(reducedMotion.matches ? 'Play' : 'Pause'); play.appendChild(playText);
    const step = document.createElement('button'); step.type = 'button'; step.textContent = 'Step'; controls.append(reset, play, step);
    const legend = document.createElement('div'); legend.className = 'kb-sim-legend';
    [['#3f8b57','Success'],['#c94a4a','Failure'],['#2f6fbd','Running'],['#8a6a16','Halted'],['#aeb8c3','Idle / not ticked']].forEach(([color,labelText]) => {
      const item = document.createElement('span'), swatch = document.createElement('i'); swatch.style.background = color; item.append(swatch, document.createTextNode(labelText)); legend.appendChild(item);
    });
    footer.append(controls, legend); wrapper.append(header, layout, footer); sourceBlock.replaceWith(wrapper);

    const canvasRenderer = createCanvasRenderer(canvas, engine);
    let playing = !reducedMotion.matches, raf = null, lastFrame = performance.now(), accumulator = 0;
    const fixedDt = engine.control.dt;
    const formatValue = (key, value) => typeof value === 'number' ? (key === 'tick' ? String(Math.round(value)) : value.toFixed(2)) : String(value);
    function updateView() {
      const state = engine.state();
      clock.node.data = `t=${state.time.toFixed(1)} s · tick ${state.tick} · ${state.activeAction}`;
      event.node.data = state.event;
      blackboardKeys.forEach(key => { const value = state.blackboard[key]; blackboardViews.get(key).data = value === undefined ? '—' : formatValue(key, value); });
      nodeViews.forEach((view, id) => { const status = state.statuses.get(id) || STATUS.IDLE; view.card.dataset.status = status; view.status.data = status; });
      canvasRenderer.render(); playText.data = playing ? 'Pause' : 'Play';
    }
    function frame(now) {
      if (!wrapper.isConnected) return;
      const elapsed = Math.min(0.25, Math.max(0, (now - lastFrame) / 1000)); lastFrame = now;
      if (playing) {
        accumulator += elapsed; let guard = 0;
        while (accumulator >= fixedDt && guard < 8) { engine.step(fixedDt); accumulator -= fixedDt; guard += 1; }
        updateView();
      }
      raf = requestAnimationFrame(frame);
    }
    reset.addEventListener('click', () => { engine.reset(); accumulator = 0; updateView(); });
    play.addEventListener('click', () => { playing = !playing; lastFrame = performance.now(); updateView(); });
    step.addEventListener('click', () => { playing = false; engine.step(fixedDt); updateView(); });
    const onReducedMotion = event => { if (event.matches) playing = false; updateView(); };
    reducedMotion.addEventListener?.('change', onReducedMotion);
    updateView(); raf = requestAnimationFrame(frame);

    return { wrapper, stop() { if (raf !== null) cancelAnimationFrame(raf); reducedMotion.removeEventListener?.('change', onReducedMotion); canvasRenderer.stop(); } };
  }

  function convertSimulationBlocks() {
    article.querySelectorAll('pre > code.language-kb-sim').forEach(code => {
      const pre = code.parentElement;
      if (!pre || pre.dataset.kbSimulationConverted === 'true') return;
      pre.dataset.kbSimulationConverted = 'true';
      try {
        const simulation = createSimulation(JSON.parse(code.textContent || '{}'), pre);
        if (simulation) simulations.add(simulation);
      } catch (error) { console.warn('Simulation definition could not be parsed:', error); }
    });
    simulations.forEach(simulation => { if (!simulation.wrapper.isConnected) { simulation.stop(); simulations.delete(simulation); } });
  }

  let scheduled = false;
  function scheduleConversion() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; convertSimulationBlocks(); });
  }

  new MutationObserver(scheduleConversion).observe(article, { childList: true, subtree: true });
  scheduleConversion();
  window.KBSimulations = { refresh: convertSimulationBlocks };
})();