import test from "node:test";
import assert from "node:assert/strict";
import { buildWikiHumanSearchIndex } from "../build-wiki-human-search-index.mjs";

test("wiki human search index groups subjects and documents with display metadata", () => {
	const index = buildWikiHumanSearchIndex({
		documents: [
			{
				id: "doc:docs/operation/data/storage-system/ceph/osd.mdx",
				type: "document",
				title: "Ceph OSD",
				description: "OSD management guide",
				url: "/docs/operation/data/storage-system/ceph/osd",
				snippet: "Ceph OSD management guide",
				headings: ["OSD 관리"],
				keywords: ["ceph", "osd"],
				subject_ref: "subject:data:storage-system:ceph",
				ontology: {
					role: "operation",
					domain: "data",
					class: "storage-system",
					instance: "ceph",
					aspect: "osd",
				},
			},
		],
		subjects: [
			{
				id: "subject:data:storage-system:ceph",
				type: "subject",
				canonical_name: "Ceph",
				document_refs: ["doc:docs/operation/data/storage-system/ceph/osd.mdx"],
				snippet: "Ceph overview",
				ontology: { domain: "data", class: "storage-system", instance: "ceph" },
			},
		],
		relations: [],
	});

	assert.equal(index.subjects[0].id, "subject:data:storage-system:ceph");
	assert.equal(index.subjects[0].title, "Ceph");
	assert.equal(index.subjects[0].url, "/docs/operation/data/storage-system/ceph/osd");
	assert.equal(index.subjects[0].snippet, "Ceph overview");
	assert.equal(index.documents[0].id, "doc:docs/operation/data/storage-system/ceph/osd.mdx");
	assert.equal(index.documents[0].title, "Ceph OSD");
	assert.equal(index.documents[0].description, "OSD management guide");
	assert.equal(index.documents[0].url, "/docs/operation/data/storage-system/ceph/osd");
	assert.deepEqual(index.documents[0].headings, ["OSD 관리"]);
	assert.deepEqual(index.documents[0].keywords, ["ceph", "osd"]);
	assert.equal(index.documents[0].snippet, "Ceph OSD management guide");
});
