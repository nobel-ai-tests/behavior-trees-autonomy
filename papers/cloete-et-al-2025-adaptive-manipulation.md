# Cloete, Merkt & Havoutis (2025) — Adaptive Manipulation using Behavior Trees

## Abstract

This paper introduces an adaptive behavior-tree pattern for manipulation tasks whose critical properties may only become known after physical interaction begins. The robot uses task feedback, including force/torque information, to select among discrete manipulation strategies, switch strategies before failure, and reuse information from previous attempts. The approach is evaluated on industrial-style manipulation tasks including valve operation.

- [Raw abstract and preprint on arXiv](https://arxiv.org/abs/2406.14634)
- [Oxford Research Archive record](https://ora.ox.ac.uk/objects/uuid%3Acfc482c4-2237-4bff-949d-037178689f0e)

## Full text

- [arXiv PDF](https://arxiv.org/pdf/2406.14634)
- [Accepted manuscript at Oxford](https://ora.ox.ac.uk/objects/uuid%3Acfc482c4-2237-4bff-949d-037178689f0e)
- [Version of record](https://doi.org/10.1109/IROS60139.2025.11245892)

## Contents

- Motivation from contact-rich and effort-sensitive manipulation
- Literature review: BTs, task planning, adaptive control, and TAMP
- BehaviorTree.CPP execution model
- General adaptive behavior-tree design
- Strategy selection and reactive preemption
- Adaptive manipulation specialization
- Force/torque monitoring and regrasp behavior
- Industrial manipulation experiments
- Performance, robustness, and safety results
- Conclusions

## Problem / motivation

Many manipulation tasks depend on friction, stiffness, required torque, or other properties that vision cannot determine reliably before contact. A fixed strategy may therefore be efficient on one task instance and fail or become unsafe on another.

## Contribution

The authors define a reusable BT structure that selects among manipulation strategies, monitors whether the current strategy remains feasible, and preempts execution when a different strategy becomes preferable. The same structure can accumulate observations across attempts so later decisions use knowledge learned from earlier interaction.

## Method

A strategy-selection node chooses among discrete candidate strategies using current and historical task data. Reactive subtrees execute the selected strategy while repeatedly checking feasibility and task-completion conditions. If a condition fails, the current strategy can be interrupted before catastrophic task failure and another strategy attempted.

## Experimental setting

The framework is tested on industrially motivated manipulation scenarios. A central example is tightening a needle valve using strategies with different speed and torque characteristics, with force/torque sensing providing information that is not available from vision alone.

## Key results / significance

The paper reports strong robustness across its experiments and an average speedup for the valve-tightening task when adaptive strategy switching is used. More broadly, it demonstrates how BT reactivity can operate above the low-level controller: the tree does not merely recover after an action fails, but can change the manipulation strategy while execution is still in progress.

## Repository notes

Core topics: robot manipulation, adaptive execution, reactivity, fault tolerance, robot learning, and robot control.

This paper is a useful bridge between high-level BT task logic and contact-rich manipulation. It also provides a concrete BehaviorTree.CPP-oriented implementation example with asynchronous actions, reactive control-flow nodes, and blackboard data.

The paper contains several manipulation and BT-structure figures. The repository links to the author/preprint copies rather than rehosting them.

## Citation

Jacques Cloete, Wolfgang Merkt, and Ioannis Havoutis. **Adaptive Manipulation using Behavior Trees.** *2025 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)*, pp. 19031–19038, 2025. DOI: [10.1109/IROS60139.2025.11245892](https://doi.org/10.1109/IROS60139.2025.11245892).
