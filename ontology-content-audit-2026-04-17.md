# Ontology Content Audit

Date: 2026-04-17

## Scope

This audit is content-first.

The goal is not to rename files based on filenames alone. The goal is to check whether each document's current path and filename faithfully encode the page's actual primary subject.

This first pass focuses on the highest-risk ontology mismatches:

- `entity` pages using generic `instance` names
- `entity` pages whose titles or first sections are clearly procedural
- mixed pages where overview and how-to content are merged
- paths whose current class or instance does not match the page body

## Method

1. Inventory the current `docs/` tree and ontology metadata.
2. Shortlist high-risk candidates using path patterns only as a filter.
3. Read actual content, starting from frontmatter, title, and first content sections.
4. Classify the real primary subject and the dominant role.
5. Recommend the target path only after the subject is clear.

## Inventory Signals

- Total `docs/**/*.md(x)` files: 622
- MDX files with an `ontology:` block: 614
- `entity` pages using high-risk generic `instance` names in the initial shortlist: 35
- `entity` pages with clearly procedural titles in the initial shortlist: 44
- `entity` pages whose first visible section is procedural in the initial shortlist: 82

These counts are triage signals, not final classifications.

## High-Confidence Findings

### 1. Generic instance names are frequently hiding tool-owned or product-owned subjects

These are not truly generic subjects. The page body is about a specific product or tool facet.

| Current path | Observed primary subject from content | Problem | Recommended direction |
| --- | --- | --- | --- |
| `docs/entity/data/database/basics/basics.mdx` | DynamoDB basics and pricing | `instance=basics` hides the real subject | reclassify around `dynamodb` |
| `docs/entity/data/storage-system/basics/basics.mdx` | S3 basics and pricing | `instance=basics` hides the real subject | reclassify around `s3` or split entity/comparison |
| `docs/entity/language/api/basics/basics.mdx` | `node-addon-api` setup and usage | `instance=basics` hides the real subject | reclassify around `node-addon-api` |
| `docs/entity/language/framework/lifecycle/lifecycle.mdx` | React lifecycle | `instance=lifecycle` hides the owning framework | reclassify around `react` with `aspect=lifecycle` |
| `docs/entity/mlops/iac-tool/config/config.mdx` | Pulumi config | `instance=config` hides the owning tool | reclassify around `pulumi/config` |
| `docs/entity/mlops/iac-tool/dynamic/dynamic.mdx` | Pulumi dynamic provider | `instance=dynamic` hides the owning tool | reclassify around `pulumi/dynamic` |
| `docs/entity/mlops/iac-tool/resource-options/resource-options.mdx` | Pulumi resource options | `instance=resource-options` hides the owning tool | reclassify around `pulumi/resource-options` |
| `docs/entity/mlops/iac-tool/stack-reference/stack-reference.mdx` | Pulumi StackReference | `instance=stack-reference` hides the owning tool | reclassify around `pulumi/stack-reference` |
| `docs/entity/mlops/iac-tool/stack/stack.mdx` | Terragrunt stack | `instance=stack` hides the owning tool | reclassify around `terragrunt/stack` |
| `docs/entity/mlops/ml-platform/auth/auth.mdx` | Kubeflow authn/authz | `instance=auth` hides the owning platform | reclassify around `kubeflow/auth` |
| `docs/entity/mlops/observability-system/auth/auth.mdx` | Grafana auth configuration | `instance=auth` hides the owning system | reclassify around `grafana/auth` |
| `docs/entity/mlops/observability-system/dashboard/dashboard.mdx` | Grafana dashboard provisioning | `instance=dashboard` hides the owning system | reclassify around `grafana/dashboard` |
| `docs/entity/mlops/observability-system/datasource/datasource.mdx` | Grafana data source provisioning | `instance=datasource` hides the owning system | reclassify around `grafana/datasource` |
| `docs/entity/mlops/observability-system/label/label.mdx` | Loki labels | `instance=label` hides the owning system | reclassify around `loki/label` |
| `docs/entity/mlops/observability-system/source/source.mdx` | Vector sources | `instance=source` hides the owning system | reclassify around `vector/source` |
| `docs/entity/mlops/observability-system/sink/sink.mdx` | Vector sinks | `instance=sink` hides the owning system | reclassify around `vector/sink` |
| `docs/entity/mlops/observability-system/operator/operator.mdx` | Prometheus Operator | `instance=operator` hides the real product name | reclassify around `prometheus-operator` |
| `docs/entity/mlops/provisioning-tool/auth/auth.mdx` | Harbor authn/authz | `instance=auth` hides the owning product | reclassify around `harbor/auth` |

### 2. Some current `entity` pages are clearly `operation` pages

These pages are not mainly describing a product or concept. They are step-by-step procedures or operational guides.

| Current path | Observed primary subject from content | Recommended role |
| --- | --- | --- |
| `docs/entity/data/storage-system/cluster/cluster.mdx` | creating a Rook Ceph cluster | `operation` |
| `docs/entity/data/storage-system/central-storage-cluster/central-storage-cluster.mdx` | building a central/external Rook Ceph cluster | `operation` |
| `docs/entity/data/storage-system/monitoring/monitoring.mdx` | configuring Ceph dashboard and monitoring | `operation` |
| `docs/entity/data/storage-system/osd/osd.mdx` | OSD preparation and management procedures | `operation` |
| `docs/entity/data/storage-system/pg/pg.mdx` | PG sizing and tuning procedures | `operation` |
| `docs/entity/data/storage-system/provisioning/provisioning.mdx` | static and dynamic volume provisioning | `operation` |
| `docs/entity/data/storage-system/reboot/reboot.mdx` | reboot procedure for Ceph nodes | `operation` |
| `docs/entity/data/storage-system/tuning/tuning.mdx` | Ceph performance tuning guidance | `operation` |
| `docs/entity/mlops/iac-tool/import-export/import-export.mdx` | Pulumi refresh/import workflow | `operation` |
| `docs/entity/mlops/observability-system/collector/collector.mdx` | sending logs to Loki using collectors | `operation` |
| `docs/entity/mlops/observability-system/compactor/compactor.mdx` | configuring Loki compactor retention behavior | likely `operation` or split concept+operation |

