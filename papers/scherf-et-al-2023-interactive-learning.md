# Scherf et al. (2023) — Interactively Learning Behavior Trees from Imperfect Human Demonstrations

## Abstract

Introduction: In Interactive Task Learning (ITL), an agent learns a new task through natural interaction with a human instructor. Behavior Trees (BTs) offer a reactive, modular, and interpretable way of encoding task descriptions but have not yet been applied a lot in robotic ITL settings. Most existing approaches that learn a BT from human demonstrations require the user to specify each action step-by-step or do not allow for adapting a learned BT without the need to repeat the entire teaching process from scratch.

Method: We propose a new framework to directly learn a BT from only a few human task demonstrations recorded as RGB-D video streams. We automatically extract continuous pre- and post-conditions for BT action nodes from visual features and use a Backchaining approach to build a reactive BT. In a user study on how non-experts provide and vary demonstrations, we identify three common failure cases of an BT learned from potentially imperfect initial human demonstrations. We offer a way to interactively resolve these failure cases by refining the existing BT through interaction with a user over a web-interface. Specifically, failure cases or unknown states are detected automatically during the execution of a learned BT and the initial BT is adjusted or extended according to the provided user input.

Evaluation and results: We evaluate our approach on a robotic trash disposal task with 20 human participants and demonstrate that our method is capable of learning reactive BTs from only a few human demonstrations and interactively resolving possible failure cases at runtime.

*Verbatim abstract. The article is licensed CC BY 4.0.*

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
