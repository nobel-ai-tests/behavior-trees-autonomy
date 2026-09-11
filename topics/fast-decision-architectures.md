# Fast Decision Architectures in Robotics

Fast robotic decision making can be implemented through several architectural families with different representations, timing assumptions, and control scopes. Finite-state machines and hierarchical FSMs use discrete state transitions; reactive and subsumption systems use prioritized sensor-to-action behaviors; utility systems score competing actions; learned policies map observations to actions through trained models; and Model Predictive Control repeatedly solves a constrained short-horizon optimization problem.

These mechanisms are not mutually exclusive. A robot may use a Behavior Tree for interpretable mission and task execution, MPC or a learned controller for motion, and an independent reflex or reactive safety layer for low-latency intervention.

## Comparison axis

| Architecture | Online decision primitive | Typical scope | Natural BT relationship |
| --- | --- | --- | --- |
| FSM / HFSM | state transition | task/mode switching | direct structural comparison |
| Reactive / subsumption | priority suppression | local reaction | safety or low-level reactive layer |
| Utility selection | maximize action score | arbitration | utility selector or skill chooser |
| Learned policy | model inference | perception-to-action skill | leaf/subtree policy |
| MPC | short-horizon optimization | continuous control | controller behind a BT action |

## Related topics

- [Finite-State Machines and Hierarchical FSMs](finite-state-machines.md)
- [Reactive Architectures and Subsumption](reactive-architectures-subsumption.md)
- [Utility-Based Action Selection](utility-action-selection.md)
- [Learned Policies](learned-policies.md)
- [Model Predictive Control](model-predictive-control.md)
