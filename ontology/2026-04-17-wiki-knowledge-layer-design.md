# Wiki Knowledge Layer Design

Date: 2026-04-17

## Goal

Turn `wiki.loliot.net` into a graphify-like knowledge system that supports both:

- human-facing search and graph exploration
- agent-facing raw query access with minimal token overhead

The site must remain static-first. Knowledge artifacts are generated at build time and deployed with the site.

## Requirements

- Use the wiki ontology as the canonical semantic source
- Support natural-language search over the documentation corpus
- Support graph-style exploration over normalized subjects and related documents
- Expose separate delivery contracts for humans and agents
- Keep agent responses raw, compact, and schema-stable
- Keep human responses rich enough for browsing, scanning, and graph navigation
- Avoid runtime dependency on a query server for the first version

## Non-Goals

- Full conversational question answering in the first version
- Runtime graph computation on a separate backend
- LLM-dependent ranking during query execution
- Automatic inference of weak relations before relation semantics are validated

## Canonical Knowledge Core

The build pipeline should normalize the wiki into one canonical knowledge core. This core is the single semantic source for both agent and human outputs.

Core node types:

1. `document`
2. `subject`
3. `relation`

### Document

Represents one MDX page and includes:

- stable document id
- source path
- public route URL
- title and description
- keywords
- ontology block
- extracted headings
- normalized searchable text
- short evidence snippets

### Subject

Represents one canonical ontology subject keyed by:

- `domain`
- `class`
- `instance`

A subject groups related documents without forcing the UI or agent to start from individual pages.

### Relation

First-version required relation:

- `document -> subject` via `about_subject`

Future relations may include validated frontmatter relations such as:

- `related_to`
- `depends_on`
- `uses`
- `part_of`
- `implements`
- `prerequisite_for`

These should be added only after normalization and resolution rules are stable enough to avoid misleading graph edges.

## Delivery Model

The system uses one canonical knowledge core and two delivery layers.

### Human Delivery Layer

Purpose:

- styled search results
- graph exploration UI
- readable previews and labels
- grouped result sections for browsing

Allowed enrichments:

- display labels
- short summaries
- grouped result metadata
- badges and visual ordering hints
- graph rendering metadata

### Agent Delivery Layer

Purpose:

- compact raw access for Codex or other agents
- no HTML parsing
- no large body text by default

Rules:

- return structured JSON only
- include short evidence snippets
- expose stable ids and URLs
- expose ontology keys directly
- omit display-only fields unless strictly needed for routing

## Query Model

One query engine should feed both delivery layers.

### Query

Input:

- natural-language text
- keyword text
- optional ontology filters

Output:

- `subjects[]`
- `documents[]`

Each result should include:

- stable id
- node type
- score
- match reason
- short snippet
- ontology keys
- public URL

### Node Lookup

Lookup by stable id and return:

- node metadata
- short snippet or subject summary
- related documents for a subject
- canonical subject for a document
- directly connected validated relations

### Path

Supported paths should eventually include:

- `subject -> subject`
- `subject -> document`
- `document -> subject`

Path responses should return nodes and edges with evidence, not prose answers.

Because relation quality matters more than early coverage, `path` should follow `query` and `node lookup` in rollout order.

## Static Artifact Strategy

The first version is fully static.

Build flow:

1. read `docs/**/*.mdx`, frontmatter, and classification data
2. generate the canonical knowledge core
3. derive agent-facing static artifacts
4. derive human-facing static artifacts
5. build and publish the site with those artifacts

### Agent-Facing Static Artifacts

Representative outputs:

- `/api/wiki/query-index.json`
- `/api/wiki/graph.json`
- `/api/wiki/path-index.json`
- `/api/wiki/nodes/<id>.json`

These files should be optimized for:

- predictable schemas
- compact fields
- low token cost
- direct lookups

### Human-Facing Static Artifacts

Representative outputs:

- enriched search records
- grouped result metadata
- graph labels and summaries
- preview content for cards and panels

These files should be optimized for:

- UI readability
- scanability
- graph exploration affordances

## Search And Ranking

First-version ranking should stay deterministic and build-time derived.

Signals can include:

- title and heading hits
- keyword matches
- ontology field matches
- subject affinity
- text snippet matches

Human and agent consumers may share the same base scores, but each delivery layer can apply light presentation-specific ordering or grouping without changing the canonical ids.

## Error Handling

The system should fail loudly during build if:

- a classified doc cannot be normalized into the canonical core
- stable ids are duplicated
- a public route URL cannot be resolved
- a relation target cannot be resolved once relation enforcement is enabled
- required static artifacts are missing

The runtime site should fail softly if:

- a static artifact cannot be loaded
- a node lookup file is missing
- search returns no matches

Human UI should show a readable empty or error state. Agent-facing outputs should return a compact machine-readable error shape.

## Verification

Required verification for implementation:

1. ontology validation still passes
2. canonical core generation is deterministic
3. query and node artifacts are generated successfully
4. agent bundles remain compact and schema-stable
5. human UI uses the same ids and URLs exposed in agent artifacts
6. site build succeeds with generated artifacts included

Suggested test layers:

- unit tests for normalization and snippet extraction
- unit tests for search ranking and result grouping
- contract tests for agent JSON shapes
- integration tests for generated artifact existence and referential consistency

## Rollout

### First Version

- canonical knowledge core
- agent-facing `query` artifacts
- agent-facing `node lookup` artifacts
- human-facing search and subject/document result grouping

### Later Version

- validated multi-edge relation graph
- `path` queries
- richer graph exploration UI
- optional answer-generation layer built on top of raw query results

## Recommendation

Build `wiki.loliot.net` as a static knowledge platform with:

- one canonical ontology-derived graph core
- one raw agent contract
- one presentation-oriented human contract

This preserves token efficiency for agents while allowing the site to become a graphify-like exploration surface for people.
