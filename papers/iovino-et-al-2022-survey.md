# Iovino et al. (2022) — A Survey of Behavior Trees in Robotics and AI

## Citation

Matteo Iovino, Edvards Scukins, Jonathan Styrud, Petter Ögren, and Christian Smith. **A Survey of Behavior Trees in Robotics and AI.** *Robotics and Autonomous Systems*, 154, 104096, 2022. DOI: [10.1016/j.robot.2022.104096](https://doi.org/10.1016/j.robot.2022.104096). [arXiv:2005.05842](https://arxiv.org/abs/2005.05842).

## Problem / motivation

Behavior trees spread from game AI into robotics, but the research literature became broad enough to need a consolidated taxonomy of methods, application areas, and open challenges.

## Behavior-tree contribution

This peer-reviewed survey provides one of the most useful entry points to the field. It summarizes BT history, semantics, applications, learning and synthesis approaches, and research directions across robotics and AI.

The survey emphasizes a central motivation for BTs: in complex agent controllers, transition logic in traditional finite-state-machine designs can become difficult to extend, adapt, and reuse. BTs instead organize switching logic hierarchically, which can improve modularity and make both human and algorithmic synthesis/analysis easier.

## Method

The authors review and categorize the existing BT literature by methods, application domains, and technical contributions, then identify open research challenges.

## Key results / significance

For newcomers, this is the best broad literature map in the current repository. It supports three foundational points:

- BTs originated in game AI practice and later became significant in robotics.
- Their key architectural themes are hierarchical organization and modular switching logic.
- The research area includes not only hand-authored trees but also planning, learning, verification, and other synthesis/analysis techniques.

## Limitations

As a survey, the paper summarizes a large field rather than providing one definitive implementation semantics. Concrete BT libraries may differ in node behavior, memory, concurrency, halting/pre-emption, and data-sharing conventions.

## Connections to other work

- Use Marzinotto et al. (2014) and Colledanchise & Ögren (2017) for formal semantics and control-theoretic foundations.
- Use Ögren & Sprague (2022) for a control-systems perspective centered on modularity, hierarchy, and feedback.
