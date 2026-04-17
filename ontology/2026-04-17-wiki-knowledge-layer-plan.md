# Wiki Knowledge Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static knowledge layer for `wiki.loliot.net` that emits compact agent-facing JSON artifacts and richer human-facing search artifacts from one canonical ontology-derived core.

**Architecture:** Keep `docs/**/*.mdx`, ontology frontmatter, and the classification registry as the semantic source of truth. Generate a canonical core of `document`, `subject`, and `relation` records first, then derive two static outputs: one raw bundle for agents and one presentation bundle for the existing Docusaurus search UI.

**Tech Stack:** Node.js, existing `script/ontology` utilities, `node:test`, Docusaurus theme overrides, static JSON artifacts

---

## File Structure

Planned files and responsibilities:

- Create: `script/ontology/build-wiki-knowledge-core.mjs`
  Builds the canonical `document`, `subject`, and `relation` records with stable ids and short evidence snippets.
- Create: `script/ontology/build-wiki-agent-artifacts.mjs`
  Derives compact agent-facing static artifacts from the canonical core.
- Create: `script/ontology/build-wiki-human-search-index.mjs`
  Derives human-facing grouped search records from the canonical core.
- Create: `script/ontology/__tests__/wiki-knowledge-core.test.mjs`
  Contract tests for canonical core generation and snippet extraction.
- Create: `script/ontology/__tests__/wiki-agent-artifacts.test.mjs`
  Contract tests for the agent-facing bundle shape.
- Create: `script/ontology/__tests__/wiki-human-search-index.test.mjs`
  Contract tests for grouped human search artifacts.
- Create: `script/ontology/__tests__/wiki-search-engine.test.mjs`
  UI-side ranking tests for grouped wiki search.
- Create: `src/components/wikiSearch/searchEngine.mjs`
  Shared search/ranking logic for subject and document results.
- Modify: `src/theme/SearchBar/index.tsx`
  Loads the new human-facing search index and renders grouped subject/document results.
- Modify: `src/theme/SearchBar/styles.module.css`
  Styles the grouped result sections and snippet presentation.
- Modify: `package.json`
  Adds scripts to build the canonical core and both static bundles during `prestart` and `prebuild`.
- Create or modify via script output: `static/api/wiki/query-index.json`
  Agent-facing query records.
- Create or modify via script output: `static/api/wiki/graph.json`
  Agent-facing node and relation graph.
- Create or modify via script output: `static/api/wiki/nodes/<id>.json`
  Agent-facing node lookup payloads.
- Create or modify via script output: `static/wiki-search-index.json`
  Human-facing grouped search records.

## Scope Guardrails

- Do not implement `path` query execution in this plan.
- Do not build a new runtime server or edge function.
- Do not add LLM-driven ranking or answer synthesis.
- Reuse existing normalization and inventory utilities where possible.

### Task 1: Define canonical core contracts

**Files:**
- Create: `script/ontology/__tests__/wiki-knowledge-core.test.mjs`
- Create: `script/ontology/build-wiki-knowledge-core.mjs`

- [ ] **Step 1: Write the failing canonical-core test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { buildWikiKnowledgeCore } from "../build-wiki-knowledge-core.mjs";

