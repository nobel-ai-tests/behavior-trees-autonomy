# Knowledge Graph Explorer

The GitHub Pages index is an interactive graph over the Markdown knowledge base. It is intentionally driven by `kb-manifest.json`: adding or enriching a document changes the graph without requiring a build step.

## Graph model

The explorer currently recognizes these node types:

- **Topic / subtopic** — conceptual taxonomy nodes declared under `graph.taxonomy`.
- **General knowledge** — synthesis pages, notes, overviews, and references.
- **Paper** — publication notes with bibliographic metadata.
- **Keyword** — tags and explicit keywords attached to taxonomy nodes or documents.
- **Author** — people listed on papers.
- **Venue** — conferences, journals, books, or other publication venues.
- **Year** — publication year nodes.
- **Section** — repository-level sections such as Topics, Papers, Notes, and References.

The explorer currently recognizes these relationship types:

- `subtopic` — parent topic → child topic.
- `contains` — section → document.
- `about` — document → conceptual topic.
- `keyword` — document/topic → keyword.
- `authored-by` — paper → author.
- `published-in` — paper → venue.
- `published` — paper → year.
- `related` — explicit document ↔ document connection.

## Manifest configuration

Top-level graph configuration is optional:

```json
{
  "graph": {
    "defaults": {
      "preset": "concepts",
      "depth": 2,
      "maxNodes": 160,
      "minKeywordFrequency": 1,
      "linkDistance": 80,
      "charge": -190
    },
    "taxonomy": [
      {
        "id": "foundations",
        "title": "Foundations",
        "parent": "behavior-trees",
        "description": "Core behavior-tree concepts.",
        "keywords": ["formalism", "semantics"]
      }
    ]
  }
}
```

Each document can remain minimal (`title`, `path`, `tags`) or provide richer graph metadata:

```json
{
  "title": "Example paper",
  "shortTitle": "Author et al. (2026)",
  "path": "papers/example.md",
  "kind": "paper",
  "description": "One-sentence graph/inspector summary.",
  "authors": ["First Author", "Second Author"],
  "year": 2026,
  "venue": "Example Conference",
  "doi": "10.xxxx/example",
  "topics": ["foundations", "robot-control"],
  "keywords": ["reactivity", "planning"],
  "related": ["topics/foundations.md"],
  "tags": ["robotics", "control"]
}
```

### Field behavior

`kind` determines whether a document is rendered as a paper or general-knowledge node. Documents in the `papers` section default to paper if `kind` is omitted; other sections default to general knowledge.

`topics` should reference stable taxonomy IDs. If an ID has not yet been declared in `graph.taxonomy`, the explorer still creates a topic node, so metadata can be added incrementally.

`keywords` are merged with `tags`. Use `tags` for repository/search classification and `keywords` for graph concepts when the distinction is useful.

`related` contains repository Markdown paths and creates explicit document-to-document relationships. Use it for meaningful conceptual or lineage connections rather than every citation.

`authors`, `venue`, `year`, and `doi` are primarily useful for papers. The first three become graph nodes; DOI becomes an external action in the node inspector.

## Explorer configuration levels

The UI exposes several layers of control so the same corpus can support different research questions.

### Semantic layer

Choose which entity types and relationship types are visible. This is the most important control for changing the meaning of the graph. For example, a paper-author map is very different from a topic-keyword map even though both use the same underlying corpus.

### Exploration layer

Search can either highlight matches in the current network or become a focus operation that shows matching nodes plus their neighbors. Neighborhood depth ranges from one to five hops. Selecting any node can also constrain the graph to its local neighborhood.

### Complexity layer

`Maximum nodes` caps visual density after filters are applied. `Minimum keyword docs` suppresses one-off keywords and is useful as the corpus grows.

### Layout layer

- **Force network** emphasizes naturally connected clusters.
- **Radial rings** separates entity classes into concentric regions.
- **Layered entities** pushes topics, documents, authors/keywords, and publication metadata into approximate semantic columns.

Labels can be shown for all nodes, hidden entirely, or shown in a smart mode that favors important conceptual/document nodes plus the current selection and search matches. Node radius can be fixed by type or scaled by connectivity.

### Physics layer

Link distance changes graph spread. Repulsion controls how strongly nodes push away from one another. These controls are most useful in force and radial layouts.

## Built-in presets

- **Concept map** — topics, knowledge pages, papers, and keywords.
- **Literature** — topics, papers, authors, venues, and years.
- **Papers** — bibliographic network centered on publications.
- **Taxonomy** — conceptual hierarchy plus keywords.
- **Everything** — all graph entities and relationship classes.

Presets are starting points. Any individual control can be changed afterward.

## Interaction model

Click a node to inspect its metadata and connected nodes. Double-click a paper or general-knowledge node to open its Markdown page. The inspector also provides an explicit **Open document** action and DOI/source action when present.

The graph supports drag, pan, zoom, fit-to-view, keyboard search (`/`), and an integrated Markdown reader. Markdown is rendered with `marked` and sanitized with DOMPurify.

## Scaling the knowledge base

As the repository grows, prefer a stable taxonomy with relatively few durable topic IDs, then attach many papers and synthesis pages to those topics. Keywords can remain more granular and numerous. This keeps the topic layer interpretable while allowing detailed exploration through keyword, author, venue, and citation-like relationships.

For substantially larger corpora, likely follow-on improvements are full-text indexing, citation edges extracted from references, clustering/community detection, saved graph views in the URL, and precomputed graph data generated from Markdown front matter rather than manually maintaining all metadata in the manifest.
