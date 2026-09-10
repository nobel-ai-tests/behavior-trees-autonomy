# Scherf et al. (2023) — Interactively Learning Behavior Trees from Imperfect Human Demonstrations

## Abstract

Introduction: In Interactive Task Learning (ITL), an agent learns a new task through natural interaction with a human instructor. Behavior Trees (BTs) offer a reactive, modular, and interpretable way of encoding task descriptions but have not yet been applied a lot in robotic ITL settings. Most existing approaches that learn a BT from human demonstrations require the user to specify each action step-by-step or do not allow for adapting a learned BT without the need to repeat the entire teaching process from scratch.

Method: We propose a new framework to directly learn a BT from only a few human task demonstrations recorded as RGB-D video streams. We automatically extract continuous pre- and post-conditions for BT action nodes from visual features and use a Backchaining approach to build a reactive BT. In a user study on how non-experts provide and vary demonstrations, we identify three common failure cases of an BT learned from potentially imperfect initial human demonstrations. We offer a way to interactively resolve these failure cases by refining the existing BT through interaction with a user over a web-interface. Specifically, failure cases or unknown states are detected automatically during the execution of a learned BT and the initial BT is adjusted or extended according to the provided user input.

Evaluation and results: We evaluate our approach on a robotic trash disposal task with 20 human participants and demonstrate that our method is capable of learning reactive BTs from only a few human demonstrations and interactively resolving possible failure cases at runtime.

*Verbatim abstract. The article is licensed CC BY 4.0.*

**Contribution / method.** The paper introduces ILBERT, an interactive learning-from-demonstration pipeline that records RGB-D demonstrations, segments them into high-level actions, learns continuous preconditions and postconditions from visual features, constructs a BT through backchaining, detects execution-time precondition/postcondition failures or unknown states, and then asks the user for targeted corrective input instead of discarding the whole learned task. The core contribution is therefore not only initial BT induction but an explicit repair loop for imperfect demonstrations.

**Quantitative evidence.** The authors first ran a pilot study with **22 participants**, each asked to demonstrate the task **three times**, to characterize how non-experts vary demonstrations and to identify **three recurring failure classes**. The main evaluation used **20 participants**, again with three demonstrations per participant. In the automated pipeline, action/feature processing failed for **10 of 20 participants** strongly enough to prevent correct BT construction; with manually corrected action labels, condition computation and BT construction succeeded for **14 of 20 participants**. During the interactive execution phase, task completion and failure resolution succeeded for **all 20 participants**, but a fallback BT was used when a learned BT could not be built. Only **4 of 20 participants** included the trashcan lid interaction in their demonstrations, illustrating how sparse demonstrations can omit necessary task structure.

**Advantages.** ILBERT keeps the learned policy interpretable and editable because the task representation remains a BT rather than an opaque end-to-end policy. The repair mechanism is targeted: a user can widen a condition, correct a postcondition, or demonstrate a missing action only when the relevant failure appears. That reduces the need to repeat complete teaching sessions and naturally exploits BT reactivity—conditions are rechecked during execution and repaired subtrees can be reused later.

**Disadvantages / trade-offs.** The approach pushes substantial responsibility onto perception, action segmentation, and condition extraction. A BT can only be as reliable as the visual features and labels from which its action model is inferred, and the reported failures show that upstream perception/classification errors can prevent tree construction entirely. Interactive repair also means the system is not fully autonomous: a user must diagnose or answer prompts when novel states occur. Continuous pre/postcondition ranges derived from few demonstrations can be either too narrow, causing false failures, or too broad, admitting unsafe or semantically incorrect states.

**Limitations.** The evaluation is centered on one tabletop trash-disposal task with one robot platform, so it does not establish performance on longer-horizon, multi-object, contact-rich, mobile-manipulation, or multi-robot tasks. The headline 20/20 execution result should not be interpreted as an end-to-end 100% learning success rate because fallback trees were used when the learned pipeline failed, and manual action labels were used in a separate analysis to isolate later stages. The study size is modest, participants are mostly young adults with limited prior robot experience, and there is no strong quantitative baseline against alternative interactive task-learning methods. The method also assumes that relevant task state can be captured by the chosen RGB-D features and continuous condition ranges; hidden state, force/torque variables, ambiguous demonstrations, and safety-critical constraints may require richer models. Finally, repeated human intervention is a practical cost that the paper demonstrates but does not optimize or benchmark over long-term deployment.

- [Source abstract and full article](https://www.frontiersin.org/journals/robotics-and-ai/articles/10.3389/frobt.2023.1152595/full)
- [PubMed Central copy](https://pmc.ncbi.nlm.nih.gov/articles/PMC10368948/)

## Full text

- [Frontiers PDF](https://www.frontiersin.org/journals/robotics-and-ai/articles/10.3389/frobt.2023.1152595/pdf)
- [DOI](https://doi.org/10.3389/frobt.2023.1152595)

## Contents

- Introduction and interactive task learning motivation
- Background on behavior trees and learning from demonstration
- RGB-D demonstration capture and feature extraction
- High-level action segmentation
- Learning continuous action preconditions and postconditions
- Backchaining construction of the initial BT
- Failure detection during robot execution
- Interactive BT refinement and extension
- User-study evaluation on robotic trash disposal
- Conclusions and future work

## Problem / motivation

Robots intended for everyday or flexible settings cannot be preprogrammed for every task variation. Learning from demonstration reduces programming effort, but demonstrations from non-expert users may be sparse or imperfect and can leave a learned policy brittle when it encounters states that were never shown during teaching.

## Contribution

The paper combines demonstration learning with the modular editability of behavior trees. It automatically derives action conditions from demonstrations, uses backchaining to form a reactive tree, and adds a human-in-the-loop repair mechanism for states or failures encountered later.

## Method

Human demonstrations are recorded as RGB-D streams. Visual features are used to segment demonstrations into high-level actions and to estimate continuous preconditions and postconditions. These action models drive backchaining to generate the BT. During execution, detected failure cases can be resolved through a web interface and additional user input, updating the tree rather than relearning the task from scratch.

## Experimental setting

The approach is evaluated on a robotic trash-disposal task with 20 participants. The study examines how non-experts vary demonstrations and whether interactive refinement can repair the resulting failure cases during execution.

## Key results / significance

The work demonstrates that BTs can serve as an editable intermediate program representation between human demonstration and robot execution. That is important for HRI because the learned policy remains structured enough for targeted correction when a demonstration did not cover the full state space.

## Repository notes

Core topics: learning from demonstration, robot learning, human-robot interaction, behavior synthesis, robot manipulation, fault tolerance, and robot control.

This paper connects planning-based BT generation with interactive robot learning: the backchaining machinery remains recognizable, but the action conditions are learned from demonstrations instead of being supplied entirely by a domain engineer.

The article is CC BY and contains diagrams, algorithms, and experiment figures. They remain in the linked source for now; specific figures can later be embedded with attribution if they materially improve a topic synthesis.

## Citation

Lisa Scherf, Aljoscha Schmidt, Suman Pal, and Dorothea Koert. **Interactively learning behavior trees from imperfect human demonstrations.** *Frontiers in Robotics and AI*, 10:1152595, 2023. DOI: [10.3389/frobt.2023.1152595](https://doi.org/10.3389/frobt.2023.1152595).
