# Content Authoring Instructions

This file defines the boundary between visible research content and repository/authoring metadata.

## Research-content rule

Topic pages, paper briefs, survey briefs, and other reader-facing research pages must contain only material that helps explain the research subject: definitions, methods, algorithms, evidence, limitations, comparisons, figures, experiments, related work, and citations.

Do not expose repository workflow, implementation constraints, tool limitations, authoring instructions, graph-organization rules, renderer choices, asset-format decisions, upload workarounds, or other process commentary inside the visible research narrative.

Examples of text that does **not** belong in visible topic or paper content:

- “Role in this knowledge base …”
- “Repository-authored …”
- explanations that a visual uses HTML/CSS, Mermaid, SVG, Canvas, or a particular asset format;
- statements that a figure was omitted, redrawn, rehosted, or linked because of repository/tool constraints;
- notes about what should be added to the repository later;
- instructions about how future agents/authors should structure, validate, or render the page;
- explanations of node categories, graph presets, or why a page exists in the repository.

## Where process information belongs

Put repository and authoring rules in root instruction files, repository-organization documents, or meta pages such as `notes/knowledge-graph-explorer.md`.

If provenance or an implementation caveat must remain adjacent to a research artifact for maintainability, store it as an HTML comment so it is not part of the visible reading flow, for example:

```html
<!-- provenance: explanatory pseudocode synthesized from the paper; not verbatim source text -->
```

Use visible provenance only when it is academically or legally necessary for the reader, and phrase it as normal source attribution rather than repository-process commentary.

## Paper briefs

Paper pages should read as research briefs. A normal visible structure is:

1. Abstract or analytical summary
2. Contribution / method
3. Quantitative evidence
4. Advantages and trade-offs
5. Limitations
6. Full-text links
7. Figures / overview / methodology
8. Contents
9. Technical discussion
10. Related work
11. Citation

Do not add a visible “Repository notes” section. Convert useful scholarly connections into “Related work” and move authoring/provenance details to comments or instruction/meta files.

If an abstract is summarized rather than reproduced verbatim, keep that authoring fact in a comment unless the distinction is necessary for scholarly attribution.

## Topic pages

Topic pages should explain the topic directly. Do not preface them with why the topic is present in the knowledge base, how it is categorized, or whether it is considered core/related/meta.

Cross-links should be presented as “Related topics,” “Related work,” or another research-facing label rather than “connections in this knowledge base.”

## Visuals

Visible captions and surrounding prose should explain what the visual means. They should not explain how the repository rendered it.

Renderer, file-format, asset, extraction, licensing-workflow, and implementation notes belong in `visualization_instruction.md`, repository/meta documentation, or hidden comments.

## Maintenance

When adding or revising reader-facing research content, review the rendered page for process leakage. If a sentence is mainly about the repository, the authoring process, a tool constraint, or an instruction from a maintainer rather than the subject itself, move or remove it before considering the page complete.
