# Docs Agent Guide

## Scope

- `docs/` is an ontology-first documentation tree.
- Agent-only instructions live in this file and should not be published as site docs.
- The goal of the `docs/` tree is deterministic categorization, not human-first navigation.
- Treat the ontology filesystem and aligned frontmatter as the canonical semantic source for the wiki.

## Ontology System

The repository uses an entity-centric ontology model so the wiki can act as a structured knowledge base and integrate cleanly with graph extraction tools such as `graphify`.

The ontology applies primarily to `docs/`, not to the rest of the Docusaurus application.

Core node types:

- `Entity`
- `Concept`
- `Operation`
- `Specification`
- `EvidencePage`

`EvidencePage` is the MDX file itself. Each page should have exactly one primary subject and may mention related secondary subjects through metadata.

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

Use the ontology path model below as the source of truth:

```text
docs/<role>/<domain>/<class>/<instance>/<aspect>.mdx
```

Path semantics:

- `role`: what kind of knowledge the page contains
- `domain`: broad ontology area
- `class`: formal ontology class
- `instance`: concrete subject identifier
- `aspect`: one page facet

Examples:

```text
docs/entity/language/programming-language/go/go.mdx
docs/entity/platform/cluster-addon/node-feature-discovery/node-feature-discovery.mdx
docs/operation/hardware/mcu-family/avr/i2c.mdx
docs/specification/protocol/application-protocol/http/cors.mdx
docs/concept/language/concept/goroutine/goroutine.mdx
```

Note: this repository uses `id == filename`, so canonical subject pages do not use repeated `overview.mdx` filenames even when the ontology `aspect` is conceptually `overview`.

Operational constraints:

- canonical docs should already live under `docs/<role>/<domain>/<class>/<instance>/<aspect>.mdx`
- avoid hidden intermediate buckets once content is migrated into the canonical tree
- do not create directories whose names end with `.mdx`
- do not rely on `source-path` fallback classification for maintained docs

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

These lists are representative, not exhaustive. When the repository already uses a stable class in `ontology/classification-registry.json` and `script/ontology/pathing.mjs`, prefer that existing class over inventing a new synonym.

Naming rules:

- use kebab-case everywhere
- `class` names must be formal, stable, and singular
- `instance` names should be practical canonical names such as `go`, `postgresql`, `fastapi`, `istio`, `node-feature-discovery`
- `instance` must name the real primary subject, not a placeholder bucket such as `package`, `engine`, `command`, or another editorial grouping
- avoid duplicated namespace prefixes in `instance` names such as `python-python-*` or `cpp-cpp-*`
- encode host-language or ecosystem relationships in metadata and relations unless the qualifier is required to distinguish a genuinely different subject
- `aspect` should capture one facet only, such as `overview`, `install`, `config`, `authentication`, `middleware`
- avoid editorial buckets such as `etc`, `misc`, `advanced`, `libraries`, `workflow` unless they are true ontology classes
- prefer an already-established class name over near-synonyms such as `workflow-engine` vs `workflow-system`

## Subject Anchor Rules

Use `instance` as the stable primary anchor of the page.

In most cases, `instance` should name a concrete product, tool, system, protocol, or other canonical subject. Do not create a new `instance` just because the page is about a subtopic of that subject.

Prefer this pattern for tool-specific material:

- `instance=<tool>`
- `aspect=<subtopic>`

Examples:

- `docs/entity/mlops/iac-tool/pulumi/pulumi.mdx`
- `docs/concept/mlops/iac-tool/pulumi/config.mdx`
- `docs/concept/mlops/iac-tool/pulumi/stack-reference.mdx`
- `docs/operation/mlops/iac-tool/terraform/import.mdx`
- `docs/operation/mlops/iac-tool/terraform/state.mdx`
- `docs/concept/mlops/iac-tool/terragrunt/stack.mdx`

Avoid synthetic or misleading generic paths such as:

- `docs/entity/mlops/iac-tool/config/config.mdx`
- `docs/entity/mlops/iac-tool/import/import.mdx`

unless the page is genuinely tool-agnostic.

## Generic Vs Owned Topics

Before choosing an `instance`, ask whether the page topic is:

- a generic cross-tool subject
- or a tool-owned facet

If the title naturally wants a vendor or product prefix such as `Pulumi Config`, `Terraform Import`, or `Terragrunt Stack`, that usually means the page belongs to:

- `instance=<tool>`
- `aspect=<tool-specific-facet>`

Use a generic `instance` like `config`, `state`, `stack`, or `import` only when the page is truly cross-tool and not owned by a single product.

## Classification Rules

General rules:

- a programming language itself is an `entity/language/programming-language/...`
- a library or framework is usually an entity page under its ontology domain and class
- a usage, config, deploy, install, or how-to page is usually an `operation`
- a rule or standard page is usually a `specification`
- an architectural or conceptual topic such as `goroutine`, `cqrs`, or `event-storming` is usually a `concept`
- vendor products and deployable systems such as `kubeflow`, `istio`, `argo-workflows`, and `karpenter` are usually entity pages
- hardware families and boards are `entity/hardware/...`
- troubleshooting material should use `role=troubleshooting` rather than being hidden under operations

Language-domain rules:

- `programming-language` means the language itself, not one of its standard-library modules, language features, or ecosystem bindings
- `framework` means a subject that imposes application structure, lifecycle, routing, rendering flow, plugin flow, or other major architectural conventions
- `library` means a reusable package, module, SDK, binding, toolkit, or standard-library component consumed from user code
- do not promote a library to `framework` just because it is commonly used with a framework
- if the subject is the framework itself, create or maintain a canonical entity page for that framework
- if operation or concept pages exist for a language/framework/library subject, anchor them to the same canonical `instance` as the entity page whenever practical
- if the page title naturally reads as `<product> <facet>`, the `instance` should almost always be `<product>` and the `aspect` should be `<facet>`
- if the current path encodes a category bucket but the page is actually about a named product, move the page so `instance` names that product

