# Behavior Tree Foundations

## What is a behavior tree?

A **Behavior Tree (BT)** is a hierarchical control structure for organizing how an autonomous agent selects, sequences, and switches between behaviors. In robotics, a BT is best understood as an **executable task-switching architecture** rather than as a predictive model.

The standard robotics formulation uses a rooted directed tree. Execution begins at the root and propagates through internal control-flow nodes toward leaf nodes. A node returns a small status interface, conventionally:

- **Success** — the node's objective or condition is satisfied.
- **Failure** — the node cannot satisfy its objective, or a condition is false.
- **Running** — execution is still in progress.

Two canonical control-flow nodes are:

- **Sequence** — evaluates children in order; it succeeds only when all required children succeed, and stops when a child fails or is still running.
- **Fallback / Selector** — evaluates alternatives in priority order; it succeeds when one child succeeds, and stops when a child succeeds or is still running.

Leaves are usually **conditions** (queries about state) or **actions** (behaviors that can change the world or internal system state). Variants add decorators, parallel nodes, memory, explicit recovery semantics, and application-specific extensions.

A simplified mobile-robot BT might be written as:

```text
Fallback
├── Sequence
│   ├── BatteryLow?
│   └── Recharge
└── Sequence
    ├── GoalAvailable?
    └── NavigateToGoal
```

On each control update, the tree can re-evaluate whether the higher-priority recharge behavior is applicable. That repeated evaluation is one reason BTs are described as **reactive**: changes in sensed state can alter which subtree is active without requiring an explicit transition from every possible prior behavior.

This formulation was given a more rigorous robotics semantics by Marzinotto et al. (2014), and subsequent work by Colledanchise and Ögren connected BT composition to hybrid control, modularity, and other switching structures. The 2022 survey by Iovino et al. provides a broad map of the field.

## The core idea: a tree that *runs*, not merely a tree that *classifies*

The visual similarity between a behavior tree and a decision tree is misleading. Both are trees, but the edges and leaves mean different things because the two structures solve different problems.

A behavior tree answers a question such as:

> **What should the agent execute now, and what should it try next if conditions or outcomes change?**

A classical machine-learning decision tree answers a question such as:

> **Given this feature vector, what class or numeric value should be predicted?**

That difference in purpose determines their semantics.

## Behavior tree vs. machine-learning decision tree

| Dimension | Behavior tree | Decision tree (ML) |
| --- | --- | --- |
| Primary role | Runtime task selection and execution | Prediction: classification or regression |
| Typical input | Current world/robot state plus child execution status | A feature vector for one sample |
| Internal nodes | Control-flow operators and/or conditions | Feature tests / split rules |
| Leaves | Conditions and executable actions/subtrees | Predicted class, probability, or numeric value |
| Return/output | Usually `Success`, `Failure`, or `Running`; actions may have side effects | A prediction |
| Time | Designed for repeated evaluation during execution | Usually one root-to-leaf inference per sample |
| Reactivity | High-level choices can be reconsidered as state changes | A new prediction requires another inference call; the tree itself does not manage an ongoing task |
| State/progress | `Running` explicitly represents incomplete execution; implementations may add memory | Standard prediction trees do not represent an action that remains in progress |
| Construction | Often engineered, synthesized from plans, learned, or hybrid | Commonly induced from labeled data by optimizing split criteria |
| Main quality concerns | Modularity, reactivity, robustness, safety, task correctness, execution efficiency | Generalization, predictive accuracy, calibration, interpretability, overfitting |

J. R. Quinlan's ID3 work is a canonical reference for the machine-learning meaning of a decision tree: internal tests partition examples and leaves represent inferred classifications. The CART framework by Breiman, Friedman, Olshen, and Stone established a major classification-and-regression-tree methodology.

### Why `Running` matters

The `Running` result is a fundamental semantic difference. An action such as `NavigateToGoal` may require seconds or minutes. A BT can return `Running`, be ticked again later, and allow higher-level logic to determine whether the action should continue, be interrupted, or be replaced by another behavior.

A standard classifier decision tree has no analogous notion of an action that is currently executing. Its evaluation terminates at a prediction leaf.

### Why repeated evaluation matters

A BT is normally embedded in a control loop. Conditions can therefore be checked again as the environment changes. For example, a navigation task can be pre-empted by a newly detected safety condition when the root is evaluated again.

This makes the tree part of the agent's **control policy/executive**. In contrast, a decision tree classifier is a **mapping from inputs to outputs**. It may be called repeatedly by another control system, but the classifier itself does not define the lifecycle of an ongoing behavior.

## Formal relationship: decision trees can be represented inside the BT formalism

The two structures are not unrelated. Colledanchise and Ögren (2017) show that BTs can be viewed as a generalization of several switching structures, including decision trees. A decision-tree branch can be represented using BT conditions and control-flow composition, while BTs additionally provide execution semantics such as `Running` and hierarchical behavior composition.

