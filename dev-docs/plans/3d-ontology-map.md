# 3D Ontology Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage radial SVG with a 3D ontology map that preserves ontology structure, supports click-to-preview interactions, and stays responsive on desktop and mobile.

**Architecture:** Keep the homepage data source anchored to Docusaurus-generated docs metadata, extract that metadata into a dedicated graph-builder module, and render the result with a constrained `react-force-graph-3d` scene plus a separate preview overlay. Put behavior that can be tested without a browser into the builder module first, then layer scene rendering and UI state on top.

**Tech Stack:** React, Docusaurus, TypeScript/TSX, testable `.mjs` data utilities, `react-force-graph-3d`, `three`, CSS modules, Node.js validation scripts

---

## File Structure

Planned files and responsibilities:

- Modify: `package.json`
  Add the 3D graph dependency and, if needed, a small verification script entry for the graph builder tests.
- Modify: `package-lock.json`
  Record dependency changes.
- Modify: `src/pages/index.tsx`
  Swap the homepage from `RadialTree` to the new 3D graph shell.
- Modify: `src/pages/styles.module.css`
  Add homepage layout styles for the 3D canvas container and preview overlay behavior.
- Modify: `src/css/custom.css`
  Add only site-wide tokens or fallbacks if the homepage needs shared color variables.
- Create: `src/components/OntologyGraph3D.tsx`
  Render the force graph, own selection state, and coordinate the preview panel.
- Create: `src/components/ontologyGraph/buildOntologyGraph.mjs`
  Convert Docusaurus docs metadata into stable graph nodes and links.
- Create: `src/components/ontologyGraph/buildOntologyGraph.test.mjs`
  Verify graph extraction, labeling, and parent-child linking without a browser harness.
- Create: `src/components/ontologyGraph/ontologyGraph.types.ts`
  Define shared graph node and selection shapes used by the TSX components.
- Create: `src/components/ontologyGraph/OntologyPreviewPanel.tsx`
  Render node details and the `Open document` action.
- Create: `src/components/ontologyGraph/ontologyGraph.module.css`
  Contain visual styles for the canvas wrapper, labels, preview panel, and mobile bottom sheet.
- Review: `src/components/RadialTree.tsx`
  Leave in place unless cleanup is explicitly part of the final implementation.
- Modify: `dev-docs/PRDs/README.md`
  Register the new design and plan paths.

## Scope Guardrails

- Do not change ontology content or frontmatter for docs as part of the homepage feature.
- Do not introduce a backend or generated API just for the homepage graph.
- Do not turn raw node click into immediate navigation; preview-first is part of the approved behavior.
- Do not add a full browser test framework in this feature unless a blocking gap appears.
- Do not remove `RadialTree` until the new homepage is working and verified.

### Task 1: Add a testable ontology graph builder contract

**Files:**
- Create: `src/components/ontologyGraph/buildOntologyGraph.test.mjs`
- Create: `src/components/ontologyGraph/buildOntologyGraph.mjs`
- Test: `node --test src/components/ontologyGraph/buildOntologyGraph.test.mjs`

- [ ] **Step 1: Write the failing graph-builder tests**

Cover these behaviors with small fixtures:

- role sidebars become role nodes
- intermediate path segments become group nodes
- document leaves get stable IDs and labels
- links connect parent to child in the expected order
- sidebar label wins over title, title wins over path-derived fallback

- [ ] **Step 2: Run the test file to verify it fails**

Run: `node --test src/components/ontologyGraph/buildOntologyGraph.test.mjs`
Expected: FAIL because `buildOntologyGraph.mjs` does not exist or required exports are missing

- [ ] **Step 3: Implement the minimal graph builder**

Export a function that accepts:

- docs collection data
- ontology section mapping
- doc metadata lookup

Return:

- `nodes`
- `links`

Each node should include:

- `id`
- `label`
- `type`
- `depth`
- `role`
- `docId`
- `href`
- `description`
- `childCount`

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test src/components/ontologyGraph/buildOntologyGraph.test.mjs`
Expected: PASS with all graph-builder assertions green

- [ ] **Step 5: Commit**

```bash
git add src/components/ontologyGraph/buildOntologyGraph.mjs src/components/ontologyGraph/buildOntologyGraph.test.mjs
git commit -m "test: add ontology graph builder contract"
```

### Task 2: Add 3D graph dependencies and shared TS shapes

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/components/ontologyGraph/ontologyGraph.types.ts`
- Test: `npm install`

- [ ] **Step 1: Add the runtime dependency**

Add `react-force-graph-3d` to dependencies. Add any minimal supporting dependency only if the selected label rendering strategy actually requires it.

- [ ] **Step 2: Install dependencies and update the lockfile**

Run: `npm install`
Expected: PASS with `package-lock.json` updated and no install errors

- [ ] **Step 3: Write shared graph types**

Define types for:

- graph node
- graph link
- selected node payload
- preview panel props

