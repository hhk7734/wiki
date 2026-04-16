# Wiki Ontology Reorganization Design

Date: 2026-04-16
Repository: `/home/hhk7734/.superset/projects/wiki`

## Goal

Reorganize the `docs/` tree so it becomes a canonical ontology-shaped corpus rather than a human-oriented documentation hierarchy.

The primary objective is not navigation readability. The objective is deterministic categorization of each MDX file so the repository can act as an ontology-backed knowledge base and integrate cleanly with graph extraction tools such as `graphify`.

## Current Repository Context

The current `docs/` tree mixes several incompatible organizing principles:

- domain buckets such as `mlops`, `linux`, `mcu`
- language buckets such as `go`, `python`, `cpp`
- artifact buckets such as `db`, `design`
- weak catch-all buckets such as `etc`
- lower-level folders that sometimes mean class, sometimes topic, sometimes editorial grouping, such as `libraries`, `workflow`, `advanced-cpp`

The current corpus also contains ontology-hostile inconsistencies such as both `docs/linux/kernel/...` and `docs/linux/linux-kernel/...`.

This means the current path layout cannot be treated as a reliable semantic source of truth.

## Recommended Approach

Use an entity-centric ontology path with an explicit role axis:

```text
docs/<role>/<domain>/<class>/<instance>/<aspect>.mdx
```

This is the recommended design because it preserves ontology semantics directly in the filesystem and separates:

- what kind of knowledge the page contains
- what the page is about

## Ontology Boundary

The ontology applies primarily to `docs/`, not to the whole Docusaurus application.

The primary ontology subject is an `Entity`. Each MDX file is treated as typed evidence about one primary subject.

Core node types:

- `Entity`
- `Concept`
- `Operation`
- `Specification`
- `EvidencePage`

`EvidencePage` is the MDX file itself. It points to exactly one primary subject and may mention related secondary subjects through metadata.

Core relations:

- `aboutEntity`
- `aboutConcept`
- `describesOperation`
- `describesSpecification`
- `dependsOn`
- `implements`
- `uses`
- `partOf`
- `relatedTo`
- `prerequisiteFor`

## Canonical Path Model

Canonical path shape:

```text
docs/<role>/<domain>/<class>/<instance>/<aspect>.mdx
```

Path segment semantics:

- `role`: what kind of knowledge the page contains
- `domain`: broad ontology area
- `class`: formal ontology class
- `instance`: concrete subject identifier
- `aspect`: page facet

Examples:

```text
docs/entity/language/programming-language/go/overview.mdx
docs/entity/platform/cluster-addon/node-feature-discovery/overview.mdx
docs/operation/hardware/mcu-family/avr/upload-terminal.mdx
docs/specification/protocol/application-protocol/http/cors.mdx
docs/concept/language/concurrency/goroutine/overview.mdx
```

## Controlled Vocabulary

### Role

Recommended fixed `role` vocabulary:

- `entity`
- `concept`
- `operation`
- `specification`
- `troubleshooting`
- `comparison`

### Domain

Recommended fixed `domain` vocabulary for this corpus:

- `language`
- `platform`
- `hardware`
- `protocol`
- `data`
- `mlops`
- `science`
- `management`

### Class

Representative `class` vocabulary by domain:

- `language`
  - `programming-language`
  - `library`
  - `framework`
  - `toolchain`
  - `runtime`
- `platform`
  - `orchestrator`
  - `cluster-addon`
  - `service-mesh`
  - `iac-tool`
  - `workflow-engine`
- `hardware`
  - `mcu-family`
  - `board`
  - `peripheral`
  - `sensor`
- `protocol`
  - `application-protocol`
  - `wire-protocol`
  - `interface-definition`
  - `api-spec`
- `data`
  - `database`
  - `storage-system`
  - `schema-language`
- `mlops`
  - `training-system`
  - `serving-system`
  - `model-family`
  - `observability-system`

### Naming Rules

- use kebab-case everywhere
- `class` names must be formal, stable, and singular
- `instance` names should be practical and canonical, such as `go`, `postgresql`, `fastapi`, `istio`, `node-feature-discovery`
- `aspect` should capture one page facet only, such as `overview`, `install`, `config`, `authentication`, `middleware`
- avoid editorial buckets such as `etc`, `misc`, `advanced`, `libraries`, `workflow` unless they are real ontology classes
- reserve `overview.mdx` for the canonical subject page

## Classification Rules For This Repository

### General Rules

- a programming language itself is an `entity/language/programming-language/<name>/overview.mdx`
- a library or framework is an entity page under its domain and class
- a usage/config/deploy/how-to page is usually an `operation`
- a rule or standard page is usually a `specification`
- an architectural or conceptual topic such as `goroutine`, `cqrs`, or `event-storming` is usually a `concept`
- vendor products and deployable systems such as `kubeflow`, `istio`, `argo-workflows`, and `karpenter` are usually `entity/platform/...`
- hardware families and boards are `entity/hardware/...`
- troubleshooting material gets `role=troubleshooting` rather than being hidden under operations

### Known Problem Areas

- `docs/lang/design/...`
  This is not a language subtree and should split into `concept` and `specification`.
- `docs/lang/db/...`
  This is not a language subtree and should move under `data`.
- `docs/mlops/...`
  This mixes entities, operations, and concepts and should be decomposed rather than preserved.
- `docs/etc/...`
  This should disappear entirely.
- `docs/linux/kernel/...` and `docs/linux/linux-kernel/...`
  These should collapse into one canonical path model.

