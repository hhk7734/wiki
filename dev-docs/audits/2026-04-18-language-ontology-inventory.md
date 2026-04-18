# Language Ontology Inventory Audit

Date: 2026-04-18

## Scope

This audit covers the current `language` corpus for the ontology classes:

- `programming-language`
- `framework`
- `library`

Included paths:

- `docs/entity/language/programming-language/**`
- `docs/entity/language/framework/**`
- `docs/entity/language/library/**`
- `docs/concept/language/framework/**`
- `docs/concept/language/library/**`
- `docs/operation/language/framework/**`
- `docs/operation/language/library/**`

## Current Inventory

- documents in scope: `97`
- canonical subject groups in scope: `55`
- documents currently classified as `framework`: `14`
- documents currently classified as `programming-language`: `4`
- documents currently classified as `library`: `79`

## High-Priority Findings

### 1. Missing entity anchors

The corpus contains framework-owned concept and operation pages without stable entity anchors for:

- `react`
- `flutter`
- `sveltekit`
- `flutter-engine` or another stable engine-owned subject if the engine pages remain distinct from `flutter`

The language corpus also needs a canonical `dart` programming-language anchor because multiple Flutter-owned pages depend on it semantically.

### 2. Misclassified framework subjects

These current framework instances should not remain in the `framework` class as-is:

- `jotai` -> reclassify to `library/jotai`
- `react-query` -> reclassify to `library/react-query`
- `bloc` -> reclassify to `library/flutter-bloc` if the pages are package-specific
- `redux` with `aspect=toolkit` -> re-anchor to `library/redux-toolkit` or another stable toolkit-owned subject after content review

### 3. Placeholder or synthetic framework instances

These framework instances do not currently name the real primary subject:

- `engine`
- `package`

Planned direction:

- `package/linux-methodchannel` -> anchor under `flutter`
- split `engine` pages between `flutter` and `flutter-engine` depending on whether the page is about building the app or the engine itself

### 4. Malformed `ontology.instance` values

Some docs still include `.mdx` in `ontology.instance`. These must be normalized before subject-level reasoning is trustworthy.

Current malformed examples include:

- `cpp-cpp-exception-handling.mdx`
- `cpp-cpp-stl.mdx`
- `go-encoding-json.mdx`
- `go-gorm.mdx`
- `go-reverse-proxy.mdx`
- `go-session.mdx`
- `go-smtp.mdx`
- `go-swagger.mdx`
- `go-time.mdx`
- `go-validator.mdx`
- `go-websocket.mdx`
- `javascript-github-probot.mdx`
- `python-concurrent-futures.mdx`
- `python-python-pybluez.mdx`
- `python-python-socket.mdx`
- `python-python-tkinter.mdx`

### 5. Duplicated language-prefix instances

These subjects should not retain duplicated language prefixes:

- `cpp-cpp-exception-handling`
- `cpp-cpp-stl`
- `python-python-pybluez`
- `python-python-socket`
- `python-python-tkinter`

### 6. Placeholder or bucketed library instances

Some library subjects are anchored to a category bucket rather than the actual named library:

- `go-command` with `aspect=viper` -> likely `viper`
- `javascript-github-probot` with `aspect=github-probot` -> likely `probot`

These need subject-identity review before mass path rewrites.

## Current Subject Groups

### Programming languages

- `go` -> keep as `programming-language`
- `javascript` -> keep as `programming-language`
- `rust` -> keep as `programming-language`
- `shellscript` -> keep for now, review whether canonical alias should remain `shellscript` or become `shell`
- missing anchor to add: `dart`

### Framework groups

- `react` -> keep as framework, add canonical entity page, add `depends_on: [javascript]`
- `nextjs` -> keep as framework, add explicit relations
- `sveltekit` -> keep as framework, add canonical entity page
- `jotai` -> move to library
- `react-query` -> move to library
- `bloc` -> move to `flutter-bloc` library if Flutter-package specific
- `redux` -> review and likely re-anchor to library-level toolkit subject
- `package` -> rename to real owning subject, likely `flutter`
- `engine` -> split or rename to real owning subject, likely `flutter` or `flutter-engine`

### Library groups

The library corpus falls into four buckets:

1. keep qualified because the binding is genuinely language-specific
   Examples:
   - `go-grpc`
   - `python-grpc`
   - `cpp-grpc`
   - `javascript-firebase`
   - `go-firebase`

2. keep qualified for now but review whether the public product name should become the canonical `instance`
   Examples:
   - `python-fastapi`
   - `python-sqlalchemy`
   - `python-pyside2`
   - `javascript-prisma`
   - `javascript-threejs`

3. normalize duplicated prefixes or malformed `.mdx` suffixes
   Examples:
   - `python-python-tkinter`
   - `python-python-pybluez`
   - `python-python-socket`
   - `cpp-cpp-stl`

4. re-anchor from category buckets to named products
   Examples:
   - `go-command` -> `viper`
   - `javascript-github-probot` -> `probot`

## Recommended Migration Batches

### Batch A: rule and metadata foundation

- update `docs/AGENTS.md`
- add missing anchors: `dart`, `react`, `flutter`, `sveltekit`
- normalize malformed `.mdx` suffixes in `ontology.instance`

### Batch B: framework cleanup

- move `jotai` to `library/jotai`
- move `react-query` to `library/react-query`
- move `bloc` to `library/flutter-bloc` if confirmed by content
- re-anchor `package/linux-methodchannel` under `flutter`
- split or rename the `engine` subject

### Batch C: library identity cleanup

- remove duplicated language prefixes
- re-anchor bucketed subjects such as `go-command`
- decide which single-language public product names should drop synthetic language prefixes

### Batch D: corpus-wide relation pass

- add `subject` and `relations` frontmatter to normalized language subjects
- encode primary host-language and host-framework relationships with `depends_on`

## Immediate Execution Order

1. Update `docs/AGENTS.md` with the corpus-wide language rules.
2. Add missing canonical entity anchors.
3. Fix malformed `ontology.instance` values.
4. Execute framework cleanup.
5. Execute library cleanup in reviewed batches.
6. Rebuild `ontology/classification-registry.json`, validate, rewrite links, and build the site after each batch.
