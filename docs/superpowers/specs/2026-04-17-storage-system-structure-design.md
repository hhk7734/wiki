# Storage-System Ontology Alignment Plan

Date: 2026-04-17

## Scope

This note replaces the previous storage-system restructuring proposal.

The previous version optimized for human-first grouping by placing Ceph-related pages under a shared filesystem subtree. That conflicts with `docs/AGENTS.md`, which defines the canonical model as:

```text
docs/<role>/<domain>/<class>/<instance>/<aspect>.mdx
```

This revised plan treats the filesystem as ontology-first and uses classification correctness as the primary constraint.

## Problem Statement

The current `docs/entity/data/storage-system/` subtree mixes at least four different page types:

- canonical entity pages
- procedural operation pages
- mixed entity-plus-operation pages
- incorrectly classified pages belonging to another class

Examples:

- `ceph/ceph.mdx` is a valid entity overview page.
- `monitoring/monitoring.mdx` and `reboot/reboot.mdx` are procedural and should not live under `entity`.
- `cephfs/cephfs.mdx`, `rbd/rbd.mdx`, and `object-gateway/object-gateway.mdx` appear to mix product overview with setup or provisioning steps.
- `mongodb/mongodb.mdx` belongs under `data/database`, not `data/storage-system`.

## Goals

- Align storage-system pages with the canonical ontology path model in `docs/AGENTS.md`.
- Separate `entity` pages from `operation` pages.
- Keep one primary subject per page.
- Preserve deterministic classification even when that is less convenient for browsing.
- Create a migration order with clear validation checkpoints.

## Non-Goals

- This plan does not redesign sidebars for human-first navigation.
- This plan does not rewrite all content immediately.
- This plan does not attempt a full reclassification of every `docs/` page outside the storage-system area.

## Constraints From `docs/AGENTS.md`

The following rules are binding for this migration:

- The canonical path is `docs/<role>/<domain>/<class>/<instance>/<aspect>.mdx`.
- `id` must remain equal to the filename.
- Canonical subject pages should not use repeated `overview.mdx` filenames.
- Usage, config, deploy, install, and how-to material is usually `role=operation`.
- Action pages must not be stored as entity pages.
- The filesystem path is the primary structural signal.
- Editorial buckets such as `etc` should be removed.

## Design Decision

The storage-system tree should be normalized by subject and role, not by product-family navigation.

That means:

- primary subjects such as `ceph`, `cephfs`, `rbd`, `rook-ceph`, and `local-path-provisioner` remain distinct entity instances
- procedural pages move into `docs/operation/data/storage-system/<instance>/...`
- pages that currently mix overview and procedure should be split rather than forced into a navigation-friendly folder layout

If Ceph-family grouping is still desirable for readers, it should be expressed through sidebar generation, frontmatter relations, or curated index pages, not by breaking the ontology path model.

## Canonical Target Shape

### Entity pages

```text
docs/entity/data/storage-system/ceph/ceph.mdx
docs/entity/data/storage-system/cephfs/cephfs.mdx
docs/entity/data/storage-system/rbd/rbd.mdx
docs/entity/data/storage-system/object-gateway/object-gateway.mdx
docs/entity/data/storage-system/rook-ceph/rook-ceph.mdx
docs/entity/data/storage-system/local-path-provisioner/local-path-provisioner.mdx
```

### Operation pages

```text
docs/operation/data/storage-system/ceph/monitoring.mdx
docs/operation/data/storage-system/ceph/osd.mdx
docs/operation/data/storage-system/ceph/pg.mdx
docs/operation/data/storage-system/ceph/provisioning.mdx
docs/operation/data/storage-system/ceph/reboot.mdx
docs/operation/data/storage-system/ceph/tuning.mdx
docs/operation/data/storage-system/rook-ceph/cluster.mdx
docs/operation/data/storage-system/rook-ceph/central-storage-cluster.mdx
```

### Non-storage reclassification

```text
docs/entity/data/database/mongodb/mongodb.mdx
```

## Page-Level Classification Proposal

### Keep as entity pages

These are already good or close to good as canonical entity pages:

- `docs/entity/data/storage-system/ceph/ceph.mdx`
- `docs/entity/data/storage-system/rook-ceph/rook-ceph.mdx`
- `docs/entity/data/storage-system/cephfs/cephfs.mdx`
- `docs/entity/data/storage-system/rbd/rbd.mdx`
- `docs/entity/data/storage-system/object-gateway/object-gateway.mdx`
- `docs/entity/data/storage-system/local-path-provisioner/local-path-provisioner.mdx`

Required follow-up:

- trim procedural content out of mixed pages where needed
- keep each page centered on one primary subject and one aspect

### Move to operation pages

These are primarily procedural and should move out of `entity`:

- `docs/entity/data/storage-system/cluster/cluster.mdx`
  - target: `docs/operation/data/storage-system/rook-ceph/cluster.mdx`
- `docs/entity/data/storage-system/central-storage-cluster/central-storage-cluster.mdx`
  - target: `docs/operation/data/storage-system/rook-ceph/central-storage-cluster.mdx`
