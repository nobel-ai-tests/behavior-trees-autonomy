# Fast Decision Architectures: Additional Resources Around Behavior Trees

**Behavior Trees are the core subject of this knowledge base.** The pages in this branch of the graph are additional resources: they show other ways a robot can make low-latency decisions and make it easier to see what a BT contributes, what it does not replace, and which mechanisms are useful inside BT leaf skills or safety layers.

The five comparison families represented here are finite-state machines and hierarchical FSMs, reactive/subsumption architectures, utility-based action selection, learned policies, and Model Predictive Control. They span discrete switching, layered reaction, numerical arbitration, learned inference, and online optimization.

These are not mutually exclusive alternatives. Common hybrid systems use a BT for interpretable mission and task execution, an MPC or learned controller for motion, and an independent reflex or reactive safety layer for hard real-time intervention.

## Comparison axis

| Architecture | Online decision primitive | Typical scope | Natural BT relationship |
| --- | --- | --- | --- |
| FSM / HFSM | state transition | task/mode switching | direct structural comparison |
| Reactive / subsumption | priority suppression | local reaction | safety or low-level reactive layer |
| Utility selection | maximize action score | arbitration | utility selector or skill chooser |
| Learned policy | model inference | perception-to-action skill | leaf/subtree policy |
| MPC | short-horizon optimization | continuous control | controller behind a BT action |

## Resources

- [Finite-State Machines and Hierarchical FSMs](finite-state-machines.md)
- [Reactive Architectures and Subsumption](reactive-architectures-subsumption.md)
- [Utility-Based Action Selection](utility-action-selection.md)
- [Learned Policies](learned-policies.md)
- [Model Predictive Control](model-predictive-control.md)
