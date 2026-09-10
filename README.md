# Behavior Trees in Autonomous Systems and Robotics

A living knowledge base for exploring behavior trees (BTs) in autonomous systems and robotics.

The repository collects and connects papers, implementation notes, conceptual summaries, comparisons, and references as the knowledge base develops.

## Start here

- [Behavior Tree Foundations](topics/behavior-tree-foundations.md) — what a behavior tree is, how its runtime semantics work, and how it differs from a machine-learning decision tree.
- [Knowledge Graph Explorer](notes/knowledge-graph-explorer.md) — graph model, manifest schema, presets, filters, layouts, inspector behavior, content behavior, and scaling guidance.
- [References](references.md) — consolidated bibliography with DOI, abstract-source, and accessible full-text links.

## Interactive knowledge graph

`index.html` is a graph-first GitHub Pages interface over the repository. It derives a network from `kb-manifest.json` and supports first-class nodes for topics/subtopics, general-knowledge pages, papers, keywords, authors, venues, years, and repository sections.

The page uses a full-width configuration bar above a resizable content/graph workspace. The content reader is the primary left pane and the graph is the exploration pane on the right. A **single click on any graph node brings its best available content into the left pane** while also selecting it for the inspector. Document-backed paper and knowledge nodes open their Markdown. Topic nodes show their description, subtopics/keywords, and related documents. Authors, keywords, venues, years, and sections generate a compact content view from their linked repository metadata.

The left content pane includes browser-style navigation. **Back** and **Forward** maintain independent stacks of up to 100 entries each, and the history strip shows up to the five most recent unique content items on one line for quick jumping. Opening new content pushes the previous page onto the Back stack and clears Forward, matching normal browser behavior. `Alt+Left` and `Alt+Right` provide keyboard Back/Forward navigation.

Selecting a graph node also populates the inspector with a one-line summary, its associated topic list, metadata, actions, and connections; connections are always presented last. Paper nodes expose Abstract and PDF actions when those resources are registered. For non-document entities such as authors, keywords, venues, years, and sections, inspector topics are derived from the documents associated with that entity.

The reading surface uses an academic serif typography stack and narrower measure, while navigation, filtering, and graph controls use a modern sans-serif interface. Rectangular UI elements use sharp corners, shadows are minimized, and the graph uses a light-theme palette with distinct restrained colors for topics, knowledge pages, papers, keywords, authors, venues, years, and sections.

The graph can be explored using concept, literature, paper, taxonomy, or all-entity presets. Controls expose node and relationship filters, search highlighting/focus, neighborhood depth, node limits, keyword-frequency pruning, multiple layouts, label density, connectivity-based sizing, and force-physics tuning.

## Structure

- `papers/` — notes on individual papers and technical publications
- `notes/` — working notes, questions, synthesis, and explorer documentation
- `topics/` — topic-focused Markdown pages
- `references.md` — consolidated bibliography and links
- `kb-manifest.json` — content manifest, graph taxonomy, document summaries, topic assignments, and paper resource URLs
- `index.html` — graph-first GitHub Pages entry point
- `assets/kb-graph.js` — manifest-to-graph model, filtering, layouts, and interaction
- `assets/kb-node-content.js` — single-click routing from graph nodes into the content pane
- `assets/kb-node-content.css` — generated node-content presentation
- `assets/kb-history.js` — 100-entry Back/Forward stacks and five-item recent-content navigation
- `assets/kb-history.css` — history bar and recent-item presentation
- `assets/kb-inspector.js` — summary/topic enrichment, paper resource actions, and inspector ordering
- `assets/kb-reader-links.js` — directory-aware Markdown and asset links in the reader
- `assets/kb-layout.js` — resizable content/graph layout and panel state
- `assets/kb.css` — responsive graph/explorer base presentation
- `assets/kb-inspector.css` — inspector-specific summary/topic presentation
- `assets/kb-academic.css` — academic reader typography, sharp-corner UI overrides, and light-theme graph palette

## Scope

Initial areas of interest include behavior-tree theory, planning and execution, reactive control, task and motion planning, learning-based approaches, verification and safety, human-robot interaction, and practical robotics implementations.

## Adding content

Add Markdown documents under `papers/`, `topics/`, or `notes/`, then register them in `kb-manifest.json`. The web explorer loads the manifest at runtime, constructs the graph, and renders referenced Markdown without a build step.

Every registered document should provide a concise `description` suitable for the inspector and one or more stable `topics` IDs. Also add `kind`, `shortTitle`, `keywords`, and—where applicable—`authors`, `year`, `venue`, `doi`, and `related`. Paper entries should additionally provide `abstractUrl` for the raw abstract source and `pdf` for the best lawful public reading copy when one is available.

Paper briefs follow the repository order documented in `papers/README.md`: Abstract first, then full-text access, reusable images/figures when appropriate, Contents, paper-derived material, repository-only notes near the bottom, and Citation as the final section. Do not copy copyrighted abstracts, figures, or full text when redistribution rights are unclear; link the source and summarize instead.

Stable conceptual hierarchy is declared under `graph.taxonomy`, and every taxonomy entry should have a one-sentence `description` so topic nodes always have content to display. See [Knowledge Graph Explorer](notes/knowledge-graph-explorer.md) for the schema and conventions.
