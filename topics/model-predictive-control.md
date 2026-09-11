# Model Predictive Control

Model Predictive Control repeatedly solves a finite-horizon optimization problem from the latest measured state, applies only the first control input, then shifts the horizon forward and solves again.

<div role="img" aria-label="Model Predictive Control execution overview" style="border:1px solid #cbd5e1;border-radius:14px;padding:20px;background:#f8fafc;margin:1.25rem 0;">
  <div style="font-weight:800;font-size:1.15rem;margin-bottom:4px;">MPC receding-horizon graph</div>
  <div style="color:#64748b;margin-bottom:16px;">Measure, predict, optimize, apply the first input, then repeat from the new state.</div>
  <div style="display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;margin-bottom:18px;">
    <div style="padding:12px 16px;border:2px solid #64748b;border-radius:10px;background:white;font-weight:700;">Measure state</div>
    <div style="font-size:1.45rem;">→</div>
    <div style="padding:12px 16px;border:2px solid #64748b;border-radius:10px;background:white;font-weight:700;">Predict horizon</div>
    <div style="font-size:1.45rem;">→</div>
    <div style="padding:12px 16px;border:2px solid #475569;border-radius:10px;background:white;font-weight:800;">Optimize cost + constraints</div>
    <div style="font-size:1.45rem;">→</div>
    <div style="padding:12px 16px;border:2px solid #64748b;border-radius:10px;background:white;font-weight:700;">Apply u₀</div>
    <div style="font-size:1.45rem;">↺</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;">
    <div style="padding:12px;border-radius:10px;background:white;border:1px solid #dbe3ec;"><strong>Fast enough when</strong><br>Horizon, model, and solver are chosen for the control-rate budget.</div>
    <div style="padding:12px;border-radius:10px;background:white;border:1px solid #dbe3ec;"><strong>Key strength</strong><br>Constraints and predicted dynamics are handled explicitly.</div>
    <div style="padding:12px;border-radius:10px;background:white;border:1px solid #dbe3ec;"><strong>BT integration</strong><br>A BT action can invoke MPC until the skill returns Success or Failure.</div>
  </div>
</div>

## Runtime idea

The optimizer predicts state evolution over a short horizon, evaluates costs and constraints, and returns a control sequence. Receding-horizon execution provides feedback because the problem is reconstructed from new measurements every cycle.

## Algorithm

```latex
\begin{algorithmic}[1]
\Require measured state $x_t$, dynamics $f$, cost $J$, constraints $C$, horizon $H$
\Ensure applied control $u_t$
\State $x_t \gets \textsc{MeasureState}()$
\State $U^* \gets \arg\min_{u_{t:t+H-1}} J(x_t,U)$
\State \hspace{1em}subject to $x_{k+1}=f(x_k,u_k)$ and $C(x_k,u_k)\le 0$
\State $u_t \gets U^*[0]$
\State \textsc{Apply}$(u_t)$
\State \Return $u_t$ \Comment{repeat at the next control cycle}
\end{algorithmic}
```

## Relationship to Behavior Trees

MPC and BTs normally operate at different abstraction levels. A BT is a strong fit for discrete mission/task execution and recovery; MPC is a strong fit for constrained continuous control. A common hybrid is a BT action such as `FollowPath` or `Dock` whose implementation invokes an MPC controller until the skill reports Success or Failure.

## When it is useful beside a BT

A BT can remain the mission/task executive while MPC implements a continuous controller behind a motion, docking, tracking, or manipulation action.

## Related topics

- [Behavior Tree foundations](behavior-tree-foundations.md)
- [Behavior Trees in robotics](robotics-behavior-trees.md)
- [Fast decision architectures in robotics](fast-decision-architectures.md)
