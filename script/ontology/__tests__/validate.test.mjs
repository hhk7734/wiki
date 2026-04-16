import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { validateDocumentFile, validateEntries, validateFrontmatter, validateRegistryDeterminism, validateSourcePath } from "../validate.mjs";
import { listRewriteTargets, rewriteDocLinks } from "../rewrite-links.mjs";
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

test("rewriteDocLinks updates absolute doc links using the registry map", () => {
	const output = rewriteDocLinks(
		"See [Go](/docs/lang/go/go.mdx) and [CORS](/docs/lang/design/protocol-spec/http/cors.mdx).",
		new Map([
			["/docs/lang/go/go.mdx", "/docs/entity/language/programming-language/go/go.mdx"],
			["/docs/lang/design/protocol-spec/http/cors.mdx", "/docs/specification/protocol/application-protocol/http/cors.mdx"],
		]),
	);

	assert.match(output, /\/docs\/entity\/language\/programming-language\/go\/go\.mdx/);
});

test("rewriteDocLinks updates absolute doc links without extensions", () => {
	const output = rewriteDocLinks(
		"See [Lua](/docs/lang/etc/vim/lua#options) and [k0s](/docs/mlops/kubernetes/cluster/k0s#worker).",
		new Map([
			["/docs/lang/etc/vim/lua", "/docs/operation/platform/tool/lua/lua"],
			["/docs/mlops/kubernetes/cluster/k0s", "/docs/entity/mlops/cluster-orchestrator/k0s"],
		]),
	);

	assert.match(output, /\/docs\/operation\/platform\/tool\/lua\/lua#options/);
	assert.match(output, /\/docs\/entity\/mlops\/cluster-orchestrator\/k0s#worker/);
});

test("listRewriteTargets includes docs under docs/superpowers", () => {
	const docs = listRewriteTargets();

	assert.ok(docs.includes("docs/superpowers/plans/2026-04-16-wiki-ontology-reorg.md"));
	assert.ok(docs.includes("docs/superpowers/specs/2026-04-16-wiki-ontology-reorg-design.md"));
	assert.ok(docs.includes("docs/entity/language/programming-language/go/go.mdx"));
});
