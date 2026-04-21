import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { validateCorpus, validateDocumentFile, validateEntries, validateFrontmatter, validateRegistryDeterminism, validateSourcePath } from "../validate.mjs";
import { listRewriteTargets, rewriteDocLinks } from "../rewrite-links.mjs";
import { ROOT_DIR } from "../constants.mjs";
import { bootstrapRegistry } from "../bootstrap-registry.mjs";

test("validateSourcePath rejects editorial etc buckets", () => {
	assert.throws(
		() => validateSourcePath("docs/language/go/etc/notes.mdx"),
		/forbidden editorial bucket/,
	);
});

test("validateSourcePath normalizes backslashes before checking editorial buckets", () => {
	assert.throws(
		() => validateSourcePath("docs\\language\\go\\etc\\notes.mdx"),
		/forbidden editorial bucket/,
	);
});

test("validateSourcePath rejects malformed taxonomy-like paths", () => {
	assert.throws(
		() => validateSourcePath("docs/language/grpc//overview.mdx"),
		/unsupported taxonomy path/,
	);
});

test("validateSourcePath still rejects editorial buckets under approved taxonomy topics", () => {
	assert.throws(
		() => validateSourcePath("docs/language/etc/foo.mdx"),
		/forbidden editorial bucket/,
	);
});

test("validateEntries rejects duplicate targets", () => {
	assert.throws(
		() =>
			validateEntries([
				{
					source: "docs/language/go/overview.mdx",
					target: "docs/language/go/overview.mdx",
					ontology: {
						role: "entity",
						domain: "language",
						class: "programming-language",
						instance: "go",
						aspect: "overview",
					},
				},
				{
					source: "docs/language/go/install.mdx",
					target: "docs/language/go/overview.mdx",
					ontology: {
						role: "operation",
						domain: "language",
						class: "programming-language",
						instance: "go",
						aspect: "install",
					},
				},
			]),
		/duplicate target path: docs\/language\/go\/overview.mdx/,
		);
});

test("validateEntries does not derive target alignment from ontology for taxonomy docs", () => {
	assert.doesNotThrow(() =>
		validateEntries(
			[
				{
					source: "docs/knowledge/concepts/ontology.mdx",
					target: "docs/knowledge/concepts/ontology-copy.mdx",
					ontology: {
						role: "concept",
						domain: "knowledge",
						class: "concept",
						instance: "ontology",
						aspect: "overview",
					},
				},
			],
			{ validateSourcePaths: true },
		),
	);
});

test("validateRegistryDeterminism requires exact targets for taxonomy-path registry entries", () => {
	assert.doesNotThrow(() =>
		validateRegistryDeterminism(
			[
				{
					source: "docs/knowledge/concepts/ontology.mdx",
					target: "docs/knowledge/concepts/ontology.mdx",
					ontology: {
						role: "concept",
						domain: "knowledge",
						class: "concept",
						instance: "ontology",
						aspect: "overview",
					},
				},
				{
					source: "docs/language/library/grpc/overview.mdx",
					target: "docs/language/library/grpc/overview.mdx",
					ontology: {
						role: "entity",
						domain: "language",
						class: "library",
						instance: "grpc",
						aspect: "overview",
					},
				},
			],
				[
					{
						source: "docs/knowledge/concepts/ontology.mdx",
						target: "docs/knowledge/concepts/ontology.mdx",
						ontology: {
							role: "concept",
							domain: "knowledge",
						class: "concept",
						instance: "ontology",
						aspect: "overview",
					},
				},
					{
						source: "docs/language/library/grpc/overview.mdx",
						target: "docs/language/library/grpc/overview.mdx",
						ontology: {
							role: "entity",
							domain: "language",
						class: "library",
						instance: "grpc",
						aspect: "overview",
					},
				},
			],
			),
	);
});

