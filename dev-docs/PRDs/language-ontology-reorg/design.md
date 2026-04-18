# Language Ontology Reorganization Design

Date: 2026-04-18

## Goal

Reorganize the `language` ontology so `programming-language`, `framework`, and `library` have stable and non-overlapping meanings.

The reorganization must make the knowledge layer deterministic for both humans and agents:

- path and ontology fields identify the primary subject only
- ecosystem ownership and host-language relationships are modeled explicitly
- the canonical subject key remains compact and stable
- language-adjacent docs stop relying on free-text hints such as descriptions or keywords for core semantics
- every documentation page under the language corpus is normalized to the same rules

In scope:

- `docs/entity/language/programming-language/**`
- `docs/entity/language/framework/**`
- `docs/entity/language/library/**`
- `docs/concept/language/framework/**`
- `docs/concept/language/library/**`
- `docs/operation/language/framework/**`
- `docs/operation/language/library/**`

and any adjacent language-domain pages that should be reclassified into one of those buckets during migration.

## Background

The current repo already treats one canonical subject as the tuple:

- `domain`
- `class`
- `instance`

The knowledge layer and graph export both assume that a subject is keyed only by those fields, while additional semantics should be carried by explicit frontmatter and relations.

This means the filesystem should not be overloaded with hidden ecosystem meaning such as:

- host language
- parent framework
- runtime family
- packaging namespace

unless that information is required to distinguish two genuinely different subjects.

## Decision Summary

The ontology should use a strict intrinsic-type model:

1. `class` means what the subject is, not which ecosystem it belongs to.
2. `path` encodes canonical subject identity, not inferred dependency edges.
3. ecosystem relationships are expressed with explicit `relations`.
4. language-qualified instance names are allowed only when they distinguish different canonical subjects.

Recommended examples:

- `JavaScript` -> `entity/language/programming-language/javascript/javascript.mdx`
- `React` -> `entity/language/framework/react/react.mdx`
- `Next.js` -> `entity/language/framework/nextjs/nextjs.mdx`
- `Jotai` -> `entity/language/library/jotai/jotai.mdx`
- `flutter_bloc` -> `entity/language/library/flutter-bloc/flutter-bloc.mdx`
- `Flutter` -> `entity/language/framework/flutter/flutter.mdx`
- `Dart` -> `entity/language/programming-language/dart/dart.mdx`

## Core Principles

### 1. Primary Subject Identity Comes First

Each document must resolve to exactly one primary subject.

The path and `ontology` block identify that subject. They should answer:

- what is this page mainly about
- what kind of thing is it
- which canonical subject bucket does it belong to

They should not be responsible for answering:

- what language it runs on
- what framework it extends
- what ecosystem it is commonly grouped with

Those are graph relations, not identity.

### 2. Intrinsic Type Beats Ecosystem Membership

`class` should be based on the subject's intrinsic role.

Bad classification logic:

- "`Jotai` is used with React, so put it under `framework`"
- "`Prisma` is often used from JavaScript, so bake `javascript` into the path"

Good classification logic:

- "`Jotai` is a state-management library" -> `library`
- "`Next.js` defines application structure and execution conventions" -> `framework`
- "`JavaScript` is itself a language" -> `programming-language`

### 3. Relations Must Carry Cross-Subject Semantics

If an agent should be able to answer:

- "Jotai is related to React"
- "Flutter depends on Dart"
- "Next.js depends on React"

that information must be modeled as relations, not guessed from prose.

### 4. Qualification Is For Disambiguation Only

An `instance` may include a qualifier only when the qualifier is part of canonical identity.

Allowed examples:

- `grpc-go`
- `grpc-python`
- `javascript-firebase`

because these are meaningfully different host-language bindings or integrations.

Disallowed examples:

- `javascript-nextjs`
- `react-jotai`
- `flutter-bloc` only when the actual subject is just `bloc`

If the subject is a single cross-ecosystem product with one stable identity, keep the short canonical instance and model the ecosystem via relations.

## Class Definitions

### `programming-language`

Use for a language definition or language runtime identity.

Typical properties:

- defines syntax and semantics
- may define standard library and runtime model
- acts as a host environment for libraries and frameworks

