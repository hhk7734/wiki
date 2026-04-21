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
	assert.deepEqual(parseTaxonomyPath("docs/knowledge/concepts/ontology.mdx"), {
		topic: "knowledge",
		subject: "ontology",
		facet: null,
		page: "ontology",
		kind: "topic-concept",
	});
});

test("parseTaxonomyPath parses the topic comparison and reference shapes", () => {
	assert.deepEqual(parseTaxonomyPath("docs/knowledge/comparisons/type.mdx"), {
		topic: "knowledge",
		subject: "type",
		facet: null,
		page: "type",
		kind: "topic-comparison",
	});

	assert.deepEqual(parseTaxonomyPath("docs/knowledge/reference/schema.mdx"), {
		topic: "knowledge",
		subject: "schema",
		facet: null,
		page: "schema",
		kind: "topic-reference",
	});
});

test("parseTaxonomyPath parses infrastructure area shapes", () => {
	assert.deepEqual(parseTaxonomyPath("docs/infrastructure/database/type.mdx"), {
		topic: "infrastructure",
		subject: "database",
		facet: null,
		page: "type",
		kind: "area-page",
		area: "database",
	});

	assert.deepEqual(parseTaxonomyPath("docs/infrastructure/iac/pulumi/config.mdx"), {
		topic: "infrastructure",
		subject: "pulumi",
		facet: null,
		page: "config",
		kind: "area-subject-page",
		area: "iac",
	});

	assert.deepEqual(parseTaxonomyPath("docs/infrastructure/kubernetes/kubernetes/scheduling/affinity.mdx"), {
		topic: "infrastructure",
		subject: "kubernetes",
		facet: "scheduling",
		page: "affinity",
		kind: "area-facet-page",
		area: "kubernetes",
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
	assert.throws(() => validateTaxonomyPath("docs/knowledge/reference/schema/details.mdx"), /unsupported taxonomy shape/);
	assert.throws(() => validateTaxonomyPath("docs/language/concepts/go/client.mdx"), /unsupported taxonomy shape/);
});

test("validateTaxonomyPath rejects malformed empty path segments and basenames", () => {
	assert.throws(() => validateTaxonomyPath("docs/language/grpc//overview.mdx"), /unsupported taxonomy path/);
	assert.throws(() => validateTaxonomyPath("docs/knowledge/concepts//ontology.mdx"), /unsupported taxonomy path/);
	assert.throws(() => validateTaxonomyPath("docs/knowledge/concepts/.mdx"), /unsupported taxonomy path/);
});

test("validateTaxonomyPath rejects traversal-like path segments", () => {
	assert.throws(() => validateTaxonomyPath("docs/language/../overview.mdx"), /unsupported taxonomy path/);
	assert.throws(() => validateTaxonomyPath("docs/language/grpc/../client.mdx"), /unsupported taxonomy path/);
});
