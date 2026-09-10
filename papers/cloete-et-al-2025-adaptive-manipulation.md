# Cloete, Merkt & Havoutis (2025) — Adaptive Manipulation using Behavior Trees

## Abstract

Many manipulation tasks pose a challenge since they depend on non-visual environmental information that can only be determined after sustained physical interaction has already begun. This is particularly relevant for effort-sensitive, dynamics-dependent tasks such as tightening a valve. To perform these tasks safely and reliably, robots must be able to quickly adapt in response to unexpected changes during task execution, and should also learn from past experience to better inform future decisions. Humans can intuitively respond and adapt their manipulation strategy to suit such problems, but representing and implementing such behaviors for robots remains a challenge. In this work we show how this can be achieved within the framework of behavior trees. We present the adaptive behavior tree, a scalable and generalizable behavior tree design that enables a robot to quickly adapt to and learn from both visual and non-visual observations during task execution, preempting task failure or switching to a different manipulation strategy. The adaptive behavior tree selects the manipulation strategy that is predicted to optimize task performance, and learns from past experience to improve these predictions for future attempts. We test our approach on a variety of tasks commonly found in industry; the adaptive behavior tree demonstrates safety, robustness (100% success rate) and efficiency in task completion (up to 36% task speedup from the baseline).

*Verbatim abstract from the CC BY 4.0 arXiv preprint, aligned to the later accepted/published version.*

**Contribution / method.** The paper introduces an adaptive behavior-tree pattern in which multiple manipulation strategies are represented as separate subtrees and a higher-level selector chooses among them using current observations and data from previous attempts. During execution, the tree continuously checks whether the selected strategy remains feasible, can preempt an action before catastrophic failure, switch to a different strategy, and update its strategy preference from accumulated experience. The method is aimed at manipulation tasks where important parameters such as friction, stiffness, or required torque become observable only after physical interaction begins.

**Quantitative evidence.** The accepted/current abstract reports **100% task success** across the evaluated experiments and **up to 36% task speedup relative to the baseline**. These are task-level empirical results from the paper's industrially motivated manipulation experiments; they should not be interpreted as a universal performance bound for adaptive BTs on arbitrary robots or tasks.

**Advantages.** The method combines BT interpretability with online adaptation. Strategy alternatives remain explicit and inspectable, while force/torque or other non-visual feedback can trigger a strategy change during execution rather than only after a hard failure. Reusing experience from previous attempts can reduce repeated trial-and-error, and preemption provides a natural place to encode safety checks before a low-torque, high-force, or otherwise unsuitable strategy reaches a dangerous state.

**Disadvantages / trade-offs.** Adaptation is restricted to the strategy set that the designer has made available; the method selects and switches among alternatives rather than inventing fundamentally new manipulation skills online. More strategies increase coverage but also increase authoring, validation, and selection complexity. The approach depends on reliable sensing and on a useful performance model for choosing strategies, and repeated online switching can add latency or execution overhead compared with a fixed strategy when the environment is already well characterized.

**Limitations.** The reported success and speedup are demonstrated on a limited set of industrial-style manipulation tasks and do not establish the same gains across different robots, end effectors, sensing suites, contact regimes, or long-horizon task-and-motion-planning problems. Candidate strategies must still be implemented manually, so the approach does not solve automatic strategy generation or skill discovery. The discrete strategy formulation can miss better solutions that lie between hand-authored alternatives, and its performance depends on the quality of force/torque sensing, thresholds, feasibility checks, and learned predictions. The experiments demonstrate practical robustness but do not provide a formal safety proof under sensor failure, model error, unexpected contacts, or arbitrary environment changes; nor do they quantify long-term learning stability, catastrophic forgetting, or scaling to very large strategy libraries.

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

The accepted/current paper reports 100% task success across the evaluated experiments and up to 36% task speedup relative to the baseline. More broadly, it demonstrates how BT reactivity can operate above the low-level controller: the tree does not merely recover after an action fails, but can change the manipulation strategy while execution is still in progress.

## Repository notes

Core topics: robot manipulation, adaptive execution, reactivity, fault tolerance, robot learning, and robot control.

This paper is a useful bridge between high-level BT task logic and contact-rich manipulation. It also provides a concrete BehaviorTree.CPP-oriented implementation example with asynchronous actions, reactive control-flow nodes, and blackboard data.

The paper contains several manipulation and BT-structure figures. The repository links to the author/preprint copies rather than rehosting them.

## Citation

Jacques Cloete, Wolfgang Merkt, and Ioannis Havoutis. **Adaptive Manipulation using Behavior Trees.** *2025 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)*, pp. 19031–19038, 2025. DOI: [10.1109/IROS60139.2025.11245892](https://doi.org/10.1109/IROS60139.2025.11245892).
