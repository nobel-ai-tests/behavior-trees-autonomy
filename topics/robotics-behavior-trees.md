# Behavior Trees in Robotics: Core Research Topics

Behavior trees in robotics sit between high-level task reasoning and lower-level robot skills. The most useful robotics literature can be organized around a small number of recurring problems: executing tasks reactively, synthesizing task structure, learning robot programs, coordinating multiple robots, adapting manipulation strategies, and handling mission-level failures safely.

## Robot task planning and reactive execution

Behavior trees are often used as an executable task policy rather than as a static plan. A recurring research question is how to generate or refine a BT from goals, action preconditions, and effects while preserving the ability to react during execution.

Core papers:

- [Colledanchise, Almeida & Ögren (2019)](../papers/colledanchise-almeida-ogren-2019-blended-planning.md) — backchaining-based BT construction that blends planning and acting in dynamic environments.
- [Cai et al. (2021)](../papers/cai-et-al-2021-bt-expansion.md) — sound and complete BT expansion with formal planning guarantees and disturbance handling.

## Robot learning and behavior synthesis

BT structure can be generated from optimization, demonstrations, or other learned signals. This area is important because it connects the interpretability and modularity of BTs with methods that reduce manual robot programming.

Core papers:

- [Iovino et al. (2021)](../papers/iovino-et-al-2021-genetic-programming.md) — learns BT structure with genetic programming for unpredictable robotic tasks.
- [Scherf et al. (2023)](../papers/scherf-et-al-2023-interactive-learning.md) — learns and interactively repairs BTs from a small number of imperfect human demonstrations.

## Robot manipulation and adaptive execution

Manipulation exposes BTs to long-running actions, contact uncertainty, force/torque feedback, recovery, and strategy switching. It is therefore a strong test domain for reactive task execution.

Core papers:

- [Cloete, Merkt & Havoutis (2025)](../papers/cloete-et-al-2025-adaptive-manipulation.md) — adaptive BTs for switching manipulation strategies using visual and non-visual feedback.
- The planning and learning papers above also use manipulation or mobile-manipulation tasks as important evaluation domains.

## Mobile and multi-robot systems

For mobile robots, BTs often coordinate navigation, recovery, task allocation, and distributed execution. Multi-robot work adds asynchronous communication and fault handling to the execution model.

Core papers:

- [Jeong et al. (2022)](../papers/jeong-et-al-2022-multi-robot-dds.md) — BT task planning for multiple mobile robots using a Data Distribution Service and asynchronous recovery behavior.
- [Dortmans & Punter (2022)](../papers/dortmans-punter-2022-practical-guidelines.md) — practical guidance for robust robot behavior and BT execution architectures, including mobile robot and ROS-oriented concerns.

## Aerial robotics and mission autonomy

Aerial systems emphasize deterministic emergency handling, platform heterogeneity, and mission-level adaptability. BTs are attractive because safety checks can be given explicit priority while nominal mission subtrees remain reusable.

Core paper:

- [Gil-Castilla, Maza & Ollero (2026)](../papers/gil-castilla-et-al-2026-uav-emergency-handling.md) — a ROS-based BT framework for heterogeneous UAV mission actuation and prioritized emergency handling.

## Robot software architecture and tooling

In deployed systems, the tree itself is only one part of the stack. A practical BT architecture also needs asynchronous skills, blackboard/data flow, middleware integration, logging, inspection, and a clear boundary between decision logic and low-level controllers.

Core paper:

- [Dortmans & Punter (2022)](../papers/dortmans-punter-2022-practical-guidelines.md) — a practitioner-oriented bridge from BT theory to robot software architecture.

## Fault tolerance and recovery

Fault tolerance appears across nearly every robotics use of BTs. Common mechanisms include repeated condition checking, fallback alternatives, runtime tree expansion, recovery subtrees, strategy switching, and explicit emergency branches.

Representative papers:

- [Colledanchise, Almeida & Ögren (2019)](../papers/colledanchise-almeida-ogren-2019-blended-planning.md)
- [Cai et al. (2021)](../papers/cai-et-al-2021-bt-expansion.md)
- [Jeong et al. (2022)](../papers/jeong-et-al-2022-multi-robot-dds.md)
- [Cloete, Merkt & Havoutis (2025)](../papers/cloete-et-al-2025-adaptive-manipulation.md)
- [Gil-Castilla, Maza & Ollero (2026)](../papers/gil-castilla-et-al-2026-uav-emergency-handling.md)

## Open research directions

Important directions include tighter integration with task-and-motion planning, formal verification and safety, ROS 2 navigation and execution tooling, language-guided robot programming, long-horizon autonomy, and methods that preserve BT interpretability while introducing learned skills or automatically synthesized structure.
