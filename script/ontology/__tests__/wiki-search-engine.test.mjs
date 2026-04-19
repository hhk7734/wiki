import test from "node:test";
import assert from "node:assert/strict";
import { buildWikiResultGroups } from "../../../src/components/wikiSearch/resultGroups.mjs";
import { dedupeGroupedWikiResults, searchWikiIndex } from "../../../src/components/wikiSearch/searchEngine.mjs";

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
					url: "/docs/data/ceph/overview",
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
					url: "/docs/data/ceph/osd",
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
					url: "/docs/data/ceph/overview",
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
	assert.equal(results.documents.length, 1);
	assert.ok(results.documents[0]?.score > 0);
});

test("wiki search ignores punctuation-only queries after normalization", () => {
	const results = searchWikiIndex(
		"!!! ???",
		{
			subjects: [
				{
					id: "subject:ceph",
					title: "Ceph",
					description: "Ceph overview",
					snippet: "Ceph overview",
					url: "/docs/data/ceph/overview",
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
					url: "/docs/data/ceph/osd",
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
			],
		},
	);

	assert.deepEqual(results, { subjects: [], documents: [] });
});

test("wiki search ignores hyphen-only queries without breaking hyphenated fields", () => {
	const results = searchWikiIndex(
		"-",
		{
			subjects: [
				{
					id: "subject:ceph",
					title: "Ceph",
					description: "Ceph overview",
					snippet: "Ceph overview",
					url: "/docs/data/ceph/overview",
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
					id: "doc:ceph-overview",
					title: "Ceph Overview",
					description: "Ceph overview",
					snippet: "Ceph overview",
					headings: ["개요"],
					keywords: ["ceph"],
					url: "/docs/data/ceph/overview",
					subject_ref: "subject:ceph",
					subject_title: "Ceph",
					ontology: {
						role: "entity",
						domain: "data",
						class: "storage-system",
						instance: "ceph",
						aspect: "overview",
					},
					search_text: "ceph storage-system overview",
					display: { label: "Ceph Overview", kind: "document", subtitle: "Ceph" },
				},
			],
		},
	);

	assert.deepEqual(results, { subjects: [], documents: [] });
});

test("wiki search deduplicates canonical subject pages from document results", () => {
	const results = dedupeGroupedWikiResults({
		subjects: [
			{
				id: "subject:ceph",
				title: "Ceph",
				url: "/docs/data/ceph/overview",
			},
			{
				id: "subject:other",
				title: "Other",
				url: "/docs/data/minio/overview",
			},
		],
		documents: [
			{
				id: "doc:ceph-overview",
				title: "Ceph Overview",
				url: "/docs/data/ceph/overview",
			},
			{
				id: "doc:ceph-osd",
				title: "Ceph OSD",
				url: "/docs/data/ceph/osd",
			},
		],
	});

	assert.equal(results.subjects.length, 2);
	assert.deepEqual(
		results.documents.map((document) => document.id),
		["doc:ceph-osd"],
	);
});

test("wiki search keeps the full document slot count after canonical-page dedupe", () => {
	const results = dedupeGroupedWikiResults(
		searchWikiIndex(
			"ceph",
			{
				subjects: [
					{
						id: "subject:ceph",
						title: "Ceph",
						description: "Ceph overview",
						snippet: "Ceph overview",
						url: "/docs/data/ceph/overview",
						ontology: {
							domain: "data",
							class: "storage-system",
							instance: "ceph",
						},
						search_text: "ceph overview architecture",
						display: { label: "Ceph", kind: "subject", subtitle: "Ceph", document_count: 3 },
					},
				],
				documents: [
					{
						id: "doc:ceph-canonical",
						title: "Ceph",
						description: "Canonical subject page",
						snippet: "Canonical subject page",
						headings: ["Overview"],
						keywords: ["ceph"],
						url: "/docs/data/ceph/overview",
						subject_ref: "subject:ceph",
						subject_title: "Ceph",
						ontology: {
							role: "entity",
							domain: "data",
							class: "storage-system",
							instance: "ceph",
							aspect: "overview",
						},
						search_text: "ceph canonical subject page",
						display: { label: "Ceph", kind: "document", subtitle: "Ceph" },
					},
					{
						id: "doc:ceph-osd",
						title: "Ceph OSD",
						description: "OSD management guide",
						snippet: "OSD management guide",
						headings: ["OSD 관리"],
						keywords: ["ceph", "osd"],
						url: "/docs/data/ceph/osd",
						subject_ref: "subject:ceph",
						subject_title: "Ceph",
						ontology: {
							role: "operation",
							domain: "data",
							class: "storage-system",
							instance: "ceph",
							aspect: "osd",
						},
						search_text: "ceph osd management",
						display: { label: "Ceph OSD", kind: "document", subtitle: "Ceph" },
					},
					{
						id: "doc:ceph-monitoring",
						title: "Ceph Monitoring",
						description: "Monitoring guide",
						snippet: "Monitoring guide",
						headings: ["Dashboard"],
						keywords: ["ceph", "monitoring"],
						url: "/docs/data/ceph/monitoring",
						subject_ref: "subject:ceph",
						subject_title: "Ceph",
						ontology: {
							role: "operation",
							domain: "data",
							class: "storage-system",
							instance: "ceph",
							aspect: "monitoring",
						},
						search_text: "ceph monitoring dashboard",
						display: { label: "Ceph Monitoring", kind: "document", subtitle: "Ceph" },
					},
				],
			},
			{ limit: 2 },
		),
	);

	assert.equal(results.subjects.length, 1);
	assert.equal(results.documents.length, 2);
	assert.deepEqual(
		results.documents.map((document) => document.id).sort(),
		["doc:ceph-monitoring", "doc:ceph-osd"],
	);
});

test("wiki result groups render documents before subjects", () => {
	const groups = buildWikiResultGroups({
		subjects: [{ id: "subject:ceph" }],
		documents: [{ id: "doc:ceph-osd" }],
	});

	assert.deepEqual(
		groups.map((group) => group.key),
		["documents", "subjects"],
	);
});
