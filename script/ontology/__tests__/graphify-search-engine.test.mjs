import test from "node:test";
import assert from "node:assert/strict";
import { searchGraphifyIndex } from "../../../src/components/graphifySearch/searchEngine.mjs";

test("graphify search ranks ceph osd operation docs highly for natural-language queries", () => {
	const results = searchGraphifyIndex("ceph osd 관리 방법은?", [
		{
			id: "doc:ceph-osd",
			title: "Ceph OSD",
			description: "OSD management guide",
			headings: ["OSD 관리"],
			keywords: ["ceph", "osd"],
			ontology: {
				role: "operation",
				domain: "infrastructure",
				class: "storage-system",
				instance: "ceph",
				aspect: "osd",
			},
			search_text: "ceph osd 관리 방법과 교체 절차",
			terms: ["ceph", "osd", "관리", "방법", "교체", "절차"],
			url: "/docs/infrastructure/storage/ceph/osd",
		},
		{
			id: "doc:ceph-overview",
			title: "Ceph",
			description: "Ceph overview",
			headings: ["구성 요소"],
			keywords: ["ceph"],
			ontology: {
				role: "entity",
				domain: "infrastructure",
				class: "storage-system",
				instance: "ceph",
				aspect: "overview",
			},
			search_text: "ceph overview and architecture",
			terms: ["ceph", "overview", "architecture"],
			url: "/docs/infrastructure/storage/ceph/overview",
		},
	]);

	assert.equal(results[0]?.id, "doc:ceph-osd");
});
