# Taxonomy Path And Semantic Frontmatter Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `docs/` from ontology-shaped filesystem paths to human-friendly taxonomy paths while keeping ontology semantics in frontmatter and preserving working search, graph, validation, and build tooling.

**Architecture:** Treat the filesystem as a canonical taxonomy tree for navigation and human interpretation, and treat frontmatter as the semantic source of truth for subject identity and relations. Implement this as a dual-support migration: first make tooling frontmatter-first and taxonomy-aware, then migrate example docs, then bulk-migrate the remaining corpus, and finally remove legacy path-derived ontology assumptions.

**Tech Stack:** MDX frontmatter, Docusaurus docs routing, Node.js ESM scripts in `script/ontology/`, repository-local JSON artifacts under `ontology/` and `static/api/wiki/`

---

## Target Model

**Canonical taxonomy path patterns**

```text
docs/<topic>/<subject>/<page>.mdx
docs/<topic>/<subject>/<facet>/<page>.mdx
docs/<topic>/concepts/<concept>.mdx
docs/<topic>/comparisons/<name>.mdx
docs/<topic>/reference/<name>.mdx
```

**Required semantic frontmatter**

```yaml
---
id: client
title: "gRPC Go Client"
sidebar_label: Client
description: Go client usage for gRPC
keywords:
  - grpc
  - go

ontology:
  role: operation
  domain: language
  class: library
  instance: grpc
  aspect: go-client

subject:
  canonical_name: gRPC
  aliases: []

relations:
  related_to:
    - go
    - javascript
    - protobuf
  depends_on:
    - http2
  prerequisite_for: []
  part_of: []
  implements: []
  uses: []

source:
  status: supporting
  confidence: exact
---
```

**Invariants**

- Path is for taxonomy and navigation, not ontology inference.
- Every doc has one canonical path.
- Frontmatter is the semantic source of truth.
- Cross-topic and many-to-many relationships live in `relations`, not in the path.
- Tooling may validate path patterns, but must not derive ontology identity from the path for maintained docs.

### Task 1: Lock The New Model In Tests

**Files:**
- Create: `script/ontology/__tests__/taxonomy-paths.test.mjs`
- Modify: `script/ontology/__tests__/frontmatter.test.mjs`
- Modify: `script/ontology/__tests__/validate.test.mjs`
- Test: `script/ontology/__tests__/taxonomy-paths.test.mjs`

- [ ] **Step 1: Write failing tests for allowed taxonomy paths**

```js
test("validateTaxonomyPath accepts subject-owned doc pages", () => {
  assert.deepEqual(
    parseTaxonomyPath("docs/language/library/grpc/overview.mdx"),
    { topic: "language", subject: "grpc", facet: null, kind: "subject-page" },
  );
});

test("validateTaxonomyPath accepts subject facet pages", () => {
  assert.deepEqual(
    parseTaxonomyPath("docs/language/library/grpc/go/client.mdx"),
    { topic: "language", subject: "grpc", facet: "go", kind: "facet-page" },
  );
});

test("validateTaxonomyPath accepts topic concept pages", () => {
  assert.deepEqual(
    parseTaxonomyPath("docs/data/concepts/ontology.mdx"),
    { topic: "data", subject: "ontology", facet: null, kind: "topic-concept" },
  );
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test script/ontology/__tests__/taxonomy-paths.test.mjs script/ontology/__tests__/frontmatter.test.mjs script/ontology/__tests__/validate.test.mjs`

Expected: FAIL with missing `parseTaxonomyPath` support and path-alignment assumptions still enforced.

- [ ] **Step 3: Add failing tests for frontmatter-first semantics**

```js
test("normalizeOntologyBlock preserves semantic metadata without path coupling", () => {
  const next = normalizeOntologyBlock({
    role: "operation",
    domain: "language",
    className: "library",
    instance: "grpc",
    aspect: "go-client",
    sourceStatus: "supporting",
  });

  assert.equal(next.ontology.instance, "grpc");
  assert.equal(next.ontology.aspect, "go-client");
  assert.equal(next.source.status, "supporting");
});

test("validateCorpus allows taxonomy paths that do not encode ontology role", async () => {
  // fixture path: docs/data/concepts/ontology.mdx
  // frontmatter ontology.role: concept
});
```

