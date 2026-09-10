# Colledanchise, Almeida & Ögren (2019) — Blended Reactive Planning and Acting

## Abstract

*Analytical abstract — repository-authored because the source does not provide clear permission to reproduce the complete publisher abstract verbatim.*

**Contribution / method.** The paper proposes a backchaining planner that creates and incrementally refines a behavior tree while the robot is acting. Starting from a goal condition, the planner selects actions whose effects satisfy that goal, recursively expands unmet preconditions, and embeds the resulting alternatives in reactive BT structure. During execution, already-satisfied conditions cause actions to be skipped, undone effects can cause earlier actions to be reexecuted, and newly discovered blockers can trigger local tree expansion rather than a complete replan.

**Quantitative evidence.** The evaluation is qualitative rather than benchmark-driven. The method is demonstrated in two robotics scenario families in simulation: a KUKA YouBot manipulation task with dynamically appearing, disappearing, and moved obstacles, and an ABB YuMi cellphone-assembly task requiring a longer sequence of manipulation actions. The paper reports successful executions and illustrative disturbance cases, but no repeated-trial success rate, planning-time distribution, tree-size comparison, statistical test, or direct numerical baseline against classical replanning.

**Advantages.** Analytically, the method exploits BT reactivity to absorb some state changes without invoking the planner: if another agent completes a needed action, the corresponding branch is skipped; if an achieved condition is undone, the BT can revisit the necessary action; and if a new precondition failure appears, only the affected part of the tree is expanded. This reduces conceptual separation between planning and acting and preserves a modular policy representation instead of committing to a single open-loop action sequence.

**Disadvantages / trade-offs.** The planner depends on a correct symbolic library of actions, preconditions, and postconditions, so modeling errors propagate directly into the generated tree. Local expansion and conflict handling can grow the BT over time and do not guarantee minimal tree size or globally optimal behavior. The original algorithm also lacks the soundness and completeness guarantees introduced by later BT-expansion work, so a solvable problem is not guaranteed to yield a valid solution tree under every action-selection/conflict configuration.

**Limitations.** The experiments are simulation demonstrations rather than systematic performance studies, and the paper does not measure how often the method succeeds under stochastic action failure, perception error, or large-scale domain growth. It assumes abstract action templates are available and sufficiently accurate; learning those templates is left as future work. The approach is also not a general planner for arbitrary uncertainty: it reacts well to disturbances that can be expressed through the existing conditions and actions, but it does not solve model mismatch, unmodeled continuous dynamics, resource contention, or probabilistic outcomes by itself. Because no numerical comparison with repeated full replanning is reported, claims of improved efficiency should be interpreted as architectural and behavioral rather than as measured speedup.

[Source abstract on arXiv](https://arxiv.org/abs/1611.00230).

## Full text

- [arXiv PDF](https://arxiv.org/pdf/1611.00230)
- [Version of record](https://doi.org/10.1109/ICRA.2019.8794128)

## Contents

- Introduction and motivation for blending planning and acting
- Related work in automated planning and robotic manipulation
- Behavior-tree background
- Problem formulation using actions, preconditions, postconditions, and goal conditions
- Atomic BT construction for postconditions
- Iterative expansion of failed conditions
- Conflict handling and runtime refinement
- Robotics simulations
- Conclusions

## Problem / motivation

Classical planning commonly produces a static action sequence and delegates execution to a separate controller. In dynamic environments this can force expensive replanning whenever the world changes. The paper asks whether planning and execution can be coupled so that routine disturbances are handled directly by the execution structure.

## Contribution

The central contribution is a backchaining procedure that produces a BT from goals and action models. Failed conditions can be replaced by atomic subtrees that try alternative actions whose postconditions satisfy the missing condition. This creates an execution structure that can both react to state changes and be refined online.

## Method

The planner starts with the goal conditions and works backward through available actions. Each desired condition is represented by a fallback structure that first checks whether the condition already holds and otherwise tries actions whose effects can establish it, guarded by their preconditions. During execution, failed conditions can trigger further expansion.

## Robotics relevance

The examples are manipulation-oriented and emphasize disturbances such as a dropped object, an obstacle appearing in the path, or another actor completing a step on the robot's behalf. These cases illustrate why BT execution can skip already-satisfied work, retry invalidated work, and refine only the part of the plan that currently blocks progress.

## Key results / significance

The paper is an important bridge between symbolic task planning and reactive robot execution. It establishes the design pattern later developed by stronger synthesis methods: use planning to construct BT structure, but exploit BT ticking and condition checks to avoid treating every state change as a replanning event.

## Repository notes

Core topics: robot task planning, behavior synthesis, planning, reactivity, and robot control.

This work is a direct precursor to sound/complete BT-expansion methods and to later approaches that learn preconditions, postconditions, or task structure from demonstration.

The preprint contains the original planning diagrams and algorithm figures; they are linked rather than rehosted here.

## Citation

Michele Colledanchise, Diogo Almeida, and Petter Ögren. **Towards Blended Reactive Planning and Acting using Behavior Trees.** *2019 International Conference on Robotics and Automation (ICRA)*, pp. 8839–8845, 2019. DOI: [10.1109/ICRA.2019.8794128](https://doi.org/10.1109/ICRA.2019.8794128).
