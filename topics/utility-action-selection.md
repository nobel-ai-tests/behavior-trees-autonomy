# Utility-Based Action Selection

Utility systems assign a numerical score to each candidate action from context such as task value, battery, distance, risk, and confidence. The decision is the argmax over feasible actions.

<div role="img" aria-label="Utility-based action selection execution overview" style="border:1px solid #cbd5e1;border-radius:14px;padding:20px;background:#f8fafc;margin:1.25rem 0;">
  <div style="font-weight:800;font-size:1.15rem;margin-bottom:4px;">Utility selection graph</div>
  <div style="color:#64748b;margin-bottom:16px;">Each feasible action is scored from current context; the maximum-utility action wins.</div>
  <div style="display:grid;grid-template-columns:minmax(170px,1fr) 54px minmax(210px,1fr) 54px minmax(170px,1fr);gap:10px;align-items:center;margin-bottom:18px;">
    <div style="display:grid;gap:8px;">
      <div style="padding:10px;border:1px solid #94a3b8;border-radius:10px;background:white;"><strong>Context</strong><br>battery · distance · risk</div>
      <div style="padding:10px;border:1px solid #94a3b8;border-radius:10px;background:white;"><strong>Candidate actions</strong><br>A₁ · A₂ · A₃ · …</div>
    </div>
    <div style="font-size:1.6rem;text-align:center;">→</div>
    <div style="padding:18px;border:2px solid #475569;border-radius:12px;background:white;text-align:center;font-weight:800;">Score every action<br><span style="font-weight:400;color:#64748b;">U(a | context)</span><br><br>arg max U</div>
    <div style="font-size:1.6rem;text-align:center;">→</div>
    <div style="padding:18px;border:2px solid #475569;border-radius:12px;background:white;text-align:center;font-weight:800;">Selected action</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;">
    <div style="padding:12px;border-radius:10px;background:white;border:1px solid #dbe3ec;"><strong>Fast because</strong><br>Runtime work is a score-and-compare pass.</div>
    <div style="padding:12px;border-radius:10px;background:white;border:1px solid #dbe3ec;"><strong>Stability aids</strong><br>Hysteresis and switching costs reduce oscillation.</div>
    <div style="padding:12px;border-radius:10px;background:white;border:1px solid #dbe3ec;"><strong>BT integration</strong><br>Use utility scoring at a selector where priorities must be context dependent.</div>
  </div>
</div>

## Runtime idea

Each cycle scores the feasible action set and chooses the maximum. Hysteresis, switching costs, or minimum commitment times are often added to reduce oscillation when scores are close.

## Algorithm

```latex
\begin{algorithmic}[1]
\Require candidate actions $A$, observation $o_t$, utility models $U_a$
\Ensure selected action $a^*$
\State $o_t \gets \textsc{Observe}()$
\State $a^* \gets \textsc{None}$; $v^* \gets -\infty$
\ForAll{$a \in A$}
  \State $v \gets U_a(o_t)$
  \If{$v > v^*$}
    \State $(a^*,v^*) \gets (a,v)$
  \EndIf
\EndFor
\State \Return $a^*$
\end{algorithmic}
```

## Relationship to Behavior Trees

A standard BT selector uses ordered control flow: earlier children are preferred according to Success/Failure/Running semantics. A utility selector instead computes a context-dependent preference numerically. Utility scoring can therefore be embedded inside a BT when the task hierarchy should remain explicit but one decision point needs dynamic trade-offs.

## When it is useful beside a BT

A BT can remain the explicit task executive while a utility selector ranks navigation modes, manipulation strategies, resource decisions, or other competing skills using current context.

## Related topics

- [Behavior Tree foundations](behavior-tree-foundations.md)
- [Behavior Trees in robotics](robotics-behavior-trees.md)
- [Fast decision architectures in robotics](fast-decision-architectures.md)
