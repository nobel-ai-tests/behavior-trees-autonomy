# Visualization Instructions

This file is the repository-level contract for creating, maintaining, and validating diagrams, figures, simulations, and animations in the knowledge base.

## 1. Core principle

Visualizations must explain behavior, method, data flow, mathematical structure, or experimental workflow. They should not be decorative.

Prefer **structured visual definitions** over manually positioned graphics. The visualization source should describe the model; the renderer should manage layout wherever practical.

Use:

- **Mermaid** for static architecture, process, dependency, control-flow, data-flow, taxonomy, and methodological diagrams.
- **D3** for structured interactive trees/graphs whose layout or state changes dynamically.
- **Canvas** for simulated physical scenes where actors move continuously.
- **A deterministic simulation model** for animations that claim to demonstrate runtime behavior.

Avoid hand-positioned SVG diagrams unless the subject genuinely requires exact custom geometry that cannot be represented by the structured renderers.

## 2. Mermaid diagrams

### Authoring

Write Mermaid definitions directly in Markdown using fenced `mermaid` blocks.

Keep labels concise. Split a long concept into a short node label plus surrounding prose instead of forcing a paragraph into a node.

Prefer explicit subgraphs for architectural layers or workflow stages. Use direction deliberately (`LR`, `TB`, etc.) based on the causal/data-flow structure.

Do not manually compensate for layout problems with excessive invisible nodes or arbitrary spacer links. Fix the graph structure or renderer configuration instead.

### Rendering

Mermaid is initialized in `assets/kb-diagrams.js` and styled in `assets/kb-diagrams.css`.

Current requirements:

- wait for `document.fonts.ready` before rendering when available;
- use SVG labels rather than HTML labels for flowcharts;
- use automatic wrapping for long labels;
- prefer ELK layout for complex flowcharts;
- keep node/rank spacing compact enough for the reading pane;
- preserve square-corner visual styling;
- render inside a dedicated viewport rather than shrinking complex diagrams to unreadable size;
- do not let Mermaid's own SVG/DOM mutations trigger semantic reader-navigation behavior.

### Interaction

Every Mermaid diagram must provide visible controls for zoom out, zoom in, fit/reset, and explicit pan mode.

Normal article scrolling must always remain the default interaction.

Rules:

- ordinary mouse-wheel scrolling scrolls the reader, including while the pointer is over the diagram;
- ordinary touch drag scrolls the reader, including when the gesture starts over the diagram;
- the diagram viewport must be non-interactive for pointer hit-testing while Pan mode is off;
- `Ctrl/Command + wheel` may zoom through the outer diagram shell without changing ordinary-wheel behavior;
- direct pointer/touch panning is available only after enabling the visible **Pan** control;
- disabling Pan must immediately restore pointer pass-through and normal page scrolling;
- when Pan mode is active, keyboard arrows may pan and Escape should leave Pan mode;
- zoom and Fit must remain available through toolbar buttons even when the diagram viewport itself is non-interactive.

Do not use implicit drag-to-pan or modifier-drag behavior as the default. A large diagram occupies enough screen area that any implicit pointer capture can make the page feel locked.

Never make a diagram interaction trap the reader's scroll position.

## 3. Simulations and animations

### Simulation-first rule

If a visualization demonstrates a temporal robotics/autonomy behavior, prefer an actual simulation over authored animation phases.

The desired architecture is:

`scenario parameters -> world state -> sensors/perception -> blackboard -> BT evaluator -> selected action -> dynamics/kinematics -> next world state -> renderer`

The visible animation must be a projection of this state, not the source of truth.

### Scenario definition

A Markdown simulation block should define only the model inputs needed by the simulator, such as:

- environment/road/map geometry;
- agents/actors;
- initial state;
- dynamics and controller parameters;
- sensing/conflict thresholds;
- tick/control rates;
- behavior-tree structure;
- deterministic reset/loop behavior.

Do not encode a list of hand-authored frames, statuses, or phases when those values can be computed.

### Runtime semantics

Behavior-tree node states shown in a live decision graph must come directly from the same evaluator that controls the actor.

The renderer must distinguish at least `SUCCESS`, `FAILURE`, `RUNNING`, `HALTED` when a previously running action is interrupted, and `IDLE` / not ticked.

The scene and decision tree must share one source of truth. A node must never be shown as Running merely because an animation author selected that color/state.

### Actor motion

When the selected behavior implies motion, the actor should physically move in the simulation whenever feasible.

Examples:

