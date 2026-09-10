# Scherf et al. (2023) — Interactively Learning Behavior Trees from Imperfect Human Demonstrations

## Abstract

This open-access paper presents ILBERT, a framework that learns a behavior tree from a small number of human task demonstrations recorded as RGB-D video and then allows the learned tree to be repaired interactively during execution. The system extracts continuous preconditions and postconditions from visual features, constructs an initial BT using backchaining, detects execution-time failure cases, and refines the tree with additional user input.

- [Raw abstract and full article](https://www.frontiersin.org/journals/robotics-and-ai/articles/10.3389/frobt.2023.1152595/full)
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
