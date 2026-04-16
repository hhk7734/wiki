# Wiki Ontology Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize `docs/` into an ontology-first tree, add deterministic migration/validation tooling, and keep the Docusaurus site building against the new structure.

**Architecture:** Build a small Node-based ontology toolchain under `script/ontology/` that inventories existing MDX files, classifies each file into the approved ontology axes, computes canonical target paths, rewrites frontmatter and `/docs/...` links, and validates the result before and after the destructive move. Simplify the current hand-maintained navigation so the new ontology tree becomes the source of truth instead of the old sidebar taxonomy.

**Tech Stack:** Docusaurus 3, Node built-in test runner, plain `.mjs` scripts, JSON registries, MDX frontmatter, existing `npm run build` and `npm run lint`

---

## Planned File Structure

**Create:**
- `ontology/vocabulary.json`
- `ontology/classification-registry.json`
- `script/ontology/constants.mjs`
- `script/ontology/pathing.mjs`
- `script/ontology/frontmatter.mjs`
- `script/ontology/inventory.mjs`
- `script/ontology/bootstrap-registry.mjs`
- `script/ontology/migrate.mjs`
- `script/ontology/rewrite-links.mjs`
- `script/ontology/validate.mjs`
- `script/ontology/__tests__/pathing.test.mjs`
- `script/ontology/__tests__/frontmatter.test.mjs`
- `script/ontology/__tests__/validate.test.mjs`

**Modify:**
- `package.json`
- `sidebars.ts`
- `navbar.ts`
- `src/components/RadialTree.tsx`
- `README.md`
- `docs/**/*.mdx`

**Do not modify unless required by a failing build:**
- `sidebars-2021-05.ts`
- `sidebars-2024-01.ts`
- `sidebars-2026-01.ts`
- `docusaurus.config.ts`

## Execution Notes

- The approved spec uses `overview.mdx` for canonical subject pages, but this repo’s doc convention requires `id == filename`. Repeated `overview.mdx` files would create duplicate IDs. Implementation must preserve `aspect: overview` while using unique filenames for canonical pages, for example `docs/entity/language/programming-language/go/go.mdx` with `ontology.aspect: overview`.
- Exclude `docs/superpowers/**` from ontology migration and validation scope.
- Treat Git history as the rollback strategy. Do not build a second in-repo backup system.

### Task 1: Add Ontology Vocabulary And Canonical Pathing

**Files:**
- Create: `ontology/vocabulary.json`
- Create: `script/ontology/constants.mjs`
- Create: `script/ontology/pathing.mjs`
- Create: `script/ontology/__tests__/pathing.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing pathing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { buildTargetPath } from "../pathing.mjs";

test("buildTargetPath uses unique canonical filenames for overview pages", () => {
	assert.equal(
		buildTargetPath({
			role: "entity",
			domain: "language",
			className: "programming-language",
			instance: "go",
			aspect: "overview",
		}),
		"docs/entity/language/programming-language/go/go.mdx",
	);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test script/ontology/__tests__/pathing.test.mjs`
Expected: FAIL with `Cannot find module '../pathing.mjs'`

- [ ] **Step 3: Add ontology vocabulary**

```json
{
	"roles": ["entity", "concept", "operation", "specification", "troubleshooting", "comparison"],
	"domains": ["language", "platform", "hardware", "protocol", "data", "mlops", "science", "management"]
}
```

- [ ] **Step 4: Implement canonical path generation**

```js
export function buildTargetPath({ role, domain, className, instance, aspect }) {
	const filename = aspect === "overview" ? instance : aspect;
	return `docs/${role}/${domain}/${className}/${instance}/${filename}.mdx`;
}
```

- [ ] **Step 5: Add package scripts for ontology tooling**

