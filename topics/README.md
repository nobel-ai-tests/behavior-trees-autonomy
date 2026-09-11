# Topics

Topic-oriented pages connect concepts and findings across sources.

## Current topics

- [Behavior Tree Foundations](behavior-tree-foundations.md) — what a behavior tree is, core execution semantics, and how BTs differ from machine-learning decision trees and nearby autonomy architectures.
- [Behavior Trees in Robotics: Core Research Topics](robotics-behavior-trees.md) — robotics literature map covering task planning, synthesis, robot learning, manipulation, mobile and multi-robot systems, aerial robotics, software architecture, and fault recovery.

## Topic-page convention

Register every topic-oriented Markdown page in `../kb-manifest.json` with a one-sentence `description`, explicit stable `topics` IDs, and useful `keywords`/`tags`. Stable topic definitions belong under `graph.taxonomy`; each taxonomy node should also carry a concise description so selecting that conceptual node produces a meaningful inspector summary.

For technical figures, prefer fenced `mermaid` blocks over hand-positioned SVG whenever the visual can be represented as a graph, tree, flowchart, state diagram, sequence diagram, dependency structure, or workflow. Mermaid keeps the diagram source declarative and lets the renderer manage node placement, edge routing, and responsive sizing automatically. Use custom animation only where temporal behavior or a realistic physical scenario requires it; those animations should increasingly be driven from structured state/scene data rather than fixed drawing coordinates.

## Robotics taxonomy now represented

- Robot task planning
- Behavior-tree synthesis
- Robot learning
- Evolutionary learning
- Learning from demonstration
- Robot manipulation
- Mobile robotics
- Multi-robot systems
- Aerial robotics
- Fault tolerance and recovery
- Robot software architecture
- Human-robot interaction

## Areas to develop next

- Task and motion planning
- Formal verification and safety
- Long-horizon autonomy
- ROS 2 navigation and production tooling
- Language-guided and LLM-assisted robot programming
- Human-robot collaboration
- Swarm robotics
- Marine and underwater robotics


## Additional resources: fast decision architectures

**Behavior Trees remain the core topic of this repository.** The following pages are comparison resources for other low-latency decision mechanisms and hybrid architectures:

- [Fast Decision Architectures](fast-decision-architectures.md)
- [Finite-State Machines and Hierarchical FSMs](finite-state-machines.md)
- [Reactive Architectures and Subsumption](reactive-architectures-subsumption.md)
- [Utility-Based Action Selection](utility-action-selection.md)
- [Learned Policies](learned-policies.md)
- [Model Predictive Control](model-predictive-control.md)

Program implementations are represented separately under **Program Libraries**, including [Bonsai](../libraries/bonsai.md), a Rust/Python Behavior Tree runtime.
