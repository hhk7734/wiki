import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CLASSIFICATION_REGISTRY_PATH, bootstrapRegistry } from "./bootstrap-registry.mjs";
import { ROOT_DIR } from "./constants.mjs";
import { inventory } from "./inventory.mjs";
import { readFrontmatter, requireSemanticFrontmatter } from "./frontmatter.mjs";
import { readFileSync } from "node:fs";
import { isMaintainedTaxonomyPath } from "./pathing.mjs";
import { hasApprovedTaxonomyTopicPrefix, validateTaxonomyPath } from "./taxonomy-paths.mjs";

export function validateSourcePath(legacyPath, { allowEditorialBuckets = false } = {}) {
	const normalizedPath = legacyPath.replaceAll("\\", "/");

	if (!normalizedPath.startsWith("docs/")) {
		throw new Error("source path must be under docs/");
	}

	if (!normalizedPath.endsWith(".mdx")) {
		throw new Error("source path must point to an .mdx document");
	}

	if (!allowEditorialBuckets && normalizedPath.includes("/etc/")) {
		throw new Error("forbidden editorial bucket");
	}

	if (hasApprovedTaxonomyTopicPrefix(normalizedPath)) {
		validateTaxonomyPath(normalizedPath);
		return;
	}
}

export function validateEntries(entries, { validateSourcePaths = false, allowEditorialBuckets = false } = {}) {
	const seenTargets = new Set();
	const seenSources = new Set();

	for (const entry of entries) {
		if (validateSourcePaths) {
			validateSourcePath(entry.source, { allowEditorialBuckets });
		}

		if (seenSources.has(entry.source)) {
			throw new Error(`duplicate source path: ${entry.source}`);
		}

		if (seenTargets.has(entry.target)) {
			throw new Error(`duplicate target path: ${entry.target}`);
		}

		seenSources.add(entry.source);
		seenTargets.add(entry.target);
	}
}

export function validateFrontmatter({ source, frontmatter }) {
	const filename = basename(source, ".mdx");
	const docId = frontmatter?.id;

	if (docId !== filename) {
		throw new Error(`id mismatch: ${docId} != ${filename}`);
	}
}

export function loadRegistry(registryPath = CLASSIFICATION_REGISTRY_PATH) {
	return JSON.parse(readFileSync(registryPath, "utf8"));
}

function projectOntology(ontology = {}) {
	return {
		role: ontology.role,
		domain: ontology.domain,
		class: ontology.class,
		instance: ontology.instance,
		aspect: ontology.aspect,
	};
}

function projectRegistryEntry(entry = {}) {
	return {
		source: entry.source,
		target: entry.target,
		ontology: projectOntology(entry.ontology),
	};
}

function sortProjectedEntries(entries) {
	return entries
		.map((entry) => projectRegistryEntry(entry))
		.sort((left, right) =>
			`${left.source}\0${left.target}`.localeCompare(`${right.source}\0${right.target}`),
		);
}

export function validateRegistryDeterminism(entries, expectedEntries = bootstrapRegistry()) {
	const actual = sortProjectedEntries(entries);
	const expected = sortProjectedEntries(expectedEntries);

	if (actual.length !== expected.length) {
		throw new Error("classification registry is out of date");
	}

	for (let index = 0; index < actual.length; index += 1) {
		const nextActual = actual[index];
		const nextExpected = expected[index];

		if (
			nextActual.source !== nextExpected.source ||
			nextActual.target !== nextExpected.target ||
			nextActual.ontology.role !== nextExpected.ontology.role ||
			nextActual.ontology.domain !== nextExpected.ontology.domain ||
			nextActual.ontology.class !== nextExpected.ontology.class ||
			nextActual.ontology.instance !== nextExpected.ontology.instance ||
			nextActual.ontology.aspect !== nextExpected.ontology.aspect
		) {
			throw new Error("classification registry is out of date");
		}
	}
}

export function validateDocumentFile(source) {
	const absolutePath = resolve(ROOT_DIR, source);
	const frontmatter = readFrontmatter(absolutePath);

	validateFrontmatter({ source, frontmatter });

	if (isMaintainedTaxonomyPath(source)) {
		requireSemanticFrontmatter(frontmatter, source);
	}

	return frontmatter;
}

function validateDocumentOntology(source, entry, frontmatter) {
	const ontology = frontmatter?.ontology ?? {};

	if (
		ontology.role !== entry.ontology.role ||
		ontology.domain !== entry.ontology.domain ||
		ontology.class !== entry.ontology.class ||
		ontology.instance !== entry.ontology.instance ||
		ontology.aspect !== entry.ontology.aspect
	) {
		throw new Error(`ontology mismatch: ${source}`);
	}
}

export function validateCorpus({ entries = loadRegistry(), docs = inventory() } = {}) {
	validateEntries(entries, {
		validateSourcePaths: true,
		allowEditorialBuckets: true,
	});
	validateRegistryDeterminism(entries, bootstrapRegistry(docs));

	const entryBySource = new Map(entries.map((entry) => [entry.source, entry]));
	const entryByTarget = new Map(entries.map((entry) => [entry.target, entry]));

	for (const source of docs) {
		const frontmatter = validateDocumentFile(source);
		const entry = entryBySource.get(source) ?? entryByTarget.get(source);

		if (!entry) {
			throw new Error(`missing registry entry for document: ${source}`);
		}

		if (isMaintainedTaxonomyPath(source)) {
			validateDocumentOntology(source, entry, frontmatter);
		}
	}
}

function main() {
	try {
		validateCorpus();
		console.log("ontology validation passed");
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
	main();
}