test("validateRegistryDeterminism rejects taxonomy entries that keep legacy targets", () => {
	assert.throws(
		() =>
			validateRegistryDeterminism(
				[
					{
						source: "docs/knowledge/concepts/ontology.mdx",
						target: "docs/knowledge/concepts/ontology.mdx",
						ontology: {
							role: "concept",
							domain: "knowledge",
							class: "concept",
							instance: "ontology",
							aspect: "overview",
						},
					},
				],
				[
					{
						source: "docs/knowledge/concepts/ontology.mdx",
						target: "docs/knowledge/concepts/ontology-copy.mdx",
						ontology: {
							role: "concept",
							domain: "knowledge",
							class: "concept",
							instance: "ontology",
							aspect: "overview",
						},
					},
				],
			),
		/classification registry is out of date/,
	);
});

test("validateFrontmatter rejects ids that do not match the filename", () => {
	assert.throws(
		() =>
			validateFrontmatter({
				source: "docs/language/go/overview.mdx",
				frontmatter: { id: "go-overview" },
			}),
		/id mismatch: go-overview != overview/,
	);
});

test("validateFrontmatter accepts matching ids", () => {
	assert.doesNotThrow(() =>
		validateFrontmatter({
			source: "docs/language/go/install.mdx",
			frontmatter: { id: "install" },
		}),
	);
});

