# Docs Agent Guide

## Scope

- `docs/` is a taxonomy-first documentation tree.
- Agent-only instructions live in this file and should not be published as site docs.
- The filesystem path is the canonical navigation path for humans.
- Frontmatter provides semantic metadata for ontology, graph extraction, and agent use.

## Mental Model

Treat the docs system as two layers:

- `path`: human-facing taxonomy for navigation and stable routes
- `frontmatter`: semantic metadata for ontology, graph extraction, search, and agents

The path tells readers where to find a page. The frontmatter tells tooling what the page is about.

Maintained docs must follow a supported taxonomy path and carry complete semantic frontmatter. Do not rely on fallback classification for current documents.

## Canonical Path Model

Use one of these path patterns:

```text
docs/<topic>/<subject>/<page>.mdx
docs/<topic>/<subject>/<facet>/<page>.mdx
docs/<topic>/concepts/<concept>.mdx
docs/<topic>/comparisons/<name>.mdx
docs/<topic>/reference/<name>.mdx
docs/comparison/<area>/<subject>/<facet>/<page>.mdx
```

Path semantics:

- `topic`: broad navigation bucket
- `subject`: primary human-facing subject anchor
- `facet`: optional slice within a subject
- `page`: filename and canonical route leaf
- `area`: the comparison topic's broad domain grouping

Examples:

```text
docs/data/concepts/ontology.mdx
docs/data/concepts/taxonomy.mdx
docs/language/go/overview.mdx
docs/language/go/syntax/interface.mdx
docs/mlops/pulumi/config.mdx
docs/comparison/data/database/type/type.mdx
```

Path rules:

- keep one canonical path per document
- do not create editorial buckets such as `etc`, `misc`, or `advanced`
- do not create directories whose names end with `.mdx`
- do not encode many-to-many semantics in the filesystem
- if several paths seem possible, choose the one that is easiest for a human to predict

## Topics

Approved top-level topics for maintained docs:

- `comparison`
- `language`
- `platform`
- `hardware`
- `protocol`
- `data`
- `mlops`
- `science`
- `management`

## Semantic Frontmatter

Every maintained doc must include:

- Docusaurus metadata such as `id`, `title`, `sidebar_label`, `description`, `keywords`
- `ontology`
- `subject`
- `relations`
- `source`

Recommended shape:

```mdx
---
id: overview
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
    - grpc
  depends_on: []
  prerequisite_for: []
  part_of: []
  implements: []
  uses: []

source:
  status: canonical
  confidence: exact
---
```

Rules:

- `id` must match the filename without `.mdx`
- `ontology.role`, `ontology.domain`, `ontology.class`, `ontology.instance`, and `ontology.aspect` must all be present
- `subject.canonical_name` must be a meaningful display name
- `relations` must always be present, even if every list is empty
- `source.status` and `source.confidence` should reflect how authoritative the page is in this repository
- if path and frontmatter disagree about the primary subject, fix the document rather than relying on inference

## Controlled Vocabulary

Fixed `role` vocabulary:

- `entity`
- `concept`
- `operation`
- `specification`
- `troubleshooting`
- `comparison`

Preferred `domain` vocabulary for this corpus:

- `language`
- `platform`
- `hardware`
- `protocol`
- `data`
- `mlops`
- `science`
- `management`

Representative `class` vocabulary:

- `language`: `programming-language`, `library`, `framework`, `toolchain`, `build-tooling`, `environment`, `package`, `api`, `concept`
- `platform`: `tool`, `kernel`, `bootloader`, `package-manager`
- `hardware`: `mcu-family`, `electronics`
- `protocol`: `application-protocol`, `api-spec`
- `data`: `database`, `storage-system`, `storage-interface`, `object-storage`
- `mlops`: `auth-system`, `cloud-service`, `cluster-addon`, `cluster-orchestrator`, `configuration`, `container-platform`, `eventing-system`, `gateway-api`, `iac-tool`, `ml-platform`, `networking`, `networking-stack`, `observability-system`, `orchestrator`, `provisioning-tool`, `scheduler`, `security`, `service-mesh`, `serving-system`, `storage`, `tool`, `upgrade-plan`, `workflow-system`, `workload`
- `science`: `model-family`, `biology`, `project`
- `management`: `memo`

