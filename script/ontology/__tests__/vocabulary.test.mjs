import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { DOCS_DIR, loadOntologyVocabulary } from "../constants.mjs";

test("ontology vocabulary domains match maintained documentation topics", () => {
	const vocabulary = loadOntologyVocabulary();
	const topics = readdirSync(DOCS_DIR, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();

	assert.deepEqual([...vocabulary.domains].sort(), topics);
});

test("loadOntologyVocabulary rejects malformed vocabulary", () => {
	const tempDir = mkdtempSync(join(tmpdir(), "ontology-vocabulary-"));
	const vocabularyPath = join(tempDir, "vocabulary.json");

	try {
		writeFileSync(vocabularyPath, JSON.stringify({ roles: "entity", domains: [] }));

		assert.throws(() => loadOntologyVocabulary(vocabularyPath), /roles must be a non-empty string array/);
	} finally {
		rmSync(tempDir, { recursive: true, force: true });
	}
});