- `DriveSegment` advances the ego vehicle along the current road segment;
- `YieldAtStopLine` decelerates toward and holds a yield/stop position;
- `FollowLeadVehicle` targets a speed constrained by the lead vehicle;
- `EmergencyBrake` decelerates aggressively;
- navigation actions advance robot pose along a generated or controlled trajectory;
- moving obstacles/other agents evolve independently according to their own model.

### Live decision visualization

Use a structured layout such as `d3.hierarchy` + `d3.tree` for dynamic BT views. Do not hand-position the decision tree.

The live tree should:

- derive hierarchy from the same JSON/tree data used by the evaluator;
- update node status on each BT tick;
- visually distinguish traversed/active branches from unticked branches;
- remain legible at the reader width;
- avoid overlapping labels;
- keep node labels concise.

## 4. Map-navigation simulations

Physical navigation simulations must separate the following responsibilities even when they live in one browser file:

`visual map geometry -> navigation graph -> planner -> route state -> controller -> renderer`

Canvas objects are display primitives, not the navigation model. Road surfaces and building rectangles may be rendered from structured map data, but pathfinding must operate on a graph or another explicit planning representation.

### Map and graph generation

Where practical, derive navigation nodes from road intersections and connect neighboring nodes that share a road. Keep visual road geometry and graph edge metadata consistent through shared source data rather than maintaining unrelated coordinate lists.

Road edges should expose enough metadata for planning and control, such as road identity, length, speed limit, blockage state, and optional cost modifiers.

A complex demonstration should use enough blocks and intersections to make route choice meaningful. Start and goal must not be a trivial straight-line pair when the purpose is to teach planning and hierarchical route execution.

### Planning and route overlays

Routes displayed in a simulation must be produced by the planner. Do not draw a route that differs from planner state.

For road-network navigation, A* is appropriate. A blocked edge must have infinite/unavailable traversal cost. Optional congestion and turn penalties may be used when they remain explicit scenario inputs.

Route state should include, at minimum, the ordered nodes/edges, a version, validity, and the current segment index. The renderer should visually distinguish planned, completed, current, and blocked portions of the route.

A route closure must update the road/world model first. Route validation then discovers the invalid path, and the BT may invoke replanning. Do not schedule `ReplanRoute` directly from the event timeline.

### Dynamic obstacles and perception

Environment events may deterministically spawn, move, or remove lead vehicles, crossing traffic, pedestrians, and construction barriers. Those events must modify world state only.

Perception converts world state into task-relevant observations such as:

- lead-vehicle distance and speed;
- pedestrian occupancy of the ego lane;
- intersection approach and conflict estimates;
- collision risk;
- blocked route segments.

BT conditions should read these perception/blackboard values rather than querying Canvas coordinates ad hoc.

### Behavior-tree depth and lifecycle

Live BT visualizations must support recursively nested trees without assuming a fixed hierarchy depth. The evaluator must use generic recursion for Sequence, Fallback/Selector, Condition, and Action nodes.

Selected branches may reasonably reach five to eight logical levels when the hierarchy corresponds to real decomposition, for example:

`mission -> route execution -> segment supervisor -> intersection handling -> right-of-way policy -> yield behavior`

Depth is not itself a quality metric. Avoid unnecessary wrapper nodes that do not express a distinct control responsibility.

If a previously `RUNNING` action is not ticked because a higher-priority branch preempts it, expose `HALTED` semantics. Unticked children remain `IDLE`. Active-path highlighting must be derived from the actual tick traversal.

### Deep-tree interaction and inspection

For deep BTs, use automatic layout and a viewport that supports Fit, zoom, and explicit Pan rather than shrinking the complete tree until text becomes unreadable.

Normal wheel and touch gestures must continue to scroll the reader while Pan is off. `Ctrl/Command + wheel` may zoom. Direct drag-to-pan is enabled only through the visible Pan control.

Where useful, allow selecting a node to inspect its label, type, depth, runtime status, input/read keys, output/write keys, and purpose. Node metadata belongs in the structured tree definition or runtime model, not in manually positioned annotations.

### Determinism and event history

Reset must reproduce the same map, start pose, destination, obstacle schedule, and planning result unless a visible seeded-random mode is explicitly supported.

Event history should record meaningful state transitions such as route computation, obstacle detection, preemption, route invalidation, replanning, and goal completion. Do not log every physics frame.

## 5. Paper visualizations

For paper briefs, visuals should be placed in this order when applicable:

1. Abstract
2. Full-text/PDF link
3. Paper overview visual
4. Method/workflow visual
5. Mathematical/data-structure/algorithm visual
6. Experimental/application visual
7. Contents
8. Paper-derived discussion
9. Repository commentary
10. Citation (always last)

Only reproduce source figures when reuse rights and source stability are clear. Otherwise create a repository-authored explanatory diagram or point readers to the original PDF.

Repository-authored figures must not imply they are original figures from the cited paper.

## 6. Topic visualizations

A mature topic page should normally contain, where applicable, an overview/architecture diagram, a methodological or execution-flow diagram, a mathematical/data-structure visualization when the topic has meaningful formal structure, and a simulated example when temporal behavior is central to understanding the topic.

Do not add all four mechanically. Use only the visual forms that materially improve comprehension.

## 7. Visual design

The site is light-theme-first.

Use restrained, readable colors with strong contrast against white/off-white backgrounds. Preserve consistent semantic colors where practical:

- blue: control/runtime/topic emphasis;
- green: success/nominal/knowledge;
- red/rose: failure/risk/safety;
- amber: running/action/recovery emphasis;
- gray/slate: inactive, infrastructure, or neutral data.

For live BT cards, node type and runtime status must use separate visual channels. For example, fill may encode type while border or a marker encodes status.

Keep corners sharp. Avoid decorative gradients, oversized shadows, or game-like visual effects unless the subject specifically benefits from them.

The academic reader uses serif body typography; diagram and simulation interfaces use a modern sans-serif UI font for legibility.

## 8. Reader and viewport safety

Visualizations live inside the left reader, which has its own vertical scroll context.

A visualization must never:

- call `scrollIntoView` as part of normal interaction;
- capture ordinary wheel scrolling;
- capture ordinary touch scrolling;
- set persistent document/body scroll locks;
- leave pointer capture active after interaction ends;
- force the reader to remain at a particular scroll position;
- use a generic article `MutationObserver` to reset `reader.scrollTop`.

Reader scroll reset is a semantic navigation action, not a DOM-rendering side effect. Reset to the top only on explicit content navigation/open events such as a new document, Back, Forward, or recent-history selection. Diagram rendering, syntax highlighting, simulation updates, or any other DOM mutation inside the article must never reset the reader position.

When zoom/pan is necessary, interaction must be explicit and reversible.

## 9. Validation checklist

Before considering a visualization complete, verify all of the following.

### Static diagrams

- diagram renders without Mermaid/parser errors;
- labels do not overlap or extend outside nodes;
- the first fitted view is readable;
- zoom in/out works from visible controls;
- Fit works;
- Pan can be intentionally enabled and disabled;
- ordinary wheel scrolling moves the reader while the pointer is directly over the diagram;
- ordinary touch scrolling moves the reader when the gesture starts directly over the diagram;
- disabling Pan restores scrolling immediately;
- resizing the left/right split does not break the diagram.

### Simulations

- Play/Pause works;
- Step advances exactly one simulation/control step as intended;
- Reset reproduces the initial deterministic state;
- visible actor motion matches the active behavior;
- BT statuses are evaluator-derived;
- `HALTED` is used only for real preemption/interruption;
- the scene and live tree agree on the active behavior;
- reduced-motion preference disables automatic playback without breaking manual stepping.

For map-navigation simulations also verify:

- the ego car visibly follows a multi-segment planner route;
- start and destination are not one trivial straight road;
- the road graph and displayed route come from the same map model;
- A* computes the initial route;
- a road closure invalidates an upcoming route edge and produces a different route version;
- different obstacle classes activate distinct BT subtrees;
- a preempted running action can be observed as `HALTED`;
- the route overlay agrees with route state before and after replanning;
- the vehicle eventually reaches the destination or safely stops on genuine planning failure;
- deep-tree labels remain readable under Fit/zoom/pan;
- selecting a live-tree node does not interfere with reader scrolling.

### Site behavior

- Back/Forward navigation still works;
- selecting another graph node destroys/stops the previous simulation cleanly;
- reader scrolling remains usable above, directly over, inside, and below visualization blocks;
- post-render DOM mutations do not change the reader scroll position;
- GitHub Pages builds successfully;
- where possible, perform a real browser interaction check rather than relying only on deployment success.

## 10. Maintenance rule

When the visualization architecture, interaction contract, renderer, simulation format, or validation procedure changes, update this file in the same change set.

This file is the authoritative process reference for future visualization work in this repository.
