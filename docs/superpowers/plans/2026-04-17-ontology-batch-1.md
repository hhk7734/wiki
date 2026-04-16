# Ontology Batch 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the first high-confidence ontology corrections using content-based classification rather than filename-only heuristics.

**Architecture:** Update the highest-confidence mismatches in small batches. Use direct file moves plus frontmatter alignment, then rewrite `/docs/...` links and run ontology validation. Avoid mixed-page splits in this batch.

**Tech Stack:** Docusaurus MDX, ontology scripts in `script/ontology/`, JSON registry, markdown link rewriting

---

### Task 1: Move high-confidence storage-system operation pages out of `entity`

**Files:**
- Modify: `docs/entity/data/storage-system/cluster/cluster.mdx`
- Modify: `docs/entity/data/storage-system/central-storage-cluster/central-storage-cluster.mdx`
- Modify: `docs/entity/data/storage-system/monitoring/monitoring.mdx`
- Modify: `docs/entity/data/storage-system/osd/osd.mdx`
- Modify: `docs/entity/data/storage-system/pg/pg.mdx`
- Modify: `docs/entity/data/storage-system/provisioning/provisioning.mdx`
- Modify: `docs/entity/data/storage-system/reboot/reboot.mdx`
- Modify: `docs/entity/data/storage-system/tuning/tuning.mdx`
- Create: `docs/operation/data/storage-system/ceph/*.mdx`
- Create: `docs/operation/data/storage-system/rook-ceph/*.mdx`

- [ ] Move files to `operation/...`
- [ ] Update `id` and `ontology` blocks
- [ ] Leave content unchanged except path-alignment fixes

### Task 2: Reclassify obvious class mismatch

**Files:**
- Modify: `docs/entity/data/storage-system/mongodb/mongodb.mdx`
- Create or update: `docs/entity/data/database/mongodb/mongodb.mdx`

- [ ] Compare both MongoDB pages
- [ ] Keep both for now if subjects differ
- [ ] Reclassify the Helm-install page into the correct `database` location or merge if trivially safe

### Task 3: Reclassify high-confidence tool-owned concept and operation pages

**Files:**
- Modify: `docs/entity/mlops/iac-tool/config/config.mdx`
- Modify: `docs/entity/mlops/iac-tool/dynamic/dynamic.mdx`
- Modify: `docs/entity/mlops/iac-tool/resource-options/resource-options.mdx`
- Modify: `docs/entity/mlops/iac-tool/stack-reference/stack-reference.mdx`
- Modify: `docs/entity/mlops/iac-tool/stack/stack.mdx`
- Modify: `docs/entity/mlops/iac-tool/micro-stack/micro-stack.mdx`
- Modify: `docs/entity/mlops/iac-tool/import-export/import-export.mdx`
- Create: `docs/concept/mlops/iac-tool/pulumi/*.mdx`
- Create: `docs/concept/mlops/iac-tool/terragrunt/*.mdx`
- Create: `docs/operation/mlops/iac-tool/pulumi/*.mdx`

- [ ] Move Pulumi and Terragrunt concept pages under tool-owned instances
- [ ] Move `import-export` under `operation/mlops/iac-tool/pulumi/`
- [ ] Keep mixed pages unsplit unless a simple rename and role-change is enough

### Task 4: Rewrite links and validate

**Files:**
- Modify: affected docs with `/docs/...` references
- Modify: `ontology/classification-registry.json`

- [ ] Refresh registry entries for edited pages
- [ ] Rewrite links using the ontology link rewriter
- [ ] Run `npm run ontology:validate`
- [ ] Run `npm run build` if validation passes

### Task 5: Commit batch

**Files:**
- Commit all batch-1 ontology corrections

- [ ] Review `git diff`
- [ ] Commit with a focused ontology migration message
