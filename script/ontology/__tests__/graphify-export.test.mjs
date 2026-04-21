import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join, relative, resolve } from "node:path";
import { ROOT_DIR } from "../constants.mjs";
import { buildGraphifyExport, serializeGraphifyJsonl } from "../export-graphify.mjs";

test("graphify export emits a document, a subject, and an about_subject relation", () => {
	const records = buildGraphifyExport([
		"docs/infrastructure/iac/pulumi/overview.mdx",
	]);

	const document = records.find((record) => record.type === "document");
	const subject = records.find((record) => record.type === "subject");
	const relation = records.find((record) => record.type === "relation");

	assert.ok(document);
	assert.ok(subject);
	assert.ok(relation);

	assert.equal(document.source_path, "docs/infrastructure/iac/pulumi/overview.mdx");
	assert.equal(document.url, "/docs/infrastructure/iac/pulumi/overview");
	assert.equal(document.subject_ref, "subject:infrastructure:iac-tool:pulumi");
	assert.equal(subject.id, "subject:infrastructure:iac-tool:pulumi");
	assert.equal(relation.predicate, "about_subject");
	assert.equal(relation.to, "subject:infrastructure:iac-tool:pulumi");
});

test("graphify export keeps searchable text and headings", () => {
	const records = buildGraphifyExport([
		"docs/infrastructure/iac/pulumi/overview.mdx",
	]);

	const document = records.find((record) => record.type === "document");

	assert.match(document.text, /Pulumi/);
	assert.ok(document.headings.includes("관련 문서"));
});

test("graphify export keeps multi-document subject ordering deterministic", () => {
	const forward = buildGraphifyExport([
		"docs/infrastructure/storage/ceph/overview.mdx",
		"docs/infrastructure/storage/ceph/osd/index.mdx",
	]);
	const reverse = buildGraphifyExport([
		"docs/infrastructure/storage/ceph/osd/index.mdx",
		"docs/infrastructure/storage/ceph/overview.mdx",
	]);

	assert.deepEqual(
		forward.map((record) => `${record.type}:${record.id}`),
		reverse.map((record) => `${record.type}:${record.id}`),
	);

	const subject = forward.find((record) => record.type === "subject");

	assert.deepEqual(subject.document_refs, [
		"doc:docs/infrastructure/storage/ceph/overview.mdx",
		"doc:docs/infrastructure/storage/ceph/osd/index.mdx",
	]);
	assert.equal(subject.canonical_name, "Ceph Storage Cluster란?");
	assert.equal(subject.snippet, forward.find((record) => record.id === "doc:docs/infrastructure/storage/ceph/overview.mdx").snippet);
});

test("graphify export keeps source paths and subject identity separate for maintained taxonomy docs", () => {
	const tempDir = mkdtempSync(join(resolve(ROOT_DIR, "docs", "language"), "__graphify-taxonomy-"));
	const filePath = join(tempDir, "grpc", "client.mdx");
	const sourcePath = relative(ROOT_DIR, filePath).replaceAll("\\", "/");
	const fileDir = dirname(filePath);
	const registryEntry = {
		source: sourcePath,
		target: sourcePath,
		ontology: {
			role: "entity",
			domain: "language",
			class: "library",
			instance: "grpc",
			aspect: "client",
		},
	};

	try {
		mkdirSync(fileDir, { recursive: true });
		writeFileSync(
			filePath,
			`---
id: client
title: gRPC Go Client
ontology:
  role: entity
  domain: language
  class: library
  instance: grpc
  aspect: client
subject:
  canonical_name: gRPC
relations:
  related_to: []
  depends_on: []
  prerequisite_for: []
  part_of: []
  implements: []
  uses: []
source:
  status: canonical
  confidence: exact
---
content
`,
		);

		const records = buildGraphifyExport([sourcePath], { registry: [registryEntry] });
		const document = records.find((record) => record.type === "document");
		const subject = records.find((record) => record.type === "subject");

		assert.equal(document.source_path, sourcePath);
		assert.equal(document.subject_ref, "subject:language:library:grpc");
		assert.equal(document.url, `/${sourcePath.replace(/\.mdx$/, "")}`);
		assert.equal(subject.id, "subject:language:library:grpc");
	} finally {
		rmSync(tempDir, { recursive: true, force: true });
	}
});

test("graphify export serializes newline-delimited JSON", () => {
	const jsonl = serializeGraphifyJsonl([
		{ type: "document", id: "doc:one" },
		{ type: "subject", id: "subject:one" },
	]);

	const lines = jsonl.trim().split("\n");
	assert.equal(lines.length, 2);
	assert.deepEqual(JSON.parse(lines[0]), { type: "document", id: "doc:one" });
	assert.deepEqual(JSON.parse(lines[1]), { type: "subject", id: "subject:one" });
});