Keep the types small and aligned to the builder output instead of mirroring the entire Docusaurus metadata shape.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/components/ontologyGraph/ontologyGraph.types.ts
git commit -m "chore: add homepage ontology graph dependencies"
```

### Task 3: Build the preview-first overlay UI

**Files:**
- Create: `src/components/ontologyGraph/OntologyPreviewPanel.tsx`
- Create: `src/components/ontologyGraph/ontologyGraph.module.css`
- Test: `npm run build`

- [ ] **Step 1: Write the preview panel component**

Support these states:

- no selection returns `null`
- selected structural node shows label, role, and child count
- selected doc node shows label, description, ontology context, and `Open document`

- [ ] **Step 2: Add overlay and mobile-bottom-sheet styles**

Implement:

- desktop side panel
- mobile bottom sheet
- readable metadata rows
- visible close action

- [ ] **Step 3: Run a build to verify the new component compiles**

Run: `npm run build`
Expected: PASS with no TypeScript or bundling errors from the new panel files

- [ ] **Step 4: Commit**

```bash
git add src/components/ontologyGraph/OntologyPreviewPanel.tsx src/components/ontologyGraph/ontologyGraph.module.css
git commit -m "feat: add ontology graph preview panel"
```

### Task 4: Implement the constrained 3D scene

**Files:**
- Create: `src/components/OntologyGraph3D.tsx`
- Modify: `src/components/ontologyGraph/buildOntologyGraph.mjs`
- Modify: `src/components/ontologyGraph/ontologyGraph.types.ts`
- Test: `npm run build`

- [ ] **Step 1: Write a minimal scene shell that renders the graph data**

Use:

- `BrowserOnly` at the page level, not inside the component
- `react-force-graph-3d` inside `OntologyGraph3D.tsx`
- memoized graph data from `buildOntologyGraph`

- [ ] **Step 2: Add constrained layout tuning**

Tune for:

- centered root
- distinct role clustering
- lighter document nodes
- readable spacing between parent-child links

Prefer deterministic readability over maximum motion.

- [ ] **Step 3: Add selection behavior**

Implement:

- node click selects the node
- background click clears selection
- selected node visually stands out
- only a restrained subset of labels renders by default

- [ ] **Step 4: Run a build to verify scene integration**

Run: `npm run build`
Expected: PASS with the graph component bundling correctly in the Docusaurus app

- [ ] **Step 5: Commit**

```bash
git add src/components/OntologyGraph3D.tsx src/components/ontologyGraph/buildOntologyGraph.mjs src/components/ontologyGraph/ontologyGraph.types.ts
git commit -m "feat: add homepage 3d ontology graph scene"
```

### Task 5: Wire the homepage shell and responsive layout

**Files:**
- Modify: `src/pages/index.tsx`
- Modify: `src/pages/styles.module.css`
- Modify: `src/css/custom.css`
- Test: `npm run build`

- [ ] **Step 1: Replace `RadialTree` usage on the root page**

Keep the homepage shell simple:

- `Layout`
- `main`
- graph container

Mount `OntologyGraph3D` inside `BrowserOnly`.

- [ ] **Step 2: Add page-level layout styling**

Support:

- full-viewport graph presentation
- stable spacing under navbar
- overflow control
- mobile-safe preview placement

- [ ] **Step 3: Add only minimal shared CSS tokens if the scene needs them**

If the homepage can stay self-contained in module CSS, do not expand `custom.css`.

- [ ] **Step 4: Run a build to verify the full homepage compiles**

Run: `npm run build`
Expected: PASS with the root page rendering the new component

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.tsx src/pages/styles.module.css src/css/custom.css
git commit -m "feat: wire 3d ontology graph onto homepage"
```

### Task 6: Run repository validation and manual interaction checks

**Files:**
- Modify: `dev-docs/PRDs/README.md`
- Review: `dev-docs/PRDs/3d-ontology-map.md`
- Review: `dev-docs/plans/3d-ontology-map.md`

- [ ] **Step 1: Register the new design and plan in the PRD index**

Add the 3D ontology map entry to `dev-docs/PRDs/README.md`.

- [ ] **Step 2: Run ontology validation commands**

Run:

```bash
npm run ontology:bootstrap
npm run ontology:validate
```

Expected:

- bootstrap completes without ontology registry errors
- validation reports success

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: PASS with the homepage included in the output

- [ ] **Step 4: Manually verify homepage behavior**

Check:

- desktop scene loads and remains interactive
- mobile-width viewport keeps the page usable
- clicking a doc node opens a preview with the right title and link
- clicking a structural node opens a non-navigation preview
- clicking empty space clears selection
- opening a document from the preview routes correctly

- [ ] **Step 5: Commit**

```bash
git add dev-docs/PRDs/README.md
git commit -m "docs: register 3d ontology map planning docs"
```

## Execution Notes

- Start with the graph builder and its test file before adding scene code.
- Keep the graph builder pure and browser-free so it remains easy to validate with `node --test`.
- If `react-force-graph-3d` label rendering proves too noisy, reduce label density before adding more helper dependencies.
- Leave `src/components/RadialTree.tsx` untouched unless cleanup is explicitly requested after the new graph ships.
