# Iovino et al. (2022) — A Survey of Behavior Trees in Robotics and AI

## Abstract

The survey traces behavior trees from game AI into robotics, explains their hierarchical organization and modular switching logic, and categorizes the literature by theory, applications, synthesis and learning methods, implementation libraries, and open research challenges.

- [Read the raw abstract on arXiv](https://arxiv.org/abs/2005.05842)
- [Publisher abstract on ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0921889022000513)

## Full text

- [arXiv PDF](https://arxiv.org/pdf/2005.05842)
- [Publisher version](https://doi.org/10.1016/j.robot.2022.104096)

## Contents

- Introduction and core behavior-tree semantics
- Fundamental theory
- Applications in game AI and chatbots
- Manipulation and mobile robotics
- Aerial and underwater systems
- Hand-designed behavior trees
- Learning from demonstration and reinforcement learning
- Planning and synthesis methods
- Implementation libraries
- Open research challenges
- Conclusions

## Problem / motivation

Behavior trees spread from game AI into robotics, but the research literature became broad enough to need a consolidated taxonomy of methods, application areas, and open challenges.

## Behavior-tree contribution

This peer-reviewed survey provides a broad entry point to the field. It summarizes BT history, semantics, applications, learning and synthesis approaches, and research directions across robotics and AI.

The survey emphasizes a central motivation for BTs: in complex agent controllers, transition logic in traditional finite-state-machine designs can become difficult to extend, adapt, and reuse. BTs instead organize switching logic hierarchically, which can improve modularity and make both human and algorithmic synthesis and analysis easier.

## Method

The authors review and categorize the existing BT literature by methods, application domains, and technical contributions, then identify open research challenges.

## Key results / significance

The survey supports three foundational observations:

- BTs originated in game AI practice and later became significant in robotics.
- Their key architectural themes are hierarchical organization and modular switching logic.
- The research area includes hand-authored trees as well as planning, learning, verification, and other synthesis and analysis techniques.

## Repository notes

As a survey, the paper summarizes a large field rather than defining one implementation semantics. Concrete BT libraries may differ in node behavior, memory, concurrency, halting or pre-emption, and data-sharing conventions.

The paper contains numerous diagrams, taxonomy tables, and examples. Those visuals remain in the linked arXiv/publisher versions rather than being rehosted here unless reuse rights are clear.

Connections in this knowledge base:

- Use Marzinotto et al. (2014) and Colledanchise & Ögren (2017) for formal semantics and control-theoretic foundations.
- Use Ögren & Sprague (2022) for a control-systems perspective centered on modularity, hierarchy, and feedback.

## Citation

Matteo Iovino, Edvards Scukins, Jonathan Styrud, Petter Ögren, and Christian Smith. **A Survey of Behavior Trees in Robotics and AI.** *Robotics and Autonomous Systems*, 154, 104096, 2022. DOI: [10.1016/j.robot.2022.104096](https://doi.org/10.1016/j.robot.2022.104096).
