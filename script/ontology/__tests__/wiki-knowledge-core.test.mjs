import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join, relative, resolve } from "node:path";
import { buildWikiKnowledgeCore } from "../build-wiki-knowledge-core.mjs";
import { ROOT_DIR } from "../constants.mjs";
import { buildCanonicalSubjectSnapshot, selectCanonicalSubjectDocument } from "../wiki-knowledge-shared.mjs";

test("wiki knowledge core emits stable document ids, urls, and normalized snippets", () => {
	const records = buildWikiKnowledgeCore([
		"docs/infrastructure/storage/ceph/osd/index.mdx",
	]);

	const document = records.documents[0];
	const relation = records.relations[0];

	assert.equal(document.type, "document");
	assert.equal(document.id, "doc:docs/infrastructure/storage/ceph/osd/index.mdx");
	assert.equal(document.url, "/docs/infrastructure/storage/ceph/osd");
	assert.equal(document.subject_ref, "subject:infrastructure:storage-system:ceph");
	assert.ok(document.snippet.length > 0);
	assert.ok(document.snippet.length < document.text.length);
	assert.doesNotMatch(document.snippet, /import useBaseUrl|:::|`/i);
	assert.equal(relation.id, "relation:doc:docs/infrastructure/storage/ceph/osd/index.mdx:about_subject:subject:infrastructure:storage-system:ceph");
	assert.equal(relation.predicate, "about_subject");
});

test("wiki knowledge core keeps multi-document subject records deterministic", () => {
	const forward = buildWikiKnowledgeCore([
		"docs/infrastructure/storage/ceph/overview.mdx",
		"docs/infrastructure/storage/ceph/osd/index.mdx",
	]);
	const reverse = buildWikiKnowledgeCore([
		"docs/infrastructure/storage/ceph/osd/index.mdx",
		"docs/infrastructure/storage/ceph/overview.mdx",
	]);

	assert.deepEqual(forward.documents.map((document) => document.id), reverse.documents.map((document) => document.id));
	assert.deepEqual(forward.relations.map((relation) => relation.id), reverse.relations.map((relation) => relation.id));
	assert.deepEqual(forward.subjects.map((subject) => subject.id), reverse.subjects.map((subject) => subject.id));
	assert.deepEqual(forward.subjects[0].document_refs, [
		"doc:docs/infrastructure/storage/ceph/overview.mdx",
		"doc:docs/infrastructure/storage/ceph/osd/index.mdx",
	]);
	assert.equal(forward.subjects[0].canonical_name, "Ceph Storage Cluster란?");
	assert.equal(forward.subjects[0].snippet, forward.documents[0].snippet);
	assert.equal(reverse.subjects[0].snippet, forward.subjects[0].snippet);
	assert.equal(reverse.subjects[0].canonical_name, forward.subjects[0].canonical_name);
});

test("wiki knowledge core selects the canonical subject representative explicitly", () => {
	const overviewDocument = {
		id: "doc:docs/infrastructure/storage/ceph/overview.mdx",
		source_path: "docs/infrastructure/storage/ceph/overview.mdx",
		title: "Ceph Storage Cluster란?",
		snippet: "overview snippet",
		aliases: ["z", "ä"],
		ontology: {
			role: "entity",
			domain: "infrastructure",
			class: "storage-system",
			instance: "ceph",
			aspect: "overview",
		},
	};
	const detailDocument = {
		id: "doc:docs/infrastructure/storage/ceph/osd/index.mdx",
		source_path: "docs/infrastructure/storage/ceph/osd/index.mdx",
		title: "Ceph OSD 관리",
		snippet: "detail snippet",
		aliases: ["a", "z"],
		ontology: {
			role: "operation",
			domain: "infrastructure",
			class: "storage-system",
			instance: "ceph",
			aspect: "osd",
		},
	};

	assert.equal(selectCanonicalSubjectDocument([detailDocument, overviewDocument]).id, overviewDocument.id);

	const subject = buildCanonicalSubjectSnapshot("subject:infrastructure:storage-system:ceph", [detailDocument, overviewDocument], overviewDocument);

	assert.equal(subject.canonical_name, overviewDocument.title);
	assert.equal(subject.snippet, overviewDocument.snippet);
	assert.deepEqual(subject.aliases, ["a", "z", "ä"]);
	assert.deepEqual(subject.document_refs, [overviewDocument.id, detailDocument.id]);
});

test("wiki knowledge core keeps source paths and subject refs independent for maintained taxonomy docs", () => {
	const tempDir = mkdtempSync(join(resolve(ROOT_DIR, "docs", "language"), "__wiki-core-taxonomy-"));
	const filePath = join(tempDir, "grpc", "client.mdx");
	const sourcePath = relative(ROOT_DIR, filePath).replaceAll("\\", "/");
	const fileDir = dirname(filePath);
	const registryEntry = {
		source: sourcePath,
		target: sourcePath,
		ontology: {
			role: "entity",
			domain: "language",
			class: "library",
			instance: "grpc",
			aspect: "client",
		},
	};

	try {
		mkdirSync(fileDir, { recursive: true });
		writeFileSync(
			filePath,
			`---
id: client
title: gRPC Go Client
ontology:
  role: entity
  domain: language
  class: library
  instance: grpc
  aspect: client
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

		const records = buildWikiKnowledgeCore([sourcePath], { registry: [registryEntry] });
		const document = records.documents[0];

		assert.equal(document.source_path, sourcePath);
		assert.equal(document.id, `doc:${sourcePath}`);
		assert.equal(document.subject_ref, "subject:language:library:grpc");
		assert.equal(document.url, `/${sourcePath.replace(/\.mdx$/, "")}`);
	} finally {
		rmSync(tempDir, { recursive: true, force: true });
	}
});

