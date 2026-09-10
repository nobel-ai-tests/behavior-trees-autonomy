# Ögren & Sprague (2022) — Behavior Trees in Robot Control Systems

## Abstract

The review interprets behavior trees through modularity, hierarchy, and feedback, showing how those ideas support robot-control design, analysis, convergence arguments, safety mechanisms, explainability, learning, and planning.

- [Read the source abstract at Annual Reviews](https://www.annualreviews.org/content/journals/10.1146/annurev-control-042920-095314)
- [Preprint abstract on arXiv](https://arxiv.org/abs/2203.13083)

## Full text

- [arXiv PDF](https://arxiv.org/pdf/2203.13083)
- [Version of record](https://doi.org/10.1146/annurev-control-042920-095314)

## Contents

- History of behavior trees and their relationship to finite-state machines
- Formal BT definitions
- Optimal modularity
- Convergence analysis
- Design principles based on modularity and feedback
- Safety and invariance with control barrier functions
- Explainability and human-robot interaction
- Reinforcement learning and utility
- Evolutionary algorithms
- Planning
- Conclusions

## Problem / motivation

Robot control systems must handle complex task structure, uncertainty, disturbances, and evolving mission conditions. The paper asks how behavior trees should be understood from a control-theoretic perspective.

## Behavior-tree contribution

The review organizes the value of BTs around three ideas: **modularity, hierarchy, and feedback**. Modules make separate behaviors easier to develop and extend; hierarchy mirrors decomposition of robot tasks into subtasks; feedback allows higher-level behavior selection to react to progress and applicability information.

## Method

This is a review article rather than a single experiment. It synthesizes theoretical analysis, design principles, extensions, and relationships between BTs and control and robotics concepts.

## Key results / significance

The paper is especially useful for avoiding a purely software-engineering interpretation of behavior trees. A BT can be viewed as a high-level feedback mechanism that repeatedly chooses among behavior modules based on applicability and progress.

That perspective also separates BTs from standard machine-learning decision trees: a classifier may contribute information to a controller, but a BT itself participates in ongoing task execution and switching.

## Repository notes

The review adopts a control-systems lens and is best read alongside broader AI and robotics surveys for coverage of learning, game AI, tooling, and application-specific variants.

The review includes formal diagrams and conceptual figures throughout. Those visuals remain in the linked full text rather than being rehosted here unless reuse rights are clear.

Connections in this knowledge base:

- Complements Iovino et al. (2022), which surveys the broader BT literature.
- Builds conceptually on the modularity and hybrid-control analysis in Colledanchise & Ögren (2017).

## Citation

Petter Ögren and Christopher I. Sprague. **Behavior Trees in Robot Control Systems.** *Annual Review of Control, Robotics, and Autonomous Systems*, 5, 81–107, 2022. DOI: [10.1146/annurev-control-042920-095314](https://doi.org/10.1146/annurev-control-042920-095314).
