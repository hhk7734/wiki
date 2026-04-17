# Graphify Export Implementation Plan

**Goal:** Add a graphify-ready ontology export so sentence search can use wiki text while preserving ontology fields for filtering.

**Architecture:** Build a JSONL exporter on top of `classification-registry.json`, frontmatter parsing, and lightweight MDX-to-text normalization. Emit `document`, `subject`, and `relation` records.

**Tech Stack:** Node.js, existing `script/ontology` utilities, node:test

---

### Task 1: Add export contract tests

**Files:**
- Create: `script/ontology/__tests__/graphify-export.test.mjs`

- [ ] Write failing tests for document, subject, and relation records
- [ ] Verify the tests fail because the exporter does not exist yet

### Task 2: Implement graphify exporter

**Files:**
- Create: `script/ontology/export-graphify.mjs`
- Modify: `package.json`

- [ ] Build plain-text extraction for MDX
- [ ] Build `document` records from classified docs
- [ ] Build unique `subject` records
- [ ] Build `about_subject` relations
- [ ] Add an npm script for export

### Task 3: Verify export end-to-end

**Files:**
- Modify: `ontology/graphify-export.jsonl` via script output

- [ ] Run targeted tests
- [ ] Run exporter and inspect output shape
- [ ] Run `npm run ontology:validate`
- [ ] Run `npm run build`
