# Behavior Trees in Autonomous Systems and Robotics

A living knowledge base for exploring behavior trees (BTs) in autonomous systems and robotics.

The repository collects and connects papers, implementation notes, conceptual summaries, comparisons, and references as the knowledge base develops.

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
