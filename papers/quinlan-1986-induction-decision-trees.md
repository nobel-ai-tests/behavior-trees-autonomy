# Quinlan (1986) — Induction of Decision Trees

## Citation

J. R. Quinlan. **Induction of Decision Trees.** *Machine Learning*, 1, 81–106, 1986. DOI: [10.1007/BF00116251](https://doi.org/10.1007/BF00116251).

## Problem / motivation

The paper studies how a predictive decision tree can be induced from examples and presents the ID3 system in detail. It is a canonical source for the machine-learning meaning of "decision tree."

## Decision-tree contribution

A decision tree recursively partitions examples using tests on attributes/features. Traversing the learned tests routes an input toward a leaf that represents an inferred classification. Quinlan connects split selection to information-theoretic criteria and discusses noisy or incomplete data.

## Why it belongs in a behavior-tree knowledge base

Behavior trees and decision trees share a branching tree shape, so newcomers often assume they are variants of the same mechanism. Quinlan provides the contrasting baseline:

- the decision tree is learned from examples for **inference/prediction**;
- internal nodes perform feature tests;
- evaluation normally ends at a prediction leaf;
- there is no inherent `Running` status or lifecycle for an executing action.

A behavior tree, by contrast, is normally embedded in an agent's execution loop and composes conditions/actions using control-flow semantics.

## Key significance

This paper is useful for making the comparison precise rather than relying on visual intuition. It also prevents conflating a robotics behavior executive with a supervised-learning classifier.

## Limitations for this comparison

"Decision tree" has other meanings in decision analysis and planning. Quinlan specifically represents the machine-learning/classification tradition; comparisons should name the intended decision-tree formalism.

## Connections to other work

- Breiman et al. (1984), *Classification and Regression Trees*, is another foundational reference and extends the tree methodology to both classification and regression.
- Colledanchise & Ögren (2017) formally discuss how behavior trees can generalize decision-tree structures in a hybrid-control setting.
