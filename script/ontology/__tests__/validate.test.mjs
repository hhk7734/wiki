import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { validateDocumentFile, validateEntries, validateFrontmatter, validateRegistryDeterminism, validateSourcePath } from "../validate.mjs";
import { ROOT_DIR } from "../constants.mjs";

test("validateSourcePath rejects editorial etc buckets", () => {
	assert.throws(
		() => validateSourcePath("docs/lang/go/etc/notes.mdx"),
		/forbidden editorial bucket/,
	);
});

test("validateSourcePath normalizes backslashes before checking editorial buckets", () => {
	assert.throws(
		() => validateSourcePath("docs\\lang\\go\\etc\\notes.mdx"),
		/forbidden editorial bucket/,
	);
});

test("validateEntries rejects duplicate targets", () => {
	assert.throws(
		() =>
			validateEntries([
				{
					source: "docs/lang/go/go.mdx",
					target: "docs/entity/language/programming-language/go/go.mdx",
					ontology: {
						role: "entity",
						domain: "language",
						class: "programming-language",
						instance: "go",
						aspect: "overview",
					},
				},
				{
					source: "docs/lang/go/go-basics.mdx",
					target: "docs/entity/language/programming-language/go/go.mdx",
					ontology: {
						role: "entity",
						domain: "language",
						class: "programming-language",
						instance: "go",
						aspect: "basics",
					},
				},
			]),
		/duplicate target path: docs\/entity\/language\/programming-language\/go\/go.mdx/,
	);
});

test("validateFrontmatter rejects ids that do not match the filename", () => {
	assert.throws(
		() =>
			validateFrontmatter({
				source: "docs/lang/go/go-intro.mdx",
				frontmatter: { id: "go-overview" },
			}),
		/id mismatch: go-overview != go-intro/,
	);
});

test("validateFrontmatter accepts matching ids", () => {
	assert.doesNotThrow(() =>
		validateFrontmatter({
			source: "docs/lang/go/go-intro.mdx",
			frontmatter: { id: "go-intro" },
		}),
	);
});

test("validateRegistryDeterminism ignores incidental object key ordering", () => {
	const actual = [
		{
			source: "docs/lang/go/go.mdx",
			target: "docs/entity/language/programming-language/go/go.mdx",
			ontology: {
				aspect: "overview",
				instance: "go",
				class: "programming-language",
				domain: "language",
				role: "entity",
			},
		},
	];
	const expected = [
		{
			target: "docs/entity/language/programming-language/go/go.mdx",
			source: "docs/lang/go/go.mdx",
			ontology: {
				role: "entity",
				domain: "language",
				class: "programming-language",
				instance: "go",
				aspect: "overview",
			},
		},
	];

	assert.doesNotThrow(() => validateRegistryDeterminism(actual, expected));
});

test("validateRegistryDeterminism rejects semantic differences", () => {
	assert.throws(
		() =>
			validateRegistryDeterminism(
				[
					{
						source: "docs/lang/go/go.mdx",
						target: "docs/entity/language/programming-language/go/go.mdx",
						ontology: {
							role: "entity",
							domain: "language",
							class: "programming-language",
							instance: "go",
							aspect: "overview",
						},
					},
				],
				[
					{
						source: "docs/lang/go/go.mdx",
						target: "docs/entity/language/programming-language/go/go.mdx",
						ontology: {
							role: "entity",
							domain: "language",
							class: "programming-language",
							instance: "go",
							aspect: "install",
						},
					},
				],
			),
		/classification registry is out of date/,
	);
});

test("validateDocumentFile reads and validates a real document file", () => {
	const tempDir = mkdtempSync(join(ROOT_DIR, "docs", "__ontology-validate-"));
	const filePath = join(tempDir, "temp-doc.mdx");
	const source = relative(ROOT_DIR, filePath).replaceAll("\\", "/");

	try {
		writeFileSync(
			filePath,
			`---
id: temp-doc
title: "Temp Doc"
ontology:
  role: concept
---
content
`,
		);

		assert.deepEqual(validateDocumentFile(source), {
			id: "temp-doc",
			title: "Temp Doc",
			ontology: {
				role: "concept",
			},
		});
	} finally {
		rmSync(dirname(filePath), { recursive: true, force: true });
	}
});
