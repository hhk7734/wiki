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
				url: "/docs/data/ceph/osd",
				snippet: "Ceph OSD management guide",
				ontology: { role: "operation", domain: "data", class: "storage-system", instance: "ceph", aspect: "osd" },
				subject_ref: "subject:data:storage-system:ceph",
			},
			{
				id: "doc:ceph-monitoring",
				type: "document",
				title: "Ceph Monitoring",
				source_path: "docs/data/ceph/monitoring.mdx",
				snippet: "Ceph monitoring guide",
				text: "FULL NORMALIZED DOCUMENT TEXT SHOULD NOT BE EXPORTED",
				ontology: { role: "operation", domain: "data", class: "storage-system", instance: "ceph", aspect: "monitoring" },
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
	assert.equal(artifacts.nodes["subject:data:storage-system:ceph"].documents[1].url, "/docs/data/ceph/monitoring");
	assert.equal(artifacts.nodes["doc:ceph-monitoring"].subject.url, "/docs/data/ceph/monitoring");
	assert.deepEqual(artifacts.graph.edges, [
		{
			id: "relation:doc:ceph-osd:about_subject:subject:data:storage-system:ceph",
			from: "doc:ceph-osd",
			to: "subject:data:storage-system:ceph",
			predicate: "about_subject",
		},
	]);
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
		const pathBasedDocumentNodePath = join(outputDir, "nodes", "doc:docs/data/ceph/monitoring.mdx.json");
		const result = writeWikiAgentArtifacts(outputDir, {
			documents: [
				{
					id: "doc:ceph-osd",
					type: "document",
					title: "Ceph OSD",
					url: "/docs/data/ceph/osd",
					snippet: "Ceph OSD management guide",
					text: "FULL NORMALIZED DOCUMENT TEXT SHOULD NOT BE EXPORTED",
					ontology: { role: "operation", domain: "data", class: "storage-system", instance: "ceph", aspect: "osd" },
					subject_ref: "subject:data:storage-system:ceph",
				},
				{
					id: "doc:docs/data/ceph/monitoring.mdx",
					type: "document",
					title: "Ceph Monitoring",
					source_path: "docs/data/ceph/monitoring.mdx",
					snippet: "Ceph monitoring guide",
					text: "FULL NORMALIZED DOCUMENT TEXT SHOULD NOT BE EXPORTED",
					ontology: { role: "operation", domain: "data", class: "storage-system", instance: "ceph", aspect: "monitoring" },
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
		assert.equal(queryIndex.documents[1].url, "/docs/data/ceph/monitoring");
		assert.equal(readFileSync(join(outputDir, "query-index.json"), "utf8").includes("FULL NORMALIZED DOCUMENT TEXT SHOULD NOT BE EXPORTED"), false);
		assert.equal(readFileSync(join(outputDir, "graph.json"), "utf8").includes("FULL NORMALIZED DOCUMENT TEXT SHOULD NOT BE EXPORTED"), false);
		const subjectNode = JSON.parse(readFileSync(subjectNodePath, "utf8"));
		const documentNode = JSON.parse(readFileSync(documentNodePath, "utf8"));
		const sourcePathDocumentNode = JSON.parse(readFileSync(pathBasedDocumentNodePath, "utf8"));
		assert.ok(readFileSync(subjectNodePath, "utf8").includes('"relations": ['));
		assert.deepEqual(JSON.parse(readFileSync(join(outputDir, "graph.json"), "utf8")).edges, [
			{
				id: "relation:doc:ceph-osd:about_subject:subject:data:storage-system:ceph",
				from: "doc:ceph-osd",
				to: "subject:data:storage-system:ceph",
				predicate: "about_subject",
			},
		]);
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
		assert.equal(sourcePathDocumentNode.url, "/docs/data/ceph/monitoring");
		assert.equal(readFileSync(join(outputDir, "nodes", "doc:ceph-osd.json"), "utf8").includes("FULL NORMALIZED DOCUMENT TEXT SHOULD NOT BE EXPORTED"), false);
		assert.equal(readFileSync(pathBasedDocumentNodePath, "utf8").includes("FULL NORMALIZED DOCUMENT TEXT SHOULD NOT BE EXPORTED"), false);
		assert.equal(sourcePathDocumentNode.subject.url, "/docs/data/ceph/monitoring");
		assert.ok(readFileSync(pathBasedDocumentNodePath, "utf8").includes('"subject": {'));
	} finally {
		rmSync(outputDir, { recursive: true, force: true });
	}
});

test("agent artifacts keep subtitles and graph labels tied to ontology identity", () => {
	const artifacts = buildWikiAgentArtifacts({
		documents: [
			{
				id: "doc:docs/language/library/grpc/go/client.mdx",
				type: "document",
				title: "gRPC Go Client",
				source_path: "docs/language/library/grpc/go/client.mdx",
				snippet: "gRPC client guide",
				ontology: { role: "entity", domain: "language", class: "library", instance: "grpc", aspect: "client" },
				subject_ref: "subject:language:library:grpc",
			},
		],
		subjects: [
			{
				id: "subject:language:library:grpc",
				type: "subject",
				canonical_name: "gRPC",
				ontology: { domain: "language", class: "library", instance: "grpc" },
				document_refs: ["doc:docs/language/library/grpc/go/client.mdx"],
			},
		],
		relations: [],
	});

	assert.equal(artifacts.queryIndex.subjects[0].title, "gRPC");
	assert.equal(artifacts.queryIndex.documents[0].title, "gRPC Go Client");
	assert.equal(artifacts.graph.nodes.find((node) => node.id === "subject:language:library:grpc").title, "gRPC");
	assert.equal(artifacts.graph.nodes.find((node) => node.id === "doc:docs/language/library/grpc/go/client.mdx").title, "gRPC Go Client");
});
