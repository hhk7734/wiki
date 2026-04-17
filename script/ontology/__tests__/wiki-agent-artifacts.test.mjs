import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { buildWikiAgentArtifacts, writeWikiAgentArtifacts } from "../build-wiki-agent-artifacts.mjs";

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
			{
				id: "doc:ceph-ha",
				type: "document",
				title: "Ceph HA",
				source_path: "docs/concept/data/storage-system/ceph/ha.mdx",
				snippet: "Ceph HA overview",
				text: "FULL NORMALIZED DOCUMENT TEXT SHOULD NOT BE EXPORTED",
				ontology: { role: "concept", domain: "data", class: "storage-system", instance: "ceph", aspect: "ha" },
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
		relations: [
			{
				id: "relation:doc:ceph-osd:about_subject:subject:data:storage-system:ceph",
				from: "doc:ceph-osd",
				predicate: "about_subject",
				to: "subject:data:storage-system:ceph",
				snippet: "Ceph OSD management guide",
			},
		],
	});

	assert.equal(artifacts.queryIndex.subjects[0].id, "subject:data:storage-system:ceph");
	assert.equal(artifacts.queryIndex.documents[0].snippet, "Ceph OSD management guide");
	assert.equal(artifacts.nodes["subject:data:storage-system:ceph"].documents[0].id, "doc:ceph-osd");
	assert.equal(artifacts.nodes["subject:data:storage-system:ceph"].documents[1].url, "/docs/concept/data/storage-system/ceph/ha");
	assert.equal(artifacts.nodes["doc:ceph-ha"].subject.url, "/docs/concept/data/storage-system/ceph/ha");
	assert.deepEqual(artifacts.nodes["subject:data:storage-system:ceph"].relations, [
		{
			id: "relation:doc:ceph-osd:about_subject:subject:data:storage-system:ceph",
			predicate: "about_subject",
			other_id: "doc:ceph-osd",
			direction: "incoming",
		},
	]);
	assert.deepEqual(artifacts.nodes["doc:ceph-osd"].relations, [
		{
			id: "relation:doc:ceph-osd:about_subject:subject:data:storage-system:ceph",
			predicate: "about_subject",
			other_id: "subject:data:storage-system:ceph",
			direction: "outgoing",
		},
	]);
});

test("write wiki agent artifacts emits compact files without normalized text", () => {
	const outputDir = mkdtempSync(join(tmpdir(), "wiki-agent-artifacts-"));

	try {
		const subjectNodePath = join(outputDir, "nodes", "subject:data:storage-system:ceph.json");
		const documentNodePath = join(outputDir, "nodes", "doc:ceph-osd.json");
		const result = writeWikiAgentArtifacts(outputDir, {
			documents: [
				{
					id: "doc:ceph-osd",
					type: "document",
					title: "Ceph OSD",
					url: "/docs/operation/data/storage-system/ceph/osd",
					snippet: "Ceph OSD management guide",
					text: "FULL NORMALIZED DOCUMENT TEXT SHOULD NOT BE EXPORTED",
					ontology: { role: "operation", domain: "data", class: "storage-system", instance: "ceph", aspect: "osd" },
					subject_ref: "subject:data:storage-system:ceph",
				},
				{
					id: "doc:ceph-ha",
					type: "document",
					title: "Ceph HA",
					source_path: "docs/concept/data/storage-system/ceph/ha.mdx",
					snippet: "Ceph HA overview",
					text: "FULL NORMALIZED DOCUMENT TEXT SHOULD NOT BE EXPORTED",
					ontology: { role: "concept", domain: "data", class: "storage-system", instance: "ceph", aspect: "ha" },
					subject_ref: "subject:data:storage-system:ceph",
				},
			],
			subjects: [
				{
					id: "subject:data:storage-system:ceph",
					type: "subject",
					canonical_name: "Ceph",
					snippet: "Ceph overview",
					ontology: { domain: "data", class: "storage-system", instance: "ceph" },
					document_refs: ["doc:ceph-osd"],
				},
			],
			relations: [
				{
					id: "relation:doc:ceph-osd:about_subject:subject:data:storage-system:ceph",
					from: "doc:ceph-osd",
					predicate: "about_subject",
					to: "subject:data:storage-system:ceph",
					snippet: "Ceph OSD management guide",
				},
			],
		});

		assert.equal(result.nodeCount, 3);
		const queryIndex = JSON.parse(readFileSync(join(outputDir, "query-index.json"), "utf8"));
		assert.equal(queryIndex.documents[1].url, "/docs/concept/data/storage-system/ceph/ha");
		assert.equal(readFileSync(join(outputDir, "query-index.json"), "utf8").includes("FULL NORMALIZED DOCUMENT TEXT SHOULD NOT BE EXPORTED"), false);
		assert.equal(readFileSync(join(outputDir, "graph.json"), "utf8").includes("FULL NORMALIZED DOCUMENT TEXT SHOULD NOT BE EXPORTED"), false);
		const subjectNode = JSON.parse(readFileSync(subjectNodePath, "utf8"));
		const documentNode = JSON.parse(readFileSync(documentNodePath, "utf8"));
		const sourcePathDocumentNode = JSON.parse(readFileSync(join(outputDir, "nodes", "doc:ceph-ha.json"), "utf8"));
		assert.ok(readFileSync(subjectNodePath, "utf8").includes('"relations": ['));
		assert.deepEqual(subjectNode.relations, [
			{
				id: "relation:doc:ceph-osd:about_subject:subject:data:storage-system:ceph",
				predicate: "about_subject",
				other_id: "doc:ceph-osd",
				direction: "incoming",
			},
		]);
		assert.deepEqual(documentNode.relations, [
			{
				id: "relation:doc:ceph-osd:about_subject:subject:data:storage-system:ceph",
				predicate: "about_subject",
				other_id: "subject:data:storage-system:ceph",
				direction: "outgoing",
			},
		]);
		assert.equal(Object.hasOwn(documentNode, "text"), false);
		assert.equal(sourcePathDocumentNode.url, "/docs/concept/data/storage-system/ceph/ha");
		assert.equal(readFileSync(join(outputDir, "nodes", "doc:ceph-osd.json"), "utf8").includes("FULL NORMALIZED DOCUMENT TEXT SHOULD NOT BE EXPORTED"), false);
		assert.equal(readFileSync(join(outputDir, "nodes", "doc:ceph-ha.json"), "utf8").includes("FULL NORMALIZED DOCUMENT TEXT SHOULD NOT BE EXPORTED"), false);
		assert.equal(sourcePathDocumentNode.subject.url, "/docs/concept/data/storage-system/ceph/ha");
	} finally {
		rmSync(outputDir, { recursive: true, force: true });
	}
});
