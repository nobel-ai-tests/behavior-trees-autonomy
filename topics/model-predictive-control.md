# Model Predictive Control

    > **Role in this knowledge base.** Behavior Trees remain the core autonomy architecture studied here. This page is an additional resource for comparing BT execution with another fast decision-making mechanism and for identifying useful hybrid designs.

    Model Predictive Control repeatedly solves a finite-horizon optimization problem from the latest measured state, applies only the first control input, then shifts the horizon forward and solves again.

    ![Model Predictive Control overview](../assets/figures/mpc-overview.svg)

    *Repository-authored overview figure. It is an explanatory synthesis, not a figure reproduced from a paper.*

    ## Runtime idea

    The optimizer predicts state evolution over a short horizon, evaluates costs and constraints, and returns a control sequence. Receding-horizon execution provides feedback because the problem is reconstructed from new measurements every cycle.

    ## Algorithm

    ```latex
    \\begin{algorithmic}[1]
\\Require measured state $x_t$, dynamics $f$, cost $J$, constraints $C$, horizon $H$
\\Ensure applied control $u_t$
\\State $x_t \\gets \\textsc{MeasureState}()$
\\State $U^* \\gets \\arg\\min_{u_{t:t+H-1}} J(x_t,U)$
\\State \\hspace{1em}subject to $x_{k+1}=f(x_k,u_k)$ and $C(x_k,u_k)\\le 0$
\\State $u_t \\gets U^*[0]$
\\State \\textsc{Apply}$(u_t)$
\\State \\Return $u_t$ \\Comment{repeat at the next control cycle}
\\end{algorithmic}
    ```

    ## Relationship to Behavior Trees

    MPC and BTs normally operate at different abstraction levels. A BT is a strong fit for discrete mission/task execution and recovery; MPC is a strong fit for constrained continuous control. A common hybrid is a BT action such as `FollowPath` or `Dock` whose implementation invokes an MPC controller until the skill reports Success or Failure.

    ## When it is useful beside a BT

    A practical robot does not need to choose one architecture for every level. A BT can remain the mission/task executive while this mechanism handles a narrower decision or control problem below a leaf node, inside a skill, or as an independent safety layer.

    ## Related knowledge

    - [Behavior Tree foundations](behavior-tree-foundations.md)
    - [Behavior Trees in robotics](robotics-behavior-trees.md)
    - [Fast decision architectures: additional resources](fast-decision-architectures.md)
