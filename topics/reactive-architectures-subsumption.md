# Reactive Architectures and Subsumption

> **Role in this knowledge base.** Behavior Trees remain the core autonomy architecture studied here. This page is an additional resource for comparing BT execution with another fast decision-making mechanism and for identifying useful hybrid designs.

Reactive architectures minimize deliberation. In subsumption-style control, several sensor-driven behaviors can run concurrently and a priority mechanism lets urgent behaviors suppress or override lower-priority outputs.

<div role="img" aria-label="Reactive architectures and subsumption structured overview" style="border:1px solid #cbd5e1;border-radius:14px;padding:20px;background:#f8fafc;margin:1.25rem 0;">
  <div style="font-weight:800;font-size:1.15rem;margin-bottom:4px;">Subsumption execution graph</div>
  <div style="color:#64748b;margin-bottom:16px;">Concurrent sensor-driven behaviors compete through explicit priority and suppression.</div>
  <div style="display:grid;grid-template-columns:minmax(180px,1fr) 54px minmax(180px,1fr) 54px minmax(180px,1fr);gap:10px;align-items:center;margin-bottom:18px;">
    <div style="display:grid;gap:8px;">
      <div style="padding:10px;border:2px solid #64748b;border-radius:10px;background:white;font-weight:700;">Emergency avoid</div>
      <div style="padding:10px;border:2px solid #94a3b8;border-radius:10px;background:white;font-weight:700;">Obstacle avoid</div>
      <div style="padding:10px;border:2px solid #cbd5e1;border-radius:10px;background:white;font-weight:700;">Goal seeking</div>
    </div>
    <div style="font-size:1.6rem;text-align:center;">→</div>
    <div style="padding:18px;border:2px solid #475569;border-radius:12px;background:white;text-align:center;font-weight:800;">Priority arbiter<br><span style="font-weight:400;color:#64748b;">highest active layer wins</span></div>
    <div style="font-size:1.6rem;text-align:center;">→</div>
    <div style="padding:18px;border:2px solid #475569;border-radius:12px;background:white;text-align:center;font-weight:800;">Robot command</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;">
    <div style="padding:12px;border-radius:10px;background:white;border:1px solid #dbe3ec;"><strong>Fast because</strong><br>No global plan search is required.</div>
    <div style="padding:12px;border-radius:10px;background:white;border:1px solid #dbe3ec;"><strong>Preemption</strong><br>Urgent layers suppress lower-priority outputs immediately.</div>
    <div style="padding:12px;border-radius:10px;background:white;border:1px solid #dbe3ec;"><strong>BT integration</strong><br>Use as a low-latency safety layer beneath the task tree.</div>
  </div>
</div>

*Repository-authored structured overview rendered directly from Markdown HTML/CSS nodes; no SVG, Mermaid, or binary image asset is required.*

## Runtime idea

The runtime continually computes candidate behavior outputs. Arbitration selects the highest-priority active behavior, so no global search is required before issuing a command.

## Algorithm

```latex
\begin{algorithmic}[1]
\Require ordered behaviors $B_1,\dots,B_n$ from highest to lowest priority
\Require observation $o_t$
\Ensure selected command $u_t$
\State $o_t \gets \textsc{Observe}()$
\For{$i \gets 1$ to $n$}
  \State $(active,u) \gets B_i(o_t)$
  \If{$active$}
    \State \Return $u$ \Comment{higher layer suppresses lower layers}
  \EndIf
\EndFor
\State \Return $u_{default}$
\end{algorithmic}
```

## Relationship to Behavior Trees

Both BTs and subsumption can express priority and reactive preemption, but the representation is different. A BT makes priority part of hierarchical traversal and status propagation; subsumption emphasizes simultaneously available behaviors and output suppression. A BT is usually stronger for explicit task decomposition, whereas a subsumption layer can be attractive for very fast local reactions.

## When it is useful beside a BT

A BT can remain the mission/task executive while a reactive layer handles collision avoidance, emergency overrides, or other low-latency responses beneath or beside the tree.

## Related knowledge

- [Behavior Tree foundations](behavior-tree-foundations.md)
- [Behavior Trees in robotics](robotics-behavior-trees.md)
- [Fast decision architectures: additional resources](fast-decision-architectures.md)