Examples:

- JavaScript
- Dart
- Go
- Rust

### `framework`

Use for a system that imposes application structure, lifecycle, or architectural conventions.

Typical signals:

- defines application skeleton or execution flow
- expects the user to plug code into framework-owned control flow
- owns routing, rendering, state lifecycle, bootstrapping, plugin lifecycle, or major app conventions

Examples:

- React
- Next.js
- Flutter
- SvelteKit

Borderline rule:

If the tool is primarily a reusable API that you call directly, it is usually a `library`.
If the tool primarily dictates how the application is structured or executed, it is usually a `framework`.

### `library`

Use for a reusable package, SDK, binding, or toolkit that provides functionality inside a host language or framework.

Typical signals:

- imported and called from user code
- does not define the whole application structure
- may extend a framework, but does not become the framework itself

Examples:

- Jotai
- Prisma Client
- `flutter_bloc`
- React Query
- Three.js

## Relation Rules

The existing relation vocabulary is enough for the first reorganization. Use the narrowest relation that matches the semantics.

### `depends_on`

Use when the subject requires another subject as a host language, required runtime, or required framework.

Examples:

- `react` depends on `javascript`
- `nextjs` depends on `react`
- `flutter` depends on `dart`
- `jotai` depends on `react`
- `flutter-bloc` depends on `flutter`

Language dependency should be included when it is a meaningful prerequisite for understanding or using the subject.

Examples:

- `nextjs` depends on `javascript`
- `jotai` depends on `javascript`
- `flutter-bloc` depends on `dart`

### `uses`

Use when the subject commonly uses another subject internally or operationally, but that dependency is not its defining host environment.

Example:

- a framework integration that uses a transport library

Do not use `uses` for primary host-language or primary host-framework relationships. Those should be `depends_on`.

### `part_of`

Use when the subject is a stable subcomponent or integrated module within a larger named subject.

Examples:

- a named Next.js subsystem that belongs to Next.js
- a Flutter engine subsystem that belongs to Flutter

Do not use `part_of` merely to say "belongs to the same ecosystem".

### `implements`

Use only when the subject implements a formal interface, spec, or protocol.

This is usually not the right relation for language/framework/library hierarchy.

### `related_to`

Use for strong but non-directional association when `depends_on`, `uses`, and `part_of` are too strong or misleading.

Use sparingly. Prefer a directional relation when possible.

## Path Rules

Canonical path model remains:

```text
docs/<role>/<domain>/<class>/<instance>/<aspect>.mdx
```

For the `language` domain:

- `<class>` is one of `programming-language`, `framework`, `library`, `toolchain`, `build-tooling`, `environment`, `package`, `api`, or `concept`
- `<instance>` is the canonical subject name in kebab-case
- `<aspect>` is a single page facet such as `overview`, `install`, `routing`, `widgets`, `config`

### Entity Pages

Use one canonical entity page per subject:

- `docs/entity/language/programming-language/javascript/javascript.mdx`
- `docs/entity/language/framework/react/react.mdx`
- `docs/entity/language/library/jotai/jotai.mdx`

### Non-Entity Pages

Concept and operation pages should keep the same canonical subject as the entity page and vary only by role and aspect.

Examples:

- `docs/concept/language/framework/react/lifecycle.mdx`
- `docs/operation/language/framework/nextjs/env.mdx`
- `docs/operation/language/library/flutter-bloc/widgets.mdx`

## Qualification Rules For `instance`

Default rule:

- prefer the shortest stable canonical subject name

Only qualify the instance when at least one of these is true:

1. The repo contains multiple distinct subjects that would otherwise collide.
2. The host language or framework is part of the product's canonical public identity.
3. The unqualified name would be misleading because it refers to a family, not a concrete subject.

Examples that should stay qualified:

- `javascript-firebase`
- `python-grpc`
- `go-grpc`

Examples that should become unqualified if the subject is actually cross-language and singular:

- `jotai`
- `nextjs`
- `react`
- `flutter`

Examples that should be renamed to match the real package identity:

- `bloc` -> `flutter-bloc` if the pages are about the Flutter package rather than a generic concept
- `react-query` may stay qualified if the canonical public name remains `React Query`

