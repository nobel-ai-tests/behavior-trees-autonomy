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
- render inside a dedicated interactive viewport rather than shrinking complex diagrams to unreadable size.

### Interaction

Every Mermaid diagram must provide visible controls for:

- zoom out;
- zoom in;
- fit/reset;
- explicit pan mode.

Normal article scrolling must always remain the default interaction.

Rules:

- ordinary mouse-wheel scrolling scrolls the reader;
- ordinary touch drag scrolls the reader;
- ordinary pointer drag must not be captured by a diagram;
- `Ctrl/Command + wheel` may zoom the diagram;
- `Shift + drag` may pan the diagram;
- enabling the visible **Pan** control may allow direct drag/touch panning;
- disabling Pan must immediately restore normal page scrolling;
- keyboard access should support zoom, fit, and optional pan controls when the viewport has focus.

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

The renderer must distinguish at least:

- `SUCCESS`;
- `FAILURE`;
- `RUNNING`;
- `HALTED` when a previously running action is interrupted;
- `IDLE` / not ticked.

The scene and decision tree must share one source of truth. A node must never be shown as Running merely because an animation author selected that color/state.

### Actor motion

When the selected behavior implies motion, the actor should physically move in the simulation whenever feasible.

Examples:

- `DriveLane` advances the ego vehicle;
- `YieldAtStopLine` decelerates toward and holds a yield/stop position;
- `EmergencyBrake` decelerates aggressively;
- navigation actions should advance robot pose along a generated or controlled trajectory;
- moving obstacles/other agents should evolve independently according to their own model.

### Live decision visualization

Use a structured layout such as `d3.hierarchy` + `d3.tree` for dynamic BT views. Do not hand-position the decision tree.

The live tree should:

- derive hierarchy from the same JSON/tree data used by the evaluator;
- update node status on each BT tick;
- visually distinguish traversed/active branches from unticked branches;
- remain legible at the reader width;
- avoid overlapping labels;
- keep node labels concise.

## 4. Paper visualizations

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

## 5. Topic visualizations

A mature topic page should normally contain, where applicable:

- one overview/architecture diagram;
- one methodological or execution-flow diagram;
- one mathematical/data-structure visualization when the topic has meaningful formal structure;
- one simulated example when temporal behavior is central to understanding the topic.

Do not add all four mechanically. Use only the visual forms that materially improve comprehension.

## 6. Visual design

The site is light-theme-first.

Use restrained, readable colors with strong contrast against white/off-white backgrounds. Preserve consistent semantic colors where practical:

- blue: control/runtime/topic emphasis;
- green: success/nominal/knowledge;
- red/rose: failure/risk/safety;
- amber: running/action/recovery emphasis;
- gray/slate: inactive, infrastructure, or neutral data.

Keep corners sharp. Avoid decorative gradients, oversized shadows, or game-like visual effects unless the subject specifically benefits from them.

The academic reader uses serif body typography; diagram and simulation interfaces use a modern sans-serif UI font for legibility.

## 7. Reader and viewport safety

Visualizations live inside the left reader, which has its own vertical scroll context.

A visualization must never:

- call `scrollIntoView` as part of normal interaction;
- capture ordinary wheel scrolling;
- capture ordinary touch scrolling;
- set persistent document/body scroll locks;
- leave pointer capture active after interaction ends;
- force the reader to remain at a particular scroll position.

When zoom/pan is necessary, interaction must be explicit and reversible.

## 8. Validation checklist

Before considering a visualization complete, verify all of the following:

### Static diagrams

- diagram renders without Mermaid/parser errors;
- labels do not overlap or extend outside nodes;
- the first fitted view is readable;
- zoom in/out works;
- Fit works;
- Pan can be intentionally enabled;
- normal wheel/touch scrolling still moves the reader;
- resizing the left/right split does not break the diagram.

### Simulations

- Play/Pause works;
- Step advances exactly one simulation/control step as intended;
- Reset reproduces the initial deterministic state;
- visible actor motion matches the active behavior;
- BT statuses are evaluator-derived;
- `HALTED` is used only for real preemption/interruption;
- the scene and live tree agree on the active behavior;
- the scenario eventually demonstrates the intended behavior under its configured conditions;
- reduced-motion preference disables automatic playback without breaking manual stepping.

### Site behavior

- Back/Forward navigation still works;
- selecting another graph node destroys/stops the previous simulation cleanly;
- reader scrolling remains usable above, inside, and below visualization blocks;
- GitHub Pages builds successfully;
- where possible, perform a real browser interaction check rather than relying only on deployment success.

## 9. Maintenance rule

When the visualization architecture, interaction contract, renderer, simulation format, or validation procedure changes, update this file in the same change set.

This file is the authoritative process reference for future visualization work in this repository.
