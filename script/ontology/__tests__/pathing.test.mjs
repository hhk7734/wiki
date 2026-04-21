import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { classifySeed, classifySeedFromFrontmatter, isMaintainedTaxonomyPath } from "../pathing.mjs";
import { CLASSIFICATION_REGISTRY_PATH, bootstrapRegistry } from "../bootstrap-registry.mjs";
import { ROOT_DIR } from "../constants.mjs";
import { inventory } from "../inventory.mjs";

function writeTaxonomyDoc(filePath, { id = "overview", title = "gRPC Overview" } = {}) {
	writeFileSync(
		filePath,
		`---
id: ${id}
title: "${title}"
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
}

test("classifySeed reads maintained taxonomy docs from semantic frontmatter", () => {
	const tempRoot = join(ROOT_DIR, "docs", "language");
	mkdirSync(tempRoot, { recursive: true });
	const tempDir = mkdtempSync(join(tempRoot, "__ontology-pathing-"));
	const fileDir = join(tempDir, "grpc");
	const filePath = join(fileDir, "overview.mdx");
	const source = relative(ROOT_DIR, filePath).replaceAll("\\", "/");

	try {
		mkdirSync(fileDir, { recursive: true });
		writeTaxonomyDoc(filePath);

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

test("classifySeedFromFrontmatter matches classifySeed for maintained taxonomy docs", () => {
	const tempRoot = join(ROOT_DIR, "docs", "language");
	mkdirSync(tempRoot, { recursive: true });
	const tempDir = mkdtempSync(join(tempRoot, "__ontology-pathing-"));
	const fileDir = join(tempDir, "grpc");
	const filePath = join(fileDir, "overview.mdx");
	const source = relative(ROOT_DIR, filePath).replaceAll("\\", "/");

	try {
		mkdirSync(fileDir, { recursive: true });
		writeTaxonomyDoc(filePath);

		assert.deepEqual(classifySeedFromFrontmatter(source), classifySeed(source));
	} finally {
		rmSync(tempDir, { recursive: true, force: true });
	}
});

test("classifySeed requires frontmatter for maintained taxonomy paths", () => {
	assert.throws(
		() => classifySeed("docs/knowledge/concepts/__missing__.mdx"),
		/no such file or directory|ENOENT/i,
	);
});

test("classifySeed rejects non-taxonomy legacy paths", () => {
	assert.throws(
		() => classifySeed("docs/lang/go/go.mdx"),
		/unsupported taxonomy path/i,
	);
});

test("classifySeed rejects malformed taxonomy-like paths", () => {
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
		writeTaxonomyDoc(filePath, { id: "wrong-id" });

		assert.throws(() => classifySeed(source), /id mismatch: wrong-id != overview/);
	} finally {
		rmSync(tempDir, { recursive: true, force: true });
	}
});

test("isMaintainedTaxonomyPath recognizes approved topic-first paths", () => {
	assert.equal(isMaintainedTaxonomyPath("docs/language/go/overview.mdx"), true);
	assert.equal(isMaintainedTaxonomyPath("docs/knowledge/concepts/ontology.mdx"), true);
	assert.equal(isMaintainedTaxonomyPath("docs/lang/go/go.mdx"), false);
});

test("inventory excludes docs/AGENTS.md", () => {
	assert.equal(inventory().includes("docs/AGENTS.md"), false);
});

test("bootstrap registry preserves source-target identity for the current corpus", () => {
	const entries = bootstrapRegistry(
		inventory().filter((source) => !source.includes("/__")),
	);

	assert.ok(entries.length > 0);
	assert.equal(entries.every((entry) => entry.source === entry.target), true);
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
