# Papers

One Markdown note per paper or technical publication.

## Current paper notes

### Foundations

- [Marzinotto et al. (2014) — Towards a Unified Behavior Trees Framework for Robot Control](marzinotto-et-al-2014-unified-bt-framework.md)
- [Colledanchise & Ögren (2017) — BT Modularity and Generalization](colledanchise-ogren-2017-bt-modularity.md)

### Surveys and reviews

- [Iovino et al. (2022) — A Survey of Behavior Trees in Robotics and AI](iovino-et-al-2022-survey.md)
- [Ögren & Sprague (2022) — Behavior Trees in Robot Control Systems](ogren-sprague-2022-robot-control-systems.md)

Survey/review documents are represented as their own `survey` node type in the graph. Documents connected to the `surveys` taxonomy topic are recognized as survey nodes; an explicit `kind: "survey"` is also supported for future entries.

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

1. **Abstract** — every paper must include the same five repository-authored analytical components: **Contribution / method**, **Quantitative evidence**, **Advantages**, **Disadvantages / trade-offs**, and **Limitations**. Quantitative claims must use values actually reported by the paper; if the paper has no numerical benchmark, say that explicitly rather than inventing one. The limitations paragraph should be complete and cover assumptions, evaluation scope, missing comparisons, generalization limits, and major deployment gaps. When the source license permits verbatim redistribution, place the paper's **complete raw abstract first**, clearly marked as verbatim and with the reuse license/source identified, then place the five analytical components underneath it. When the complete publisher abstract cannot be reproduced, start directly with the five analytical components. In either case, the note must be self-contained enough that the reader does not need to leave the knowledge base to understand what the paper does, what evidence it reports, and where it falls short.
2. **Full text** — direct PDF or accepted-manuscript access first, followed by the version of record when applicable.
3. **Images / figures, when appropriate** — preserve useful source-specific overview, taxonomy, architecture, or system-overview figures when they materially improve comprehension and reuse is appropriate. For methodology, synthesis, and workflow explanations, prefer **repository-written algorithms or pseudocode in our own words** over self-made workflow diagrams. Do not create decorative or generic diagrams that merely restate prose. If a source figure is retained or redrawn, identify its source figure number and purpose.
4. **Contents** — follow the paper's section structure closely enough that the note can be used as a reading map.
5. **Paper-derived material** — problem/motivation, contribution, method, experimental setting where applicable, and key results/significance.
6. **Repository notes** — comparison notes, why the paper matters to this knowledge base, and cross-paper connections. Major limitations should already be visible in the Abstract rather than being hidden only here.
7. **Citation** — always the final section.

## Additional structure for surveys and reviews

Survey/review notes should emphasize the paper's own organizing logic rather than flattening the paper into a generic summary. In addition to the structure above, include:

- a **survey/review overview** anchored to the paper's overview or taxonomy figure when one exists; overview figures are useful and may remain visual;
- the **review methodology or analytical lens**, including search sources, query terms, screening rules, corpus size/date, or review perspective when the paper reports them;
- one or more **algorithm or pseudocode blocks** written in repository language for important methodology, synthesis, analysis, or workflow patterns; these should explain the paper's process without copying source pseudocode verbatim;
- the paper's **taxonomy, synthesis, or open-challenge structure**, so later topic nodes can link back to the survey's categories.

Do not duplicate publisher-controlled text or figures beyond what their license permits. For permissively licensed papers, keep the complete raw abstract inline and follow it with the five analytical components. For restricted papers, the five-component analytical abstract is the self-contained replacement.

Each paper must also be registered in `../kb-manifest.json` with a one-sentence `description` and explicit `topics` IDs so the graph inspector can present a useful summary and topic list. Add `authors`, `year`, `venue`, `doi`, `abstractUrl`, `pdf`, `keywords`, `related`, and `tags` when available. The `abstractUrl` field should point to the raw abstract source; `pdf` should point directly to the best lawful reading copy available.
