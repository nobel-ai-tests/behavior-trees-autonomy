# Topics

Topic-oriented pages connect concepts and findings across sources.

## Primary scope

**Behavior Trees remain the core subject of this knowledge base.** The additional decision-architecture pages below are included to sharpen comparisons, show where alternative fast-decision mechanisms fit in a robot stack, and make hybrid BT architectures easier to reason about. They should be read as supporting resources around the Behavior Tree core, not as a shift to a general robotics-control encyclopedia.

## Current Behavior Tree topics

- [Behavior Tree Foundations](behavior-tree-foundations.md) — what a behavior tree is, core execution semantics, and how BTs differ from machine-learning decision trees and nearby autonomy architectures.
- [Behavior Trees in Robotics: Core Research Topics](robotics-behavior-trees.md) — robotics literature map covering task planning, synthesis, robot learning, manipulation, mobile and multi-robot systems, aerial robotics, software architecture, and fault recovery.

## Additional resources: fast robot decision architectures

These comparison topics each include a repository-authored overview figure, a concise execution model, an algorithm written in a LaTeX `algorithmic`-style format, and a section explaining how the method differs from or complements a Behavior Tree.

- [Finite-State Machines and Hierarchical FSMs](finite-state-machines-hfsm.md) — explicit modes and guarded transitions; especially useful for compact local mode logic and as stateful controllers inside BT leaves.
- [Reactive Architectures and Subsumption](reactive-architectures-subsumption.md) — direct sensor-to-action behaviors with priority suppression; useful beneath a BT for reflexes and fast local safety behavior.
- [Utility-Based Action Selection](utility-based-action-selection.md) — numerical scoring of competing actions; useful as an arbitration primitive inside an explicit BT hierarchy.
- [Learned Policies](learned-policies.md) — fast observation-to-action inference learned from data or interaction; naturally used as learned skills orchestrated by a BT.
- [Model Predictive Control and Receding-Horizon Control](model-predictive-control.md) — short-horizon numerical optimization; typically a continuous controller behind a BT action node.

## Topic-page convention

Register every topic-oriented Markdown page in `../kb-manifest.json` with a one-sentence `description`, explicit stable `topics` IDs, and useful `keywords`/`tags`. Stable topic definitions belong under `graph.taxonomy`; each taxonomy node should also carry a concise description so selecting that conceptual node produces a meaningful inspector summary.

For technical figures, the repository normally prefers fenced `mermaid` blocks when the visual is naturally represented as a graph, tree, flowchart, state diagram, dependency structure, or workflow. The fast-decision comparison pages intentionally use repository-authored overview image assets because these pages are designed as compact visual explainers. Custom animation remains appropriate only where temporal behavior or a realistic physical scenario materially improves understanding.

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
- Finite-state machines and hierarchical FSMs
- Reactive architectures and subsumption
- Utility-based action selection
- Learned policies
- Model predictive control

## Areas to develop next

- Task and motion planning
- Formal verification and safety
- Long-horizon autonomy
- ROS 2 navigation and production tooling
- Language-guided and LLM-assisted robot programming
- Human-robot collaboration
- Swarm robotics
- Marine and underwater robotics