test("wiki knowledge core emits semantic subject relations from frontmatter metadata", () => {
	const tempDir = mkdtempSync(join(resolve(ROOT_DIR, "docs", "language"), "__wiki-core-relations-"));
	const nextjsPath = join(tempDir, "nextjs", "overview.mdx");
	const reactPath = join(tempDir, "react", "overview.mdx");
	const nextjsSource = relative(ROOT_DIR, nextjsPath).replaceAll("\\", "/");
	const reactSource = relative(ROOT_DIR, reactPath).replaceAll("\\", "/");

	try {
		mkdirSync(dirname(nextjsPath), { recursive: true });
		mkdirSync(dirname(reactPath), { recursive: true });
		writeFileSync(
			nextjsPath,
			`---
id: overview
title: Next.js
ontology:
  role: entity
  domain: language
  class: framework
  instance: nextjs
  aspect: overview
subject:
  canonical_name: Next.js
relations:
  related_to: []
  depends_on:
    - react
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
		writeFileSync(
			reactPath,
			`---
id: overview
title: React
ontology:
  role: entity
  domain: language
  class: framework
  instance: react
  aspect: overview
subject:
  canonical_name: React
relations:
  related_to: []
  depends_on:
    - javascript
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

		const records = buildWikiKnowledgeCore([nextjsSource, reactSource], {
			registry: [
				{
					source: nextjsSource,
					target: nextjsSource,
					ontology: {
						role: "entity",
						domain: "language",
						class: "framework",
						instance: "nextjs",
						aspect: "overview",
					},
				},
				{
					source: reactSource,
					target: reactSource,
					ontology: {
						role: "entity",
						domain: "language",
						class: "framework",
						instance: "react",
						aspect: "overview",
					},
				},
			],
		});

		assert.ok(
			records.relations.some((relation) =>
				relation.from === "subject:language:framework:nextjs" &&
				relation.to === "subject:language:framework:react" &&
				relation.predicate === "depends_on",
			),
		);
	} finally {
		rmSync(tempDir, { recursive: true, force: true });
	}
});
