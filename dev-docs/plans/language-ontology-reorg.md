# Language Ontology Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normalize the entire `language` ontology corpus so intrinsic subject type is encoded by `class`, while host-language and ecosystem relationships are expressed explicitly through frontmatter relations.

**Architecture:** Keep the canonical subject key as `domain/class/instance`, inventory every language-scoped language/library/framework subject, add missing entity anchors for shared ecosystems, and then migrate the corpus in controlled batches. Update ontology guidance, frontmatter, links, and registry output together so every batch lands in a valid intermediate state.

**Tech Stack:** MDX frontmatter, `docs/AGENTS.md`, `script/ontology` utilities, Node.js validation scripts, Docusaurus build

---

## File Structure

Planned files and responsibilities:

- Modify: `docs/AGENTS.md`
  Add the concrete classification and relation rules for `programming-language`, `framework`, and `library`.
- Modify: `dev-docs/PRDs/README.md`
  Register the new language ontology reorganization topic.
- Review and normalize: `docs/entity/language/programming-language/**`
  Ensure every programming language subject has a canonical entity page and explicit relations where needed.
- Review and normalize: `docs/entity/language/framework/**`
  Ensure each framework subject is correctly classified and has a canonical entity anchor.
- Review and normalize: `docs/entity/language/library/**`
  Reclassify miscategorized subjects and normalize canonical subject names.
- Review and normalize: `docs/concept/language/framework/**`
  Align concept pages to the correct canonical framework subjects.
- Review and normalize: `docs/concept/language/library/**`
  Align library concepts to canonical library subjects where present.
- Review and normalize: `docs/operation/language/framework/**`
  Move or rewrite operation docs whose subject anchor or class is incorrect.
- Review and normalize: `docs/operation/language/library/**`
  Normalize language-qualified instances and relation metadata across the full corpus.
- Create: `docs/entity/language/framework/react/react.mdx`
  Canonical entity anchor for React.
- Create: `docs/entity/language/framework/flutter/flutter.mdx`
  Canonical entity anchor for Flutter.
- Create: `docs/entity/language/programming-language/dart/dart.mdx`
  Canonical entity anchor for Dart if it does not already exist.
- Modify or move: `docs/entity/language/framework/jotai/jotai.mdx`
  Reclassify Jotai as a library and add explicit relations.
- Modify: `docs/entity/language/framework/nextjs/nextjs.mdx`
  Keep class as framework and add explicit relations.
- Modify or move: `docs/concept/language/framework/react/lifecycle.mdx`
  Align frontmatter to the new React entity anchor.
- Modify or move: `docs/operation/language/framework/bloc/event-state.mdx`
  Normalize the canonical subject to either generic `bloc` or package-specific `flutter-bloc`.
- Modify or move: `docs/operation/language/framework/bloc/observer.mdx`
  Same normalization as above.
- Modify or move: `docs/operation/language/framework/bloc/widgets.mdx`
  Same normalization as above.
- Modify via script output: `ontology/classification-registry.json`
  Regenerated classification registry after path and metadata normalization.

## Scope Guardrails

- Do not redesign non-`language` domains in this plan.
- Do not add automatic weak-relation inference to the knowledge layer.
- Do not collapse qualified instances that are still needed for subject disambiguation.
- Do not change subject identity without a documented canonicalization reason.
- Do not move the entire corpus in one edit batch. Migrate by reviewed subject groups.

### Task 1: Inventory the full language corpus

**Files:**
- Review: `docs/entity/language/programming-language/**`
- Review: `docs/entity/language/framework/**`
- Review: `docs/entity/language/library/**`
- Review: `docs/concept/language/framework/**`
- Review: `docs/concept/language/library/**`
- Review: `docs/operation/language/framework/**`
- Review: `docs/operation/language/library/**`

- [ ] **Step 1: Build an inventory of all language-domain subjects**

Collect every document under the language corpus and group by current canonical subject:

- `domain`
- `class`
- `instance`

- [ ] **Step 2: Mark each subject with a migration decision**

For each grouped subject, decide one of:

- keep as-is
- reclassify `framework -> library`
- reclassify `library -> framework`
- rename `instance`
- add missing entity anchor
- add explicit relations only

- [ ] **Step 3: Record the migration batches**

Partition the corpus into safe batches such as:

- programming languages
- framework anchors
- framework operations
- libraries grouped by ecosystem
- ambiguous or package-qualified instances

- [ ] **Step 4: Commit**

```bash
git add dev-docs/plans/language-ontology-reorg.md dev-docs/PRDs/language-ontology-reorg/design.md
git commit -m "docs: expand language ontology reorganization scope"
```

### Task 2: Encode the reorganization rules in `docs/AGENTS.md`

**Files:**
- Modify: `docs/AGENTS.md`
- Test: `npm run ontology:validate`

- [ ] **Step 1: Write the rule changes into `docs/AGENTS.md`**

Add concrete guidance for:

- `programming-language` vs `framework` vs `library`
- when to use `depends_on`, `uses`, `part_of`, and `related_to`
- when an `instance` may be language-qualified
- why free-text hints are not sufficient ontology signals

- [ ] **Step 2: Run validation to verify no ontology mismatch was introduced**

Run: `npm run ontology:validate`
Expected: PASS with `ontology validation passed`

- [ ] **Step 3: Commit**

```bash
git add docs/AGENTS.md
git commit -m "docs: define language ontology classification rules"
```

### Task 3: Add missing canonical entity anchors

**Files:**
- Create: `docs/entity/language/framework/react/react.mdx`
- Create: `docs/entity/language/framework/flutter/flutter.mdx`
- Create: `docs/entity/language/programming-language/dart/dart.mdx`
- Test: `npm run ontology:bootstrap`

