# Jeong et al. (2022) — Behavior-Tree Task Planning for Multiple Mobile Robots

## Abstract

*Analytical abstract — repository-authored because the source does not provide clear permission to reproduce the complete publisher abstract verbatim.*

**Contribution / method.** The paper extends behavior-tree task execution from one synchronously ticked robot to multiple asynchronously operating mobile robots. A supervisory task-planning unit uses a coalesced BT to assign tasks, while DDS carries shared task/action variables between the planner and the robots. Novel task/action node behavior supports asynchronous execution, and each robot can switch to a local recovery BT when a fault occurs.

**Quantitative evidence.** The experimental validation uses 3 mobile robots coordinated through one planning unit and 4 goal positions, with the robots traveling to the goals in an alternating coordinated task. This establishes small-fleet feasibility, but the paper does not report throughput, task-completion-time improvement, DDS latency, packet loss, bandwidth, CPU load, recovery-time distributions, success percentages across repeated trials, or scaling tests with larger robot counts.

**Advantages.** Architecturally, the method separates global task sequencing from local fault recovery and allows the supervisory BT to assign work to several robots simultaneously instead of forcing all activity through one ordinary single-root/single-tick execution path. DDS provides a middleware mechanism for exchanging task state without tightly coupling the planner to each robot implementation. Local recovery also prevents every robot fault from requiring immediate restructuring of the fleet-level tree.

**Disadvantages / trade-offs.** The design introduces dependence on distributed middleware and shared state consistency. A supervisory planning unit simplifies coordination but can become a bottleneck or single point of coordination failure as fleet size and task interaction increase. Recovery behavior is predefined in robot-side BTs; the architecture does not automatically synthesize a new recovery strategy when a fault falls outside the available local tree. The additional task/action abstractions also depart from conventional single-agent BT semantics and therefore require implementation-specific coordination logic.

**Limitations.** The empirical evidence is limited to three robots and four goal locations, so scalability to tens or hundreds of agents is not demonstrated. The paper does not isolate communication performance from planning performance, test degraded or partitioned networks, quantify DDS quality-of-service choices, or compare against decentralized multi-robot BTs, auction/task-allocation methods, or other supervisory architectures. The task itself is primarily coordinated mobile navigation, leaving richer dependencies such as shared resources, manipulation handoffs, collision-coupled planning, heterogeneous capabilities, and adversarial/long-duration communication failures largely untested. Thus the work shows that the proposed architecture is feasible for a small fleet, but it does not establish quantitative scaling, optimal task allocation, or fault tolerance beyond the predefined recovery modes.

[Source abstract on arXiv](https://arxiv.org/abs/2201.10918).

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
