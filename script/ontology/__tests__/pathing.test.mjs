import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { buildTargetPath, classifySeed } from "../pathing.mjs";
import { CLASSIFICATION_REGISTRY_PATH, bootstrapRegistry, stabilizeTargets } from "../bootstrap-registry.mjs";
import { ROOT_DIR } from "../constants.mjs";
import { inventory } from "../inventory.mjs";
import { normalizeOntologyBlock } from "../ontology-frontmatter.mjs";

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

test("buildTargetPath uses the aspect name for non-overview pages", () => {
	assert.equal(
		buildTargetPath({
			role: "operation",
			domain: "platform",
			className: "cluster-addon",
			instance: "node-feature-discovery",
			aspect: "install",
		}),
		"docs/operation/platform/cluster-addon/node-feature-discovery/install.mdx",
	);
});

test("current Go overview path maps to canonical ontology path", () => {
	assert.equal(
		classifySeed("docs/lang/go/go.mdx").target,
		"docs/entity/language/programming-language/go/go.mdx",
	);
});

test("classifySeed uses normalized ontology metadata", () => {
	assert.deepEqual(
		classifySeed("docs/lang/go/go.mdx").ontology,
		normalizeOntologyBlock({
			role: "entity",
			domain: "language",
			className: "programming-language",
			instance: "go",
			aspect: "overview",
		}).ontology,
	);
});

test("classifySeed reads maintained taxonomy docs from semantic frontmatter", () => {
	const tempRoot = join(ROOT_DIR, "docs", "language");
	mkdirSync(tempRoot, { recursive: true });
	const tempDir = mkdtempSync(join(tempRoot, "__ontology-pathing-"));
	const fileDir = join(tempDir, "grpc");
	const filePath = join(fileDir, "overview.mdx");
	const source = relative(ROOT_DIR, filePath).replaceAll("\\", "/");

	try {
		mkdirSync(fileDir, { recursive: true });
		writeFileSync(
			filePath,
			`---
id: overview
title: "gRPC Overview"
ontology:
  role: entity
  domain: language
  class: library
  instance: grpc
  aspect: overview
subject:
  canonical_name: gRPC
relations:
  related_to: []
  depends_on: []
  prerequisite_for: []
  part_of: []
  implements: []
  uses: []
source:
  status: canonical
  confidence: exact
---
content
`,
		);

		assert.deepEqual(classifySeed(source), {
			source,
			target: source,
			ontology: {
				role: "entity",
				domain: "language",
				class: "library",
				instance: "grpc",
				aspect: "overview",
			},
		});
		} finally {
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

test("classifySeed requires frontmatter for maintained taxonomy paths", () => {
	assert.throws(
		() => classifySeed("docs/data/concepts/__missing__.mdx"),
		/no such file or directory|ENOENT/i,
	);
});

test("classifySeed rejects malformed taxonomy-like paths instead of falling back", () => {
	assert.throws(
		() => classifySeed("docs/language/grpc//overview.mdx"),
		/unsupported taxonomy path/i,
	);
});

test("classifySeed rejects taxonomy docs whose id does not match the filename", () => {
	const tempRoot = join(ROOT_DIR, "docs", "language");
	mkdirSync(tempRoot, { recursive: true });
	const tempDir = mkdtempSync(join(tempRoot, "__ontology-pathing-"));
	const fileDir = join(tempDir, "grpc");
	const filePath = join(fileDir, "overview.mdx");
	const source = relative(ROOT_DIR, filePath).replaceAll("\\", "/");

	try {
		mkdirSync(fileDir, { recursive: true });
		writeFileSync(
			filePath,
			`---
id: wrong-id
title: "gRPC Overview"
ontology:
  role: entity
  domain: language
  class: library
  instance: grpc
  aspect: overview
subject:
  canonical_name: gRPC
relations:
  related_to: []
  depends_on: []
  prerequisite_for: []
  part_of: []
  implements: []
  uses: []
source:
  status: canonical
  confidence: exact
---
content
`,
		);

		assert.throws(() => classifySeed(source), /id mismatch: wrong-id != overview/);
	} finally {
		rmSync(tempDir, { recursive: true, force: true });
	}
});

test("inventory excludes docs/AGENTS.md", () => {
	assert.equal(inventory().includes("docs/AGENTS.md"), false);
});

test("bootstrap registry keeps targets unique for the current corpus", () => {
	const entries = bootstrapRegistry(
		inventory().filter((source) => !source.includes("/__ontology-")),
	);
	const targets = entries.map((entry) => entry.target);

	assert.equal(new Set(targets).size, targets.length);
});

test("grpc family members stay distinguishable before bootstrap disambiguation", () => {
	const targets = [
		"docs/lang/cpp/libraries/grpc/grpc.mdx",
		"docs/lang/go/libraries/grpc/grpc.mdx",
		"docs/lang/python/libraries/grpc/grpc.mdx",
	].map((source) => classifySeed(source).target);

	assert.equal(new Set(targets).size, targets.length);
});

test("workflow crd family members stay distinguishable before bootstrap disambiguation", () => {
	const targets = [
		"docs/operation/mlops/workflow-system/argo-cd/crd.mdx",
		"docs/operation/mlops/workflow-system/argo-workflows/crd.mdx",
		"docs/operation/mlops/workflow-system/awx/crd.mdx",
	].map((source) => classifySeed(source).target);

	assert.equal(new Set(targets).size, targets.length);
});

test("bootstrap disambiguation is deterministic for collision groups", () => {
	const entries = stabilizeTargets([
		{
			source: "docs/example/first.mdx",
			target: "docs/entity/platform/tool/example/overview.mdx",
			ontology: { role: "entity", domain: "platform", class: "tool", instance: "example", aspect: "overview" },
		},
		{
			source: "docs/example/second.mdx",
			target: "docs/entity/platform/tool/example/overview.mdx",
			ontology: { role: "entity", domain: "platform", class: "tool", instance: "example", aspect: "overview" },
		},
	].reverse());

	assert.deepEqual(
		entries.map((entry) => [entry.source, entry.target]),
		[
			["docs/example/second.mdx", "docs/entity/platform/tool/example/overview--example-second.mdx"],
			["docs/example/first.mdx", "docs/entity/platform/tool/example/overview--example-first.mdx"],
		],
	);
});

test("classification registry path is rooted to the repo", () => {
	const moduleUrl = new URL("../bootstrap-registry.mjs", import.meta.url);
	const result = spawnSync(
		process.execPath,
		["--input-type=module", "-e", `import { CLASSIFICATION_REGISTRY_PATH } from ${JSON.stringify(moduleUrl.href)}; console.log(CLASSIFICATION_REGISTRY_PATH);`],
		{
			cwd: "/tmp",
			encoding: "utf8",
		},
	);

	assert.equal(result.status, 0);
	assert.equal(result.stdout.trim(), CLASSIFICATION_REGISTRY_PATH);
	assert.equal(CLASSIFICATION_REGISTRY_PATH, resolve(ROOT_DIR, "ontology", "classification-registry.json"));
});
