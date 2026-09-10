# Behavior Trees in Autonomous Systems and Robotics

A living knowledge base for exploring behavior trees (BTs) in autonomous systems and robotics.

The repository collects and connects papers, implementation notes, conceptual summaries, comparisons, and references as the knowledge base develops.

## Start here

- [Behavior Tree Foundations](topics/behavior-tree-foundations.md) — what a behavior tree is, how its runtime semantics work, and how it differs from a machine-learning decision tree.
- [References](references.md) — consolidated bibliography with DOI and accessible-source links.

## Structure

- `papers/` — notes on individual papers and technical publications
- `notes/` — working notes, questions, and synthesis
- `topics/` — topic-focused Markdown pages
- `references.md` — consolidated bibliography and links
- `kb-manifest.json` — content manifest used by the web index
- `index.html` — dynamic knowledge-base browser for GitHub Pages

## Scope

Initial areas of interest include behavior-tree theory, planning and execution, reactive control, task and motion planning, learning-based approaches, verification and safety, human-robot interaction, and practical robotics implementations.

This structure is intentionally minimal and will evolve with the literature.

## Adding content

Add Markdown documents under `papers/`, `topics/`, or `notes/`, then register them in `kb-manifest.json`. The GitHub Pages site loads the manifest at runtime and renders the referenced Markdown without a build step.
