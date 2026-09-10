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
  const lerp = (a, b, t) => a + (b - a) * t;
  const angleDelta = (target, current) => Math.atan2(Math.sin(target - current), Math.cos(target - current));

  function textElement(tag, className, value = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    const node = document.createTextNode(value);
    element.appendChild(node);
    return { element, node };
  }

  function findActionNode(node, actionName) {
    if (!node) return null;
    if (node.kind === 'action' && node.action === actionName) return node;
    for (const child of node.children || []) {
      const found = findActionNode(child, actionName);
      if (found) return found;
    }
    return null;
  }

  function createCityMap(config = {}) {
    const width = Number(config.width) || 168;
    const height = Number(config.height) || 126;
    const roadWidth = Number(config.roadWidth) || 10;
    const verticalXs = (config.verticalXs || [12, 48, 84, 120, 156]).map(Number);
    const horizontalYs = (config.horizontalYs || [15, 47, 79, 111]).map(Number);
    const verticalNames = config.verticalNames || ['1st Street', '2nd Street', '3rd Street', '4th Street', '5th Street'];
    const horizontalNames = config.horizontalNames || ['Avenue A', 'Avenue B', 'Avenue C', 'Avenue D'];

    const roads = [];
    horizontalYs.forEach((y, row) => roads.push({
      id: `avenue-${row}`,
      name: horizontalNames[row] || `Avenue ${row + 1}`,
      orientation: 'horizontal',
      center: y,
      width: roadWidth,
      speedLimit: row === 0 || row === horizontalYs.length - 1 ? 7 : 6.3
    }));
    verticalXs.forEach((x, col) => roads.push({
      id: `street-${col}`,
      name: verticalNames[col] || `Street ${col + 1}`,
      orientation: 'vertical',
      center: x,
      width: roadWidth,
      speedLimit: col === 0 || col === verticalXs.length - 1 ? 6.2 : 5.8
    }));

    const buildings = [];
    const blockPad = Number(config.blockPad) || 3.5;
    for (let row = 0; row < horizontalYs.length - 1; row += 1) {
      for (let col = 0; col < verticalXs.length - 1; col += 1) {
        const left = verticalXs[col] + roadWidth / 2 + blockPad;
        const right = verticalXs[col + 1] - roadWidth / 2 - blockPad;
        const top = horizontalYs[row] + roadWidth / 2 + blockPad;
        const bottom = horizontalYs[row + 1] - roadWidth / 2 - blockPad;
        buildings.push({
          id: `block-${row}-${col}`,
          label: `Block ${String.fromCharCode(65 + row)}${col + 1}`,
          x: left,
          y: top,
          width: Math.max(4, right - left),
          height: Math.max(4, bottom - top),
          district: row === 0 ? 'north' : row === horizontalYs.length - 2 ? 'south' : 'central'
        });
      }
    }

    const intersections = [];
    horizontalYs.forEach((y, row) => {
      verticalXs.forEach((x, col) => intersections.push({
        id: `r${row}c${col}`,
        x,
        y,
        row,
        col,
        label: `${horizontalNames[row] || `Avenue ${row + 1}`} × ${verticalNames[col] || `Street ${col + 1}`}`
      }));
    });

    return { width, height, roadWidth, verticalXs, horizontalYs, roads, buildings, intersections };
  }

  function buildRoadGraph(city, plannerConfig = {}) {
    const nodes = new Map(city.intersections.map(node => [node.id, { ...node }]));
    const edges = new Map();
    const adjacency = new Map([...nodes.keys()].map(id => [id, []]));
    const penalties = plannerConfig.edgePenalties || {};
    const initiallyBlocked = new Set(plannerConfig.initiallyBlockedEdges || []);

    function addEdge(fromId, toId, road, edgeId) {
      const a = nodes.get(fromId);
      const b = nodes.get(toId);
      const edge = {
        id: edgeId,
        from: fromId,
        to: toId,
        roadId: road.id,
        roadName: road.name,
        length: distance(a, b),
        speedLimit: road.speedLimit,
        congestionPenalty: Number(penalties[edgeId]) || 0,
        blocked: initiallyBlocked.has(edgeId),
        type: 'road'
      };
      edges.set(edgeId, edge);
      adjacency.get(fromId).push({ edgeId, nodeId: toId });
      adjacency.get(toId).push({ edgeId, nodeId: fromId });
    }

    city.horizontalYs.forEach((_, row) => {
      const road = city.roads.find(item => item.id === `avenue-${row}`);
      for (let col = 0; col < city.verticalXs.length - 1; col += 1) {
        addEdge(`r${row}c${col}`, `r${row}c${col + 1}`, road, `h${row}-${col}-${col + 1}`);
      }
    });

    city.verticalXs.forEach((_, col) => {
      const road = city.roads.find(item => item.id === `street-${col}`);
      for (let row = 0; row < city.horizontalYs.length - 1; row += 1) {
        addEdge(`r${row}c${col}`, `r${row + 1}c${col}`, road, `v${col}-${row}-${row + 1}`);
      }
    });

    return { nodes, edges, adjacency };
  }

  function edgeDirection(graph, edgeId, fromId, toId) {
    const a = graph.nodes.get(fromId);
    const b = graph.nodes.get(toId);
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  function routeEdgeCost(graph, edgeId, previousEdgeId, turnPenalty) {
    const edge = graph.edges.get(edgeId);
    if (!edge || edge.blocked) return Infinity;
    let cost = edge.length + edge.congestionPenalty;
    if (previousEdgeId) {
      const previous = graph.edges.get(previousEdgeId);
      if (previous && previous.roadId !== edge.roadId) cost += turnPenalty;
    }
    return cost;
  }

  function planRoute(graph, startNode, goalNode, options = {}) {
    if (!graph.nodes.has(startNode) || !graph.nodes.has(goalNode)) return null;
    const turnPenalty = Number(options.turnPenalty) || 0;
    const heuristic = id => {
      const a = graph.nodes.get(id);
      const b = graph.nodes.get(goalNode);
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    };

    const open = [{ nodeId: startNode, previousEdgeId: null, g: 0, f: heuristic(startNode), serial: 0 }];
    const best = new Map([[`${startNode}|`, 0]]);
    const cameFrom = new Map();
    let serial = 1;
    let goalStateKey = null;

    while (open.length) {
      open.sort((a, b) => a.f - b.f || a.g - b.g || a.serial - b.serial);
      const current = open.shift();
      const currentKey = `${current.nodeId}|${current.previousEdgeId || ''}`;
      if (current.g > (best.get(currentKey) ?? Infinity) + 1e-9) continue;
      if (current.nodeId === goalNode) {
        goalStateKey = currentKey;
        break;
      }

      for (const next of graph.adjacency.get(current.nodeId) || []) {
        const edge = graph.edges.get(next.edgeId);
        if (!edge || edge.blocked) continue;
        const stepCost = routeEdgeCost(graph, next.edgeId, current.previousEdgeId, turnPenalty);
        if (!Number.isFinite(stepCost)) continue;
        const nextG = current.g + stepCost;
        const nextKey = `${next.nodeId}|${next.edgeId}`;
        if (nextG + 1e-9 >= (best.get(nextKey) ?? Infinity)) continue;
        best.set(nextKey, nextG);
        cameFrom.set(nextKey, { previousKey: currentKey, edgeId: next.edgeId, nodeId: current.nodeId });
        open.push({
          nodeId: next.nodeId,
          previousEdgeId: next.edgeId,
          g: nextG,
          f: nextG + heuristic(next.nodeId),
          serial: serial++
        });
      }
    }

    if (!goalStateKey) return null;

    const reverseNodes = [goalNode];
    const reverseEdges = [];
    let cursor = goalStateKey;
    while (cameFrom.has(cursor)) {
      const step = cameFrom.get(cursor);
      reverseEdges.push(step.edgeId);
      reverseNodes.push(step.nodeId);
      cursor = step.previousKey;
    }

    const nodes = reverseNodes.reverse();
    const edges = reverseEdges.reverse();
    const cost = edges.reduce((sum, edgeId, index) => {
      return sum + routeEdgeCost(graph, edgeId, index ? edges[index - 1] : null, turnPenalty);
    }, 0);

    return { nodes, edges, cost };
  }

  function routeIsValid(route, graph) {
    if (!route || !route.valid) return false;
    for (let index = route.currentSegmentIndex || 0; index < route.edges.length; index += 1) {
      const edge = graph.edges.get(route.edges[index]);
      if (!edge || edge.blocked) return false;
    }
    return true;
  }

  function routePolyline(route, graph) {
    if (!route) return [];
    return route.nodes.map(id => graph.nodes.get(id)).filter(Boolean);
  }

  function samplePolyline(points, progress) {
    if (!points.length) return { x: 0, y: 0, heading: 0 };
    let remaining = Math.max(0, progress);
    for (let index = 0; index < points.length - 1; index += 1) {
      const a = points[index];
      const b = points[index + 1];
      const length = distance(a, b);
      if (remaining <= length || index === points.length - 2) {
        const t = length ? clamp(remaining / length, 0, 1) : 0;
        return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), heading: Math.atan2(b.y - a.y, b.x - a.x) };
      }
      remaining -= length;
    }
    return { ...points[points.length - 1], heading: 0 };
  }

  function createCityEngine(config) {
    const city = createCityMap(config.city);
    const graph = buildRoadGraph(city, config.planner);
    const startNode = config.startNode || `r${city.horizontalYs.length - 1}c0`;
    const goalNode = config.goalNode || `r0c${city.verticalXs.length - 1}`;
    const eventConfig = {
      pedestrianStart: Number(config.events?.pedestrianStart) || 17,
      pedestrianEnd: Number(config.events?.pedestrianEnd) || 23,
      closureTime: Number(config.events?.closureTime) || 28,
      closureEdge: config.events?.closureEdge || 'h1-3-4',
      crossStart: Number(config.events?.crossStart) || 32,
      crossEnd: Number(config.events?.crossEnd) || 40,
      pedestrianNode: config.events?.pedestrianNode || 'r2c2',
      crossNode: config.events?.crossNode || 'r0c3'
    };
    const egoConfig = {
      length: Number(config.ego?.length) || 4.5,
      width: Number(config.ego?.width) || 2,
      maxSpeed: Number(config.ego?.maxSpeed) || 7,
      accel: Number(config.ego?.accel) || 2.1,
      comfortBrake: Number(config.ego?.comfortBrake) || 3.2,
      emergencyBrake: Number(config.ego?.emergencyBrake) || 7.5,
      turnRate: Number(config.ego?.turnRate) || 2.4
    };
    const control = {
      dt: clamp(Number(config.control?.dt) || 0.04, 0.02, 0.1),
      btHz: clamp(Number(config.control?.btHz) || 10, 2, 30),
      goalTolerance: Number(config.control?.goalTolerance) || 1.4,
      intersectionRange: Number(config.control?.intersectionRange) || 15,
      conflictHorizon: Number(config.control?.conflictHorizon) || 2.4,
      leadRange: Number(config.control?.leadRange) || 17,
      safeFollowingDistance: Number(config.control?.safeFollowingDistance) || 8,
      resetDelay: Number(config.control?.resetDelay) || 3,
      plannerTicks: Math.max(1, Number(config.control?.plannerTicks) || 2)
    };

    const initialPlan = planRoute(graph, startNode, goalNode, config.planner) || { nodes: [startNode], edges: [], cost: 0 };
    const initialPolyline = routePolyline(initialPlan, graph);
    let state;
    let previousActiveAction = null;
    let lastBtTickTime = -Infinity;
    let terminalAt = null;
    let eventSequence = 0;

    function logEvent(message) {
      const entry = { id: ++eventSequence, time: state.time, message };
      state.events.push(entry);
      if (state.events.length > 6) state.events.shift();
      state.event = `t=${state.time.toFixed(1)}  ${message}`;
    }

    function currentSegment() {
      const route = state.route;
      if (!route || route.currentSegmentIndex >= route.edges.length) return null;
      const index = route.currentSegmentIndex;
      return {
        index,
        edgeId: route.edges[index],
        edge: graph.edges.get(route.edges[index]),
        fromId: route.nodes[index],
        toId: route.nodes[index + 1],
        from: graph.nodes.get(route.nodes[index]),
        to: graph.nodes.get(route.nodes[index + 1])
      };
    }

    function segmentRemaining() {
      const segment = currentSegment();
      return segment ? distance(state.ego, segment.to) : 0;
    }

    function updateActors() {
      state.lead.progress += state.lead.speed * control.dt;
      const leadPose = samplePolyline(initialPolyline, state.lead.progress);
      state.lead.x = leadPose.x;
      state.lead.y = leadPose.y;
      state.lead.heading = leadPose.heading;

      const pedestrianNode = graph.nodes.get(eventConfig.pedestrianNode);
      const pedWindow = Math.max(0.1, eventConfig.pedestrianEnd - eventConfig.pedestrianStart);
      const pedPhase = clamp((state.time - eventConfig.pedestrianStart) / pedWindow, 0, 1);
      state.pedestrian.active = state.time >= eventConfig.pedestrianStart && state.time <= eventConfig.pedestrianEnd;
      if (pedestrianNode) {
        state.pedestrian.x = pedestrianNode.x + lerp(-8, 8, pedPhase);
        state.pedestrian.y = pedestrianNode.y;
      }

      const crossNode = graph.nodes.get(eventConfig.crossNode);
      const crossWindow = Math.max(0.1, eventConfig.crossEnd - eventConfig.crossStart);
      const crossPhase = clamp((state.time - eventConfig.crossStart) / crossWindow, 0, 1);
      state.cross.active = state.time >= eventConfig.crossStart && state.time <= eventConfig.crossEnd;
      if (crossNode) {
        state.cross.x = crossNode.x + lerp(-28, 28, crossPhase);
        state.cross.y = crossNode.y;
        state.cross.heading = 0;
      }

      if (!state.flags.closureActivated && state.time >= eventConfig.closureTime) {
        state.flags.closureActivated = true;
        const edge = graph.edges.get(eventConfig.closureEdge);
        if (edge) {
          edge.blocked = true;
          logEvent(`${edge.roadName} segment ${edge.id} closed by construction barricade.`);
        }
      }
    }

    function perceive() {
      const segment = currentSegment();
      const targetNode = segment?.to || null;
      const distanceToIntersection = targetNode ? distance(state.ego, targetNode) : Infinity;
      const approachingIntersection = Boolean(targetNode && distanceToIntersection <= control.intersectionRange);

      const leadDistance = distance(state.ego, state.lead);
      const headingDifference = Math.abs(angleDelta(state.lead.heading, state.ego.heading));
      const leadVehicleDetected = leadDistance <= control.leadRange && headingDifference < 0.8 && state.time < 18;

      const pedestrianDistance = state.pedestrian.active ? distance(state.ego, state.pedestrian) : Infinity;
      const pedestrianDetected = state.pedestrian.active && pedestrianDistance < 22;
      const pedestrianInLane = pedestrianDetected && pedestrianDistance < 15;

      const crossNode = graph.nodes.get(eventConfig.crossNode);
      const crossDistanceToNode = state.cross.active && crossNode ? distance(state.cross, crossNode) : Infinity;
      const egoTti = approachingIntersection ? distanceToIntersection / Math.max(state.ego.speed, 1.2) : Infinity;
      const crossTti = state.cross.active ? crossDistanceToNode / 7 : Infinity;
      const intersectionConflict = Boolean(
        state.cross.active &&
        targetNode?.id === eventConfig.crossNode &&
        (crossDistanceToNode < 9 || Math.abs(egoTti - crossTti) <= control.conflictHorizon)
      );

      const actorDistances = [
        leadVehicleDetected ? leadDistance : Infinity,
        pedestrianDetected ? pedestrianDistance : Infinity,
        state.cross.active ? distance(state.ego, state.cross) : Infinity
      ];
      const collisionImminent = Math.min(...actorDistances) < 3.2 && state.ego.speed > 0.8;
      const blockedEdge = [...graph.edges.values()].find(edge => edge.blocked && state.route?.edges.slice(state.route.currentSegmentIndex).includes(edge.id));

      return {
        leadVehicleDetected,
        leadDistance,
        leadSpeed: state.lead.speed,
        pedestrianDetected,
        pedestrianInLane,
        pedestrianDistance,
        approachingIntersection,
        intersectionConflict,
        hasRightOfWay: !intersectionConflict,
        distanceToIntersection,
        egoTti,
        crossTti,
        collisionImminent,
        laneBlocked: Boolean(blockedEdge),
        blockedSegment: blockedEdge?.id || null
      };
    }

    function updateBlackboard() {
      state.perception = perceive();
      const segment = currentSegment();
      const destination = graph.nodes.get(goalNode);
      const destinationDistance = destination ? distance(state.ego, destination) : Infinity;
      const routeAvailable = Boolean(state.route?.edges.length);
      const valid = routeAvailable && routeIsValid(state.route, graph);
      if (state.route) state.route.valid = valid;

      state.blackboard = {
        destination_valid: graph.nodes.has(goalNode),
        destination_reached: destinationDistance <= control.goalTolerance,
        route_available: routeAvailable,
        route_valid: valid,
        route_version: state.route?.version || 0,
        current_segment: segment?.edgeId || '—',
        distance_to_goal: destinationDistance,
        segment_complete: Boolean(segment && distance(state.ego, segment.to) <= control.goalTolerance),
        ego_speed: state.ego.speed,
        target_speed: state.command.targetSpeed,
        approaching_intersection: state.perception.approachingIntersection,
        intersection_conflict: state.perception.intersectionConflict,
        has_right_of_way: state.perception.hasRightOfWay,
        lead_vehicle_detected: state.perception.leadVehicleDetected,
        lead_vehicle_distance: state.perception.leadDistance,
        lead_vehicle_speed: state.perception.leadSpeed,
        lead_vehicle_too_close: state.perception.leadVehicleDetected && state.perception.leadDistance < control.safeFollowingDistance + state.ego.speed * 0.65,
        lane_blocked: state.perception.laneBlocked,
        blocked_segment: state.perception.blockedSegment || '—',
        pedestrian_detected: state.perception.pedestrianDetected,
        pedestrian_in_lane: state.perception.pedestrianInLane,
        collision_imminent: state.perception.collisionImminent,
        local_detour_available: false,
        planning_failed: state.planningFailed,
        active_skill: state.activeAction,
        root_status: state.rootStatus,
        tick: state.tick,
        sim_time: state.time
      };
    }

    function reset() {
      graph.edges.forEach(edge => {
        edge.blocked = (config.planner?.initiallyBlockedEdges || []).includes(edge.id);
      });
      const start = graph.nodes.get(startNode);
      state = {
        time: 0,
        tick: 0,
        ego: { x: start.x, y: start.y, heading: 0, speed: 0, acceleration: 0 },
        lead: { progress: 30, speed: 3.2, x: start.x, y: start.y, heading: 0 },
        pedestrian: { active: false, x: 0, y: 0 },
        cross: { active: false, x: 0, y: 0, heading: 0 },
        route: null,
        routeVersion: 0,
        statuses: new Map(),
        traversedEdges: new Set(),
        activeAction: 'none',
        rootStatus: STATUS.IDLE,
        command: { targetSpeed: 0, braking: 'none' },
        blackboard: {},
        perception: {},
        events: [],
        event: '',
        plannerProgress: 0,
        planningFailed: false,
        flags: { closureActivated: false, pedestrianLogged: false, pedestrianClearLogged: false, leadLogged: false, crossLogged: false }
      };
      previousActiveAction = null;
      lastBtTickTime = -Infinity;
      terminalAt = null;
      eventSequence = 0;
      updateActors();
      updateBlackboard();
      logEvent('Mission initialized; no route is available, so the BT must invoke the planner.');
      tickBehaviorTree(true);
      return state;
    }

    function setStatus(id, status) {
      state.statuses.set(id, status);
      return status;
    }

    function conditionStatus(name) {
      const bb = state.blackboard;
      const conditions = {
        collisionImminent: bb.collision_imminent,
        pedestrianInLane: bb.pedestrian_in_lane,
        destinationReached: bb.destination_reached,
        routeInvalid: !bb.route_available || !bb.route_valid,
        localDetourAvailable: bb.local_detour_available,
        destinationValid: bb.destination_valid,
        routeAvailable: bb.route_available,
        approachingIntersection: bb.approaching_intersection,
        intersectionConflict: bb.intersection_conflict,
        leadVehicleTooClose: bb.lead_vehicle_too_close,
        currentSegmentValid: bb.route_available && bb.route_valid,
        turnRequired: turnRequired(),
        planningFailed: bb.planning_failed
      };
      return conditions[name] ? STATUS.SUCCESS : STATUS.FAILURE;
    }

    function turnRequired() {
      const route = state.route;
      const segment = currentSegment();
      if (!route || !segment || segment.index === 0) return false;
      const previousFrom = route.nodes[segment.index - 1];
      const previousTo = route.nodes[segment.index];
      const previousHeading = edgeDirection(graph, route.edges[segment.index - 1], previousFrom, previousTo);
      const currentHeading = edgeDirection(graph, segment.edgeId, segment.fromId, segment.toId);
      return Math.abs(angleDelta(currentHeading, previousHeading)) > 0.35 && distance(state.ego, segment.from) < 10;
    }

    function planningStart() {
      const segment = currentSegment();
      if (!segment) return { prefixNodes: [startNode], prefixEdges: [], start: startNode, currentSegmentIndex: 0 };
      if (segment.edge && !segment.edge.blocked) {
        return {
          prefixNodes: [segment.fromId, segment.toId],
          prefixEdges: [segment.edgeId],
          start: segment.toId,
          currentSegmentIndex: 0
        };
      }
      return { prefixNodes: [segment.fromId], prefixEdges: [], start: segment.fromId, currentSegmentIndex: 0 };
    }

    function computeRouteAction() {
      state.activeAction = 'ComputeGlobalRoute';
      state.command.targetSpeed = 0;
      if (state.plannerProgress === 0) {
        state.plannerProgress = 1;
        logEvent(`Global replanning started from ${planningStart().start}.`);
        return STATUS.RUNNING;
      }
      if (state.plannerProgress < control.plannerTicks) {
        state.plannerProgress += 1;
        return STATUS.RUNNING;
      }

      const start = planningStart();
      const plan = planRoute(graph, start.start, goalNode, config.planner);
      state.plannerProgress = 0;
      if (!plan) {
        state.planningFailed = true;
        logEvent('A* could not find a route; mission enters safe-stop failure handling.');
        return STATUS.FAILURE;
      }

      state.routeVersion += 1;
      const nodes = start.prefixEdges.length ? [...start.prefixNodes, ...plan.nodes.slice(1)] : plan.nodes;
      const edges = start.prefixEdges.length ? [...start.prefixEdges, ...plan.edges] : plan.edges;
      state.route = {
        nodes,
        edges,
        cost: plan.cost,
        version: state.routeVersion,
        valid: true,
        currentSegmentIndex: start.currentSegmentIndex
      };
      state.planningFailed = false;
      logEvent(`A* accepted route version ${state.routeVersion}: ${nodes.join(' → ')}.`);
      return STATUS.SUCCESS;
    }

    function advanceRouteAction() {
      const route = state.route;
      if (!route) return STATUS.FAILURE;
      if (route.currentSegmentIndex < route.edges.length - 1) {
        route.currentSegmentIndex += 1;
        state.activeAction = 'AdvanceRouteSegment';
        const segment = currentSegment();
        if (segment) logEvent(`Route advanced to ${segment.edge.roadName} (${segment.edgeId}).`);
        return STATUS.RUNNING;
      }
      return STATUS.SUCCESS;
    }

    function motionAction(actionName) {
      state.activeAction = actionName;
      if (state.blackboard.segment_complete) return STATUS.SUCCESS;
      return STATUS.RUNNING;
    }

    function actionStatus(name) {
      if (name === 'emergencyBrake') {
        state.activeAction = 'EmergencyBrake';
        return STATUS.RUNNING;
      }
      if (name === 'stopForPedestrian') {
        state.activeAction = 'StopForPedestrian';
        return STATUS.RUNNING;
      }
      if (name === 'stopAtDestination') {
        state.activeAction = 'StopAtDestination';
        return state.ego.speed <= 0.08 ? STATUS.SUCCESS : STATUS.RUNNING;
      }
      if (name === 'applyLocalDetour') return STATUS.FAILURE;
      if (name === 'computeGlobalRoute') return computeRouteAction();
      if (name === 'yieldAtStopLine') {
        state.activeAction = 'YieldAtStopLine';
        return STATUS.RUNNING;
      }
      if (name === 'proceedThroughIntersection') return motionAction('ProceedThroughIntersection');
      if (name === 'followLeadVehicle') return motionAction('FollowLeadVehicle');
      if (name === 'executeTurn') return motionAction('ExecuteTurn');
      if (name === 'driveSegment') return motionAction('DriveSegment');
      if (name === 'advanceRouteSegment') return advanceRouteAction();
      if (name === 'safeStopMissionFailure') {
        state.activeAction = 'SafeStopMissionFailure';
        return STATUS.FAILURE;
      }
      return STATUS.FAILURE;
    }

    function evaluate(node, parentId = null) {
      if (!node) return STATUS.FAILURE;
      if (parentId) state.traversedEdges.add(`${parentId}->${node.id}`);
      const kind = node.kind || 'action';

      if (kind === 'condition') return setStatus(node.id, conditionStatus(node.condition));
      if (kind === 'action') return setStatus(node.id, actionStatus(node.action));

      if (kind === 'sequence') {
        for (const child of node.children || []) {
          const childStatus = evaluate(child, node.id);
          if (childStatus === STATUS.FAILURE || childStatus === STATUS.RUNNING) return setStatus(node.id, childStatus);
        }
        return setStatus(node.id, STATUS.SUCCESS);
      }

      if (kind === 'fallback' || kind === 'control') {
        for (const child of node.children || []) {
          const childStatus = evaluate(child, node.id);
          if (childStatus === STATUS.SUCCESS || childStatus === STATUS.RUNNING) return setStatus(node.id, childStatus);
        }
        return setStatus(node.id, STATUS.FAILURE);
      }

      return setStatus(node.id, STATUS.FAILURE);
    }

    function updateCommand() {
      const segment = currentSegment();
      const speedLimit = segment?.edge?.speedLimit || egoConfig.maxSpeed;
      let targetSpeed = 0;
      let braking = 'none';
      if (state.activeAction === 'EmergencyBrake') {
        targetSpeed = 0;
        braking = 'emergency';
      } else if (state.activeAction === 'StopForPedestrian' || state.activeAction === 'YieldAtStopLine' || state.activeAction === 'ComputeGlobalRoute' || state.activeAction === 'SafeStopMissionFailure' || state.activeAction === 'StopAtDestination') {
        targetSpeed = 0;
        braking = 'comfort';
      } else if (state.activeAction === 'FollowLeadVehicle') {
        targetSpeed = Math.min(speedLimit, state.blackboard.lead_vehicle_speed);
      } else if (state.activeAction === 'ExecuteTurn') {
        targetSpeed = Math.min(3.4, speedLimit);
      } else if (state.activeAction === 'ProceedThroughIntersection') {
        targetSpeed = Math.min(4.5, speedLimit);
      } else if (state.activeAction === 'DriveSegment' || state.activeAction === 'AdvanceRouteSegment') {
        targetSpeed = Math.min(egoConfig.maxSpeed, speedLimit);
      }

      if (segment) {
        const remaining = segmentRemaining();
        if (remaining < 7 && routeTurnAhead()) targetSpeed = Math.min(targetSpeed, 3.5);
        if (state.route?.currentSegmentIndex === state.route?.edges.length - 1 && remaining < 8) targetSpeed = Math.min(targetSpeed, Math.max(0.8, remaining * 0.75));
      }
      state.command = { targetSpeed, braking };
      state.blackboard.target_speed = targetSpeed;
    }

    function routeTurnAhead() {
      const route = state.route;
      if (!route) return false;
      const index = route.currentSegmentIndex;
      if (index >= route.edges.length - 1) return false;
      const a = graph.edges.get(route.edges[index]);
      const b = graph.edges.get(route.edges[index + 1]);
      return Boolean(a && b && a.roadId !== b.roadId);
    }

    function tickBehaviorTree(force = false) {
      const interval = 1 / control.btHz;
      if (!force && state.time - lastBtTickTime < interval - 1e-8) return;
      lastBtTickTime = state.time;
      state.tick += 1;
      state.statuses = new Map();
      state.traversedEdges = new Set();
      state.activeAction = 'none';
      updateBlackboard();
      state.rootStatus = evaluate(config.tree);

      if (previousActiveAction && previousActiveAction !== state.activeAction) {
        const haltedNode = findActionNode(config.tree, actionNameForLabel(previousActiveAction));
        if (haltedNode && !state.statuses.has(haltedNode.id)) state.statuses.set(haltedNode.id, STATUS.HALTED);
      }

      if (state.activeAction !== 'none') previousActiveAction = state.activeAction;
      updateCommand();
      updateBlackboard();
      state.blackboard.root_status = state.rootStatus;
      state.blackboard.active_skill = state.activeAction;

      if (state.blackboard.lead_vehicle_detected && !state.flags.leadLogged) {
        state.flags.leadLogged = true;
        logEvent('Slower lead vehicle detected; following policy is eligible.');
      }
      if (state.blackboard.pedestrian_in_lane && !state.flags.pedestrianLogged) {
        state.flags.pedestrianLogged = true;
        logEvent('Pedestrian entered the ego lane; safety subtree preempts road execution.');
      }
      if (state.flags.pedestrianLogged && !state.blackboard.pedestrian_in_lane && !state.flags.pedestrianClearLogged && state.time > eventConfig.pedestrianStart) {
        state.flags.pedestrianClearLogged = true;
        logEvent('Pedestrian cleared the lane; nominal navigation can resume on the next tick.');
      }
      if (state.blackboard.intersection_conflict && !state.flags.crossLogged) {
        state.flags.crossLogged = true;
        logEvent('Cross traffic creates an intersection arrival conflict; ego yields.');
      }
    }

    function actionNameForLabel(label) {
      const map = {
        EmergencyBrake: 'emergencyBrake',
        StopForPedestrian: 'stopForPedestrian',
        StopAtDestination: 'stopAtDestination',
        ComputeGlobalRoute: 'computeGlobalRoute',
        YieldAtStopLine: 'yieldAtStopLine',
        ProceedThroughIntersection: 'proceedThroughIntersection',
        FollowLeadVehicle: 'followLeadVehicle',
        ExecuteTurn: 'executeTurn',
        DriveSegment: 'driveSegment',
        AdvanceRouteSegment: 'advanceRouteSegment',
        SafeStopMissionFailure: 'safeStopMissionFailure'
      };
      return map[label] || label;
    }

    function integrateEgo(dt) {
      const segment = currentSegment();
      const desired = state.command.targetSpeed;
      const braking = desired < state.ego.speed;
      const rate = braking
        ? (state.command.braking === 'emergency' ? egoConfig.emergencyBrake : egoConfig.comfortBrake)
        : egoConfig.accel;
      const delta = clamp(desired - state.ego.speed, -rate * dt, rate * dt);
      state.ego.acceleration = delta / Math.max(dt, 1e-6);
      state.ego.speed = clamp(state.ego.speed + delta, 0, egoConfig.maxSpeed);

      if (!segment || state.activeAction === 'ComputeGlobalRoute' || state.activeAction === 'SafeStopMissionFailure') return;
      const desiredHeading = Math.atan2(segment.to.y - state.ego.y, segment.to.x - state.ego.x);
      const turn = clamp(angleDelta(desiredHeading, state.ego.heading), -egoConfig.turnRate * dt, egoConfig.turnRate * dt);
      state.ego.heading += turn;

      const maxStep = state.ego.speed * dt;
      const remaining = distance(state.ego, segment.to);
      if (remaining <= maxStep + 0.05) {
        state.ego.x = segment.to.x;
        state.ego.y = segment.to.y;
      } else {
        state.ego.x += Math.cos(state.ego.heading) * maxStep;
        state.ego.y += Math.sin(state.ego.heading) * maxStep;
      }
    }

    function step(dt = control.dt) {
      state.time += dt;
      updateActors();
      updateBlackboard();
      tickBehaviorTree();
      integrateEgo(dt);
      updateBlackboard();

      if (state.blackboard.destination_reached && state.rootStatus === STATUS.SUCCESS) {
        if (terminalAt === null) {
          terminalAt = state.time;
          logEvent('Destination reached; StopAtDestination completed and the root returned SUCCESS.');
        }
        if (config.loop !== false && state.time - terminalAt >= control.resetDelay) reset();
      } else {
        terminalAt = null;
      }
      return state;
    }

    reset();
    return { state: () => state, city, graph, startNode, goalNode, egoConfig, control, events: eventConfig, reset, step };
  }

  function createCityRenderer(canvas, engine) {
    const context = canvas.getContext('2d');
    let cssWidth = 760;
    let cssHeight = 500;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      cssWidth = Math.max(360, rect.width || 760);
      cssHeight = Math.max(300, rect.height || cssWidth * 0.66);
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
        x: pad + point.x / engine.city.width * (cssWidth - pad * 2),
        y: pad + point.y / engine.city.height * (cssHeight - pad * 2)
      };
    };
    const pxX = value => value / engine.city.width * (cssWidth - 36);
    const pxY = value => value / engine.city.height * (cssHeight - 36);

    function drawBackground() {
      context.fillStyle = '#edf2ed';
      context.fillRect(0, 0, cssWidth, cssHeight);
    }

    function drawBuildings() {
      engine.city.buildings.forEach((building, index) => {
        const p = worldToCanvas(building);
        const w = pxX(building.width);
        const h = pxY(building.height);
        context.fillStyle = index % 3 === 0 ? '#dfe7e1' : index % 3 === 1 ? '#e5e4dc' : '#dde3e8';
        context.strokeStyle = '#aab5b0';
        context.lineWidth = 1;
        context.fillRect(p.x, p.y, w, h);
        context.strokeRect(p.x, p.y, w, h);
        context.fillStyle = '#5f6c68';
        context.font = '10px system-ui, sans-serif';
        context.fillText(building.label, p.x + 5, p.y + 14);
      });
    }

    function drawRoads() {
      engine.city.roads.forEach(road => {
        context.fillStyle = '#d7dce1';
        context.strokeStyle = '#c0c7ce';
        context.lineWidth = 1;
        if (road.orientation === 'horizontal') {
          const a = worldToCanvas({ x: 0, y: road.center - road.width / 2 });
          const b = worldToCanvas({ x: engine.city.width, y: road.center + road.width / 2 });
          context.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
          const centerA = worldToCanvas({ x: 0, y: road.center });
          const centerB = worldToCanvas({ x: engine.city.width, y: road.center });
          context.setLineDash([9, 8]);
          context.strokeStyle = '#ffffff';
          context.beginPath();
          context.moveTo(centerA.x, centerA.y);
          context.lineTo(centerB.x, centerB.y);
          context.stroke();
          context.setLineDash([]);
        } else {
          const a = worldToCanvas({ x: road.center - road.width / 2, y: 0 });
          const b = worldToCanvas({ x: road.center + road.width / 2, y: engine.city.height });
          context.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
          const centerA = worldToCanvas({ x: road.center, y: 0 });
          const centerB = worldToCanvas({ x: road.center, y: engine.city.height });
          context.setLineDash([9, 8]);
          context.strokeStyle = '#ffffff';
          context.beginPath();
          context.moveTo(centerA.x, centerA.y);
          context.lineTo(centerB.x, centerB.y);
          context.stroke();
          context.setLineDash([]);
        }
      });

      engine.city.intersections.forEach(node => {
        const p = worldToCanvas(node);
        context.fillStyle = 'rgba(255,255,255,.1)';
        context.fillRect(p.x - pxX(engine.city.roadWidth / 2), p.y - pxY(engine.city.roadWidth / 2), pxX(engine.city.roadWidth), pxY(engine.city.roadWidth));
      });
    }

    function drawRoute() {
      const state = engine.state();
      const route = state.route;
      if (!route) return;
      const points = route.nodes.map(id => engine.graph.nodes.get(id)).filter(Boolean);
      if (points.length < 2) return;

      context.lineCap = 'round';
      context.lineJoin = 'round';
      for (let index = 0; index < route.edges.length; index += 1) {
        const a = worldToCanvas(points[index]);
        const b = worldToCanvas(points[index + 1]);
        const edge = engine.graph.edges.get(route.edges[index]);
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        if (edge?.blocked) {
          context.strokeStyle = '#c94a4a';
          context.lineWidth = 6;
          context.setLineDash([5, 5]);
        } else if (index < route.currentSegmentIndex) {
          context.strokeStyle = '#6d8f79';
          context.lineWidth = 4;
          context.setLineDash([]);
        } else if (index === route.currentSegmentIndex) {
          context.strokeStyle = '#245b88';
          context.lineWidth = 6;
          context.setLineDash([]);
        } else {
          context.strokeStyle = '#4f82b1';
          context.lineWidth = 4;
          context.setLineDash([8, 6]);
        }
        context.stroke();
        context.setLineDash([]);
      }
    }

    function drawBarricades() {
      engine.graph.edges.forEach(edge => {
        if (!edge.blocked) return;
        const a = engine.graph.nodes.get(edge.from);
        const b = engine.graph.nodes.get(edge.to);
        const p = worldToCanvas({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
        context.save();
        context.translate(p.x, p.y);
        context.rotate(Math.atan2(b.y - a.y, b.x - a.x));
        context.fillStyle = '#fff5e6';
        context.strokeStyle = '#b14c35';
        context.lineWidth = 2;
        context.fillRect(-13, -6, 26, 12);
        context.strokeRect(-13, -6, 26, 12);
        context.beginPath();
        context.moveTo(-10, 5);
        context.lineTo(-3, -5);
        context.moveTo(0, 5);
        context.lineTo(7, -5);
        context.stroke();
        context.restore();
      });
    }

    function drawDestination() {
      const node = engine.graph.nodes.get(engine.goalNode);
      const p = worldToCanvas(node);
      context.fillStyle = '#28775f';
      context.strokeStyle = '#1f5b48';
      context.lineWidth = 2;
      context.fillRect(p.x - 8, p.y - 8, 16, 16);
      context.strokeRect(p.x - 8, p.y - 8, 16, 16);
      context.fillStyle = '#1f5b48';
      context.font = '11px system-ui, sans-serif';
      context.fillText('loading goal', p.x - 28, p.y - 13);
    }

    function drawCar(actor, fill, stroke, label, length = 4.5, width = 2) {
      const p = worldToCanvas(actor);
      const lengthPx = Math.max(18, pxX(length));
      const widthPx = Math.max(10, pxY(width));
      context.save();
      context.translate(p.x, p.y);
      context.rotate(actor.heading || 0);
      context.fillStyle = fill;
      context.strokeStyle = stroke;
      context.lineWidth = 1.6;
      context.fillRect(-lengthPx / 2, -widthPx / 2, lengthPx, widthPx);
      context.strokeRect(-lengthPx / 2, -widthPx / 2, lengthPx, widthPx);
      context.restore();
      context.fillStyle = stroke;
      context.font = '10px system-ui, sans-serif';
      context.fillText(label, p.x + 8, p.y - 9);
    }

    function drawActors() {
      const state = engine.state();
      drawCar(state.lead, '#f3dfc2', '#915d1f', 'lead');
      if (state.cross.active) drawCar(state.cross, '#f2cdcf', '#a84451', 'cross traffic', 4.6, 2);
      if (state.pedestrian.active) {
        const p = worldToCanvas(state.pedestrian);
        context.fillStyle = '#7a426f';
        context.beginPath();
        context.arc(p.x, p.y, 5, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#63335a';
        context.font = '10px system-ui, sans-serif';
        context.fillText('pedestrian', p.x + 7, p.y - 7);
      }
      drawCar(state.ego, '#dce9f6', '#245b88', 'ego', engine.egoConfig.length, engine.egoConfig.width);
    }

    function drawTelemetry() {
      const state = engine.state();
      context.fillStyle = 'rgba(255,255,255,.93)';
      context.strokeStyle = '#cbd2da';
      context.lineWidth = 1;
      context.fillRect(10, 10, 238, 72);
      context.strokeRect(10, 10, 238, 72);
      context.fillStyle = '#273445';
      context.font = '11px ui-monospace, monospace';
      context.fillText(`route v${state.route?.version || 0} · ${state.blackboard.current_segment}`, 20, 29);
      context.fillText(`ego ${state.ego.speed.toFixed(1)} → ${state.command.targetSpeed.toFixed(1)} m/s`, 20, 46);
      context.fillText(`skill ${state.activeAction}`, 20, 63);
      context.fillText(`goal ${state.blackboard.distance_to_goal.toFixed(1)} m`, 20, 78);
    }

    function render() {
      context.clearRect(0, 0, cssWidth, cssHeight);
      drawBackground();
      drawBuildings();
      drawRoads();
      drawRoute();
      drawBarricades();
      drawDestination();
      drawActors();
      drawTelemetry();
    }

    return { render, stop: () => observer.disconnect() };
  }

  function createTreeRenderer(host, tree, engine, inspector) {
    if (!d3) {
      host.textContent = 'Live tree view requires D3.';
      return { update() {}, stop() {} };
    }

    const toolbar = document.createElement('div');
    toolbar.className = 'kb-sim-tree-toolbar';
    const fit = document.createElement('button');
    const zoomOut = document.createElement('button');
    const zoomIn = document.createElement('button');
    const pan = document.createElement('button');
    [fit, zoomOut, zoomIn, pan].forEach(button => { button.type = 'button'; });
    fit.textContent = 'Fit';
    zoomOut.textContent = '−';
    zoomIn.textContent = '+';
    pan.textContent = 'Pan';
    pan.setAttribute('aria-pressed', 'false');
    toolbar.append(fit, zoomOut, zoomIn, pan);
    host.appendChild(toolbar);

    const shell = document.createElement('div');
    shell.className = 'kb-sim-tree-shell';
    host.appendChild(shell);

    const svg = d3.select(shell)
      .append('svg')
      .attr('class', 'kb-sim-tree-svg')
      .attr('role', 'img')
      .attr('aria-label', 'Live behavior tree execution state');
    const viewport = svg.append('g').attr('class', 'kb-sim-tree-viewport');

    const hierarchy = d3.hierarchy(tree);
    const leaves = Math.max(1, hierarchy.leaves().length);
    const levels = hierarchy.height + 1;
    const width = Math.max(1040, leaves * 170);
    const height = Math.max(620, levels * 96);
    const layout = d3.tree().size([width - 180, height - 110]).separation((a, b) => a.parent === b.parent ? 1.1 : 1.35);
    layout(hierarchy);
    const nodes = hierarchy.descendants();
    const links = hierarchy.links();
    const shiftX = 90 - Math.min(...nodes.map(node => node.x));
    const viewWidth = Math.max(width, Math.max(...nodes.map(node => node.x)) - Math.min(...nodes.map(node => node.x)) + 180);
    svg.attr('viewBox', `0 0 ${viewWidth} ${height}`);

    const linkViews = viewport.append('g')
      .attr('class', 'kb-sim-tree-links')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('data-edge-id', link => `${link.source.data.id}->${link.target.data.id}`)
      .attr('d', link => {
        const sx = link.source.x + shiftX;
        const sy = link.source.y + 48;
        const tx = link.target.x + shiftX;
        const ty = link.target.y + 48;
        const mid = (sy + ty) / 2;
        return `M${sx},${sy} C${sx},${mid} ${tx},${mid} ${tx},${ty}`;
      });

    const nodeViews = new Map();
    const nodeGroups = viewport.append('g')
      .attr('class', 'kb-sim-tree-nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'kb-sim-tree-node')
      .attr('data-kind', node => node.data.kind || 'action')
      .attr('transform', node => `translate(${node.x + shiftX},${node.y + 48})`)
      .attr('tabindex', 0)
      .attr('role', 'button');

    nodeGroups.append('rect')
      .attr('x', -72)
      .attr('y', -27)
      .attr('width', 144)
      .attr('height', 54);

    nodeGroups.each(function(node) {
      const group = d3.select(this);
      const labelText = String(node.data.label || node.data.id);
      const words = labelText.split(/\s+/);
      let first = labelText;
      let second = '';
      if (labelText.length > 20 && words.length > 1) {
        const cut = Math.ceil(words.length / 2);
        first = words.slice(0, cut).join(' ');
        second = words.slice(cut).join(' ');
      }
      const label = group.append('text').attr('class', 'kb-sim-tree-label').attr('text-anchor', 'middle');
      label.append('tspan').attr('x', 0).attr('dy', second ? '-.35em' : '.15em').text(first);
      if (second) label.append('tspan').attr('x', 0).attr('dy', '1.1em').text(second);
      const meta = group.append('text').attr('class', 'kb-sim-tree-meta').attr('text-anchor', 'middle').attr('y', 40);
      meta.text(`${String(node.data.kind || 'action').toUpperCase()} · depth ${node.depth}`);
      const status = group.append('text').attr('class', 'kb-sim-tree-status').attr('text-anchor', 'middle').attr('y', 53).text(STATUS.IDLE);
      nodeViews.set(node.data.id, { group, status, node });
    });

    function showInspector(node) {
      const state = engine.state();
      const status = state.statuses.get(node.data.id) || STATUS.IDLE;
      inspector.replaceChildren();
      const title = textElement('strong', 'kb-sim-inspector-title', node.data.label || node.data.id);
      const grid = document.createElement('div');
      grid.className = 'kb-sim-inspector-grid';
      const rows = [
        ['Type', String(node.data.kind || 'action').toUpperCase()],
        ['Depth', String(node.depth)],
        ['Status', status],
        ['Reads', (node.data.reads || []).join(', ') || '—'],
        ['Writes', (node.data.writes || []).join(', ') || '—']
      ];
      rows.forEach(([key, value]) => {
        const row = document.createElement('div');
        row.append(textElement('span', 'kb-sim-inspector-key', key).element, textElement('span', 'kb-sim-inspector-value', value).element);
        grid.appendChild(row);
      });
      const purpose = textElement('p', 'kb-sim-inspector-purpose', node.data.purpose || 'Structured node evaluated by the live behavior-tree runtime.');
      inspector.append(title.element, grid, purpose.element);
    }

    nodeGroups.on('click', (_, node) => showInspector(node));
    nodeGroups.on('keydown', (event, node) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showInspector(node);
      }
    });

    let panEnabled = false;
    const zoom = d3.zoom()
      .scaleExtent([0.45, 2.5])
      .filter(event => {
        if (event.type === 'wheel') return Boolean(event.ctrlKey || event.metaKey);
        return panEnabled;
      })
      .on('zoom', event => viewport.attr('transform', event.transform));
    svg.call(zoom);
    svg.on('wheel.kb-scroll-safety', event => {
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
    }, { passive: false });

    function fitTree() {
      const bounds = viewport.node().getBBox();
      const shellWidth = Math.max(320, shell.clientWidth || 640);
      const shellHeight = Math.max(280, shell.clientHeight || 420);
      if (!bounds.width || !bounds.height) return;
      const scale = Math.min(1, 0.9 / Math.max(bounds.width / shellWidth, bounds.height / shellHeight));
      const tx = shellWidth / 2 - scale * (bounds.x + bounds.width / 2);
      const ty = shellHeight / 2 - scale * (bounds.y + bounds.height / 2);
      svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
    }

    fit.addEventListener('click', fitTree);
    zoomIn.addEventListener('click', () => svg.transition().duration(160).call(zoom.scaleBy, 1.25));
    zoomOut.addEventListener('click', () => svg.transition().duration(160).call(zoom.scaleBy, 0.8));
    pan.addEventListener('click', () => {
      panEnabled = !panEnabled;
      pan.setAttribute('aria-pressed', String(panEnabled));
      pan.classList.toggle('active', panEnabled);
      shell.classList.toggle('pan-enabled', panEnabled);
    });

    function update() {
      const state = engine.state();
      nodeViews.forEach((view, id) => {
        const status = state.statuses.get(id) || STATUS.IDLE;
        view.group.attr('data-status', status);
        view.status.text(status);
      });
      linkViews.attr('data-active', link => state.traversedEdges.has(`${link.source.data.id}->${link.target.data.id}`) ? 'true' : 'false');
    }

    requestAnimationFrame(fitTree);
    update();
    return { update, fit: fitTree, stop() { svg.on('.zoom', null); } };
  }

  function createSimulation(config, sourceBlock) {
    if (!config?.tree || !config?.city) return null;
    const engine = createCityEngine(config);
    const wrapper = document.createElement('section');
    wrapper.className = 'kb-sim kb-sim-city';
    wrapper.setAttribute('aria-label', config.title || 'City behavior-tree simulation');

    const header = document.createElement('div');
    header.className = 'kb-sim-header';
    const title = textElement('div', 'kb-sim-title', config.title || 'City navigation simulation');
    const clock = textElement('div', 'kb-sim-phase', '');
    header.append(title.element, clock.element);

    const layout = document.createElement('div');
    layout.className = 'kb-sim-layout';

    const scenePanel = document.createElement('section');
    scenePanel.className = 'kb-sim-panel kb-sim-scene-panel';
    const sceneHeading = textElement('h4', '', 'City / road simulation');
    const canvas = document.createElement('canvas');
    canvas.className = 'kb-sim-canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'City road network with twelve building blocks, route overlay, ego vehicle, traffic, pedestrian, road closure, and destination');
    const eventHeading = textElement('h4', 'kb-sim-event-heading', 'Significant events');
    const eventLog = document.createElement('ol');
    eventLog.className = 'kb-sim-event-log';
    scenePanel.append(sceneHeading.element, canvas, eventHeading.element, eventLog);

    const decisionPanel = document.createElement('section');
    decisionPanel.className = 'kb-sim-panel kb-sim-decision-panel';
    const blackboardHeading = textElement('h4', '', 'Blackboard — perception + planner state');
    const blackboard = document.createElement('div');
    blackboard.className = 'kb-sim-blackboard';
    const blackboardKeys = ['route_version', 'current_segment', 'route_valid', 'ego_speed', 'target_speed', 'intersection_conflict', 'pedestrian_in_lane', 'lane_blocked', 'active_skill', 'root_status', 'tick'];
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

    const treeHeading = textElement('h4', '', 'Live BT — recursive hierarchy and active path');
    const treeHost = document.createElement('div');
    treeHost.className = 'kb-sim-tree-host';
    const inspectorHeading = textElement('h4', 'kb-sim-inspector-heading', 'Node inspector');
    const inspector = document.createElement('div');
    inspector.className = 'kb-sim-inspector';
    inspector.textContent = 'Select a BT node to inspect its type, depth, status, inputs, outputs, and purpose.';
    decisionPanel.append(blackboardHeading.element, blackboard, treeHeading.element, treeHost, inspectorHeading.element, inspector);
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
    const speed = document.createElement('select');
    speed.className = 'kb-sim-speed';
    speed.setAttribute('aria-label', 'Simulation speed');
    [[0.5, '0.5×'], [1, '1×'], [2, '2×']].forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = String(value);
      option.textContent = label;
      if (value === 1) option.selected = true;
      speed.appendChild(option);
    });
    controls.append(reset, play, step, speed);

    const legend = document.createElement('div');
    legend.className = 'kb-sim-legend';
    [['#3f8b57', 'Success'], ['#c94a4a', 'Failure'], ['#2f6fbd', 'Running'], ['#8a6a16', 'Halted'], ['#aeb8c3', 'Idle']].forEach(([color, labelText]) => {
      const item = document.createElement('span');
      const swatch = document.createElement('i');
      swatch.style.background = color;
      item.append(swatch, document.createTextNode(labelText));
      legend.appendChild(item);
    });
    footer.append(controls, legend);
    wrapper.append(header, layout, footer);
    sourceBlock.replaceWith(wrapper);

    const cityRenderer = createCityRenderer(canvas, engine);
    const treeRenderer = createTreeRenderer(treeHost, config.tree, engine, inspector);
    let playing = !reducedMotion.matches;
    let raf = null;
    let lastFrame = performance.now();
    let accumulator = 0;
    const fixedDt = engine.control.dt;

    function formatValue(key, value) {
      if (typeof value !== 'number') return String(value);
      if (key === 'tick' || key === 'route_version') return String(Math.round(value));
      if (!Number.isFinite(value)) return '∞';
      return value.toFixed(2);
    }

    function updateEventLog(state) {
      eventLog.replaceChildren();
      state.events.slice().reverse().forEach(entry => {
        const item = document.createElement('li');
        const time = document.createElement('time');
        time.textContent = `t=${entry.time.toFixed(1)}`;
        item.append(time, document.createTextNode(` ${entry.message}`));
        eventLog.appendChild(item);
      });
    }

    function updateView() {
      const state = engine.state();
      clock.node.data = `t=${state.time.toFixed(1)} s · tick ${state.tick} · route v${state.route?.version || 0} · ${state.activeAction}`;
      blackboardKeys.forEach(key => {
        const value = state.blackboard[key];
        blackboardViews.get(key).data = value === undefined ? '—' : formatValue(key, value);
      });
      updateEventLog(state);
      cityRenderer.render();
      treeRenderer.update();
      playText.data = playing ? 'Pause' : 'Play';
    }

    function frame(now) {
      if (!wrapper.isConnected) return;
      const elapsed = Math.min(0.2, Math.max(0, (now - lastFrame) / 1000));
      lastFrame = now;
      if (playing) {
        accumulator += elapsed * Number(speed.value || 1);
        let guard = 0;
        while (accumulator >= fixedDt && guard < 12) {
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
    speed.addEventListener('change', () => { lastFrame = performance.now(); });
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
        cityRenderer.stop();
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
