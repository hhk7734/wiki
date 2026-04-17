# Graphify Ontology Export Design

Date: 2026-04-17

## Goal

Export the repository ontology into a graphify-ingestible JSONL shape that supports:

- sentence-style search over document text
- ontology-aware filtering by role, domain, class, instance, and aspect
- graph expansion from a document to its canonical subject

## Source of Truth

- `docs/**/*.mdx`
- frontmatter blocks such as `ontology`, `subject`, and `relations`
- `ontology/classification-registry.json`

## Export Shape

The export uses three record types:

1. `document`
2. `subject`
3. `relation`

### Document

One record per MDX file.

Includes:

- repo path
- docs URL
- title, description, keywords
- normalized ontology block
- extracted headings
- normalized searchable text
- reference to the canonical subject

### Subject

One record per unique `domain/class/instance`.

Includes:

- canonical subject id
- ontology anchor fields
- canonical name
- aliases
- reverse references to document ids

### Relation

Initial implementation guarantees:

- `document -> subject` via `about_subject`

Optional frontmatter relations can be added later once relation resolution rules are stable.

## Search Strategy

Graphify should index `document.text` as the primary sentence-search field.

Recommended query flow:

1. sentence search over document text
2. filter or rerank by ontology fields
3. expand to connected subject records

## Extraction Rules

- strip frontmatter before indexing body text
- keep headings separately
- flatten MDX syntax into readable plain text
- keep code snippets in text, but normalize formatting
- replace markdown links with anchor text
- remove MDX component tags and imports

## Validation

Success means:

- every classified MDX yields exactly one `document` record
- every `document` has exactly one `subject_ref`
- every unique `domain/class/instance` yields one `subject`
- every `document` yields one `about_subject` relation
- exported ontology fields match `classification-registry.json`