- [ ] **Step 4: Run the test set again**

Run: `node --test script/ontology/__tests__/taxonomy-paths.test.mjs script/ontology/__tests__/frontmatter.test.mjs script/ontology/__tests__/validate.test.mjs`

Expected: FAIL only for the newly asserted behaviors.

- [ ] **Step 5: Commit**

```bash
git add script/ontology/__tests__/taxonomy-paths.test.mjs script/ontology/__tests__/frontmatter.test.mjs script/ontology/__tests__/validate.test.mjs
git commit -m "test: capture taxonomy path and semantic frontmatter rules"
```

### Task 2: Introduce A Taxonomy-Path Parser And Decouple Frontmatter Normalization

**Files:**
- Create: `script/ontology/taxonomy-paths.mjs`
- Modify: `script/ontology/ontology-frontmatter.mjs`
- Modify: `script/ontology/frontmatter.mjs`
- Test: `script/ontology/__tests__/taxonomy-paths.test.mjs`

- [ ] **Step 1: Implement `parseTaxonomyPath` and `validateTaxonomyPath`**

```js
const TOPIC_BUCKETS = new Set([
  "language",
  "platform",
  "hardware",
  "protocol",
  "data",
  "mlops",
  "science",
  "management",
]);

export function parseTaxonomyPath(sourcePath) {
  const parts = sourcePath.replaceAll("\\\\", "/").split("/").filter(Boolean);

  if (parts[0] !== "docs" || !sourcePath.endsWith(".mdx")) {
    throw new Error(`unsupported docs path: ${sourcePath}`);
  }

  const topic = parts[1];
  if (!TOPIC_BUCKETS.has(topic)) {
    throw new Error(`unsupported topic bucket: ${topic}`);
  }

  if (parts[2] === "concepts" || parts[2] === "comparisons" || parts[2] === "reference") {
    return { topic, subject: parts[3]?.replace(/\.mdx$/, ""), facet: null, kind: `topic-${parts[2].slice(0, -1)}` };
  }

  if (parts.length === 4) {
    return { topic, subject: parts[2], facet: null, kind: "subject-page" };
  }

  if (parts.length === 5) {
    return { topic, subject: parts[2], facet: parts[3], kind: "facet-page" };
  }

  throw new Error(`unsupported taxonomy shape: ${sourcePath}`);
}
```

- [ ] **Step 2: Update `normalizeOntologyBlock` to stop implying path alignment**

```js
export function normalizeOntologyBlock(parts) {
  const sourceStatus = parts.sourceStatus ?? (parts.aspect === "overview" ? "canonical" : "supporting");

  return {
    ontology: {
      role: parts.role,
      domain: parts.domain,
      class: parts.className,
      instance: parts.instance,
      aspect: parts.aspect,
    },
    source: {
      status: sourceStatus,
      confidence: parts.sourceConfidence ?? "exact",
    },
  };
}
```

- [ ] **Step 3: Add frontmatter helpers for required semantic blocks**

```js
export function requireSemanticFrontmatter(frontmatter, sourcePath) {
  if (!frontmatter.ontology?.instance || !frontmatter.subject?.canonical_name || !frontmatter.relations) {
    throw new Error(`missing semantic frontmatter in ${sourcePath}`);
  }
}
```

- [ ] **Step 4: Run focused tests**