This is an important distinction:

> A decision tree can be encoded as a restricted behavior-selection structure, but a general behavior tree is not merely a decision tree with different labels.

The extra semantics are what make BTs useful as autonomous-system executives.

## Behavior trees vs. nearby autonomy architectures

### Finite-state machines (FSMs)

FSMs represent behavior using explicit states and transitions. They are effective and mathematically well understood, but large reactive controllers can accumulate many transitions between states. BTs move much of that switching logic into reusable hierarchical control-flow composition. The robotics literature repeatedly identifies modularity and composability as major reasons for using BTs.

BTs and FSMs are not opposites: one can often translate or embed portions of one representation into the other, and implementations frequently combine them. The practical distinction is where transition logic lives and how behaviors are composed.

### Hierarchical task networks (HTNs) and planners

HTNs and task planners primarily address **how to decompose or generate a plan**. A BT primarily addresses **how to execute and react while carrying out behavior**. Planning systems can therefore generate BTs, and BTs can also call planning components as actions. In autonomy stacks, planning and behavior execution are often complementary layers rather than competing representations.

## A useful mental model

For this knowledge base, use the following default interpretation:

- A **decision tree** is primarily a *prediction/decision rule over data*.
- A **behavior tree** is primarily an *execution and task-switching structure over behaviors*.
- The shared tree shape expresses hierarchical decomposition, but **node semantics, temporal behavior, and purpose** are different.

## Terminology caveat

"Decision tree" is also used outside machine learning for decision analysis, where chance nodes, decisions, utilities, and sequential choices may be represented in a tree. Those models are closer to planning under uncertainty than an ML classifier is, but they still do not automatically acquire the tick/status/action semantics of robotics behavior trees. When comparing BTs with a decision tree, specify which decision-tree formalism is intended.

## Recommended starting sources

1. Marzinotto, A., Colledanchise, M., Smith, C., & Ögren, P. (2014). **Towards a Unified Behavior Trees Framework for Robot Control.** *IEEE International Conference on Robotics and Automation (ICRA)*, 5420–5427. DOI: [10.1109/ICRA.2014.6907656](https://doi.org/10.1109/ICRA.2014.6907656). [KTH accepted version](https://kth.diva-portal.org/smash/get/diva2:808739/FULLTEXT01).
2. Colledanchise, M., & Ögren, P. (2017). **How Behavior Trees Modularize Hybrid Control Systems and Generalize Sequential Behavior Compositions, the Subsumption Architecture, and Decision Trees.** *IEEE Transactions on Robotics*, 33(2), 372–389. DOI: [10.1109/TRO.2016.2633567](https://doi.org/10.1109/TRO.2016.2633567). [KTH accepted version](https://www.diva-portal.org/smash/get/diva2:1078931/FULLTEXT01.pdf).
3. Iovino, M., Scukins, E., Styrud, J., Ögren, P., & Smith, C. (2022). **A Survey of Behavior Trees in Robotics and AI.** *Robotics and Autonomous Systems*, 154, 104096. DOI: [10.1016/j.robot.2022.104096](https://doi.org/10.1016/j.robot.2022.104096). [arXiv:2005.05842](https://arxiv.org/abs/2005.05842).
4. Ögren, P., & Sprague, C. I. (2022). **Behavior Trees in Robot Control Systems.** *Annual Review of Control, Robotics, and Autonomous Systems*, 5, 81–107. DOI: [10.1146/annurev-control-042920-095314](https://doi.org/10.1146/annurev-control-042920-095314). [arXiv:2203.13083](https://arxiv.org/abs/2203.13083).
5. Colledanchise, M., & Ögren, P. (2018). **Behavior Trees in Robotics and AI: An Introduction.** CRC Press. DOI: [10.1201/9780429489105](https://doi.org/10.1201/9780429489105). [Author-maintained book site](https://btirai.github.io/) and [preprint](https://arxiv.org/abs/1709.00084).
6. Quinlan, J. R. (1986). **Induction of Decision Trees.** *Machine Learning*, 1, 81–106. DOI: [10.1007/BF00116251](https://doi.org/10.1007/BF00116251).
7. Breiman, L., Friedman, J. H., Olshen, R. A., & Stone, C. J. (1984). **Classification and Regression Trees.** Wadsworth & Brooks/Cole. [Publisher page](https://www.routledge.com/Classification-and-Regression-Trees/Breiman-Friedman-Stone-Olshen/p/book/9780412048418).

## Next questions for the knowledge base

The natural follow-on topics are the precise tick semantics of Sequence/Fallback nodes, reactive vs. memory variants, BTs vs. FSMs and statecharts, planning-to-BT compilation, and the formal treatment of safety/robustness in BT composition.