```json
{
	"scripts": {
		"ontology:validate": "node script/ontology/validate.mjs",
		"ontology:inventory": "node script/ontology/inventory.mjs",
		"ontology:bootstrap": "node script/ontology/bootstrap-registry.mjs",
		"ontology:migrate": "node script/ontology/migrate.mjs",
		"ontology:rewrite-links": "node script/ontology/rewrite-links.mjs",
		"test:ontology": "node --test script/ontology/__tests__/*.test.mjs"
	}
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `node --test script/ontology/__tests__/pathing.test.mjs`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add package.json ontology/vocabulary.json script/ontology/constants.mjs script/ontology/pathing.mjs script/ontology/__tests__/pathing.test.mjs
git commit -m "feat: add ontology vocabulary and pathing"
```

### Task 2: Inventory Existing Docs And Bootstrap The Classification Registry

**Files:**
- Create: `ontology/classification-registry.json`
- Create: `script/ontology/inventory.mjs`
- Create: `script/ontology/bootstrap-registry.mjs`
- Modify: `script/ontology/pathing.mjs`
- Test: `script/ontology/__tests__/pathing.test.mjs`

- [ ] **Step 1: Extend the test with a real source-path case**

```js
test("current Go overview path maps to canonical ontology path", () => {
	assert.equal(
		classifySeed("docs/lang/go/go.mdx").target,
		"docs/entity/language/programming-language/go/go.mdx",
	);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test script/ontology/__tests__/pathing.test.mjs`
Expected: FAIL with `classifySeed is not a function`

- [ ] **Step 3: Implement inventory scanning excluding `docs/superpowers/**`**

```js
const files = walk("docs").filter((file) => file.endsWith(".mdx") && !file.startsWith("docs/superpowers/"));
```

- [ ] **Step 4: Implement bootstrap classification output**

```js
{
	"source": "docs/lang/go/go.mdx",
	"target": "docs/entity/language/programming-language/go/go.mdx",
	"ontology": {
		"role": "entity",
		"domain": "language",
		"class": "programming-language",
		"instance": "go",
		"aspect": "overview"
	}
}
```

- [ ] **Step 5: Run the bootstrap tool and inspect output**

Run: `npm run ontology:bootstrap`
Expected: `ontology/classification-registry.json` created with one entry per current MDX file outside `docs/superpowers/**`

- [ ] **Step 6: Run test to verify it passes**

Run: `node --test script/ontology/__tests__/pathing.test.mjs`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add ontology/classification-registry.json script/ontology/inventory.mjs script/ontology/bootstrap-registry.mjs script/ontology/pathing.mjs script/ontology/__tests__/pathing.test.mjs
git commit -m "feat: bootstrap ontology classification registry"
```

### Task 3: Add Frontmatter Parsing And Ontology Validation

**Files:**
- Create: `script/ontology/frontmatter.mjs`
- Create: `script/ontology/validate.mjs`
- Create: `script/ontology/__tests__/frontmatter.test.mjs`
- Create: `script/ontology/__tests__/validate.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing frontmatter test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { normalizeOntologyBlock } from "../frontmatter.mjs";