- `docs/entity/data/storage-system/monitoring/monitoring.mdx`
  - target: `docs/operation/data/storage-system/ceph/monitoring.mdx`
- `docs/entity/data/storage-system/osd/osd.mdx`
  - target: `docs/operation/data/storage-system/ceph/osd.mdx`
- `docs/entity/data/storage-system/pg/pg.mdx`
  - target: `docs/operation/data/storage-system/ceph/pg.mdx`
- `docs/entity/data/storage-system/provisioning/provisioning.mdx`
  - target: `docs/operation/data/storage-system/ceph/provisioning.mdx`
- `docs/entity/data/storage-system/reboot/reboot.mdx`
  - target: `docs/operation/data/storage-system/ceph/reboot.mdx`
- `docs/entity/data/storage-system/tuning/tuning.mdx`
  - target: `docs/operation/data/storage-system/ceph/tuning.mdx`

### Split mixed entity and operation pages

These should not be moved blindly. They need content separation:

- `docs/entity/data/storage-system/rook-ceph/rook-ceph.mdx`
  - keep entity overview in place
  - move installation and deployment instructions to `docs/operation/data/storage-system/rook-ceph/install.mdx`
- `docs/entity/data/storage-system/cephfs/cephfs.mdx`
  - keep CephFS overview in place
  - move creation or configuration steps to `docs/operation/data/storage-system/cephfs/config.mdx` or `install.mdx`
- `docs/entity/data/storage-system/rbd/rbd.mdx`
  - keep RBD overview in place
  - move setup details to `docs/operation/data/storage-system/rbd/config.mdx`
- `docs/entity/data/storage-system/object-gateway/object-gateway.mdx`
  - keep object-gateway overview in place
  - move provisioning or setup details to `docs/operation/data/storage-system/object-gateway/config.mdx`

### Reclassify out of storage-system

- `docs/entity/data/storage-system/mongodb/mongodb.mdx`
  - target: `docs/entity/data/database/mongodb/mongodb.mdx`

### Review separately

- `docs/entity/data/storage-system/basics/basics.mdx`
  - this appears to be an S3-oriented page and needs separate subject classification
  - likely outcomes:
    - `docs/entity/data/storage-system/s3/s3.mdx` if it is a canonical S3 entity overview
    - `docs/comparison/...` if it is primarily price comparison material
    - a split into entity and comparison pages if it currently mixes both

## Why Ceph Should Not Become a Filesystem Container

A path such as `docs/entity/data/storage-system/ceph/cephfs.mdx` looks attractive for browsing, but it makes `ceph` act as a product-family folder rather than the canonical `instance`.

That breaks the ontology model because:

- `instance` must identify the page subject
- `aspect` must be a facet of that subject
- `cephfs` is not an aspect of `ceph`; it is its own primary subject
- operation pages should be separated by `role`, not nested under entity folders

Ceph-family relationships should instead be represented through metadata such as `related_to`, `depends_on`, `part_of`, or a future curated index page.

## Migration Phases

### Phase 1: high-confidence moves

Do the obvious role corrections first:

- move procedural Ceph pages from `entity` to `operation`
- move `mongodb` out of `storage-system`
- update frontmatter `ontology` blocks and `id`
- rewrite cross-doc links

This phase should avoid splitting documents unless the split is trivial.

### Phase 2: split mixed pages

For `rook-ceph`, `cephfs`, `rbd`, and `object-gateway`:

- separate overview content from procedural setup content
- keep the entity page as the canonical subject overview
- create new operation pages for install, config, provisioning, or deployment steps

### Phase 3: improve navigation without breaking ontology

If browsing still feels fragmented:

- add curated index pages
- enrich frontmatter relations
- adjust autogenerated sidebar labels or ordering

This phase must not change the canonical path model.

## Validation Plan

After each migration batch:

1. run `npm run ontology:validate`
2. run `npm run ontology:rewrite-links`
3. run the Docusaurus build or equivalent link validation
4. inspect sidebar output for unintended collisions or confusing labels

## Risks

- Mixed pages may require manual editorial splitting before they can be classified cleanly.
- `instance` naming for certain operations may still need refinement after the first validation pass.
- Existing links into moved pages may break if link rewrites miss anchors or hard-coded paths.

## Recommended Execution Order

1. Move procedural Ceph pages into `docs/operation/data/storage-system/ceph/`
2. Move `cluster` and `central-storage-cluster` into `docs/operation/data/storage-system/rook-ceph/`
3. Move `mongodb` into `docs/entity/data/database/mongodb/`
4. Validate and rewrite links
5. Split mixed pages in a second pass

## Open Questions

These do not block the first migration pass:

- Should `central-storage-cluster` be modeled under `rook-ceph` or `ceph` as the primary operation subject?
- Is `basics/basics.mdx` best treated as `s3`, a comparison page, or a split page set?
- Should Ceph-family navigation be expressed through curated landing pages or richer ontology relations first?