Run: `node --test script/ontology/__tests__/taxonomy-paths.test.mjs script/ontology/__tests__/frontmatter.test.mjs`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add script/ontology/taxonomy-paths.mjs script/ontology/ontology-frontmatter.mjs script/ontology/frontmatter.mjs script/ontology/__tests__/taxonomy-paths.test.mjs script/ontology/__tests__/frontmatter.test.mjs
git commit -m "feat: add taxonomy path parser and semantic frontmatter helpers"
```

### Task 3: Make Registry Bootstrap And Validation Frontmatter-First

**Files:**
- Modify: `script/ontology/bootstrap-registry.mjs`
- Modify: `script/ontology/validate.mjs`
- Modify: `script/ontology/pathing.mjs`
- Test: `script/ontology/__tests__/validate.test.mjs`
- Test: `script/ontology/__tests__/pathing.test.mjs`

- [ ] **Step 1: Write failing validation tests for frontmatter-first registry entries**

```js
test("bootstrapRegistry reads ontology metadata from frontmatter for maintained docs", () => {
  const entries = bootstrapRegistry(["docs/data/concepts/ontology.mdx"]);
  assert.equal(entries[0].ontology.instance, "ontology");
  assert.equal(entries[0].target, "docs/data/concepts/ontology.mdx");
});
```

- [ ] **Step 2: Update bootstrap to read frontmatter first**

```js
function classifySeedFromFrontmatter(source) {
  const frontmatter = readFrontmatter(resolve(ROOT_DIR, source));
  requireSemanticFrontmatter(frontmatter, source);

  return {
    source,
    target: source,
    ontology: {
      role: frontmatter.ontology.role,
      domain: frontmatter.ontology.domain,
      class: frontmatter.ontology.class,
      instance: frontmatter.ontology.instance,
      aspect: frontmatter.ontology.aspect,
    },
  };
}
```

- [ ] **Step 3: Keep legacy pathing behind an explicit compatibility branch**

```js
export function classifySeed(sourcePath) {
  if (sourcePath.startsWith("docs/entity/") || sourcePath.startsWith("docs/concept/") || sourcePath.startsWith("docs/operation/")) {
    return classifyLegacyOntologyPath(sourcePath);
  }

  return classifySeedFromFrontmatter(sourcePath);
}
```

- [ ] **Step 4: Relax validation to check approved taxonomy patterns instead of ontology-path alignment**

Run: `node --test script/ontology/__tests__/validate.test.mjs script/ontology/__tests__/pathing.test.mjs`

Expected: PASS with both legacy and new taxonomy fixtures supported.

- [ ] **Step 5: Commit**

```bash
git add script/ontology/bootstrap-registry.mjs script/ontology/validate.mjs script/ontology/pathing.mjs script/ontology/__tests__/validate.test.mjs script/ontology/__tests__/pathing.test.mjs
git commit -m "feat: make ontology registry and validation frontmatter-first"
```

### Task 4: Update Knowledge-Core And Build Artifacts To Treat Path As Taxonomy

**Files:**
- Modify: `script/ontology/build-wiki-knowledge-core.mjs`
- Modify: `script/ontology/wiki-knowledge-shared.mjs`
- Modify: `script/ontology/build-graphify-search-index.mjs`
- Modify: `script/ontology/build-wiki-agent-artifacts.mjs`
- Modify: `script/ontology/build-wiki-human-search-index.mjs`
- Test: `script/ontology/__tests__/graphify-export.test.mjs`
- Test: `script/ontology/__tests__/wiki-agent-artifacts.test.mjs`
- Test: `script/ontology/__tests__/wiki-knowledge-core.test.mjs`

- [ ] **Step 1: Add failing tests proving document URLs remain source-path-based while subject identity remains ontology-based**

```js
assert.equal(document.source_path, "docs/language/library/grpc/go/client.mdx");
assert.equal(document.subject_ref, "subject:language:library:grpc");
```

- [ ] **Step 2: Update snapshot builders to derive UI path fields from the taxonomy path and subject identity from semantic frontmatter**

```js
return buildDocumentSnapshot(sourcePath, entry.ontology, {
  taxonomy: parseTaxonomyPath(sourcePath),
});
```

- [ ] **Step 3: Ensure search subtitles and graph labels do not assume the old ontology-path tree**

Run: `node --test script/ontology/__tests__/graphify-export.test.mjs script/ontology/__tests__/wiki-agent-artifacts.test.mjs script/ontology/__tests__/wiki-knowledge-core.test.mjs`

Expected: PASS

- [ ] **Step 4: Run artifact builds**

Run: `npm run ontology:bootstrap && npm run ontology:validate && npm run ontology:build:wiki`

Expected: success, with document nodes keyed by source path and subject nodes keyed by semantic identity.

- [ ] **Step 5: Commit**

```bash
git add script/ontology/build-wiki-knowledge-core.mjs script/ontology/wiki-knowledge-shared.mjs script/ontology/build-graphify-search-index.mjs script/ontology/build-wiki-agent-artifacts.mjs script/ontology/build-wiki-human-search-index.mjs script/ontology/__tests__/graphify-export.test.mjs script/ontology/__tests__/wiki-agent-artifacts.test.mjs script/ontology/__tests__/wiki-knowledge-core.test.mjs ontology static/api/wiki static/wiki-search-index.json
git commit -m "feat: treat docs paths as taxonomy in knowledge artifacts"
```

### Task 5: Pilot The New Model On A Small Doc Slice

**Files:**
- Modify: `docs/AGENTS.md`
- Modify: `docs/data/concepts/ontology.mdx`
- Modify: `docs/data/concepts/taxonomy.mdx`
- Modify: `docs/data/concepts/schema.mdx`
- Modify: `docs/data/concepts/knowledge-graph.mdx`
- Modify: `docs/data/concepts/metadata.mdx`
- Modify: `script/ontology/migrate.mjs`

- [ ] **Step 1: Rewrite the pilot docs into the new taxonomy paths**

```text
docs/data/concepts/ontology.mdx
docs/data/concepts/taxonomy.mdx
docs/data/concepts/schema.mdx
docs/data/concepts/knowledge-graph.mdx
docs/data/concepts/metadata.mdx
```

- [ ] **Step 2: Preserve ontology semantics in frontmatter while moving paths**

```yaml
ontology:
  role: concept
  domain: data
  class: concept
  instance: ontology
  aspect: overview
