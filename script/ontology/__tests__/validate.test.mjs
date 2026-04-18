import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { validateCorpus, validateDocumentFile, validateEntries, validateFrontmatter, validateRegistryDeterminism, validateSourcePath } from "../validate.mjs";
import { listRewriteTargets, rewriteDocLinks } from "../rewrite-links.mjs";
import { ROOT_DIR } from "../constants.mjs";
import { migrateRegistryEntries } from "../migrate.mjs";
import { bootstrapRegistry } from "../bootstrap-registry.mjs";

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

test("validateEntries does not derive target alignment from ontology for taxonomy docs", () => {
	assert.doesNotThrow(() =>
		validateEntries(
			[
				{
					source: "docs/data/concepts/ontology.mdx",
					target: "docs/concept/data/concept/ontology/ontology.mdx",
					ontology: {
						role: "concept",
						domain: "data",
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
					source: "docs/data/concepts/ontology.mdx",
					target: "docs/data/concepts/ontology.mdx",
					ontology: {
						role: "concept",
						domain: "data",
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
						source: "docs/data/concepts/ontology.mdx",
						target: "docs/data/concepts/ontology.mdx",
						ontology: {
							role: "concept",
							domain: "data",
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
						source: "docs/data/concepts/ontology.mdx",
						target: "docs/data/concepts/ontology.mdx",
						ontology: {
							role: "concept",
							domain: "data",
							class: "concept",
							instance: "ontology",
							aspect: "overview",
						},
					},
				],
				[
					{
						source: "docs/data/concepts/ontology.mdx",
						target: "docs/concept/data/concept/ontology/ontology.mdx",
						ontology: {
							role: "concept",
							domain: "data",
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

test("validateCorpus preserves legacy ontology-path compatibility when frontmatter drifts", () => {
	const tempRoot = join(ROOT_DIR, "docs", "operation", "language", "library");
	mkdirSync(tempRoot, { recursive: true });
	const tempDir = mkdtempSync(join(tempRoot, "__ontology-legacy-"));
	const filePath = join(tempDir, `${basename(tempDir)}.mdx`);
	const source = relative(ROOT_DIR, filePath).replaceAll("\\", "/");

	try {
		writeFileSync(
			filePath,
			`---
id: ${basename(tempDir)}
title: "Legacy Library Doc"
ontology:
  role: concept
  domain: data
  class: concept
  instance: drifted
  aspect: overview
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
							role: "operation",
							domain: "language",
							class: "library",
							instance: basename(tempDir),
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

test("rewriteDocLinks rewrites real links but skips fenced code blocks and plain literals", () => {
	const output = rewriteDocLinks(
		[
			'See [Go](/docs/lang/go/go.mdx), <a href="/docs/lang/design/protocol-spec/http/cors">CORS</a>, and <Link to="/docs/lang/etc/vim/lua#options">Lua</Link>.',
			"Literal /docs/lang/go/go.mdx should stay untouched.",
			"",
			"```js",
			'const sample = "[Go](/docs/lang/go/go.mdx)";',
			'<Link to="/docs/lang/etc/vim/lua#options">Lua</Link>;',
			"```",
		].join("\n"),
		new Map([
			["/docs/lang/go/go.mdx", "/docs/entity/language/programming-language/go/go.mdx"],
			["/docs/lang/design/protocol-spec/http/cors", "/docs/specification/protocol/application-protocol/http/cors"],
			["/docs/lang/etc/vim/lua", "/docs/operation/platform/tool/lua/lua"],
		]),
	);

	// Prose links should move.
	assert.match(output, /\[Go\]\(\/docs\/entity\/language\/programming-language\/go\/go\.mdx\)/);
	assert.match(output, /href="\/docs\/specification\/protocol\/application-protocol\/http\/cors"/);
	assert.match(output, /to="\/docs\/operation\/platform\/tool\/lua\/lua#options"/);

	// Plain text and fenced code should stay literal.
	assert.match(output, /Literal \/docs\/lang\/go\/go\.mdx should stay untouched\./);
	assert.match(output, /const sample = "\[Go\]\(\/docs\/lang\/go\/go\.mdx\)";/);
	assert.match(output, /<Link to="\/docs\/lang\/etc\/vim\/lua#options">Lua<\/Link>;/);
});

test("rewriteDocLinks preserves inline code spans", () => {
	const output = rewriteDocLinks(
		'Use `[Go](/docs/lang/go/go.mdx)` literally, but see [Go](/docs/lang/go/go.mdx) and <Link to="/docs/lang/etc/vim/lua#options">Lua</Link>.',
		new Map([
			["/docs/lang/go/go.mdx", "/docs/entity/language/programming-language/go/go.mdx"],
			["/docs/lang/etc/vim/lua", "/docs/operation/platform/tool/lua/lua"],
		]),
	);

	assert.match(output, /`\[Go\]\(\/docs\/lang\/go\/go\.mdx\)` literally/);
	assert.match(output, /\[Go\]\(\/docs\/entity\/language\/programming-language\/go\/go\.mdx\)/);
	assert.match(output, /to="\/docs\/operation\/platform\/tool\/lua\/lua#options"/);
});

test("listRewriteTargets includes docs/AGENTS.md", () => {
	const docs = listRewriteTargets();

	assert.ok(docs.includes("docs/AGENTS.md"));
	assert.ok(docs.includes("docs/entity/language/programming-language/go/go.mdx"));
});

test("migrateRegistryEntries rewrites id and ontology on moved documents", () => {
	const tempDir = mkdtempSync(join(ROOT_DIR, "docs", "__ontology-migrate-"));
	const sourcePath = join(tempDir, "legacy-doc.mdx");
	const targetPath = join(tempDir, "migrated-doc.mdx");
	const source = relative(ROOT_DIR, sourcePath).replaceAll("\\", "/");
	const target = relative(ROOT_DIR, targetPath).replaceAll("\\", "/");

	try {
		writeFileSync(
			sourcePath,
			`---
id: legacy-doc
title: "Legacy"
keywords:
  - ontology
ontology:
  role: concept
---
content
`,
		);

		const logs = [];
		const originalLog = console.log;
		console.log = (message) => logs.push(message);

		try {
			migrateRegistryEntries([
				{
					source,
					target,
					ontology: {
						role: "entity",
						domain: "language",
						class: "programming-language",
						instance: "migrated-doc",
						aspect: "overview",
					},
				},
			]);
		} finally {
			console.log = originalLog;
		}

		assert.deepEqual(logs, [`${source} -> ${target}`]);
		assert.equal(existsSync(sourcePath), false);
		assert.equal(existsSync(targetPath), true);

		const frontmatter = validateDocumentFile(target);
		assert.equal(frontmatter.id, "migrated-doc");
		assert.equal(frontmatter.title, "Legacy");
		assert.deepEqual(frontmatter.keywords, ["ontology"]);
		assert.deepEqual(frontmatter.ontology, {
			role: "entity",
			domain: "language",
			class: "programming-language",
			instance: "migrated-doc",
			aspect: "overview",
		});
	} finally {
		rmSync(dirname(sourcePath), { recursive: true, force: true });
	}
});

test("migrateRegistryEntries fails when the source is missing even if the target exists", () => {
	const tempDir = mkdtempSync(join(ROOT_DIR, "docs", "__ontology-migrate-"));
	const sourcePath = join(tempDir, "legacy-doc.mdx");
	const targetPath = join(tempDir, "migrated-doc.mdx");
	const source = relative(ROOT_DIR, sourcePath).replaceAll("\\", "/");
	const target = relative(ROOT_DIR, targetPath).replaceAll("\\", "/");

	try {
		writeFileSync(
			targetPath,
			`---
id: migrated-doc
title: "Already There"
---
content
`,
		);

		const originalLog = console.log;
		console.log = () => {};

		try {
			assert.throws(
				() =>
					migrateRegistryEntries([
						{
							source,
							target,
							ontology: {
								role: "entity",
								domain: "language",
								class: "programming-language",
								instance: "migrated-doc",
								aspect: "overview",
							},
						},
					]),
				/missing source document/,
			);
		} finally {
			console.log = originalLog;
		}
	} finally {
		rmSync(dirname(targetPath), { recursive: true, force: true });
	}
});

test("validateCorpus enforces registry source-path invariants in the production path", () => {
	assert.throws(
		() =>
			validateCorpus({
				entries: [
					{
						source: "docs/AGENTS.md",
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
				docs: ["docs/entity/language/programming-language/go/go.mdx"],
			}),
		/source path must point to an \.mdx document/,
	);
});