Language-domain class guidance:

- `JavaScript`, `Go`, `Rust`, `Dart` -> `programming-language`
- `React`, `Next.js`, `Flutter`, `SvelteKit` -> `framework`
- `Jotai`, `TanStack Query`, `Redux Toolkit`, `flutter_bloc`, `Prisma`, `FastAPI`, `Three.js` -> usually `library` unless the page is truly about a framework-level subject

Framework-versus-library test:

- if the subject primarily provides APIs you import and call, it is usually a `library`
- if the subject primarily dictates how the application is structured or executed, it is usually a `framework`

Qualified-instance rules for the language domain:

- keep a language-qualified `instance` only when it distinguishes genuinely different bindings or SDKs such as `go-grpc` vs `python-grpc`
- prefer a single prefix at most; collapse repeated forms such as `python-python-tkinter` to one canonical subject name
- if the subject already has a stable public product name such as `jotai`, `nextjs`, or `sveltekit`, prefer the short canonical name over a synthetic language prefix

Relation guidance for the language domain:

- use `depends_on` for primary host-language, host-framework, or required-runtime relationships such as `nextjs -> react`, `react -> javascript`, or `flutter-bloc -> flutter`
- use `uses` for meaningful but non-defining runtime or integration dependencies
- use `part_of` only when the subject is a real subsystem of a larger named subject, not merely in the same ecosystem
- use `related_to` only when a strong relationship exists but a directional dependency would be misleading
- do not rely on `title`, `description`, `keywords`, or code snippets alone to express host-language or framework relationships; add explicit `subject` and `relations` metadata

Role guidance for tool-specific pages:

- use `entity` for the tool or product itself
- use `concept` for internal abstractions, named features, and mental models within that tool
- use `operation` for install, config, deploy, import, migration, state editing, and other procedural tasks

Examples:

- `Pulumi` -> `entity/mlops/iac-tool/pulumi/pulumi.mdx`
- `Pulumi Config` -> `concept/mlops/iac-tool/pulumi/config.mdx`
- `Pulumi StackReference` -> `concept/mlops/iac-tool/pulumi/stack-reference.mdx`
- `Terraform Import` -> `operation/mlops/iac-tool/terraform/import.mdx`
- `Terragrunt Stack` -> `concept/mlops/iac-tool/terragrunt/stack.mdx`

Mixed-page rule:

- if a page mixes overview and procedural content, split it when practical
- keep the subject explanation in `entity` or `concept`
- move step-by-step setup or usage into `operation`

Family-grouping rule:

- do not use the filesystem to group related subjects under a product family if doing so breaks primary-subject identity
- represent family relationships with metadata, relations, or curated index pages instead

Repository-specific corrections:

- `docs/lang/design/...` is not a language subtree and should split into `concept` and `specification`
- `docs/lang/db/...` belongs under `data`
- `docs/mlops/...` mixes entities, operations, and concepts and should be decomposed
- `docs/etc/...` should disappear entirely
- `docs/linux/kernel/...` and `docs/linux/linux-kernel/...` should collapse into one canonical path model

## Frontmatter And Validation

## Authoring Rules

- Use English for prose in `docs/**/*.mdx`.
- Use English for code blocks, commands, and configuration snippets.
- Keep `id` equal to the filename without the extension.
- Keep the `ontology` frontmatter block aligned with the filesystem path.
- Prefer `/docs/...` links for cross-doc references.
- Keep reference blocks, Mermaid diagrams, tabs, and other Docusaurus features consistent with the repository conventions in the root `AGENTS.md`.

Recommended frontmatter shape:

```mdx
---
id: go
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

- the filesystem path is the primary structural signal
- frontmatter provides explicit semantic metadata not safely encoded by the path alone
- if path and frontmatter disagree, frontmatter is wrong

Validation expectations:

- every page must resolve to exactly one primary subject
- no `etc`, `misc`, or editorial buckets
- no duplicate canonical target paths
- action pages must not be stored as entity pages
- rule or standard pages must not be stored as operations unless they are procedural
- `ontology/classification-registry.json` should contain zero `source-path` fallback entries for maintained docs

## Tooling

Keep file moves, link rewrites, and validation aligned with:

- `ontology/classification-registry.json`
- `script/ontology/`

Operational workflow after doc additions or moves:

1. run `npm run ontology:bootstrap`
2. confirm there are no unintended `source-path` fallbacks
3. run `npm run ontology:validate`
4. run `npm run build`

The ontology system is designed to behave like a deterministic ontology compiler over the docs tree:

1. classify every MDX file into `role`, `domain`, `class`, `instance`, `aspect`
2. derive the canonical target path
3. use the path as the primary structural encoding
4. use metadata for extra semantic relations

## Graph Integration

This ontology design is intentionally compatible with `graphify`.

`graphify` is a good fit as a graph extraction, query, and exploration layer because the ontology-first paths and explicit frontmatter provide strong identity and relationship signals.

Do not treat `graphify` as the ontology engine itself. It is not a formal ontology reasoner or an RDF/OWL/SPARQL system. The canonical ontology source remains the filesystem plus aligned frontmatter.

## Agent Notes

- Do not treat this file as ontology content.
- If you add or move docs, rerun the ontology validation and link-rewrite checks before completion.
