# Jeong et al. (2022) — Behavior-Tree Task Planning for Multiple Mobile Robots

## Abstract

Verbatim excerpt from the paper's abstract:

> “In this study, we propose task planning framework for multiple robots that builds on a behavior tree (BT).”

[Read the complete source abstract on arXiv](https://arxiv.org/abs/2201.10918).

## Full text

- [arXiv PDF](https://arxiv.org/pdf/2201.10918)
- [Version of record](https://doi.org/10.1109/AIM52237.2022.9863364)

## Contents

- Motivation for distributed BT execution
- Behavior-tree and DDS background
- Task definitions for multi-robot execution
- Asynchronous assignment through a coalesced BT
- Shared task/action state over DDS
- Local recovery behavior
- Multi-robot experimental setup
- Three-robot coordination results
- Conclusions

## Problem / motivation

Standard BT execution assumes one tree receives ticks from one root. A multi-robot system instead needs to coordinate several agents that act asynchronously, communicate over a network, and may fail independently. The paper asks how to retain BT task structure while distributing execution across robots.

## Contribution

The authors introduce BT task types and execution mechanisms that communicate through DDS. A central task-planning unit can assign tasks to multiple robots simultaneously, while a robot that encounters a fault can switch into a local recovery tree.

## Method

Task assignments and action variables are shared through DDS. The central BT coordinates the overall plan, while embedded robot-side BTs handle local execution and recovery. This separates fleet-level sequencing from per-robot fault response.

## Experimental setting

Three mobile robots are coordinated to travel alternately to four goal positions. The experiment demonstrates concurrent task assignment and fault-recovery behavior using the proposed architecture.

## Key results / significance

The paper is a useful early reference for distributed BT execution because it addresses a limitation often hidden by single-robot examples: asynchronous agents need explicit communication and ownership of recovery behavior. It also connects BTs with middleware-level concerns rather than treating the tree as an isolated controller.

## Repository notes

Core topics: multi-robot systems, mobile robotics, robot task planning, fault tolerance, robot software architecture, and robot control.

The work is complementary to single-robot synthesis papers. Its main contribution is not a new planning search algorithm but an execution architecture for distributing BT-controlled tasks across multiple agents.

The source paper contains 12 figures describing the architecture and experiments; they remain in the linked preprint.

## Citation

Seungwoo Jeong, Taekwon Ga, Inhwan Jeong, and Jongeun Choi. **Behavior Tree-Based Task Planning for Multiple Mobile Robots using a Data Distribution Service.** *2022 IEEE/ASME International Conference on Advanced Intelligent Mechatronics (AIM)*, pp. 1791–1798, 2022. DOI: [10.1109/AIM52237.2022.9863364](https://doi.org/10.1109/AIM52237.2022.9863364).
