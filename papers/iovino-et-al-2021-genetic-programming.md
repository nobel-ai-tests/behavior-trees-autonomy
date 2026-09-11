# Iovino et al. (2021) — Learning Behavior Trees with Genetic Programming

## Abstract

<!-- This section is an analytical summary rather than a verbatim reproduction of the publisher abstract. -->

**Contribution / method.** The paper learns behavior-tree structure with genetic programming (GP) for a mobile-manipulation task in an unpredictable environment. Candidate BTs are evolved using crossover, mutation, tournament selection, and a fitness function that combines task progress, tree size, execution time, and estimated action-failure probability. To make the search tractable, learning is performed in a lightweight state-machine simulator and the resulting trees are then validated in a more detailed ROS/Gazebo simulation.

**Quantitative evidence.** The reported GP setup uses a population of 30 individuals, initial tree length 4, 8,000 generations, 40% crossover, 60% mutation, and 10% elitism; learning curves are averaged over 10 runs. The authors estimate that direct GP in Gazebo would take more than a month on a powerful gaming computer, while the simplified simulator reduces learning to a few minutes, i.e. several orders of magnitude faster. Convergence still requires roughly 400,000 evaluated episodes. In action-pool robustness tests, the required pool contains 9 useful behaviors; experiments add 3 useless behaviors and then 27 additional useless behaviors, and GP still removes meaningless actions early. A risk-sensitive experiment assigns failure probabilities 0.2 and 0.4 to the short path and changes the failure-cost weight from δ=0 to δ=150, causing the learned BT to prefer the longer safer route.

**Advantages.** The major measured advantage is computational: the surrogate simulator makes a search that is impractical in high-fidelity simulation feasible in minutes. The learned BTs also transfer to Gazebo without retraining in the reported tasks, remain interpretable as executable programs, tolerate injected action failures, and are relatively robust to a much larger pool of irrelevant behaviors. The explicit risk term can bias the learned structure toward safer behavior rather than only shorter execution.

**Disadvantages / trade-offs.** The speedup comes from manually constructing a simplified simulator whose transition outcomes must remain representative of the detailed environment. GP is still sample hungry—about 400,000 episodes for convergence in the reported setup—and the result depends on the fitness weights, mutation/crossover settings, allowed node set, and structural constraints. Penalizing failure probability can improve safety but may select longer/slower paths, while stronger tree-size or time penalties can push in the opposite direction.

**Limitations.** Validation is sim-to-sim, not on a physical robot, and the paper explicitly leaves real-robot transfer and comparison with hand-coded BTs to future work. The simplified simulator is a substantial modeling assumption: if action outcomes, sensing effects, or failure modes differ materially from the real system, a learned tree may not transfer. The task domain is one mobile pick-and-place problem, so the experiments do not establish scaling to long-horizon tasks, richer manipulation, continuous control, multi-robot coordination, or very large behavior libraries. The learning process also requires hundreds of thousands of policy evaluations and manually chosen fitness shaping, which can encode designer bias even though no task-specific search heuristic is used. Finally, robustness is tested against selected stochastic failures and irrelevant behaviors; it is not a formal guarantee against arbitrary disturbances or model mismatch.

[Source abstract on arXiv](https://arxiv.org/abs/2011.03252).

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

## Related work

This paper complements planning-based synthesis such as Colledanchise et al. (2019) and Cai et al. (2021): planning uses explicit action models, whereas genetic programming searches directly over candidate BT structures using performance feedback.

## Citation

Matteo Iovino, Jonathan Styrud, Pietro Falco, and Christian Smith. **Learning Behavior Trees with Genetic Programming in Unpredictable Environments.** *2021 IEEE International Conference on Robotics and Automation (ICRA)*, pp. 4591–4597, 2021. DOI: [10.1109/ICRA48506.2021.9562088](https://doi.org/10.1109/ICRA48506.2021.9562088).
