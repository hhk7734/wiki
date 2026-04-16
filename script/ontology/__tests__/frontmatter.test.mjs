import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parseFrontmatter, readFrontmatter } from "../frontmatter.mjs";
import { normalizeOntologyBlock } from "../ontology-frontmatter.mjs";

test("normalizeOntologyBlock keeps path and ontology metadata aligned", () => {
	const next = normalizeOntologyBlock({
		role: "entity",
		domain: "language",
		className: "programming-language",
		instance: "go",
		aspect: "overview",
	});

	assert.equal(next.ontology.class, "programming-language");
	assert.equal(next.ontology.instance, "go");
	assert.equal(next.ontology.aspect, "overview");
	assert.equal(next.source.status, "canonical");
	assert.equal(next.source.confidence, "exact");
});

test("parseFrontmatter parses nested objects", () => {
	const frontmatter = parseFrontmatter(`---
id: go
source:
  status: canonical
  confidence: exact
---
`);

	assert.deepEqual(frontmatter, {
		id: "go",
		source: {
			status: "canonical",
			confidence: "exact",
		},
	});
});

test("parseFrontmatter parses lists", () => {
	const frontmatter = parseFrontmatter(`---
keywords:
  - go
  - golang
---
`);

	assert.deepEqual(frontmatter, {
		keywords: ["go", "golang"],
	});
});

test("parseFrontmatter preserves quoted strings", () => {
	const frontmatter = parseFrontmatter(`---
title: "Go Basics"
description: 'go intro'
---
`);

	assert.deepEqual(frontmatter, {
		title: "Go Basics",
		description: "go intro",
	});
});

test("parseFrontmatter treats a bare key as null", () => {
	const frontmatter = parseFrontmatter(`---
description:
---
`);

	assert.deepEqual(frontmatter, {
		description: null,
	});
});

test("readFrontmatter reads frontmatter from a file", () => {
	const tempDir = mkdtempSync(join(tmpdir(), "ontology-frontmatter-"));
	const filePath = join(tempDir, "example.mdx");

	try {
		writeFileSync(
			filePath,
			`---
id: example
keywords:
  - parser
---
content
`,
		);

		assert.deepEqual(readFrontmatter(filePath), {
			id: "example",
			keywords: ["parser"],
		});
	} finally {
		rmSync(tempDir, { recursive: true, force: true });
	}
});