### Example Remaps

```text
docs/lang/go/go.mdx
-> docs/entity/language/programming-language/go/overview.mdx

docs/lang/python/libraries/fastapi/middleware.mdx
-> docs/operation/language/library/fastapi/middleware.mdx

docs/lang/design/protocol-spec/http/cors.mdx
-> docs/specification/protocol/application-protocol/http/cors.mdx

docs/lang/db/sql/postgresql/config.mdx
-> docs/operation/data/database/postgresql/config.mdx

docs/mlops/device/node-feature-discovery/node-feature-discovery.mdx
-> docs/entity/platform/cluster-addon/node-feature-discovery/overview.mdx

docs/mlops/device/node-feature-discovery/node-feautre-rule.mdx
-> docs/operation/platform/cluster-addon/node-feature-discovery/node-feature-rule.mdx

docs/mcu/avr/avr-i2c.mdx
-> docs/operation/hardware/mcu-family/avr/i2c.mdx
```

## Migration Strategy

The user does not require a safety-first migration. The recommended migration strategy is therefore destructive canonicalization.

High-level approach:

1. classify every MDX file into `role`, `domain`, `class`, `instance`, `aspect`
2. generate canonical ontology target paths for every file
3. move all files in one pass
4. rewrite `/docs/...` links in one pass
5. regenerate navigation from the new tree
6. resolve collisions where multiple files map to the same canonical target

Implications:

- backward compatibility is not the priority
- the new ontology path becomes the source of truth
- temporary breakage during migration is acceptable

## Data Flow

The system should work by deterministic classification, not runtime inference.

Flow:

1. start from each MDX file
2. assign ontology fields:
   - `role`
   - `domain`
   - `class`
   - `instance`
   - `aspect`
3. derive the canonical target path
4. treat the path as the primary structural encoding
5. use frontmatter only for extra semantic relations that are not safely encoded by path alone

## Validation Rules

- every page must resolve to exactly one primary subject
- no `etc`, `misc`, or editorial buckets
- no duplicate target paths
- `overview.mdx` is reserved for canonical entity or concept pages
- action pages must not be stored as entity pages
- standard/rule pages must not be stored as operations unless they are procedural

## Expected Failure Cases

- one page mixes multiple subjects too heavily
- the current title is really an aspect rather than an instance
- multiple legacy files collapse onto the same canonical target path
- an existing subtree such as `workflow` or `libraries` is not a valid ontology class and must be dissolved

Resolution policy:

- choose one primary subject per page
- split pages only when ambiguity is too high
- prefer canonical ontology classes over legacy folder semantics
- accept destructive renames when needed to keep the ontology clean

## Frontmatter Schema

The filesystem path is the primary structural signal. Frontmatter provides explicit semantic metadata.

Recommended schema:

```mdx
---
id: go-overview
title: Go
sidebar_label: Go
description: Go programming language overview

ontology:
  role: entity
  domain: language
  class: programming-language
  instance: go
  aspect: overview

subject:
  canonical_name: Go
  aliases:
    - golang

relations:
  related_to:
    - protobuf
    - grpc
  depends_on: []
  prerequisite_for:
    - go-goroutine
  part_of: []
  implements: []
  uses: []

source:
  status: canonical
  confidence: exact
---
```

Field semantics:

- `ontology`
  Must match the file path exactly.
- `subject.canonical_name`
  Human-readable canonical label.
- `subject.aliases`
  Alternate names for entity resolution.
- `relations`
  Explicit ontology edges not encoded by the path.
- `source.status`
  Declares whether the page is canonical, supporting, or derived.

Suggested `source.status` values:

- `canonical`
- `supporting`
- `derived`

Rule:

- if path and frontmatter disagree, frontmatter is wrong

## Fit With Graphify

This design fits `graphify` well as a graph extraction and exploration layer.

Why the fit is strong:

- the ontology-first path structure gives `graphify` cleaner identity and relationship signals
- explicit frontmatter aliases and relations improve graph extraction quality
- the corpus remains ordinary MDX, which `graphify` can ingest as documentation content
- an entity-centric tree maps naturally to graph nodes plus evidence pages

What `graphify` is good for in this design:

- building a knowledge graph over the wiki
- discovering cross-domain connections
- identifying central entities, clusters, and weakly connected pages
- querying paths and neighborhood structure
- serving the resulting graph through JSON, HTML, terminal commands, or MCP

What `graphify` is not:

- a formal ontology reasoner
- an RDF/OWL/SPARQL system by itself
- a replacement for explicit ontology validation

Recommended architecture:

1. use the ontology-first filesystem and frontmatter as the canonical semantic source
2. optionally export to RDF/OWL or a graph database if formal reasoning is needed later
3. use `graphify` as the discovery, query, and exploration layer on top

## Implementation Direction

The future implementation should behave like a deterministic ontology compiler for the docs tree.

Core implementation needs:

- file classifier over existing MDX corpus
- canonical path generator
- collision detector
- link rewriter for `/docs/...`
- vocabulary validator
- consistency checker between path and frontmatter

## Decision Summary

- ontology model: entity-centric
- path model: `docs/<role>/<domain>/<class>/<instance>/<aspect>.mdx`
- migration style: destructive canonicalization
- class naming: formal taxonomy
- instance naming: practical canonical names
- frontmatter: explicit ontology metadata aligned with the path
- graph integration: `graphify` is a strong fit as the graph extraction and query layer, but not the ontology engine itself
