import test from "node:test";
import assert from "node:assert/strict";
import { buildGraphifyExport, serializeGraphifyJsonl } from "../export-graphify.mjs";

test("graphify export emits a document, a subject, and an about_subject relation", () => {
	const records = buildGraphifyExport([
		"docs/entity/mlops/iac-tool/pulumi/pulumi.mdx",
	]);

	const document = records.find((record) => record.type === "document");
	const subject = records.find((record) => record.type === "subject");
	const relation = records.find((record) => record.type === "relation");

	assert.ok(document);
	assert.ok(subject);
	assert.ok(relation);

	assert.equal(document.source_path, "docs/entity/mlops/iac-tool/pulumi/pulumi.mdx");
	assert.equal(document.url, "/docs/entity/mlops/iac-tool/pulumi");
	assert.equal(document.subject_ref, "subject:mlops:iac-tool:pulumi");
	assert.equal(subject.id, "subject:mlops:iac-tool:pulumi");
	assert.equal(relation.predicate, "about_subject");
	assert.equal(relation.to, "subject:mlops:iac-tool:pulumi");
});

test("graphify export keeps searchable text and headings", () => {
	const records = buildGraphifyExport([
		"docs/entity/mlops/iac-tool/pulumi/pulumi.mdx",
	]);

	const document = records.find((record) => record.type === "document");

	assert.match(document.text, /Pulumi/);
	assert.ok(document.headings.includes("관련 문서"));
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
