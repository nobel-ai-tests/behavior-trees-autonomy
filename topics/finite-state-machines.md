# Finite-State Machines and Hierarchical FSMs

> **Role in this knowledge base.** Behavior Trees remain the core autonomy architecture studied here. This page is an additional resource for comparing BT execution with another fast decision-making mechanism and for identifying useful hybrid designs.

An FSM makes a fast decision by maintaining one active discrete state and evaluating transition guards. A hierarchical FSM reduces some structural growth by allowing a state to contain substates.

<div role="img" aria-label="Finite-State Machines and Hierarchical FSMs structured overview" style="border:1px solid #cbd5e1;border-radius:14px;padding:20px;background:#f8fafc;margin:1.25rem 0;">
  <div style="font-weight:800;font-size:1.15rem;margin-bottom:4px;">FSM / HFSM execution graph</div>
  <div style="color:#64748b;margin-bottom:16px;">Fast decisions through explicit state, guard evaluation, and deterministic transitions.</div>
  <div style="display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;margin-bottom:18px;">
    <div style="padding:12px 16px;border:2px solid #64748b;border-radius:10px;background:white;font-weight:700;">Observe</div>
    <div style="font-size:1.45rem;">→</div>
    <div style="padding:12px 16px;border:2px solid #64748b;border-radius:10px;background:white;font-weight:700;">Active state</div>
    <div style="font-size:1.45rem;">→</div>
    <div style="padding:12px 16px;border:2px solid #64748b;border-radius:10px;background:white;font-weight:700;">Check guards</div>
    <div style="font-size:1.45rem;">→</div>
    <div style="padding:12px 16px;border:2px solid #64748b;border-radius:10px;background:white;font-weight:700;">Transition</div>
    <div style="font-size:1.45rem;">→</div>
    <div style="padding:12px 16px;border:2px solid #64748b;border-radius:10px;background:white;font-weight:700;">Execute state</div>
    <div style="font-size:1.45rem;">↺</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;">
    <div style="padding:12px;border-radius:10px;background:white;border:1px solid #dbe3ec;"><strong>Fast because</strong><br>Boolean guards and bounded transition checks.</div>
    <div style="padding:12px;border-radius:10px;background:white;border:1px solid #dbe3ec;"><strong>HFSM extension</strong><br>Composite states contain nested substates.</div>
    <div style="padding:12px;border-radius:10px;background:white;border:1px solid #dbe3ec;"><strong>BT integration</strong><br>Use an FSM below a BT leaf for local mode switching.</div>
  </div>
</div>

*Repository-authored structured overview rendered directly from Markdown HTML/CSS nodes; no SVG, Mermaid, or binary image asset is required.*

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
