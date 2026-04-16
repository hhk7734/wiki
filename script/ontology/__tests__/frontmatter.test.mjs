import test from "node:test";
import assert from "node:assert/strict";
import { normalizeOntologyBlock } from "../frontmatter.mjs";

test("normalizeOntologyBlock keeps path and ontology metadata aligned", () => {
	const next = normalizeOntologyBlock({
		role: "entity",
		domain: "language",
		className: "programming-language",
		instance: "go",
		aspect: "overview",
	});

	assert.equal(next.ontology.instance, "go");
	assert.equal(next.ontology.aspect, "overview");
});
