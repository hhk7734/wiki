import test from "node:test";
import assert from "node:assert/strict";
import { buildWikiKnowledgeCore } from "../build-wiki-knowledge-core.mjs";

test("wiki knowledge core emits document, subject, and relation records with snippets", () => {
	const records = buildWikiKnowledgeCore([
		"docs/operation/data/storage-system/ceph/osd.mdx",
	]);

	const document = records.documents[0];
	const subject = records.subjects[0];
	const relation = records.relations[0];

	assert.equal(document.type, "document");
	assert.equal(document.subject_ref, "subject:data:storage-system:ceph");
	assert.match(document.snippet, /osd/i);
	assert.equal(subject.id, "subject:data:storage-system:ceph");
	assert.equal(relation.predicate, "about_subject");
});
