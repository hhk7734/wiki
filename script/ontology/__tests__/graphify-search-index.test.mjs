import test from "node:test";
import assert from "node:assert/strict";
import { buildGraphifySearchIndex } from "../build-graphify-search-index.mjs";

test("graphify search index emits searchable static records", () => {
	const records = buildGraphifySearchIndex([
		{
			type: "document",
			id: "doc:docs/infrastructure/storage/ceph/osd.mdx",
			source_path: "docs/infrastructure/storage/ceph/osd.mdx",
			url: "/docs/infrastructure/storage/ceph/osd",
			title: "Ceph OSD",
			description: "OSD management guide",
			keywords: ["ceph", "osd"],
			ontology: {
				role: "operation",
				domain: "infrastructure",
				class: "storage-system",
				instance: "ceph",
				aspect: "osd",
			},
			headings: ["OSD 관리"],
			text: "Ceph OSD 관리 방법과 교체 절차",
		},
	]);

	assert.equal(records.length, 1);
	assert.equal(records[0].id, "doc:docs/infrastructure/storage/ceph/osd.mdx");
	assert.match(records[0].search_text, /ceph osd/i);
	assert.ok(records[0].terms.includes("ceph"));
	assert.ok(records[0].terms.includes("osd"));
});
