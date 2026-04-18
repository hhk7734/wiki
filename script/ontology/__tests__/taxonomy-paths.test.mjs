import test from "node:test";
import assert from "node:assert/strict";
import { buildTargetPath } from "../pathing.mjs";

test("buildTargetPath accepts subject-owned doc pages in the taxonomy tree", () => {
	assert.equal(
		buildTargetPath({
			role: "entity",
			domain: "language",
			className: "library",
			instance: "grpc",
			aspect: "overview",
		}),
		"docs/language/library/grpc/overview.mdx",
	);
});

test("buildTargetPath accepts subject facet pages in the taxonomy tree", () => {
	assert.equal(
		buildTargetPath({
			role: "entity",
			domain: "language",
			className: "library",
			instance: "grpc",
			aspect: "go/client",
		}),
		"docs/language/library/grpc/go/client.mdx",
	);
});

test("buildTargetPath accepts topic concept pages in the taxonomy tree", () => {
	assert.equal(
		buildTargetPath({
			role: "concept",
			domain: "data",
			className: "concept",
			instance: "ontology",
			aspect: "overview",
		}),
		"docs/data/concepts/ontology.mdx",
	);
});