### 3. Some current `entity` pages are really `concept` pages

These pages describe subtopics, abstractions, or named features inside a concrete tool or product.

| Current path | Observed primary subject from content | Recommended role |
| --- | --- | --- |
| `docs/entity/mlops/iac-tool/config/config.mdx` | Pulumi config model and commands | `concept` with tool-owned facet |
| `docs/entity/mlops/iac-tool/dynamic/dynamic.mdx` | Pulumi dynamic provider concept | `concept` |
| `docs/entity/mlops/iac-tool/resource-options/resource-options.mdx` | Pulumi resource options | `concept` |
| `docs/entity/mlops/iac-tool/stack-reference/stack-reference.mdx` | Pulumi StackReference | `concept` |
| `docs/entity/mlops/iac-tool/micro-stack/micro-stack.mdx` | Pulumi micro-stack pattern | `concept` |
| `docs/entity/mlops/iac-tool/stack/stack.mdx` | Terragrunt stack model | `concept` |
| `docs/entity/mlops/observability-system/label/label.mdx` | Loki labels and cardinality | `concept` |

### 4. Some pages are in the wrong class entirely

| Current path | Observed primary subject from content | Problem | Recommended direction |
| --- | --- | --- | --- |
| `docs/entity/data/storage-system/mongodb/mongodb.mdx` | MongoDB | `storage-system` is the wrong class | move under `data/database` |
| `docs/entity/data/database/type/type.mdx` | cross-database data types | likely not a database entity | reclassify as `concept` or `comparison` |
| `docs/entity/data/database/user/user.mdx` | MongoDB user and roles | generic `database/user` hides the real product ownership | reclassify around `mongodb/user` |
| `docs/entity/data/database/ha/ha.mdx` | PostgreSQL HA patterns | generic `database/ha` hides the real product ownership | reclassify around `postgresql/ha` or split into concept/operation |

### 5. Many entity pages are mixed pages and need splitting

These pages still anchor correctly on a real product, but their body is dominated by install/setup/how-to content.

Representative examples:

- `docs/entity/mlops/eventing-system/redis/redis.mdx`
- `docs/entity/mlops/gateway-api/gateway-api/gateway-api.mdx`
- `docs/entity/mlops/provisioning-tool/keda/keda.mdx`
- `docs/entity/mlops/provisioning-tool/kubevirt/kubevirt.mdx`
- `docs/entity/mlops/cluster-addon/node-feature-discovery/node-feature-discovery.mdx`
- `docs/entity/mlops/cluster-orchestrator/cluster-api/cluster-api.mdx`
- `docs/entity/mlops/networking-stack/aws-load-balancer/aws-load-balancer.mdx`
- `docs/entity/mlops/serving-system/gateway-api-inference-extension/gateway-api-inference-extension.mdx`
- `docs/entity/mlops/auth-system/oauth2-proxy/oauth2-proxy.mdx`

For these, the entity path is often still salvageable, but the page should be split into:

- entity overview or concept explanation
- separate operation page for installation or configuration

## Pattern Summary

The ontology problems are not limited to `storage-system` or `iac-tool`.

The same underlying issues recur across the repo:

1. **generic instance overuse**
   - `basics`, `auth`, `config`, `stack`, `operator`, `dashboard`, `datasource`, `source`, `sink`
   - these names often hide the real owner of the subject

2. **entity pages used as procedural guides**
   - install, create, configure, tune, import, or manage workflows are often stored under `entity`

3. **tool-owned concepts treated as standalone entities**
   - especially visible in Pulumi, Terragrunt, Grafana, Loki, and Vector topics

4. **mixed pages**
   - many product pages contain both overview and step-by-step procedure

5. **class mismatch**
   - some pages are attached to the wrong formal class, not just the wrong role

## Recommended Migration Order

### Batch 1: high-confidence path corrections

Start with pages where the current path is clearly wrong even without rewriting much content:

- `storage-system` procedural pages currently under `entity`
- `iac-tool` generic-instance pages under `entity`
- `observability-system` generic-instance pages where the owner is explicit in the title or body
- `mongodb` under `storage-system`

### Batch 2: concept vs operation splits

Split pages that mix explanation and procedure:

- Pulumi and Terragrunt subtopic pages
- Grafana/Loki/Vector subtopic pages
- product pages that begin directly with installation or configuration

### Batch 3: true class cleanup

Handle pages that likely belong in another class or another role entirely:

- `database/type/type.mdx`
- `database/ha/ha.mdx`
- `database/user/user.mdx`
- `storage-system/basics/basics.mdx`
- `database/basics/basics.mdx`

## Recommended Next Deliverable

Create a repository-wide migration sheet with:

- current path
- observed primary subject
- current role/class/instance/aspect
- recommended role/class/instance/aspect
- split required: yes or no
- confidence level

This should be done in batches so link rewriting and ontology validation remain manageable.
