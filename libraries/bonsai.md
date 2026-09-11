# Bonsai: Rust Behavior Tree Library

**Bonsai** is an open-source Behavior Tree implementation centered on Rust and distributed as the `bonsai-bt` crate, with Python bindings published under the same package name on PyPI. In this knowledge base it is represented as a **program library node**: the project is implementation/tooling evidence for the Behavior Tree core, not an alternative architecture.

Repository: https://github.com/Sollimann/bonsai

## What the library implements

Bonsai uses the familiar Behavior Tree result states `Success`, `Failure`, and `Running`. Its declarative `Behavior` representation includes sequencing and selection as well as control forms such as `If`, `Invert`, `While`, `WhileAll`, and several parallel operators including `WhenAll`, `WhenAny`, `Race`, and `After`.

The project makes a useful distinction between **Behavior** and **State**. A behavior is the declarative tree description; state tracks the executing instance. The `BT` runtime also carries shared blackboard-style state used by nodes during execution.

## Event and time semantics

A distinctive design choice is the discretized event loop. Update events carry a delta-time interval `dt`. When a process terminates before consuming the full interval, the remaining time can be passed to the next process. This makes time consumption part of execution semantics rather than treating a tick as only a timeless traversal.

The documentation also calls out *instant actions*: an update action that consumes no delta time can participate in an infinite loop unless a time-consuming behavior such as `Wait` breaks the cycle.

## Parallel behavior

Bonsai places substantial emphasis on parallel semantics. Operators such as `WhenAll`, `WhenAny`, `Race`, and `After` let multiple processes be represented together while expressing different completion dependencies. The documentation notes that parallel semantics are deterministic at the behavior level but cannot perfectly reproduce sub-timestep ordering when simulated on a single thread; physical/world simulation should remain the authority for events whose exact temporal ordering matters.

## Long-running work and responsiveness

The project recommends that tree actions return quickly so traversal is not blocked. Long-running synchronous or asynchronous work can be dispatched to background threads and queried through channels, allowing the BT runtime to remain responsive while the external task continues.

## Rust and Python surface

The repository is a Cargo workspace containing the Rust library, examples, and `bonsai-py`. The Rust package metadata describes `bonsai-bt` as an MIT-licensed Behavior Tree crate and includes an optional `visualize` feature backed by graph/serialization/WebSocket dependencies. The project README documents both Cargo and `pip install bonsai-bt` installation paths.

## Why it matters to this knowledge base

Bonsai is useful as a concrete implementation reference for several concepts covered in the foundations pages: status propagation, control-flow composition, blackboard/shared state, responsiveness of long-running actions, and parallel execution semantics. Its explicit event/delta-time model is also useful when comparing abstract BT tick semantics with a real runtime that must account for elapsed simulation/control time.

## Minimal conceptual execution algorithm

```latex
\begin{algorithmic}[1]
\Require behavior tree $T$, execution state $S$, blackboard $B$, event $e(dt)$
\Ensure status and updated execution state
\State $(status, dt_{remaining}, S) \gets \textsc{Tick}(T,S,B,e(dt))
\If{$status \in \{Success,Failure\}$ and $dt_{remaining}>0$}
  \State propagate the status to the parent control operator
  \State continue eligible successor behavior with $dt_{remaining}$
\EndIf
\If{$status = Running$}
  \State preserve $S$ for the next event/update
\EndIf
\State \Return $(status,S)$
\end{algorithmic}
```

This is a knowledge-base abstraction of the runtime idea, not source code copied from Bonsai.

## Source notes

- Project README: installation, status semantics, operators, and guidance for long-running work.
- `docs/concepts/README.md`: BT fundamentals, Behavior-versus-State distinction, parallel semantics, events, delta time, and instant actions.
- `bonsai/Cargo.toml`: current package metadata, license, Rust version, and optional visualization feature.

## Related knowledge

- [Behavior Tree Foundations](../topics/behavior-tree-foundations.md)
- [Behavior Trees in Robotics](../topics/robotics-behavior-trees.md)
- [Finite-State Machines and Hierarchical FSMs](../topics/finite-state-machines.md)
