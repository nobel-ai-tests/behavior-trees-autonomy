# Reactive Architectures and Subsumption

    > **Role in this knowledge base.** Behavior Trees remain the core autonomy architecture studied here. This page is an additional resource for comparing BT execution with another fast decision-making mechanism and for identifying useful hybrid designs.

    Reactive architectures minimize deliberation. In subsumption-style control, several sensor-driven behaviors can run concurrently and a priority mechanism lets urgent behaviors suppress or override lower-priority outputs.

    ![Reactive Architectures and Subsumption overview](../assets/figures/reactive-subsumption-overview.svg)

    *Repository-authored overview figure. It is an explanatory synthesis, not a figure reproduced from a paper.*

    ## Runtime idea

    The runtime continually computes candidate behavior outputs. Arbitration selects the highest-priority active behavior, so no global search is required before issuing a command.

    ## Algorithm

    ```latex
    \\begin{algorithmic}[1]
\\Require ordered behaviors $B_1,\\dots,B_n$ from highest to lowest priority
\\Require observation $o_t$
\\Ensure selected command $u_t$
\\State $o_t \\gets \\textsc{Observe}()$
\\For{$i \\gets 1$ to $n$}
  \\State $(active,u) \\gets B_i(o_t)$
  \\If{$active$}
    \\State \\Return $u$ \\Comment{higher layer suppresses lower layers}
  \\EndIf
\\EndFor
\\State \\Return $u_{default}$
\\end{algorithmic}
    ```

    ## Relationship to Behavior Trees

    Both BTs and subsumption can express priority and reactive preemption, but the representation is different. A BT makes priority part of hierarchical traversal and status propagation; subsumption emphasizes simultaneously available behaviors and output suppression. A BT is usually stronger for explicit task decomposition, whereas a subsumption layer can be attractive for very fast local reactions.

    ## When it is useful beside a BT

    A practical robot does not need to choose one architecture for every level. A BT can remain the mission/task executive while this mechanism handles a narrower decision or control problem below a leaf node, inside a skill, or as an independent safety layer.

    ## Related knowledge

    - [Behavior Tree foundations](behavior-tree-foundations.md)
    - [Behavior Trees in robotics](robotics-behavior-trees.md)
    - [Fast decision architectures: additional resources](fast-decision-architectures.md)
