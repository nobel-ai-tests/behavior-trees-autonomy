# Papers

One Markdown note per paper or technical publication.

## Current paper notes

### Foundations and surveys

- [Marzinotto et al. (2014) — Towards a Unified Behavior Trees Framework for Robot Control](marzinotto-et-al-2014-unified-bt-framework.md)
- [Colledanchise & Ögren (2017) — BT Modularity and Generalization](colledanchise-ogren-2017-bt-modularity.md)
- [Iovino et al. (2022) — A Survey of Behavior Trees in Robotics and AI](iovino-et-al-2022-survey.md)
- [Ögren & Sprague (2022) — Behavior Trees in Robot Control Systems](ogren-sprague-2022-robot-control-systems.md)

### Robotics: planning, synthesis, learning, and execution

- [Colledanchise, Almeida & Ögren (2019) — Blended Reactive Planning and Acting](colledanchise-almeida-ogren-2019-blended-planning.md)
- [Iovino et al. (2021) — Learning Behavior Trees with Genetic Programming](iovino-et-al-2021-genetic-programming.md)
- [Cai et al. (2021) — BT Expansion for Robot Behavior Planning](cai-et-al-2021-bt-expansion.md)
- [Dortmans & Punter (2022) — Practical Guidelines for Robot Software Development](dortmans-punter-2022-practical-guidelines.md)
- [Jeong et al. (2022) — BT Task Planning for Multiple Mobile Robots](jeong-et-al-2022-multi-robot-dds.md)
- [Scherf et al. (2023) — Interactively Learning BTs from Imperfect Human Demonstrations](scherf-et-al-2023-interactive-learning.md)
- [Cloete, Merkt & Havoutis (2025) — Adaptive Manipulation using Behavior Trees](cloete-et-al-2025-adaptive-manipulation.md)
- [Gil-Castilla, Maza & Ollero (2026) — UAV Actuation and Emergency Handling](gil-castilla-et-al-2026-uav-emergency-handling.md)

### Comparison foundations

- [Quinlan (1986) — Induction of Decision Trees](quinlan-1986-induction-decision-trees.md)

See [Behavior Trees in Robotics: Core Research Topics](../topics/robotics-behavior-trees.md) for the topic-oriented map across planning, synthesis, robot learning, manipulation, mobile and multi-robot systems, aerial robotics, software architecture, and recovery.

## Required structure for paper notes

Paper briefs should follow a consistent academic reading order:

1. **Abstract** — an accurate repository-written summary followed by a link to the raw/source abstract.
2. **Full text** — direct PDF or accepted-manuscript access first, followed by the version of record when applicable.
3. **Images / figures, when appropriate** — prefer repository-authored fenced `mermaid` diagrams for method graphs, behavior trees, workflows, state transitions, data structures, and system architecture so layout is automatic and the source remains editable. Embed source figures only when there is a stable source and clear reuse permission. Use custom animation when temporal behavior or physical motion is essential, preferably driven from structured scenario/state data rather than hand-positioned drawing coordinates.
4. **Contents** — a compact map of the paper's major sections or argument progression.
5. **Paper-derived material** — problem/motivation, contribution, method, experimental setting where applicable, and key results/significance.
6. **Repository notes** — limitations, comparison notes, why the paper matters to this knowledge base, and cross-paper connections.
7. **Citation** — always the final section.

Do not duplicate a publisher's full copyrighted abstract, figures, or paper text into the repository when redistribution rights are unclear. Link the source and provide a faithful summary instead.

Each paper must also be registered in `../kb-manifest.json` with a one-sentence `description` and explicit `topics` IDs so the graph inspector can present a useful summary and topic list. Add `authors`, `year`, `venue`, `doi`, `abstractUrl`, `pdf`, `keywords`, `related`, and `tags` when available. The `abstractUrl` field should point to the raw abstract source; `pdf` should point directly to the best lawful reading copy available.
