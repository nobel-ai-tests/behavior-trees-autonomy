# Finite-State Machines and Hierarchical FSMs

> **Role in this knowledge base.** Behavior Trees remain the core autonomy architecture studied here. This page is an additional resource for comparing BT execution with another fast decision-making mechanism and for identifying useful hybrid designs.

An FSM makes a fast decision by maintaining one active discrete state and evaluating transition guards. A hierarchical FSM reduces some structural growth by allowing a state to contain substates.

![Finite-State Machines and Hierarchical FSMs overview](../assets/figures/fsm-hfsm-overview.svg)

*Repository-authored overview figure. It is an explanatory synthesis, not a figure reproduced from a paper.*

## Runtime idea

At each control cycle the machine checks guards leaving the current state. The first enabled transition changes the active state; otherwise the current state continues. HFSMs apply the same rule recursively within a composite state.

## Algorithm

```latex
\begin{algorithmic}[1]
\Require current state $s$, transition guards $G$, robot observation $o_t$
\Ensure next active state and action
\State $o_t \gets \textsc{Observe}()$
\ForAll{$(s,g,s') \in G$ in priority order}
  \If{$g(o_t)=\textsc{True}$}
    \State $s \gets s'$
    \State \textbf{break}
  \EndIf
\EndFor
\State \Return $\textsc{Execute}(s,o_t)$
\end{algorithmic}
```

## Relationship to Behavior Trees

FSMs encode switching as explicit state-to-state edges. BTs instead repeatedly traverse a hierarchy of control-flow nodes and propagate Success, Failure, or Running. FSM transition graphs can be extremely cheap and explicit, while BTs usually provide cleaner composition, reuse, and recovery structure as behavior count grows.

## When it is useful beside a BT

A practical robot does not need one architecture at every level. A BT can remain the mission/task executive while an FSM or HFSM handles a narrower mode-switching problem below a leaf node, inside a skill, or in a dedicated subsystem.

## Related knowledge

- [Behavior Tree foundations](behavior-tree-foundations.md)
- [Behavior Trees in robotics](robotics-behavior-trees.md)
- [Fast decision architectures: additional resources](fast-decision-architectures.md)
