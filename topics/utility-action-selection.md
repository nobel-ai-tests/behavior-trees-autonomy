# Utility-Based Action Selection

    > **Role in this knowledge base.** Behavior Trees remain the core autonomy architecture studied here. This page is an additional resource for comparing BT execution with another fast decision-making mechanism and for identifying useful hybrid designs.

    Utility systems assign a numerical score to each candidate action from context such as task value, battery, distance, risk, and confidence. The decision is the argmax over feasible actions.

    ![Utility-Based Action Selection overview](../assets/figures/utility-action-selection-overview.svg)

    *Repository-authored overview figure. It is an explanatory synthesis, not a figure reproduced from a paper.*

    ## Runtime idea

    Each cycle scores the feasible action set and chooses the maximum. Hysteresis, switching costs, or minimum commitment times are often added to reduce oscillation when scores are close.

    ## Algorithm

    ```latex
    \\begin{algorithmic}[1]
\\Require candidate actions $A$, observation $o_t$, utility models $U_a$
\\Ensure selected action $a^*$
\\State $o_t \\gets \\textsc{Observe}()$
\\State $a^* \\gets \\textsc{None}$; $v^* \\gets -\\infty$
\\ForAll{$a \\in A$}
  \\State $v \\gets U_a(o_t)$
  \\If{$v > v^*$}
    \\State $(a^*,v^*) \\gets (a,v)$
  \\EndIf
\\EndFor
\\State \\Return $a^*$
\\end{algorithmic}
    ```

    ## Relationship to Behavior Trees

    A standard BT selector uses ordered control flow: earlier children are preferred according to Success/Failure/Running semantics. A utility selector instead computes a context-dependent preference numerically. Utility scoring can therefore be embedded inside a BT when the task hierarchy should remain explicit but one decision point needs dynamic trade-offs.

    ## When it is useful beside a BT

    A practical robot does not need to choose one architecture for every level. A BT can remain the mission/task executive while this mechanism handles a narrower decision or control problem below a leaf node, inside a skill, or as an independent safety layer.

    ## Related knowledge

    - [Behavior Tree foundations](behavior-tree-foundations.md)
    - [Behavior Trees in robotics](robotics-behavior-trees.md)
    - [Fast decision architectures: additional resources](fast-decision-architectures.md)
