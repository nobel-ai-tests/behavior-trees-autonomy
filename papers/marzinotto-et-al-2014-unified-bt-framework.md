# Marzinotto et al. (2014) — Towards a Unified Behavior Trees Framework for Robot Control

## Citation

Alejandro Marzinotto, Michele Colledanchise, Christian Smith, and Petter Ögren. **Towards a Unified Behavior Trees Framework for Robot Control.** *2014 IEEE International Conference on Robotics and Automation (ICRA)*, pp. 5420–5427. DOI: [10.1109/ICRA.2014.6907656](https://doi.org/10.1109/ICRA.2014.6907656). [KTH accepted version](https://kth.diva-portal.org/smash/get/diva2:808739/FULLTEXT01).

## Problem / motivation

Behavior trees had already been used in game AI and early robotics work, but the literature used inconsistent terminology and semantics. Robotics requires a more precise account because a BT may sit between high-level planning and low-level controllers and must interact with continuous-time systems.

## Behavior-tree contribution

The paper presents a unified BT framework for robot control and treats a BT as both a **plan representation and execution tool**. It formalizes action and condition subsets, discusses node extensions, and studies equivalence relations between BTs and Controlled Hybrid Dynamical Systems (CHDSs).

## Method

The authors review prior BT formulations, define a more compact mathematical representation, analyze representational relationships with CHDSs, and provide a ROS-oriented implementation and a robot grasping demonstration.

## Experimental setting

The framework is demonstrated with a NAO robot in a grasping mission that schedules open-loop actions using the authors' BT library.

## Key results / significance

This is an important foundations paper because it moves BTs from informal game-AI practice toward a robotics/control formalism. It provides vocabulary and semantics that later BT literature builds on.

## Limitations

The work focuses on formalization and representational capability rather than broad empirical comparison across autonomy architectures. Many practical BT variants used today add implementation semantics beyond the core formulation.

## Connections to other work

- Followed by Colledanchise & Ögren (2017), which develops the modularity and generalization arguments in greater depth.
- Provides foundations for later surveys such as Iovino et al. (2022).
- Useful when distinguishing BT execution semantics from the inference semantics of an ML decision tree.
