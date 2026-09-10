# Cai et al. (2021) — BT Expansion for Robot Behavior Planning

## Abstract

*Analytical abstract — repository-authored because the source does not provide clear permission to reproduce the complete publisher abstract verbatim.*

**Contribution / method.** The paper introduces BT Expansion, a planning algorithm that synthesizes behavior trees from STRIPS-style actions using the state-space formulation of BTs. Starting with the goal as a condition node, the algorithm repeatedly expands unsatisfied conditions with actions that can establish them, prunes redundant branches, and grows the tree until the initial state lies inside the tree's region of attraction. The authors prove termination, soundness, and completeness and use the region-of-attraction formulation to characterize reactive recovery from disturbances.

**Quantitative evidence.** The stated traversal complexity ranges from O(b|S|) to O(|A||S|log|S|), depending on branching and implementation. The empirical evaluation uses 10 randomly generated test-set configurations with 1,000 planning tasks per configuration. Across those 10 configurations, the reported mean generated-tree size for BT Expansion is smaller than the baseline in every case: from 35.3 versus 85.7 nodes in the smallest listed case to 41.5 versus 30,840.8 nodes and 203.9 versus 32,074.7 nodes in two high-literal/high-iteration cases. Relative to the baseline means, this corresponds to roughly 58.8% to 99.9% fewer nodes across the table. A simulated YouBot case study also shows a failure mode of the earlier planning baseline in a solvable task, while BT Expansion returns a valid solution because of its soundness/completeness construction.

**Advantages.** The strongest advantage is formal reliability under the model assumptions: if the defined planning problem is solvable, the algorithm is proven to return a solution rather than merely being observed to work on examples. The region-of-attraction analysis also gives a precise explanation for why a generated BT can reexecute reversed actions, skip actions already completed by an external agent, and try alternative actions without full replanning. Empirically, the compact condition representation produces substantially smaller trees than the comparison method on the generated test sets, reducing both representation size and potential tick overhead.

**Disadvantages / trade-offs.** Robustness and compactness are in tension. Expanding all reachable conditions can enlarge the region of attraction and therefore make the controller robust from more solvable states, but it also produces a larger tree; aggressive pruning can approach a classical plan sequence, which is smaller but has a narrower region of attraction. The formal guarantees apply to the supplied symbolic model, not to arbitrary physical-world uncertainty. Complexity can also grow with the action/state space and branching factor despite being polynomial under the paper's formulation.

**Limitations.** The formulation assumes a finite discrete state space, deterministic STRIPS-like actions, known preconditions and add/delete effects, indivisible actions, persistence of an action's preconditions during execution, and finite action completion. Those assumptions omit probabilistic outcomes, model error, partial observability, concurrent actions, continuous dynamics, and many timing/resource constraints common in deployed robots. The disturbance guarantee therefore means any disturbance that remains resolvable inside the modeled state/action system, not any real-world disturbance. Evaluation is simulation-only and emphasizes generated tree size rather than wall-clock planning latency, execution success under noisy sensing, energy use, or physical-robot reliability. The paper itself leaves further tree-size reduction, planning under uncertainty, and richer properties such as temporal-logic/periodic-task analysis to future work.

[Source abstract on the AAAI article page](https://ojs.aaai.org/index.php/AAAI/article/view/16755).

## Full text

- [AAAI PDF](https://ojs.aaai.org/index.php/AAAI/article/view/16755/16562)
- [DOI](https://doi.org/10.1609/aaai.v35i7.16755)

## Contents

- Introduction and motivation for formally grounded BT synthesis
- Behavior-tree and planning background
- Related synthesis approaches
- Problem formulation using STRIPS-style actions
- BT Expansion algorithm
- Soundness and completeness analysis
- Region-of-attraction interpretation of disturbance handling
- Simulated mobile-manipulator experiments
- Conclusions

## Problem / motivation

Earlier BT-synthesis approaches could produce useful reactive policies but often lacked guarantees that a solvable planning problem would actually yield a valid behavior tree. The paper addresses that gap by asking for a synthesis procedure with a formal planning basis rather than only empirical evidence.

## Contribution

BT Expansion starts from a primary tree and expands failed or unsatisfied conditions using actions that can establish them. The main technical contribution is the formal proof that the algorithm is sound and complete under its planning assumptions.

## Method

The method combines STRIPS-style action models with the state-space formulation of behavior trees. Preconditions and effects guide expansion; the resulting tree is then executed reactively. The authors analyze disturbance handling through the BT's region of attraction and compare the method with earlier BT-planning approaches.

## Experimental setting

The evaluation uses a simulated mobile manipulator and benchmark test sets. A representative example involves grasping cargo while handling an obstacle that may appear, reappear, or be removed externally.

## Key results / significance

The paper is important because it strengthens the planning side of the BT literature from heuristic synthesis toward formal guarantees. It also makes precise a central robotics claim: if a disturbance is resolvable within the action model, the expanded BT can recover while preserving reactive execution.

## Repository notes

Core topics: robot task planning, behavior synthesis, planning, reactivity, robot manipulation, fault tolerance, and robot control.

This paper is a natural successor to blended reactive planning and acting. It should be read alongside Colledanchise et al. (2019) to see the progression from backchaining-style synthesis toward soundness and completeness results.

The source paper includes algorithm diagrams and a mobile-manipulator example figure; those remain in the linked PDF.

## Citation

Zhongxuan Cai, Minglong Li, Wanrong Huang, and Wenjing Yang. **BT Expansion: a Sound and Complete Algorithm for Behavior Planning of Intelligent Robots with Behavior Trees.** *Proceedings of the AAAI Conference on Artificial Intelligence*, 35(7), 6058–6065, 2021. DOI: [10.1609/aaai.v35i7.16755](https://doi.org/10.1609/aaai.v35i7.16755).
