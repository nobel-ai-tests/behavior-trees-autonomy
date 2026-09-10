# Iovino et al. (2022) — A Survey of Behavior Trees in Robotics and AI

## Abstract

Behavior Trees (BTs) were invented as a tool to enable modular AI in computer games, but have received an increasing amount of attention in the robotics community in the last decade. With rising demands on agent AI complexity, game programmers found that the Finite State Machines (FSM) that they used scaled poorly and were difficult to extend, adapt and reuse. In BTs, the state transition logic is not dispersed across the individual states, but organized in a hierarchical tree structure, with the states as leaves. This has a significant effect on modularity, which in turn simplifies both synthesis and analysis by humans and algorithms alike. These advantages are needed not only in game AI design, but also in robotics, as is evident from the research being done. In this paper we present a comprehensive survey of the topic of BTs in Artificial Intelligence and Robotic applications. The existing literature is described and categorized based on methods, application areas and contributions, and the paper is concluded with a list of open research challenges.

*Verbatim abstract. The article is licensed CC BY.*

- [Source abstract on arXiv](https://arxiv.org/abs/2005.05842)
- [Publisher article on ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0921889022000513)

## Full text

- [arXiv PDF](https://arxiv.org/pdf/2005.05842)
- [Version of record](https://doi.org/10.1016/j.robot.2022.104096)

## Survey overview

![Repository redraw of Figure 1: overview of the topics covered by the survey](../assets/figures/iovino-2022-fig1-survey-overview.svg)

*Repository redraw of the paper's Figure 1. The figure organizes the survey along two main dimensions: application domain and BT design method. Use the linked paper for the original figure.*

The overview is useful as the reading map for the entire paper. On the application side it separates game AI from robotic AI, then breaks robotics into manipulation, mobile ground robots, aerial/underwater robots, and other robotic systems. On the design side it separates manual design from learning, learning from demonstration, and planning/analytic approaches.

## Contents

1. Introduction, BT history, and core execution semantics
2. Fundamental theory and formal extensions
3. Applications in game AI, chatbots, and robotics
4. Methodology: learning, planning/analytic design, and manual design
5. Implementation libraries and tooling
6. Open research challenges
7. Conclusions

Within robotics, the application review is organized around manipulation, mobile ground robots, and aerial/underwater systems. Within methodology, the survey distinguishes reinforcement learning, evolution-inspired learning, case-based reasoning, learning from demonstration, planning/analytic design, and hand-authored approaches.

## Survey methodology

The paper gives an explicit literature-search procedure in Section 1.3. The authors searched Google Scholar, Scopus, and Clarivate Web of Science for both **“Behavior Tree”** and **“Behaviour Tree”**, restricted the corpus to English-language papers, and obtained 297 initial results. After excluding the unrelated functional-requirements meaning of “Behavior Tree,” dead links, and duplicates, the corpus contained **166 papers as of April 24, 2020**.

The retained papers are then classified by topic, application area, and methodology. That taxonomy is not just a summary table: it becomes the organizational structure used by the rest of the survey.

This makes the paper especially useful as a field map. It answers three different questions at once: where BTs are used, how BTs are designed or synthesized, and which theoretical or implementation problems the literature addresses.

## Method and workflow: planning to a behavior tree

![Repository redraw of Figure 8: planner-derived behavior-tree structure for mobile manipulation](../assets/figures/iovino-2022-fig8-planning-workflow.svg)

*Condensed repository redraw of the structure illustrated in the paper's Figure 8. The source example shows a mobile-manipulation BT generated from planning/action information; the redraw emphasizes the goal, precondition, navigation, grasp, and placement flow.*

The planning section identifies a recurring synthesis workflow in the literature: a planner computes a plan or exposes action preconditions and effects, and a BT-specific conversion or backchaining procedure turns that information into an executable tree. The resulting structure can keep goal conditions high in the tree and place alternative ways of satisfying preconditions underneath them, preserving the reactive checking that distinguishes BT execution from a fixed action list.

The survey treats planning as one family among several BT-generation approaches rather than as the definition of a BT. Other reviewed approaches learn or evolve tree structure, learn from demonstrations, or rely on manual authoring.

## Application coverage

The survey documents the movement of BTs from game AI into robotics and other AI systems. In robotics, the reviewed work includes manipulation, mobile ground robots, aerial and underwater vehicles, and systems that combine BT execution with planning, learning, or other control architectures.

For this knowledge base, the important point is that “behavior trees in robotics” is not one method. The same execution abstraction appears as a hand-designed executive, a target representation for planners, a program structure optimized by evolutionary search, and a policy representation refined from demonstrations or reinforcement learning.

## Design-method coverage

The paper's methodology section provides the most useful cross-paper classification for the next stages of this repository:

- **Learning:** reinforcement learning, evolutionary/genetic approaches, case-based reasoning, and related data-driven methods.
- **Learning from demonstration:** task structure or behavior logic derived from human demonstrations.
- **Planning and analytic design:** planners, backchaining, formal action models, or analytic procedures used to construct or refine BTs.
- **Manual design and other approaches:** hand-authored trees and application-specific engineering methods.

These categories provide a natural bridge from the survey stage into the later planning, synthesis, learning, and execution paper clusters.

## Open challenges and significance

The survey's main contribution is breadth. It consolidates BT history, theory, application domains, generation methods, implementation libraries, and open problems into one taxonomy. It also makes clear that the field spans both human-authored and automatically generated trees, so questions of modularity, synthesis, verification, learning, and runtime semantics should be treated separately rather than collapsed into a single “BT method.”

Because the literature corpus closes in April 2020 even though the journal publication is from 2022, this paper should be used as a foundational survey rather than as a complete inventory of later robotics work.

## Repository notes

This note follows the survey's own structure and uses figure-derived repository redraws for the overview and planning workflow. The redraws are intentionally simplified and should be read alongside the original figures in the linked full text.

Connections in this knowledge base:

- [Ögren & Sprague (2022)](ogren-sprague-2022-robot-control-systems.md) provides a narrower control-theoretic review organized around modularity, hierarchy, and feedback.
- [Marzinotto et al. (2014)](marzinotto-et-al-2014-unified-bt-framework.md) and [Colledanchise & Ögren (2017)](colledanchise-ogren-2017-bt-modularity.md) provide formal foundations referenced by the survey.
- [Behavior Trees in Robotics: Core Research Topics](../topics/robotics-behavior-trees.md) uses the survey taxonomy as one entry point into the repository's planning, learning, manipulation, multi-robot, aerial, and software clusters.

## Citation

Matteo Iovino, Edvards Scukins, Jonathan Styrud, Petter Ögren, and Christian Smith. **A Survey of Behavior Trees in Robotics and AI.** *Robotics and Autonomous Systems*, 154, 104096, 2022. DOI: [10.1016/j.robot.2022.104096](https://doi.org/10.1016/j.robot.2022.104096).
