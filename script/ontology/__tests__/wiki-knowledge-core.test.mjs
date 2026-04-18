import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join, relative, resolve } from "node:path";
import { buildWikiKnowledgeCore } from "../build-wiki-knowledge-core.mjs";
import { ROOT_DIR } from "../constants.mjs";
import { buildCanonicalSubjectSnapshot, selectCanonicalSubjectDocument } from "../wiki-knowledge-shared.mjs";

test("wiki knowledge core emits stable document ids, urls, and normalized snippets", () => {
	const records = buildWikiKnowledgeCore([
		"docs/operation/data/storage-system/ceph/osd.mdx",
	]);

	const document = records.documents[0];
	const relation = records.relations[0];

	assert.equal(document.type, "document");
	assert.equal(document.id, "doc:docs/operation/data/storage-system/ceph/osd.mdx");
	assert.equal(document.url, "/docs/operation/data/storage-system/ceph/osd");
	assert.equal(document.subject_ref, "subject:data:storage-system:ceph");
	assert.ok(document.snippet.length > 0);
	assert.ok(document.snippet.length < document.text.length);
	assert.doesNotMatch(document.snippet, /import useBaseUrl|:::|`/i);
	assert.equal(relation.id, "relation:doc:docs/operation/data/storage-system/ceph/osd.mdx:about_subject:subject:data:storage-system:ceph");
	assert.equal(relation.predicate, "about_subject");
});

test("wiki knowledge core keeps multi-document subject records deterministic", () => {
	const forward = buildWikiKnowledgeCore([
		"docs/entity/data/storage-system/ceph/ceph.mdx",
		"docs/operation/data/storage-system/ceph/osd.mdx",
	]);
	const reverse = buildWikiKnowledgeCore([
		"docs/operation/data/storage-system/ceph/osd.mdx",
		"docs/entity/data/storage-system/ceph/ceph.mdx",
	]);

	assert.deepEqual(forward.documents.map((document) => document.id), reverse.documents.map((document) => document.id));
	assert.deepEqual(forward.relations.map((relation) => relation.id), reverse.relations.map((relation) => relation.id));
	assert.deepEqual(forward.subjects.map((subject) => subject.id), reverse.subjects.map((subject) => subject.id));
	assert.deepEqual(forward.subjects[0].document_refs, [
		"doc:docs/entity/data/storage-system/ceph/ceph.mdx",
		"doc:docs/operation/data/storage-system/ceph/osd.mdx",
	]);
	assert.equal(forward.subjects[0].canonical_name, "Ceph Storage Cluster란?");
	assert.equal(forward.subjects[0].snippet, forward.documents[0].snippet);
	assert.equal(reverse.subjects[0].snippet, forward.subjects[0].snippet);
	assert.equal(reverse.subjects[0].canonical_name, forward.subjects[0].canonical_name);
});

test("wiki knowledge core selects the canonical subject representative explicitly", () => {
	const overviewDocument = {
		id: "doc:docs/entity/data/storage-system/ceph/ceph.mdx",
		source_path: "docs/entity/data/storage-system/ceph/ceph.mdx",
		title: "Ceph Storage Cluster란?",
		snippet: "overview snippet",
		aliases: ["z", "ä"],
		ontology: {
			role: "entity",
			domain: "data",
			class: "storage-system",
			instance: "ceph",
			aspect: "overview",
		},
	};
	const detailDocument = {
		id: "doc:docs/operation/data/storage-system/ceph/osd.mdx",
		source_path: "docs/operation/data/storage-system/ceph/osd.mdx",
		title: "Ceph OSD 관리",
		snippet: "detail snippet",
		aliases: ["a", "z"],
		ontology: {
			role: "operation",
			domain: "data",
			class: "storage-system",
			instance: "ceph",
			aspect: "osd",
		},
	};

	assert.equal(selectCanonicalSubjectDocument([detailDocument, overviewDocument]).id, overviewDocument.id);

	const subject = buildCanonicalSubjectSnapshot("subject:data:storage-system:ceph", [detailDocument, overviewDocument], overviewDocument);

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
