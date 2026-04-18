import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parseFrontmatter, readFrontmatter, requireSemanticFrontmatter } from "../frontmatter.mjs";
import { normalizeOntologyBlock } from "../ontology-frontmatter.mjs";

test("normalizeOntologyBlock preserves explicit supporting source status", () => {
	const next = normalizeOntologyBlock({
		role: "entity",
		domain: "language",
		className: "programming-language",
		instance: "go",
		aspect: "overview",
		sourceStatus: "supporting",
	});

	assert.equal(next.source.status, "supporting");
});

test("requireSemanticFrontmatter accepts semantic blocks", () => {
	assert.doesNotThrow(() =>
		requireSemanticFrontmatter(
			{
				ontology: {
					role: "entity",
					domain: "language",
					class: "programming-language",
					instance: "go",
					aspect: "overview",
				},
				subject: {
					canonical_name: "Go",
				},
				relations: {
					related_to: ["golang"],
				},
			},
			"docs/language/programming-language/go/go.mdx",
		),
	);
});

test("requireSemanticFrontmatter rejects incomplete semantic blocks", () => {
	assert.throws(
		() =>
			requireSemanticFrontmatter(
				{
					ontology: {
						role: "entity",
						domain: "language",
						class: "programming-language",
						aspect: "overview",
					},
					subject: {
						canonical_name: "Go",
					},
					relations: {},
				},
				"docs/language/programming-language/go/go.mdx",
			),
		/missing ontology.instance/,
	);
});

test("requireSemanticFrontmatter rejects whitespace-only required strings", () => {
	assert.throws(
		() =>
			requireSemanticFrontmatter(
				{
					ontology: {
						role: "entity",
						domain: "language",
						class: "programming-language",
						instance: " ",
						aspect: "overview",
					},
					subject: {
						canonical_name: "   ",
					},
					relations: {},
				},
				"docs/language/programming-language/go/go.mdx",
			),
		/missing ontology.instance/,
	);
});

test("requireSemanticFrontmatter rejects whitespace-only subject canonical names", () => {
	assert.throws(
		() =>
			requireSemanticFrontmatter(
				{
					ontology: {
						role: "entity",
						domain: "language",
						class: "programming-language",
						instance: "go",
						aspect: "overview",
					},
					subject: {
						canonical_name: "   ",
					},
					relations: {},
				},
				"docs/language/programming-language/go/go.mdx",
			),
		/missing subject frontmatter/,
	);
});

test("requireSemanticFrontmatter rejects missing relations blocks", () => {
	assert.throws(
		() =>
			requireSemanticFrontmatter(
				{
					ontology: {
						role: "entity",
						domain: "language",
						class: "programming-language",
						instance: "go",
						aspect: "overview",
					},
					subject: {
						canonical_name: "Go",
					},
				},
				"docs/language/programming-language/go/go.mdx",
			),
		/missing relations frontmatter/,
	);
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