```

- [ ] **Step 3: Update `docs/AGENTS.md` to describe the new taxonomy-first model**

```md
- `docs/` is a taxonomy-first documentation tree.
- The filesystem path is the canonical navigation path for humans.
- Frontmatter provides semantic metadata for ontology, graph extraction, and agent use.
```

- [ ] **Step 4: Run the pilot migration and full verification**

Run: `npm run ontology:bootstrap && npm run ontology:validate && npm run build`

Expected: PASS, with the moved `data concepts` slice rendered under the new URLs.

- [ ] **Step 5: Commit**

```bash
git add docs/AGENTS.md docs/data/concepts script/ontology/migrate.mjs ontology static/api/wiki static/wiki-search-index.json
git commit -m "docs: pilot taxonomy-first path model for data concepts"
```

### Task 6: Bulk-Migrate The Remaining Corpus And Remove Legacy Path Inference

**Files:**
- Modify: `script/ontology/pathing.mjs`
- Modify: `script/ontology/rewrite-links.mjs`
- Modify: `script/ontology/migrate.mjs`
- Modify: `docs/**/*`
- Test: `script/ontology/__tests__/pathing.test.mjs`
- Test: `script/ontology/__tests__/validate.test.mjs`

- [ ] **Step 1: Add a fixture list of old-to-new path mappings**

```json
{
  "docs/data/concepts/ontology.mdx": "docs/data/concepts/ontology.mdx",
  "docs/entity/language/programming-language/go/go.mdx": "docs/language/go/overview.mdx"
}
```

- [ ] **Step 2: Update migration tooling to rewrite links using the mapping and new taxonomy parser**

Run: `node script/ontology/migrate.mjs --mapping ontology/path-mapping.json --write`

Expected: docs moved and `/docs/...` links rewritten to the new canonical taxonomy URLs.

- [ ] **Step 3: Remove fallback path classification for maintained docs**

```js
throw new Error(`legacy ontology-path classification is no longer allowed for maintained docs: ${sourcePath}`);
```

- [ ] **Step 4: Run the full test and build suite**

Run: `node --test script/ontology/__tests__/*.test.mjs && npm run ontology:bootstrap && npm run ontology:validate && npm run build`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs script/ontology ontology static/api/wiki static/wiki-search-index.json
git commit -m "refactor: migrate docs to taxonomy-first paths"
```

## Notes For Execution

- Do not rewrite the entire corpus before Task 3 passes. The tooling must support frontmatter-first semantics before the path migration begins.
- Keep `target` in the registry equal to the source path during the transition to minimize downstream breakage.
- If renaming `target` to `canonical_path` is desirable, do it only after the migration stabilizes and artifact consumers are updated.
- Multi-language libraries should remain subject-first in taxonomy:

```text
docs/language/library/grpc/overview.mdx
docs/language/library/grpc/go/client.mdx
docs/language/library/grpc/javascript/client.mdx
```

- `syntax` remains a subject-owned facet, not a top-level taxonomy bucket:

```text
docs/language/go/syntax/overview.mdx
docs/protocol/openapi/syntax/schema-object.mdx
```
