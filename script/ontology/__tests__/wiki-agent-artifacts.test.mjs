import test from "node:test";
import assert from "node:assert/strict";
import { buildWikiAgentArtifacts } from "../build-wiki-agent-artifacts.mjs";

test("agent artifacts expose compact query and node payloads", () => {
	const artifacts = buildWikiAgentArtifacts({
		documents: [
			{
				id: "doc:ceph-osd",
				type: "document",
				title: "Ceph OSD",
				url: "/docs/operation/data/storage-system/ceph/osd",
				snippet: "Ceph OSD management guide",
				ontology: { role: "operation", domain: "data", class: "storage-system", instance: "ceph", aspect: "osd" },
				subject_ref: "subject:data:storage-system:ceph",
			},
		],
		subjects: [
			{
				id: "subject:data:storage-system:ceph",
				type: "subject",
				canonical_name: "Ceph",
				ontology: { domain: "data", class: "storage-system", instance: "ceph" },
				document_refs: ["doc:ceph-osd"],
			},
		],
		relations: [{ from: "doc:ceph-osd", predicate: "about_subject", to: "subject:data:storage-system:ceph" }],
	});

	assert.equal(artifacts.queryIndex.subjects[0].id, "subject:data:storage-system:ceph");
	assert.equal(artifacts.queryIndex.documents[0].snippet, "Ceph OSD management guide");
	assert.equal(artifacts.nodes["subject:data:storage-system:ceph"].documents[0].id, "doc:ceph-osd");
});
