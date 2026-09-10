# Behavior Trees in Autonomous Systems and Robotics

A living knowledge base for exploring behavior trees (BTs) in autonomous systems and robotics.

The repository collects and connects papers, implementation notes, conceptual summaries, comparisons, and references as the knowledge base develops.

## Start here

- [Behavior Tree Foundations](topics/behavior-tree-foundations.md) — what a behavior tree is, how its runtime semantics work, and how it differs from a machine-learning decision tree.
- [Knowledge Graph Explorer](notes/knowledge-graph-explorer.md) — graph model, manifest schema, presets, filters, layouts, inspector behavior, and scaling guidance.
- [References](references.md) — consolidated bibliography with DOI and accessible-source links.

## Interactive knowledge graph

`index.html` is a graph-first GitHub Pages interface over the repository. It derives a network from `kb-manifest.json` and supports first-class nodes for topics/subtopics, general-knowledge pages, papers, keywords, authors, venues, years, and repository sections.

The page uses a full-width configuration bar above a resizable content/graph workspace. The Markdown reader is the primary content pane and the graph is the exploration pane. Selecting a graph node populates the inspector with a one-line summary, its associated topic list, metadata, actions, and connections; connections are always presented last. For non-document entities such as authors, keywords, venues, years, and sections, inspector topics are derived from the documents associated with that entity.

The graph can be explored using concept, literature, paper, taxonomy, or all-entity presets. Controls expose node and relationship filters, search highlighting/focus, neighborhood depth, node limits, keyword-frequency pruning, multiple layouts, label density, connectivity-based sizing, and force-physics tuning.

## Structure

- `papers/` — notes on individual papers and technical publications
- `notes/` — working notes, questions, synthesis, and explorer documentation
- `topics/` — topic-focused Markdown pages
- `references.md` — consolidated bibliography and links
- `kb-manifest.json` — content manifest, graph taxonomy, document summaries, and topic assignments
- `index.html` — graph-first GitHub Pages entry point
- `assets/kb-graph.js` — manifest-to-graph model, filtering, layouts, and interaction
- `assets/kb-inspector.js` — summary/topic enrichment and inspector ordering
- `assets/kb-reader-links.js` — directory-aware Markdown and asset links in the reader
- `assets/kb-layout.js` — resizable content/graph layout and panel state
- `assets/kb.css` — responsive graph/explorer presentation
- `assets/kb-inspector.css` — inspector-specific summary/topic presentation

## Scope

Initial areas of interest include behavior-tree theory, planning and execution, reactive control, task and motion planning, learning-based approaches, verification and safety, human-robot interaction, and practical robotics implementations.

## Adding content

Add Markdown documents under `papers/`, `topics/`, or `notes/`, then register them in `kb-manifest.json`. The web explorer loads the manifest at runtime, constructs the graph, and renders referenced Markdown without a build step.

Every registered document should provide a concise `description` suitable for the inspector and one or more stable `topics` IDs. Also add `kind`, `shortTitle`, `keywords`, and—where applicable—`authors`, `year`, `venue`, `doi`, and `related`. Stable conceptual hierarchy is declared under `graph.taxonomy`, and taxonomy entries should also have a one-sentence `description`. See [Knowledge Graph Explorer](notes/knowledge-graph-explorer.md) for the schema and conventions.
