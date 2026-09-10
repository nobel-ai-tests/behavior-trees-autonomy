# Quinlan (1986) — Induction of Decision Trees

## Abstract

The paper explains a practical methodology for inducing decision trees from examples, presents ID3 in detail, studies noisy and incomplete information, compares remedies for a known weakness of the basic method, and closes with directions for further research.

[Read the source abstract via the Springer DOI page](https://doi.org/10.1007/BF00116251).

## Full text

- [Publicly hosted reading copy at Oregon State University](https://web.engr.oregonstate.edu/~xfern/classes/cs434/decisiontree-quinlan.pdf)
- [Springer version of record](https://doi.org/10.1007/BF00116251)

## Contents

- Inductive learning from examples
- Decision-tree representation
- The ID3 system
- Information-based attribute selection
- Worked examples
- Noise and incomplete attribute values
- Weaknesses of the basic method
- Modifications and remedies
- Further research directions

## Problem / motivation

The paper studies how a predictive decision tree can be induced from examples and presents the ID3 system in detail. It is a canonical source for the machine-learning meaning of “decision tree.”

## Decision-tree contribution

A decision tree recursively partitions examples using tests on attributes or features. Traversing the learned tests routes an input toward a leaf that represents an inferred classification. Quinlan connects split selection to information-theoretic criteria and discusses noisy or incomplete data.

## Method

The paper develops the ID3 induction procedure, illustrates its attribute-selection heuristic through examples, and examines practical complications such as noise, missing information, and limitations of the basic selection criterion.

## Key results / significance

The work established a widely influential decision-tree induction framework and helped make information-based recursive partitioning a standard machine-learning approach.

## Repository notes

This paper is included to provide a precise comparison point for behavior trees. A machine-learning decision tree performs inference or prediction from feature tests, whereas a behavior tree is normally embedded in an agent execution loop and composes conditions and actions using control-flow semantics.

“Decision tree” also has meanings in decision analysis and planning. This note uses Quinlan specifically as the machine-learning and classification baseline.

The paper contains decision-tree examples and diagrams in the linked reading copy. Those figures are not rehosted here unless reuse rights are clear.

Connections in this knowledge base:

- Breiman et al. (1984), *Classification and Regression Trees*, is another foundational reference covering classification and regression trees.
- Colledanchise & Ögren (2017) formally discuss how behavior trees can generalize decision-tree structures in a hybrid-control setting.

## Citation

J. R. Quinlan. **Induction of Decision Trees.** *Machine Learning*, 1, 81–106, 1986. DOI: [10.1007/BF00116251](https://doi.org/10.1007/BF00116251).