- [ ] **Step 1: Create the React, Flutter, and Dart entity pages**

Each page should include:

- aligned `ontology` frontmatter
- `subject.canonical_name`
- `subject.aliases`
- explicit `relations`
- `source.status` and `source.confidence`

- [ ] **Step 2: Regenerate the classification registry**

Run: `npm run ontology:bootstrap`
Expected: PASS with updated entries for the new canonical docs

- [ ] **Step 3: Commit**

```bash
git add docs/entity/language/framework/react/react.mdx docs/entity/language/framework/flutter/flutter.mdx docs/entity/language/programming-language/dart/dart.mdx ontology/classification-registry.json
git commit -m "docs: add canonical language framework anchors"
```

### Task 4: Normalize representative framework and library anchors

**Files:**
- Modify or move: `docs/entity/language/framework/jotai/jotai.mdx`
- Modify: `docs/entity/language/framework/nextjs/nextjs.mdx`
- Test: `npm run ontology:bootstrap`
- Test: `npm run ontology:validate`

- [ ] **Step 1: Reclassify `jotai` as a library**

Move to:

```text
docs/entity/language/library/jotai/jotai.mdx
```

Add explicit relations:

- `depends_on: [react, javascript]`

- [ ] **Step 2: Keep `nextjs` as a framework and add explicit relations**

Add:

- `depends_on: [react, javascript]`

and `subject` metadata if missing.

- [ ] **Step 3: Regenerate and validate**

Run:

```bash
npm run ontology:bootstrap
npm run ontology:validate
```

Expected:

- registry rewritten without unintended fallback entries
- validation passes

- [ ] **Step 4: Commit**

```bash
git add docs/entity/language/library/jotai/jotai.mdx docs/entity/language/framework/nextjs/nextjs.mdx ontology/classification-registry.json
git commit -m "docs: normalize language framework and library metadata"
```

### Task 5: Normalize `react` and `bloc` subject anchors

**Files:**
- Modify: `docs/concept/language/framework/react/lifecycle.mdx`
- Modify or move: `docs/operation/language/framework/bloc/event-state.mdx`
- Modify or move: `docs/operation/language/framework/bloc/observer.mdx`
- Modify or move: `docs/operation/language/framework/bloc/widgets.mdx`
- Test: `npm run ontology:bootstrap`
- Test: `npm run ontology:validate`

- [ ] **Step 1: Align React concept docs to the canonical React entity**

Ensure concept and operation pages use the same subject anchor:

- `domain: language`
- `class: framework`
- `instance: react`

with explicit relations where appropriate.

- [ ] **Step 2: Decide the canonical identity for `bloc`**

Use this rule:

- if the docs describe a generic pattern, keep `instance: bloc`
- if they describe the Flutter package, rename to `flutter-bloc` and classify as `library`

- [ ] **Step 3: Move and normalize the `bloc` docs accordingly**

If package-specific, move to:

```text
docs/operation/language/library/flutter-bloc/<aspect>.mdx
```

Add:

- `depends_on: [flutter, dart]`

- [ ] **Step 4: Regenerate and validate**

Run:

```bash
npm run ontology:bootstrap
npm run ontology:validate
```

Expected: PASS with consistent canonical targets and no ontology mismatches

- [ ] **Step 5: Commit**

```bash
git add docs/concept/language/framework/react/lifecycle.mdx docs/operation/language/library/flutter-bloc docs/operation/language/framework/bloc ontology/classification-registry.json
git commit -m "docs: normalize react and bloc subject anchors"
```

### Task 6: Migrate the remaining language corpus in subject batches

**Files:**
- Modify or move: remaining files under `docs/entity/language/programming-language/**`
- Modify or move: remaining files under `docs/entity/language/framework/**`
- Modify or move: remaining files under `docs/entity/language/library/**`
- Modify or move: remaining files under `docs/concept/language/framework/**`
- Modify or move: remaining files under `docs/concept/language/library/**`
- Modify or move: remaining files under `docs/operation/language/framework/**`
- Modify or move: remaining files under `docs/operation/language/library/**`
- Modify via script output: `ontology/classification-registry.json`

- [ ] **Step 1: Execute the programming-language batch**

Normalize all language entity pages and any dependent concept or operation pages so they use consistent subject anchors and explicit relation metadata.

- [ ] **Step 2: Execute the framework batches**

Normalize framework entity, concept, and operation pages subject-by-subject. Add missing anchors, reclassify miscategorized subjects, and update relations.

- [ ] **Step 3: Execute the library batches**

Normalize library entity, concept, and operation pages subject-by-subject. Keep qualification only where required for canonical identity.

- [ ] **Step 4: Regenerate and validate after each batch**

Run after every batch:

```bash
npm run ontology:bootstrap
npm run ontology:validate
```

Expected: PASS after each batch, with no lingering ontology mismatches.

- [ ] **Step 5: Commit each completed batch**

```bash
git add docs ontology/classification-registry.json
git commit -m "docs: migrate language ontology batch"
```

### Task 7: Rewrite links and verify end to end

**Files:**
- Modify via script output: affected docs links
- Test: `npm run ontology:rewrite-links`
- Test: `npm run build`

- [ ] **Step 1: Rewrite internal links after doc moves**

Run: `npm run ontology:rewrite-links`
Expected: moved docs now referenced by their canonical `/docs/...` paths

- [ ] **Step 2: Build the site**

Run: `npm run build`
Expected: PASS with no broken doc routes caused by the reorganization

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: rewrite links after language ontology reorganization"
```
