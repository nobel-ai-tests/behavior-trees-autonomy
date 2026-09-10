# Marzinotto et al. (2014) — Towards a Unified Behavior Trees Framework for Robot Control

## Abstract

Verbatim excerpt from the paper's abstract:

> “This paper presents a unified framework for Behavior Trees (BTs), a plan representation and execution tool.”

[Read the complete source abstract on the Christian Smith / KTH publication page](https://www.csc.kth.se/~ccs/Publications/icra14b.html).

## Full text

- [Author/KTH-hosted PDF](https://www.csc.kth.se/~almc/pdf/unified_bt_framework.pdf)
- [KTH DiVA accepted manuscript](https://kth.diva-portal.org/smash/get/diva2:808739/FULLTEXT01)

## Contents

- Prior behavior-tree formulations and terminology
- Compact mathematical representation
- Action and Condition subsets
- Node extensions and execution semantics
- Controlled Hybrid Dynamical Systems
- Equivalence relationships between BTs and CHDSs
- Software implementation
- NAO grasping demonstration
- Conclusions and future work

## Problem / motivation

Behavior trees had already been used in game AI and early robotics work, but the literature used inconsistent terminology and semantics. Robotics requires a more precise account because a BT may sit between high-level planning and low-level controllers and must interact with continuous-time systems.

## Behavior-tree contribution

The paper presents a unified BT framework for robot control and treats a BT as both a **plan representation and execution tool**. It formalizes action and condition subsets, discusses node extensions, and studies equivalence relations between BTs and Controlled Hybrid Dynamical Systems (CHDSs).

## Method

The authors review prior BT formulations, define a more compact mathematical representation, analyze representational relationships with CHDSs, and provide a ROS-oriented implementation and robot grasping demonstration.

## Experimental setting

The framework is demonstrated with a NAO robot in a grasping mission that schedules open-loop actions using the authors' BT library.

## Key results / significance

The work moves behavior trees from informal game-AI practice toward a robotics/control formalism and supplies vocabulary and semantics that later BT literature builds on.

## Repository notes

The paper is primarily a formalization and representational study rather than a broad empirical comparison across autonomy architectures. Modern BT libraries may add execution semantics beyond the core formulation described here.

The full text contains behavior-tree diagrams and imagery from the NAO demonstration. Those figures are left in the linked source manuscript rather than rehosted here unless redistribution rights are clear.

Connections in this knowledge base:

- Followed by Colledanchise & Ögren (2017), which develops the modularity and generalization arguments in greater depth.
- Provides foundations for later surveys such as Iovino et al. (2022).
- Useful when distinguishing BT execution semantics from the inference semantics of a machine-learning decision tree.

## Citation

Alejandro Marzinotto, Michele Colledanchise, Christian Smith, and Petter Ögren. **Towards a Unified Behavior Trees Framework for Robot Control.** *2014 IEEE International Conference on Robotics and Automation (ICRA)*, pp. 5420–5427. DOI: [10.1109/ICRA.2014.6907656](https://doi.org/10.1109/ICRA.2014.6907656).
