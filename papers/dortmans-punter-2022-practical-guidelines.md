# Dortmans & Punter (2022) — Practical Guidelines for Robot Software Development

## Abstract

Behavior Trees are a promising approach to model the autonomous behaviour of robots in dynamic environments. Behavior Trees represent action selection decisions as a tree of decision nodes. The hierarchy of these decision nodes provides the planning of actions of the robot including its reactions on exceptions. Behavior Trees enable flexible planning and replanning of robot behavior while supporting better maintainable decision-making than traditional Finite State Machines. This paper presents an overview of lessons, which we have learned when applying Behavior Trees to various autonomous robots. We present these lessons as a sequence of steps that is meant to support robot software practitioners to develop their systems.

<!-- Abstract reproduced verbatim from the CC BY 4.0 article. -->

**Contribution / method.** The paper turns practitioner experience with behavior-tree-based robots into an engineering workflow for building robot decision logic. The method starts from the robot's context and purpose, builds a nominal “good weather” plan, adds explicit preconditions/postconditions and recovery behavior for robustness, then introduces reactive contingency handling and connects the resulting BT to robot skills, world-state data, middleware, and execution infrastructure.

**Quantitative evidence.** The paper is a guidelines/review contribution rather than a controlled experiment. Its procedure is organized as **four main design steps**, but it reports no experimental sample size, success-rate comparison, runtime benchmark, defect-count reduction, maintainability metric, statistical test, or numerical head-to-head evaluation against finite-state machines. The evidence is therefore experiential and architectural rather than statistical.

**Advantages.** Its main strength is practical specificity. It translates BT concepts into software-engineering decisions that a robotics team can apply: where to put condition checks, how to encode recovery, how to separate skills from task logic, how to use a blackboard/world model, and how to structure ROS-oriented execution. That makes it a useful bridge between formal BT theory and deployable robot software, especially for teams that need explicit fault handling and modular skill reuse.

**Disadvantages / trade-offs.** The method still depends heavily on human design quality. Engineers must identify the right state variables, conditions, action interfaces, priorities, and recovery paths; a poorly structured tree can become large, coupled through shared blackboard data, or difficult to debug despite the hierarchical notation. Reactive checks and contingency branches improve adaptability but add execution complexity and can create priority inversions, repeated work, or hard-to-see interactions if side effects are not carefully controlled.

**Limitations.** The recommendations are derived from engineering experience and illustrative examples rather than a reproducible comparative study, so the paper does not establish quantitatively that BT-based software is easier to maintain, safer, faster to develop, or more reliable than hierarchical state machines or other executives. It does not measure scaling behavior as trees, skill libraries, teams, or blackboard state grow; nor does it provide formal guarantees for timing, resource conflicts, asynchronous actions, or safety-critical concurrency. The examples are oriented toward robot software and mobile/manipulation-style tasks, so generalization to very large distributed systems or learning-heavy autonomy remains an engineering judgment rather than an experimentally demonstrated result.

[Source abstract and full article](https://onlinelibrary.wiley.com/doi/full/10.1155/2022/3314084).

## Full text

- [Open-access PDF](https://onlinelibrary.wiley.com/doi/pdf/10.1155/2022/3314084)
- [DOI](https://doi.org/10.1155/2022/3314084)

## Contents

- Need for embodied intelligence and explicit action selection
- Behavior-tree syntax and semantics
- BT trade-offs relative to hierarchical state machines
- Step 1: describe robot context and purpose
- Step 2: construct a basic “good weather” plan
- Robustness idioms using preconditions and postconditions
- Step 3: construct a robust plan
- Step 4: add reactive contingency handling
- BT execution architecture
- ROS/ROS 2, skills, blackboards, and BehaviorTree.CPP considerations

## Problem / motivation

BT theory does not automatically tell practitioners how to structure a maintainable robot application. The paper addresses the engineering gap between formal BT descriptions and the software decisions needed for real autonomous robots.

## Contribution

The main contribution is a practical workflow for designing BTs: start with the robot's purpose and relevant world state, build the nominal sequence, add explicit checks and recovery patterns, then introduce higher-priority contingencies. The paper also describes how a BT executor fits within a broader robot software architecture.

## Method

The guidance is distilled from the authors' experience applying BTs to autonomous robot projects. A recurring mobile manipulation example is used to illustrate how a nominal plan becomes robust and reactive as conditions, fallback alternatives, and contingency branches are added.

## Robotics relevance

This paper is particularly useful for connecting BT concepts to ROS-oriented implementation. It discusses robot skills such as navigation, pick, and place; the role of preconditions and effects; blackboard/data exchange; separation between deliberation, execution, and control; and practical use of BehaviorTree.CPP-style execution infrastructure.

## Key results / significance

The paper provides a practitioner-focused complement to formal and synthesis-oriented work. It helps explain why BT adoption in robotics depends as much on software architecture, skill interfaces, and observability as on the tree notation itself.

## Related work

This review/guidelines paper provides an implementation-oriented bridge between foundational BT theory and application-specific systems. Its emphasis on skills, blackboards, recovery structure, and ROS execution complements formal work on BT semantics and synthesis.

## Citation

Eric Dortmans and Teade Punter. **Behavior Trees for Smart Robots Practical Guidelines for Robot Software Development.** *Journal of Robotics*, 2022, Article 3314084, 9 pages, 2022. DOI: [10.1155/2022/3314084](https://doi.org/10.1155/2022/3314084).