These lists are representative, not exhaustive. Prefer an existing stable class over inventing a new synonym.

Naming rules:

- use kebab-case everywhere
- `class` names must be formal, stable, and singular
- `instance` names should identify the real primary subject
- avoid placeholder instances such as `package`, `engine`, `command`, or other editorial buckets
- avoid doubled prefixes such as `python-python-*`
- keep `aspect` to one facet such as `overview`, `install`, `config`, `authentication`, `middleware`

## Subject Selection Rules

Use `instance` as the stable primary anchor of the page.

In most cases, `instance` should name a concrete product, tool, system, protocol, or other canonical subject. Do not create a new `instance` just because the page is about a subtopic of that subject.

Prefer this pattern for subject-owned material:

- `instance=<subject>`
- `aspect=<subject-owned-facet>`

Examples:

- `docs/mlops/pulumi/overview.mdx`
- `docs/mlops/pulumi/config.mdx`
- `docs/mlops/terraform/import.mdx`
- `docs/mlops/terragrunt/stack.mdx`

Avoid synthetic generic paths such as:

- `docs/mlops/config/overview.mdx`
- `docs/mlops/import/overview.mdx`

unless the page is truly cross-tool.

## Classification Guidance

General rules:

- a programming language usually lives at `docs/language/<language>/overview.mdx`
- a library or framework usually lives under `docs/language/<subject>/...` or `docs/language/<language>/<tool>/...`, depending on whether it is ecosystem-owned
- a usage, config, deploy, install, or how-to page is usually `role=operation`
- an architectural or conceptual topic is usually `role=concept`
- a rule or standard page is usually `role=specification`
- troubleshooting material should use `role=troubleshooting` metadata rather than a special filesystem tree

Language-domain rules:

- `programming-language` means the language itself
- `framework` means a subject that imposes application structure or lifecycle
- `library` means a reusable package, module, SDK, binding, toolkit, or standard-library component consumed from user code
- if the page title naturally reads as `<product> <facet>`, the `instance` should usually be `<product>` and the `aspect` should be `<facet>`
- keep a language-qualified `instance` only when it distinguishes genuinely different bindings such as `go-grpc` vs `python-grpc`

Relation guidance:

- use `depends_on` for primary host-language, host-framework, or required-runtime relationships
- use `uses` for meaningful but non-defining runtime or integration dependencies
- use `part_of` only for real subsystem relationships
- use `related_to` only when a strong relationship exists but a directional dependency would be misleading

## Authoring Rules

- Use English for prose in `docs/**/*.mdx`.
- Use English for code blocks, commands, and configuration snippets.
- Prefer `/docs/...` links for cross-doc references.
- Keep reference blocks, Mermaid diagrams, tabs, and other Docusaurus features consistent with the repository conventions in the root `AGENTS.md`.

## Validation Expectations

- every page must resolve to exactly one primary subject
- maintained docs must use an approved taxonomy path
- maintained docs must have complete semantic frontmatter
- no editorial buckets such as `etc` or `misc`
- no duplicate registry `source` paths
- no duplicate registry `target` paths
- registry entries for maintained docs should use `target === source`

## Tooling

Keep link rewrites and validation aligned with:

- `ontology/classification-registry.json`
- `script/ontology/`

Operational workflow after doc additions or moves:

1. run `npm run ontology:bootstrap`
2. run `npm run ontology:validate`
3. run `npm run build`

## Graph Integration

The semantic frontmatter layer is intentionally compatible with `graphify` and the repository's wiki search artifacts.
