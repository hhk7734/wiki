import test from "node:test";
import assert from "node:assert/strict";
import { buildTargetPath, classifySeed } from "../pathing.mjs";

test("buildTargetPath uses unique canonical filenames for overview pages", () => {
	assert.equal(
		buildTargetPath({
			role: "entity",
			domain: "language",
			className: "programming-language",
			instance: "go",
			aspect: "overview",
		}),
		"docs/entity/language/programming-language/go/go.mdx",
	);
});

test("buildTargetPath uses the aspect name for non-overview pages", () => {
	assert.equal(
		buildTargetPath({
			role: "operation",
			domain: "platform",
			className: "cluster-addon",
			instance: "node-feature-discovery",
			aspect: "install",
		}),
		"docs/operation/platform/cluster-addon/node-feature-discovery/install.mdx",
	);
});

test("current Go overview path maps to canonical ontology path", () => {
	assert.equal(
		classifySeed("docs/lang/go/go.mdx").target,
		"docs/entity/language/programming-language/go/go.mdx",
	);
});
