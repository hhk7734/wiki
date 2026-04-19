import test from "node:test";
import assert from "node:assert/strict";
import { parseTaxonomyPath, validateTaxonomyPath } from "../taxonomy-paths.mjs";

test("parseTaxonomyPath parses the subject-page shape", () => {
	assert.deepEqual(parseTaxonomyPath("docs/language/grpc/overview.mdx"), {
		topic: "language",
		subject: "grpc",
		facet: null,
		page: "overview",
		kind: "subject-page",
	});
});

test("parseTaxonomyPath parses the facet-page shape", () => {
	assert.deepEqual(parseTaxonomyPath("docs/language/grpc/go/client.mdx"), {
		topic: "language",
		subject: "grpc",
		facet: "go",
		page: "client",
		kind: "facet-page",
	});
});

test("parseTaxonomyPath parses the topic concept shape", () => {
	assert.deepEqual(parseTaxonomyPath("docs/data/concepts/ontology.mdx"), {
		topic: "data",
		subject: "ontology",
		facet: null,
		page: "ontology",
		kind: "topic-concept",
	});
});

test("parseTaxonomyPath parses the topic comparison and reference shapes", () => {
	assert.deepEqual(parseTaxonomyPath("docs/data/comparisons/type.mdx"), {
		topic: "data",
		subject: "type",
		facet: null,
		page: "type",
		kind: "topic-comparison",
	});

	assert.deepEqual(parseTaxonomyPath("docs/data/reference/schema.mdx"), {
		topic: "data",
		subject: "schema",
		facet: null,
		page: "schema",
		kind: "topic-reference",
	});
});

test("parseTaxonomyPath parses the dedicated comparison topic shape", () => {
	assert.deepEqual(parseTaxonomyPath("docs/comparison/data/database/type/type.mdx"), {
		topic: "comparison",
		subject: "data/database",
		facet: "type",
		page: "type",
		kind: "comparison-facet-page",
		area: "data",
		subject_group: "database",
	});
});

test("parseTaxonomyPath keeps distinct page basenames distinct", () => {
	assert.notDeepEqual(
		parseTaxonomyPath("docs/language/grpc/overview.mdx"),
		parseTaxonomyPath("docs/language/grpc/install.mdx"),
	);

	assert.notDeepEqual(
		parseTaxonomyPath("docs/language/grpc/go/client.mdx"),
		parseTaxonomyPath("docs/language/grpc/go/server.mdx"),
	);
});

test("validateTaxonomyPath rejects unsupported topic buckets", () => {
	assert.throws(() => validateTaxonomyPath("docs/unknown/grpc/overview.mdx"), /unsupported topic bucket/);
});

test("validateTaxonomyPath rejects unsupported shapes", () => {
	assert.throws(() => validateTaxonomyPath("docs/language/grpc/go/client/extra.mdx"), /unsupported taxonomy shape/);
});

test("validateTaxonomyPath rejects reserved bucket names in deeper subject paths", () => {
	assert.throws(() => validateTaxonomyPath("docs/data/reference/schema/details.mdx"), /unsupported taxonomy shape/);
	assert.throws(() => validateTaxonomyPath("docs/language/concepts/go/client.mdx"), /unsupported taxonomy shape/);
});

test("validateTaxonomyPath rejects malformed empty path segments and basenames", () => {
	assert.throws(() => validateTaxonomyPath("docs/language/grpc//overview.mdx"), /unsupported taxonomy path/);
	assert.throws(() => validateTaxonomyPath("docs/data/concepts//ontology.mdx"), /unsupported taxonomy path/);
	assert.throws(() => validateTaxonomyPath("docs/data/concepts/.mdx"), /unsupported taxonomy path/);
});

test("validateTaxonomyPath rejects traversal-like path segments", () => {
	assert.throws(() => validateTaxonomyPath("docs/language/../overview.mdx"), /unsupported taxonomy path/);
	assert.throws(() => validateTaxonomyPath("docs/language/grpc/../client.mdx"), /unsupported taxonomy path/);
});
