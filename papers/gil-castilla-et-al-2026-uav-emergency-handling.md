# Gil-Castilla, Maza & Ollero (2026) — UAV Actuation and Emergency Handling with Behavior Trees

## Abstract

This open-access paper presents a modular Behavior Tree framework for autonomous UAV inspection missions, with emphasis on heterogeneous platforms, scalable mission actuation, and deterministic emergency handling. The architecture integrates BTs with ROS-based UAV software, separates high-level decision logic from task execution, and gives emergency behaviors explicit priorities so nominal mission activity can be interrupted safely.

- [Raw abstract and full article](https://link.springer.com/article/10.1007/s10846-026-02367-z)

## Full text

- [Open-access PDF](https://link.springer.com/content/pdf/10.1007/s10846-026-02367-z.pdf)
- [DOI](https://doi.org/10.1007/s10846-026-02367-z)
- [Associated software repository](https://github.com/grvc-robotics-lab/grvc-bt)

## Contents

- Introduction and infrastructure-inspection motivation
- Related work in multi-UAV architectures and behavior trees
- Hardware and software architecture
- Integration with heterogeneous autopilot ecosystems
- Behavior-tree actuation layer
- Hierarchical emergency detection and response
- Simulation validation
- Real-world validation on inspection missions
- Conclusions

## Problem / motivation

Inspection UAVs must remain responsive to mission changes and emergency conditions while operating across different aircraft, autopilots, and sensing configurations. As mission complexity grows, monolithic state-machine logic becomes difficult to extend and to audit for deterministic safety responses.

## Contribution

The paper introduces a BT-based actuation layer for heterogeneous UAVs that separates reusable task execution from higher-level mission decision making. Emergency branches are organized hierarchically so more critical conditions can interrupt lower-priority nominal behavior in a deterministic way.

## Method

The architecture is implemented in the ROS ecosystem and designed to support MAVROS-compatible systems as well as DJI OSDK-compatible platforms. The authors compare the BT approach with state-machine-style mission logic and validate the system in simulation and real UAV inspection scenarios.

## Experimental setting

Validation covers autonomous inspection use cases with heterogeneous UAV platforms. The experiments exercise nominal mission execution as well as emergency detection and response, testing the architecture's adaptability across mission and hardware configurations.

## Key results / significance

The work demonstrates a contemporary field-robotics use of BTs where modularity is tied directly to operational safety and platform heterogeneity. It is particularly valuable for showing how prioritized BT branches can encode deterministic emergency behavior without entangling that logic with every nominal mission state.

## Repository notes

Core topics: aerial robotics, mission autonomy, fault tolerance, reactivity, robot software architecture, multi-robot systems, and robot control.

This paper extends the knowledge base beyond laboratory manipulation into infrastructure inspection and field deployment. It also provides a useful implementation link through the authors' associated open-source software.

The article is CC BY 4.0; its figures are generally reusable with attribution unless a figure carries a separate credit line. Specific figures can be added later to the aerial-robotics topic page when they materially improve the synthesis.

## Citation

Miguel Gil-Castilla, Ivan Maza, and Anibal Ollero. **A Modular and Scalable Framework for Autonomous Actuation and Emergency Handling with Behavior Trees for Unmanned Aerial Vehicles.** *Journal of Intelligent & Robotic Systems*, 112, Article 27, 2026. DOI: [10.1007/s10846-026-02367-z](https://doi.org/10.1007/s10846-026-02367-z).
