# Quinlan (1986) — Induction of Decision Trees

## Abstract

*Analytical abstract — repository-authored because the source does not provide clear permission to reproduce the complete publisher abstract verbatim.*

**Contribution / method.** The paper presents ID3 as a practical procedure for inducing classification decision trees from labeled examples. At each internal node, candidate attributes are evaluated using information gain, the selected test partitions the examples, and the process recurses until a classification can be assigned. The paper also develops modifications for noisy labels/attributes and unknown values, including statistical stopping based on a chi-square relevance test and weighted branching when a queried attribute is missing.

**Quantitative evidence.** A central robustness study uses 551 objects with 39 binary-valued attributes and repeats each corruption condition 20 times. With 5% noise, reported classification error is 1.3% when one attribute is corrupted, 11.9% when all attributes are corrupted, and 2.6% when class information is corrupted. At 100% noise those errors become 10.8%, 25.9%, and 49.6%, respectively. For missing data, a 10% ignorance level still yields nearly 90% correct classification when both training and test descriptions contain missing values. In a separate single-missing-value comparison, decision-tree-based imputation produces error rates of 19%, 22%, and 19% on three important attributes versus 28%, 27%, and 38% for the Bayesian method and 28%, 27%, and 40% for always using the most common value.

**Advantages.** ID3 provides an interpretable greedy induction procedure that can convert examples into explicit classification rules without manual rule elicitation. The experiments show graceful rather than catastrophic degradation under moderate noise and missingness, and the chi-square stopping rule helps suppress branches that merely fit random variation. Weighted traversal for unknown values also avoids treating “unknown” as an ordinary categorical value, which the paper shows can perversely make an attribute appear more informative.

**Disadvantages / trade-offs.** The information-gain criterion is biased toward attributes with many possible values: splitting an attribute into finer categories can increase measured gain even when the extra distinctions carry no real predictive value. Noise can create spurious tree complexity, while a relevance threshold strong enough to suppress noise can also reject genuinely useful attributes; the paper therefore uses statistical testing rather than a simple gain threshold. Missing-value handling remains imperfect—the contextual decision-tree imputation method still misidentifies roughly one fifth of the tested unknown values—and stronger noise handling can trade model detail for robustness by stopping growth earlier.

**Limitations.** ID3 is greedy and locally optimizes the next split, so it does not guarantee a globally smallest or most accurate tree. Much of the numerical analysis is based on a specific 551-example, 39-binary-attribute task, making the reported noise and missing-data curves dataset-dependent rather than universal. The treatment focuses primarily on categorical classification and predates modern practices such as large train/validation/test benchmarks, cross-validation protocols at scale, calibrated probabilistic prediction, fairness analysis, and computational comparisons against ensembles or other modern learners. The many-valued-attribute bias is identified but not fully resolved within the basic ID3 criterion, and the stopping/missing-value methods depend on heuristics and statistical assumptions. For this repository, the paper should therefore be used as the canonical foundation for predictive decision-tree induction, not as a modern performance baseline and not as evidence about behavior-tree execution semantics.

[Source abstract via Springer](https://doi.org/10.1007/BF00116251).

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
