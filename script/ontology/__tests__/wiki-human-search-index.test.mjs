import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildWikiHumanSearchIndex } from "../build-wiki-human-search-index.mjs";

test("wiki human search index groups multi-document subjects with stable labels", () => {
	const index = buildWikiHumanSearchIndex({
		documents: [
			{
				id: "doc:docs/entity/data/storage-system/ceph/ceph.mdx",
				type: "document",
				title: "Ceph Storage Cluster란?",
				description: "Ceph overview",
				url: "/docs/entity/data/storage-system/ceph/ceph",
				snippet: "Ceph overview",
				headings: ["Overview"],
				keywords: ["ceph"],
				subject_ref: "subject:data:storage-system:ceph",
				ontology: {
					role: "entity",
					domain: "data",
					class: "storage-system",
					instance: "ceph",
					aspect: "overview",
				},
			},
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
				canonical_name: "Ceph Storage Cluster란?",
				document_refs: [
					"doc:docs/entity/data/storage-system/ceph/ceph.mdx",
					"doc:docs/operation/data/storage-system/ceph/osd.mdx",
				],
				snippet: "Ceph overview",
				ontology: { domain: "data", class: "storage-system", instance: "ceph" },
			},
		],
		relations: [],
	});

	const subject = index.subjects.find((record) => record.id === "subject:data:storage-system:ceph");
	const overviewDocument = index.documents.find((record) => record.id === "doc:docs/entity/data/storage-system/ceph/ceph.mdx");
	const operationalDocument = index.documents.find((record) => record.id === "doc:docs/operation/data/storage-system/ceph/osd.mdx");

	assert.ok(subject);
	assert.ok(overviewDocument);
	assert.ok(operationalDocument);
	assert.equal(index.subjects[0].id, "subject:data:storage-system:ceph");
	assert.equal(subject.title, "Ceph Storage Cluster란?");
	assert.equal(subject.url, "/docs/entity/data/storage-system/ceph/ceph");
	assert.equal(subject.snippet, "Ceph overview");
	assert.equal(overviewDocument.title, "Ceph Storage Cluster란?");
	assert.equal(overviewDocument.subject_title, "Ceph");
	assert.equal(overviewDocument.display.subtitle, "Ceph");
	assert.equal(overviewDocument.url, "/docs/entity/data/storage-system/ceph/ceph");
	assert.equal(operationalDocument.title, "Ceph OSD");
	assert.equal(operationalDocument.description, "OSD management guide");
	assert.equal(operationalDocument.subject_title, "Ceph");
	assert.equal(operationalDocument.display.subtitle, "Ceph");
	assert.equal(operationalDocument.url, "/docs/operation/data/storage-system/ceph/osd");
	assert.deepEqual(operationalDocument.headings, ["OSD 관리"]);
	assert.deepEqual(operationalDocument.keywords, ["ceph", "osd"]);
	assert.equal(operationalDocument.snippet, "Ceph OSD management guide");
});

test("wiki human search lifecycle is wired into the build hooks", () => {
	const packageJson = JSON.parse(readFileSync(new URL("../../../package.json", import.meta.url), "utf8"));

	assert.equal(packageJson.scripts["ontology:build:wiki-human"], "node script/ontology/build-wiki-human-search-index.mjs");
	assert.match(packageJson.scripts.prestart, /ontology:build:wiki/);
	assert.match(packageJson.scripts.prebuild, /ontology:build:wiki/);
});
