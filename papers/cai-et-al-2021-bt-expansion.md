# Cai et al. (2021) — BT Expansion for Robot Behavior Planning

## Abstract

Verbatim excerpt from the paper's abstract:

> “Automated synthesis of BTs can reduce human workload and build behavior models for complex tasks beyond the ability of human design…”

[Read the complete source abstract on the AAAI article page](https://ojs.aaai.org/index.php/AAAI/article/view/16755).

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
