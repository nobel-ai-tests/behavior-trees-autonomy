# Iovino et al. (2021) — Learning Behavior Trees with Genetic Programming

## Abstract

This paper studies automatic behavior-tree synthesis for robotic tasks in unpredictable environments using genetic programming. The authors evolve BT structure in a deliberately simple simulator, then test whether the learned policy transfers to a more realistic simulation. The approach avoids task-specific heuristics and produces fault-tolerant robot behavior, making it a useful example of interpretable program synthesis for robotics.

- [Raw abstract and preprint on arXiv](https://arxiv.org/abs/2011.03252)

## Full text

- [arXiv PDF](https://arxiv.org/pdf/2011.03252)
- [Version of record](https://doi.org/10.1109/ICRA48506.2021.9562088)

## Contents

- Motivation for automatically generating robot programs
- Behavior-tree representation and genetic-programming operators
- Fitness formulation and learning setup
- Lightweight simulation used during evolution
- Transfer to a more realistic robotic simulation
- Robustness and fault-tolerance evaluation
- Discussion and conclusions

## Problem / motivation

Industrial robots increasingly need to handle changing tasks and uncertain environments, while hand-authoring a complete reactive policy can be expensive. The paper asks whether BT structure can be learned automatically without requiring an expensive high-fidelity simulator during the entire search process.

## Contribution

The authors formulate BT construction as a genetic-programming problem. Candidate trees are evolved according to task performance, while the modular BT representation keeps the resulting controller inspectable and editable in a way that end-to-end opaque policies often are not.

## Method

Genetic programming mutates and recombines behavior-tree structures. Evolution is performed in a simple simulator intended to make repeated evaluation inexpensive. Successful trees are then transferred to a more realistic simulation to test whether the learned behavior survives the simulation gap.

## Robotics relevance

The work targets industrial robotic tasks and explicitly studies unpredictable execution conditions. It therefore connects evolutionary program synthesis with practical concerns such as fault tolerance, changing environments, and minimizing robot-programming effort.

## Key results / significance

The reported experiments show convergence without task-specific search heuristics and successful transfer from the simpler learning simulator to a more realistic one. This makes the paper a core reference for evolutionary BT synthesis in robotics and for the idea that search can operate on an interpretable task representation rather than directly on low-level control parameters.

## Repository notes

Core topics: robot learning, evolutionary learning, behavior synthesis, robot manipulation, fault tolerance, and robot control.

This paper complements planning-based synthesis such as Colledanchise et al. (2019) and Cai et al. (2021): planning uses explicit action models, whereas genetic programming searches directly over candidate BT structures using performance feedback.

The original figures and experiment diagrams remain in the linked paper.

## Citation

Matteo Iovino, Jonathan Styrud, Pietro Falco, and Christian Smith. **Learning Behavior Trees with Genetic Programming in Unpredictable Environments.** *2021 IEEE International Conference on Robotics and Automation (ICRA)*, pp. 4591–4597, 2021. DOI: [10.1109/ICRA48506.2021.9562088](https://doi.org/10.1109/ICRA48506.2021.9562088).