test("normalizeOntologyBlock keeps path and ontology metadata aligned", () => {
	const next = normalizeOntologyBlock({
		role: "entity",
		domain: "language",
		className: "programming-language",
		instance: "go",
		aspect: "overview",
	});

	assert.equal(next.ontology.instance, "go");
	assert.equal(next.ontology.aspect, "overview");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test script/ontology/__tests__/frontmatter.test.mjs script/ontology/__tests__/validate.test.mjs`
Expected: FAIL with `Cannot find module '../frontmatter.mjs'`

- [ ] **Step 3: Implement frontmatter normalization helpers**

```js
export function normalizeOntologyBlock(parts) {
	return {
		ontology: {
			role: parts.role,
			domain: parts.domain,
			class: parts.className,
			instance: parts.instance,
			aspect: parts.aspect,
		},
		source: {
			status: parts.aspect === "overview" ? "canonical" : "supporting",
			confidence: "exact",
		},
	};
}
```

- [ ] **Step 4: Implement validator checks**

```js
if (legacyPath.includes("/etc/")) throw new Error("forbidden editorial bucket");
if (seenTargets.has(target)) throw new Error(`duplicate target path: ${target}`);
if (docId !== filename) throw new Error(`id mismatch: ${docId} != ${filename}`);
```

- [ ] **Step 5: Run validation against the bootstrap registry**

Run: `npm run ontology:validate`
Expected: FAIL initially on known collisions, bad legacy buckets, or unclassified entries until registry rules are completed

- [ ] **Step 6: Fix validator expectations and rerun tests**

Run: `npm run test:ontology`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add package.json script/ontology/frontmatter.mjs script/ontology/validate.mjs script/ontology/__tests__/frontmatter.test.mjs script/ontology/__tests__/validate.test.mjs
git commit -m "feat: add ontology frontmatter and validation"
```

### Task 4: Implement Destructive Migration And Link Rewriting

**Files:**
- Create: `script/ontology/migrate.mjs`
- Create: `script/ontology/rewrite-links.mjs`
- Modify: `script/ontology/frontmatter.mjs`
- Modify: `script/ontology/validate.mjs`
- Test: `script/ontology/__tests__/validate.test.mjs`

- [ ] **Step 1: Add a failing test for `/docs/...` link rewriting**

```js
test("rewriteDocLinks updates absolute doc links using the registry map", () => {
	const output = rewriteDocLinks(
		'See [Go](/docs/lang/go/go.mdx) and [CORS](/docs/lang/design/protocol-spec/http/cors.mdx).',
		new Map([
			["/docs/lang/go/go.mdx", "/docs/entity/language/programming-language/go/go.mdx"],
			["/docs/lang/design/protocol-spec/http/cors.mdx", "/docs/specification/protocol/application-protocol/http/cors.mdx"],
		]),
	);

	assert.match(output, /\/docs\/entity\/language\/programming-language\/go\/go\.mdx/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test script/ontology/__tests__/validate.test.mjs`
Expected: FAIL with `rewriteDocLinks is not a function`

- [ ] **Step 3: Implement migration in dry-run mode first**

```js
for (const entry of registry) {
	console.log(`${entry.source} -> ${entry.target}`);
}
```

- [ ] **Step 4: Implement frontmatter rewrite during moves**

```js
const filename = path.basename(entry.target, ".mdx");
doc.data.id = filename;
doc.data.ontology = normalized.ontology;
```

- [ ] **Step 5: Implement absolute-link rewriting for all MDX files**

```js
content = content.replaceAll(oldDocPath, newDocPath);
```

- [ ] **Step 6: Run the dry-run migration and then the real move**

Run: `npm run ontology:migrate -- --dry-run`
Expected: prints the full rename plan with no filesystem writes

Run: `npm run ontology:migrate`
Expected: `docs/**/*.mdx` moved into ontology paths and frontmatter rewritten

- [ ] **Step 7: Run the link rewriter**

Run: `npm run ontology:rewrite-links`
Expected: all internal `/docs/...` links updated to the new ontology paths

- [ ] **Step 8: Commit**

```bash
git add docs script/ontology/migrate.mjs script/ontology/rewrite-links.mjs script/ontology/frontmatter.mjs script/ontology/validate.mjs
git commit -m "refactor: migrate docs into ontology tree"
```

### Task 5: Replace Legacy Manual Navigation With Ontology-Driven Navigation

**Files:**
- Modify: `sidebars.ts`
- Modify: `navbar.ts`
- Modify: `src/components/RadialTree.tsx`
- Modify: `src/pages/index.tsx`

- [ ] **Step 1: Write the failing build check**

Run: `npm run build`
Expected: FAIL because old sidebar IDs still point at removed legacy doc IDs such as `lang/go/go`

- [ ] **Step 2: Simplify sidebars to match ontology top-level sections**

```ts
const sidebars: SidebarsConfig = {
	entity: [{ type: "autogenerated", dirName: "entity" }],
	concept: [{ type: "autogenerated", dirName: "concept" }],
	operation: [{ type: "autogenerated", dirName: "operation" }],
	specification: [{ type: "autogenerated", dirName: "specification" }],
	troubleshooting: [{ type: "autogenerated", dirName: "troubleshooting" }],
	comparison: [{ type: "autogenerated", dirName: "comparison" }],
};
```

- [ ] **Step 3: Replace the old navbar taxonomy with ontology sections**

```ts
export const navbar = {
	Ontology: {
		Entity: "entity",
		Concept: "concept",
		Operation: "operation",
		Specification: "specification",
		Troubleshooting: "troubleshooting",
		Comparison: "comparison",
	},
};
```

- [ ] **Step 4: Update `RadialTree` to render the new sidebar shape without legacy prefix stripping**

```ts
function docToTreeData(doc: string | SidebarItemDoc): TreeData {
	if (typeof doc === "string") return { name: doc.split("/").slice(-2, -1)[0] ?? doc };
	return { name: doc.label ?? doc.id };
}
```

- [ ] **Step 5: Re-run the site build**

Run: `npm run build`
Expected: PASS with autogenerated ontology sidebars

- [ ] **Step 6: Commit**

```bash
git add sidebars.ts navbar.ts src/components/RadialTree.tsx src/pages/index.tsx
git commit -m "refactor: replace legacy navigation with ontology navigation"
```

### Task 6: Clean The Classification Registry Until Validation Is Green

**Files:**
- Modify: `ontology/classification-registry.json`
- Modify: `docs/**/*.mdx`
- Test: `script/ontology/__tests__/validate.test.mjs`

- [ ] **Step 1: Run validation on the migrated tree**

Run: `npm run ontology:validate`
Expected: FAIL on any remaining ambiguous classification, duplicate target, or `id == filename` mismatch

- [ ] **Step 2: Fix one collision class at a time in the registry**

```json
{
	"source": "docs/lang/design/protocol-spec/protobuf/protobuf.mdx",
	"target": "docs/specification/protocol/interface-definition/protobuf/protobuf.mdx",
	"ontology": {
		"role": "specification",
		"domain": "protocol",
		"class": "interface-definition",
		"instance": "protobuf",
		"aspect": "overview"
	}
}
```

- [ ] **Step 3: Re-run validation after each fix batch**

Run: `npm run ontology:validate`
Expected: progressively fewer failures until zero remain

- [ ] **Step 4: Re-run ontology tests**

Run: `npm run test:ontology`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add ontology/classification-registry.json docs script/ontology/__tests__/validate.test.mjs
git commit -m "chore: finalize ontology classifications"
```

### Task 7: Final Verification And Operator Documentation

**Files:**
- Modify: `README.md`
- Modify: `package.json`

- [ ] **Step 1: Add README commands for ontology maintenance**

````md
## ontology

```shell
npm run ontology:bootstrap
npm run ontology:validate
npm run ontology:migrate -- --dry-run
```
````

- [ ] **Step 2: Run formatting/lint/build verification**

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS

Run: `npm run test:ontology`
Expected: PASS

- [ ] **Step 3: Check git status for unintended files**

Run: `git status --short`
Expected: only intended ontology, docs, navigation, and README changes remain

- [ ] **Step 4: Commit**

```bash
git add README.md package.json
git commit -m "docs: document ontology workflow"
```

## Verification Checklist

- `npm run test:ontology`
- `npm run lint`
- `npm run build`
- `npm run ontology:validate`
- spot-check a few rewritten links in migrated docs
- confirm `src/components/RadialTree.tsx` renders against new sidebar IDs

## Risks To Watch

- duplicate filenames if canonical pages still use `overview.mdx`
- broken sidebar IDs from old manual taxonomy
- missed `/docs/...` links inside reference blocks
- mixed-subject pages that need manual reclassification before the move
- accidental migration of `docs/superpowers/**`
