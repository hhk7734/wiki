import test from "node:test";
import assert from "node:assert/strict";
import { buildWikiKnowledgeCore } from "../build-wiki-knowledge-core.mjs";

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
	assert.equal(reverse.subjects[0].canonical_name, forward.subjects[0].canonical_name);
});
