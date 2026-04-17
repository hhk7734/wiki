import test from "node:test";
import assert from "node:assert/strict";
import { searchWikiIndex } from "../../../src/components/wikiSearch/searchEngine.mjs";

test("wiki search groups subject and document results for natural-language queries", () => {
	const results = searchWikiIndex(
		"ceph osd 관리 방법은?",
		{
			subjects: [
				{
					id: "subject:ceph",
					title: "Ceph",
					description: "Ceph overview",
					snippet: "Ceph overview",
					url: "/docs/entity/data/storage-system/ceph",
					ontology: {
						domain: "data",
						class: "storage-system",
						instance: "ceph",
					},
					search_text: "ceph overview architecture",
					display: { label: "Ceph", kind: "subject", subtitle: "Ceph", document_count: 1 },
				},
			],
			documents: [
				{
					id: "doc:ceph-osd",
					title: "Ceph OSD",
					description: "OSD management guide",
					snippet: "OSD management guide",
					headings: ["OSD 관리"],
					keywords: ["ceph", "osd"],
					url: "/docs/operation/data/storage-system/ceph/osd",
					subject_ref: "subject:ceph",
					subject_title: "Ceph",
					ontology: {
						role: "operation",
						domain: "data",
						class: "storage-system",
						instance: "ceph",
						aspect: "osd",
					},
					search_text: "ceph osd 관리 방법과 교체 절차",
					display: { label: "Ceph OSD", kind: "document", subtitle: "Ceph" },
				},
				{
					id: "doc:ceph-overview",
					title: "Ceph Overview",
					description: "Ceph overview",
					snippet: "Ceph overview",
					headings: ["구성 요소"],
					keywords: ["ceph"],
					url: "/docs/entity/data/storage-system/ceph/overview",
					subject_ref: "subject:ceph",
					subject_title: "Ceph",
					ontology: {
						role: "entity",
						domain: "data",
						class: "storage-system",
						instance: "ceph",
						aspect: "overview",
					},
					search_text: "ceph overview architecture",
					display: { label: "Ceph Overview", kind: "document", subtitle: "Ceph" },
				},
			],
		},
	);

	assert.equal(results.subjects[0]?.id, "subject:ceph");
	assert.equal(results.documents[0]?.id, "doc:ceph-osd");
	assert.ok(results.subjects[0]?.score > 0);
	assert.ok(results.documents[0]?.score > results.documents[1]?.score);
});
