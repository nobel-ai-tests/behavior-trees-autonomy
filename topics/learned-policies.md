# Learned Policies

> **Role in this knowledge base.** Behavior Trees remain the core autonomy architecture studied here. This page is an additional resource for comparing BT execution with another fast decision-making mechanism and for identifying useful hybrid designs.

A learned policy moves much of the decision-design cost into training. At runtime, observations are mapped to actions through a learned function, often a neural network trained by imitation learning, reinforcement learning, or both.

<div role="img" aria-label="Learned policies structured overview" style="border:1px solid #cbd5e1;border-radius:14px;padding:20px;background:#f8fafc;margin:1.25rem 0;">
  <div style="font-weight:800;font-size:1.15rem;margin-bottom:4px;">Learned-policy execution graph</div>
  <div style="color:#64748b;margin-bottom:16px;">Training absorbs the design/search cost; deployment becomes a short observation-to-action pipeline.</div>
  <div style="display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;margin-bottom:18px;">
    <div style="padding:12px 16px;border:2px solid #64748b;border-radius:10px;background:white;font-weight:700;">Sensors</div>
    <div style="font-size:1.45rem;">→</div>
    <div style="padding:12px 16px;border:2px solid #64748b;border-radius:10px;background:white;font-weight:700;">Preprocess</div>
    <div style="font-size:1.45rem;">→</div>
    <div style="padding:12px 16px;border:2px solid #475569;border-radius:10px;background:white;font-weight:800;">Policy πθ</div>
    <div style="font-size:1.45rem;">→</div>
    <div style="padding:12px 16px;border:2px solid #64748b;border-radius:10px;background:white;font-weight:700;">Action</div>
    <div style="font-size:1.45rem;">→</div>
    <div style="padding:12px 16px;border:2px solid #64748b;border-radius:10px;background:white;font-weight:700;">Robot</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;">
    <div style="padding:12px;border-radius:10px;background:white;border:1px solid #dbe3ec;"><strong>Fast because</strong><br>Deployment may be only preprocessing plus one model forward pass.</div>
    <div style="padding:12px;border-radius:10px;background:white;border:1px solid #dbe3ec;"><strong>Main trade-off</strong><br>Runtime simplicity shifts complexity into data, training, and validation.</div>
    <div style="padding:12px;border-radius:10px;background:white;border:1px solid #dbe3ec;"><strong>BT integration</strong><br>Use the BT to gate, monitor, and recover learned skills.</div>
  </div>
</div>

*Repository-authored structured overview rendered directly from Markdown HTML/CSS nodes; no SVG, Mermaid, or binary image asset is required.*

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
