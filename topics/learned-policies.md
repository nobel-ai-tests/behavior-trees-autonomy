# Learned Policies

> **Role in this knowledge base.** Behavior Trees remain the core autonomy architecture studied here. This page is an additional resource for comparing BT execution with another fast decision-making mechanism and for identifying useful hybrid designs.

A learned policy moves much of the decision-design cost into training. At runtime, observations are mapped to actions through a learned function, often a neural network trained by imitation learning, reinforcement learning, or both.

![Learned Policies overview](../assets/figures/learned-policies-overview.svg)

*Repository-authored overview figure. It is an explanatory synthesis, not a figure reproduced from a paper.*

## Runtime idea

Deployment can be only preprocessing plus a model forward pass. The main costs and risks therefore shift toward training data, simulation, generalization, uncertainty estimation, and runtime safety constraints.

## Algorithm

```latex
\begin{algorithmic}[1]
\Require trained policy $\pi_\theta$, observation pipeline $h$
\Ensure robot action $a_t$
\State $x_t \gets \textsc{Sense}()$
\State $o_t \gets h(x_t)$
\State $a_t \gets \pi_\theta(o_t)$
\State \textsc{Execute}$(a_t)$
\State \Return $a_t$
\end{algorithmic}
```

## Relationship to Behavior Trees

A BT exposes task logic and switching structure directly, whereas a learned policy may compress decision logic into model parameters. The two are complementary: a BT can constrain when a learned skill is allowed to run, select among learned skills, monitor preconditions and outcomes, and provide explicit recovery behavior when a policy fails.

## When it is useful beside a BT

A BT can own the interpretable mission logic while learned policies implement perception-rich skills such as grasp selection, local navigation, locomotion, or visuomotor control.

## Related knowledge

- [Behavior Tree foundations](behavior-tree-foundations.md)
- [Behavior Trees in robotics](robotics-behavior-trees.md)
- [Fast decision architectures: additional resources](fast-decision-architectures.md)
