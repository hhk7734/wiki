# Docs Agent Guide

## Scope

- `docs/` is an ontology-first documentation tree.
- Agent-only instructions live in this file and should not be published as site docs.

## Ontology Layout

- Store end-user documentation under ontology roles such as `entity/`, `concept/`, `operation/`, `specification/`, `troubleshooting/`, and `comparison/`.
- Keep file moves and link rewrites consistent with `ontology/classification-registry.json` and the scripts under `script/ontology/`.

## Authoring Rules

- Use Korean for prose in `docs/**/*.mdx`.
- Use English for code blocks, commands, and configuration snippets.
- Keep `id` equal to the filename without the extension.
- Prefer `/docs/...` links for cross-doc references.
- Keep reference blocks, Mermaid diagrams, tabs, and other Docusaurus features consistent with the repository conventions in the root `AGENTS.md`.

## Agent Notes

- Do not treat this file as ontology content.
- If you add or move docs, rerun the ontology validation and link-rewrite checks before completion.