test("wiki knowledge core emits document, subject, and relation records with snippets", () => {
	const records = buildWikiKnowledgeCore([
		"docs/operation/data/storage-system/ceph/osd.mdx",
	]);

	const document = records.documents[0];
	const subject = records.subjects[0];
	const relation = records.relations[0];

	assert.equal(document.type, "document");
	assert.equal(document.subject_ref, "subject:data:storage-system:ceph");
	assert.match(document.snippet, /osd/i);
	assert.equal(subject.id, "subject:data:storage-system:ceph");
	assert.equal(relation.predicate, "about_subject");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test script/ontology/__tests__/wiki-knowledge-core.test.mjs`
Expected: FAIL with `Cannot find module '../build-wiki-knowledge-core.mjs'` or missing export error.

- [ ] **Step 3: Implement the minimal canonical-core module**

```js
export function buildWikiKnowledgeCore(selectedSources = inventory()) {
	return {
		documents: [],
		subjects: [],
		relations: [],
	};
}
```

Then expand it by reusing `frontmatter`, `inventory`, and validated classification loading to:

- build `document` records with stable ids and URLs
- build one `subject` per unique `domain/class/instance`
- build `about_subject` relations
- extract one short snippet per document from normalized text

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test script/ontology/__tests__/wiki-knowledge-core.test.mjs`
Expected: PASS with one document, one subject, and one relation contract validated.

- [ ] **Step 5: Commit**

```bash
git add script/ontology/__tests__/wiki-knowledge-core.test.mjs script/ontology/build-wiki-knowledge-core.mjs
git commit -m "feat: add wiki knowledge core builder"
```

### Task 2: Build the agent-facing static artifacts

**Files:**
- Create: `script/ontology/__tests__/wiki-agent-artifacts.test.mjs`
- Create: `script/ontology/build-wiki-agent-artifacts.mjs`
- Modify: `package.json`
- Create or modify via script output: `static/api/wiki/query-index.json`
- Create or modify via script output: `static/api/wiki/graph.json`
- Create or modify via script output: `static/api/wiki/nodes/<id>.json`

- [ ] **Step 1: Write the failing agent-artifact contract test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { buildWikiAgentArtifacts } from "../build-wiki-agent-artifacts.mjs";

test("agent artifacts expose compact query and node payloads", () => {
	const artifacts = buildWikiAgentArtifacts({
		documents: [
			{
				id: "doc:ceph-osd",
				type: "document",
				title: "Ceph OSD",
				url: "/docs/operation/data/storage-system/ceph/osd",
				snippet: "Ceph OSD management guide",
				ontology: { role: "operation", domain: "data", class: "storage-system", instance: "ceph", aspect: "osd" },
				subject_ref: "subject:data:storage-system:ceph",
			},
		],
		subjects: [
			{
				id: "subject:data:storage-system:ceph",
				type: "subject",
				canonical_name: "Ceph",
				ontology: { domain: "data", class: "storage-system", instance: "ceph" },
				document_refs: ["doc:ceph-osd"],
			},
		],
		relations: [{ from: "doc:ceph-osd", predicate: "about_subject", to: "subject:data:storage-system:ceph" }],
	});

	assert.equal(artifacts.queryIndex.subjects[0].id, "subject:data:storage-system:ceph");
	assert.equal(artifacts.queryIndex.documents[0].snippet, "Ceph OSD management guide");
	assert.equal(artifacts.nodes["subject:data:storage-system:ceph"].documents[0].id, "doc:ceph-osd");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test script/ontology/__tests__/wiki-agent-artifacts.test.mjs`
Expected: FAIL because `build-wiki-agent-artifacts.mjs` does not exist yet.

- [ ] **Step 3: Implement the artifact builder and write static files**

```js
export function buildWikiAgentArtifacts(core) {
	return {
		queryIndex: { subjects: [], documents: [] },
		graph: { nodes: [], edges: [] },
		nodes: {},
	};
}
```

Then expand it to:

- emit query records with stable ids, type, score-neutral metadata, snippet, ontology, and URL
- emit graph nodes and edges from the canonical core
- emit per-node lookup payloads under `static/api/wiki/nodes/`
- keep payloads compact and free of full normalized document text

- [ ] **Step 4: Wire build scripts and verify the artifact test passes**

Run:

```bash
node --test script/ontology/__tests__/wiki-agent-artifacts.test.mjs
npm run ontology:build:wiki-agent
```

Expected:

- test PASS
- static files created under `static/api/wiki/`

- [ ] **Step 5: Commit**

```bash
git add script/ontology/__tests__/wiki-agent-artifacts.test.mjs script/ontology/build-wiki-agent-artifacts.mjs package.json static/api/wiki
git commit -m "feat: add wiki agent artifacts"
```

### Task 3: Build the human-facing grouped search index

**Files:**
- Create: `script/ontology/__tests__/wiki-human-search-index.test.mjs`
- Create: `script/ontology/build-wiki-human-search-index.mjs`
- Create or modify via script output: `static/wiki-search-index.json`

- [ ] **Step 1: Write the failing human-index contract test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { buildWikiHumanSearchIndex } from "../build-wiki-human-search-index.mjs";

test("human search index groups subjects and documents separately", () => {
	const index = buildWikiHumanSearchIndex({
		documents: [
			{
				id: "doc:ceph-osd",
				type: "document",
				title: "Ceph OSD",
				description: "OSD management guide",
				url: "/docs/operation/data/storage-system/ceph/osd",
				snippet: "Ceph OSD management guide",
				headings: ["OSD 관리"],
				keywords: ["ceph", "osd"],
				ontology: { role: "operation", domain: "data", class: "storage-system", instance: "ceph", aspect: "osd" },
			},
		],
		subjects: [
			{
				id: "subject:data:storage-system:ceph",
				type: "subject",
				canonical_name: "Ceph",
				document_refs: ["doc:ceph-osd"],
				ontology: { domain: "data", class: "storage-system", instance: "ceph" },
			},
		],
		relations: [],
	});

	assert.equal(index.subjects[0].title, "Ceph");
	assert.equal(index.documents[0].title, "Ceph OSD");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test script/ontology/__tests__/wiki-human-search-index.test.mjs`
Expected: FAIL because the human index builder does not exist yet.

- [ ] **Step 3: Implement the grouped human index builder**

```js
export function buildWikiHumanSearchIndex(core) {
	return {
		subjects: [],
		documents: [],
	};
}
```

Then expand it to:

- derive grouped subject and document search records
- retain headings, descriptions, snippets, and lightweight display metadata
- keep ids and URLs aligned with the agent-facing bundle

- [ ] **Step 4: Run the test and emit the static index**

Run:

```bash
node --test script/ontology/__tests__/wiki-human-search-index.test.mjs
npm run ontology:build:wiki-human
```

Expected:

- test PASS
- `static/wiki-search-index.json` created or updated

- [ ] **Step 5: Commit**

```bash
git add script/ontology/__tests__/wiki-human-search-index.test.mjs script/ontology/build-wiki-human-search-index.mjs static/wiki-search-index.json
git commit -m "feat: add wiki human search index"
```

### Task 4: Replace the current search engine with grouped wiki search

**Files:**
- Create: `script/ontology/__tests__/wiki-search-engine.test.mjs`
- Create: `src/components/wikiSearch/searchEngine.mjs`
- Modify: `src/theme/SearchBar/index.tsx`
- Modify: `src/theme/SearchBar/styles.module.css`
- Optionally retire after migration: `src/components/graphifySearch/searchEngine.mjs`

- [ ] **Step 1: Write the failing UI-side search-engine test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { searchWikiIndex } from "../../../src/components/wikiSearch/searchEngine.mjs";

test("wiki search returns subject and document groups", () => {
	const result = searchWikiIndex("ceph osd 관리", {
		subjects: [
			{ id: "subject:data:storage-system:ceph", title: "Ceph", search_text: "ceph storage cluster", ontology: { instance: "ceph" } },
		],
		documents: [
			{ id: "doc:ceph-osd", title: "Ceph OSD", search_text: "ceph osd 관리 방법", ontology: { role: "operation", instance: "ceph", aspect: "osd" } },
		],
	});

	assert.equal(result.subjects[0].id, "subject:data:storage-system:ceph");
	assert.equal(result.documents[0].id, "doc:ceph-osd");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test script/ontology/__tests__/wiki-search-engine.test.mjs`
Expected: FAIL because the new grouped search engine and test file do not exist yet.

- [ ] **Step 3: Implement grouped search and update the SearchBar UI**

```js
export function searchWikiIndex(query, records, { limit = 6 } = {}) {
	return {
		subjects: [],
		documents: [],
	};
}
```

Then expand it to:

- reuse the current token normalization and Korean-particle stripping approach
- score subjects and documents separately
- return grouped results for the navbar UI
- update `src/theme/SearchBar/index.tsx` to load `static/wiki-search-index.json`
- render separate `Subjects` and `Documents` sections with snippets and ontology badges

- [ ] **Step 4: Run the targeted tests and visual verification**

Run:

```bash
node --test script/ontology/__tests__/wiki-search-engine.test.mjs
npm run start
```

Expected:

- test PASS
- navbar search shows grouped subject and document results against generated static data

- [ ] **Step 5: Commit**

```bash
git add script/ontology/__tests__/wiki-search-engine.test.mjs src/components/wikiSearch/searchEngine.mjs src/theme/SearchBar/index.tsx src/theme/SearchBar/styles.module.css
git commit -m "feat: add grouped wiki search ui"
```

### Task 5: Wire full build flow and verify end to end

**Files:**
- Modify: `package.json`
- Modify as needed: `script/ontology/build-wiki-knowledge-core.mjs`
- Modify as needed: `script/ontology/build-wiki-agent-artifacts.mjs`
- Modify as needed: `script/ontology/build-wiki-human-search-index.mjs`

- [ ] **Step 1: Add one top-level wiki build pipeline script**

```json
{
  "scripts": {
    "ontology:build:wiki": "npm run ontology:build:wiki-agent && npm run ontology:build:wiki-human",
    "prestart": "npm run ontology:prepare:graphify-search && npm run ontology:build:wiki",
    "prebuild": "npm run ontology:prepare:graphify-search && npm run ontology:build:wiki"
  }
}
```

- [ ] **Step 2: Run the full targeted test set**

Run:

```bash
node --test script/ontology/__tests__/wiki-knowledge-core.test.mjs
node --test script/ontology/__tests__/wiki-agent-artifacts.test.mjs
node --test script/ontology/__tests__/wiki-human-search-index.test.mjs
node --test script/ontology/__tests__/wiki-search-engine.test.mjs
```

Expected: all PASS

- [ ] **Step 3: Run repository verification**

Run:

```bash
npm run ontology:bootstrap
npm run ontology:validate
npm run build
```

Expected:

- ontology registry remains valid
- generated wiki artifacts are included
- Docusaurus build succeeds

- [ ] **Step 4: Inspect generated outputs for referential consistency**

Check:

- subject ids in `static/api/wiki/query-index.json` match node file names
- document URLs in human and agent bundles match
- search results link to valid routes

- [ ] **Step 5: Commit**

```bash
git add package.json script/ontology static/api/wiki static/wiki-search-index.json src/theme/SearchBar
git commit -m "feat: wire wiki knowledge layer build"
```

## Notes For Implementation

- Prefer reusing code from `script/ontology/export-graphify.mjs` instead of forking logic blindly.
- Keep snippet extraction deterministic and cheap.
- Do not expose full normalized body text in agent payloads by default.
- Ensure `subject` and `document` ids stay stable across rebuilds.
- If `path` support becomes tempting during implementation, stop and create a follow-up plan instead of expanding scope here.