test("validateRegistryDeterminism ignores incidental object key ordering", () => {
	const actual = [
		{
			source: "docs/language/go/overview.mdx",
			target: "docs/language/go/overview.mdx",
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
			target: "docs/language/go/overview.mdx",
			source: "docs/language/go/overview.mdx",
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
						source: "docs/language/go/overview.mdx",
						target: "docs/language/go/overview.mdx",
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
						source: "docs/language/go/overview.mdx",
						target: "docs/language/go/overview.mdx",
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

test("validateCorpus accepts maintained taxonomy docs with frontmatter-first registry entries", () => {
	const tempRoot = join(ROOT_DIR, "docs", "language");
	mkdirSync(tempRoot, { recursive: true });
	const tempDir = mkdtempSync(join(tempRoot, "__ontology-validate-"));
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

		assert.doesNotThrow(() =>
			validateCorpus({
				entries: [
					{
						source,
						target: source,
						ontology: {
							role: "entity",
							domain: "language",
							class: "library",
							instance: "grpc",
							aspect: "overview",
						},
					},
				],
				docs: [source],
			}),
		);
		} finally {
			rmSync(tempDir, { recursive: true, force: true });
		}
});

test("validateCorpus rejects taxonomy docs when the registry no longer matches taxonomy docs", () => {
	const tempRoot = join(ROOT_DIR, "docs", "language");
	mkdirSync(tempRoot, { recursive: true });
	const tempDir = mkdtempSync(join(tempRoot, "__ontology-legacy-"));
	const fileDir = join(tempDir, "grpc");
	const filePath = join(fileDir, "overview.mdx");
	const source = relative(ROOT_DIR, filePath).replaceAll("\\", "/");

	try {
		mkdirSync(fileDir, { recursive: true });
		writeFileSync(
			filePath,
			`---
id: overview
title: "Legacy Library Doc"
ontology:
  role: concept
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

		assert.throws(() =>
			validateCorpus({
				entries: [
					{
						source,
						target: source,
						ontology: {
							role: "entity",
							domain: "language",
							class: "library",
							instance: "grpc",
							aspect: "overview",
						},
					},
				],
				docs: [source],
			}),
			/classification registry is out of date/,
		);
	} finally {
		rmSync(tempDir, { recursive: true, force: true });
	}
});

test("bootstrapRegistry reads ontology metadata from frontmatter for maintained taxonomy docs", () => {
	const tempRoot = join(ROOT_DIR, "docs", "language");
	mkdirSync(tempRoot, { recursive: true });
	const tempDir = mkdtempSync(join(tempRoot, "__ontology-bootstrap-"));
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

		assert.deepEqual(bootstrapRegistry([source]), [
			{
				source,
				target: source,
				ontology: {
					role: "entity",
					domain: "language",
					class: "library",
					instance: "grpc",
					aspect: "overview",
				},
			},
		]);
		} finally {
			rmSync(tempDir, { recursive: true, force: true });
		}
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
			rmSync(tempDir, { recursive: true, force: true });
		}
});

test("rewriteDocLinks updates absolute doc links using the registry map", () => {
	const output = rewriteDocLinks(
		"See [Go](/docs/language/go/overview.mdx) and [CORS](/docs/protocol/http/cors.mdx).",
		new Map([
			["/docs/language/go/overview.mdx", "/docs/language/go/overview.mdx"],
			["/docs/protocol/http/cors.mdx", "/docs/protocol/http/cors.mdx"],
		]),
	);

	assert.match(output, /\/docs\/language\/go\/overview\.mdx/);
});

test("rewriteDocLinks updates absolute doc links without extensions", () => {
	const output = rewriteDocLinks(
		"See [Lua](/docs/system/nvim/lua#options) and [k0s](/docs/infrastructure/kubernetes/k0s/install#worker).",
		new Map([
			["/docs/system/nvim/lua", "/docs/system/nvim/lua"],
			["/docs/infrastructure/kubernetes/k0s/install", "/docs/infrastructure/kubernetes/k0s/install"],
		]),
	);

	assert.match(output, /\/docs\/system\/nvim\/lua#options/);
	assert.match(output, /\/docs\/infrastructure\/kubernetes\/k0s\/install#worker/);
});

test("rewriteDocLinks rewrites real links but skips fenced code blocks and plain literals", () => {
	const output = rewriteDocLinks(
		[
			'See [Go](/docs/language/go/overview.mdx), <a href="/docs/protocol/http/cors">CORS</a>, and <Link to="/docs/system/nvim/lua#options">Lua</Link>.',
			"Literal /docs/language/go/overview.mdx should stay untouched.",
			"",
			"```js",
			'const sample = "[Go](/docs/language/go/overview.mdx)";',
			'<Link to="/docs/system/nvim/lua#options">Lua</Link>;',
			"```",
		].join("\n"),
		new Map([
			["/docs/language/go/overview.mdx", "/docs/language/go/overview.mdx"],
			["/docs/protocol/http/cors", "/docs/protocol/http/cors"],
			["/docs/system/nvim/lua", "/docs/system/nvim/lua"],
		]),
	);

	// Prose links should be rewritten or preserved according to the registry map.
	assert.match(output, /\[Go\]\(\/docs\/language\/go\/overview\.mdx\)/);
	assert.match(output, /href="\/docs\/protocol\/http\/cors"/);
	assert.match(output, /to="\/docs\/system\/nvim\/lua#options"/);

	// Plain text and fenced code should stay literal.
	assert.match(output, /Literal \/docs\/language\/go\/overview\.mdx should stay untouched\./);
	assert.match(output, /const sample = "\[Go\]\(\/docs\/language\/go\/overview\.mdx\)";/);
	assert.match(output, /<Link to="\/docs\/system\/nvim\/lua#options">Lua<\/Link>;/);
});

test("rewriteDocLinks preserves inline code spans", () => {
	const output = rewriteDocLinks(
		'Use `[Go](/docs/language/go/overview.mdx)` literally, but see [Go](/docs/language/go/overview.mdx) and <Link to="/docs/system/nvim/lua#options">Lua</Link>.',
		new Map([
			["/docs/language/go/overview.mdx", "/docs/language/go/overview.mdx"],
			["/docs/system/nvim/lua", "/docs/system/nvim/lua"],
		]),
	);

	assert.match(output, /`\[Go\]\(\/docs\/language\/go\/overview\.mdx\)` literally/);
	assert.match(output, /\[Go\]\(\/docs\/language\/go\/overview\.mdx\)/);
	assert.match(output, /to="\/docs\/system\/nvim\/lua#options"/);
});

test("listRewriteTargets includes docs/AGENTS.md", () => {
	const docs = listRewriteTargets();

	assert.ok(docs.includes("docs/AGENTS.md"));
	assert.ok(docs.includes("docs/language/go/overview.mdx"));
});

test("validateCorpus enforces registry source-path invariants in the production path", () => {
	assert.throws(
		() =>
			validateCorpus({
				entries: [
					{
						source: "docs/AGENTS.md",
						target: "docs/language/go/overview.mdx",
						ontology: {
							role: "entity",
							domain: "language",
							class: "programming-language",
							instance: "go",
							aspect: "overview",
						},
					},
				],
				docs: ["docs/language/go/overview.mdx"],
			}),
		/source path must point to an \.mdx document/,
	);
});
