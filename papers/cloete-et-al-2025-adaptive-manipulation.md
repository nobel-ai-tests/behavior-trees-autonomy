# Cloete, Merkt & Havoutis (2025) — Adaptive Manipulation using Behavior Trees

## Abstract

Many manipulation tasks use instances of a set of common motions, such as a twisting motion for tightening or loosening a valve. However, different instances of the same motion often require different environmental parameters (e.g. force/torque level), and thus different manipulation strategies to successfully complete; for example, grasping a valve handle from the side rather than head-on to increase applied torque. Humans can intuitively adapt their manipulation strategy to best suit such problems, but representing and implementing such behaviors for robots remains an open question. We present a behavior tree-based approach for adaptive manipulation, wherein the robot can reactively select from and switch between a discrete set of manipulation strategies during task execution. Furthermore, our approach allows the robot to learn from past attempts to optimize performance, for example learning the optimal strategy for different task instances. Our approach also allows the robot to preempt task failure and either change to a more feasible strategy or safely exit the task before catastrophic failure occurs. We propose a simple behavior tree design for general adaptive robot behavior and apply it in the context of industrial manipulation. The adaptive behavior outperformed all baseline behaviors that only used a single manipulation strategy, markedly reducing the number of attempts and overall time taken to complete the example tasks. Our results demonstrate potential for improved robustness and efficiency in task completion, reducing dependency on human supervision and intervention.

*Verbatim abstract from the CC BY 4.0 preprint.*

- [Source abstract on arXiv](https://arxiv.org/abs/2406.14634)
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
