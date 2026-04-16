import test from "node:test";
import assert from "node:assert/strict";
import { validateEntries, validateFrontmatter, validateSourcePath } from "../validate.mjs";

test("validateSourcePath rejects editorial etc buckets", () => {
	assert.throws(
		() => validateSourcePath("docs/lang/go/etc/notes.mdx"),
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