## Concrete Normalization Rules

### Rule A: A framework should have its own entity page

If operation or concept pages exist for a framework instance, the framework must also have a canonical entity page.

This implies adding or normalizing entity pages for subjects such as:

- `react`
- `flutter`

### Rule B: Libraries that depend on frameworks remain libraries

Do not promote a library to `framework` just because it is tightly coupled to a framework.

Examples:

- `jotai` stays `library`, not `framework`
- `flutter-bloc` stays `library`, not `framework`
- `react-query` stays `library`, not `framework`

### Rule C: Framework-owned concepts do not replace framework entities

A framework concept page such as `React Lifecycle` does not remove the need for a canonical `React` entity page.

Entity, concept, and operation pages must share the same subject anchor.

### Rule D: Free-Text Hints Are Not Semantic Ground Truth

Descriptions, keywords, and code examples can support search, but they must not be the only place where host-language or host-framework relationships are expressed.

If a page says "Flutter Bloc" in its description, the ontology should also encode:

- canonical subject identity
- relation to `flutter`
- relation to `dart` when applicable

## Representative Normalizations For Current Docs

The examples below are representative anchor cases, not the limit of the migration scope. The same rules should be applied across the full language corpus.

### `jotai`

Current direction:

- `docs/entity/language/framework/jotai/jotai.mdx`

Recommended direction:

- move to `docs/entity/language/library/jotai/jotai.mdx`
- add `relations.depends_on: [react, javascript]`

### `nextjs`

Current direction:

- `docs/entity/language/framework/nextjs/nextjs.mdx`

Recommended direction:

- keep as `framework`
- add `relations.depends_on: [react, javascript]`

### `react`

Current direction:

- concept page only

Recommended direction:

- add `docs/entity/language/framework/react/react.mdx`
- keep concept pages like `lifecycle.mdx` under the same subject anchor
- add `relations.depends_on: [javascript]`

### `bloc`

Current direction:

- `docs/operation/language/framework/bloc/*.mdx`

Recommended direction:

- decide whether these pages are about a generic Bloc concept or the Flutter package
- if they are package-specific, move them under `library/flutter-bloc`
- add `relations.depends_on: [flutter, dart]`

### `flutter`

Current direction:

- operation pages exist, but no stable entity anchor is obvious

Recommended direction:

- add `docs/entity/language/framework/flutter/flutter.mdx`
- add `relations.depends_on: [dart]`

## Corpus-Wide Migration Policy

The reorganization should happen in this order:

1. Inventory all `language`-domain docs currently classified as `programming-language`, `framework`, or `library`, including concept and operation pages anchored to those subjects.
2. Define and document the classification and relation rules.
3. Add missing canonical entity pages for anchor subjects used across the corpus.
4. Normalize frontmatter so `subject` and `relations` exist before large path moves.
5. Reclassify or rename every subject in the corpus whose current `class` or `instance` is incorrect.
6. Rewrite links after each move batch so the repo stays internally consistent.
7. Regenerate `ontology/classification-registry.json`.
8. Validate and build the wiki artifacts.

This order reduces the risk of creating ambiguous or misleading graph nodes mid-migration.

## Validation Requirements

Any implementation of this design should verify:

1. `domain/class/instance` still yields one canonical subject per real subject.
2. moved docs do not create duplicate target paths.
3. newly added relation targets resolve to existing canonical subjects once relation enforcement is enabled.
4. `ontology:bootstrap`, `ontology:validate`, and `build` all pass.
5. agent-facing subject ids remain stable except where a deliberate canonical rename is part of the migration.

## Non-Goals

- inventing a second hierarchy that encodes both type and ecosystem in the path
- keeping every historical language-qualified instance forever
- automatically inferring framework or language relationships from prose
- redesigning non-`language` domains in the same pass

## Recommended Next Step

Implement the reorganization in three phases:

1. inventory and rule codification for the entire language corpus
2. metadata-first normalization and anchor-page creation for shared ecosystem subjects such as `react`, `flutter`, and `dart`
3. full-corpus migration of all language, library, and framework docs, grouped into safe batches by canonical subject
