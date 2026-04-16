import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CLASSIFICATION_REGISTRY_PATH, bootstrapRegistry } from "./bootstrap-registry.mjs";
import { ROOT_DIR } from "./constants.mjs";
import { inventory } from "./inventory.mjs";
import { readFrontmatter } from "./frontmatter.mjs";
import { readFileSync } from "node:fs";

export function validateSourcePath(legacyPath) {
	if (legacyPath.replaceAll("\\", "/").includes("/etc/")) {
		throw new Error("forbidden editorial bucket");
	}
}

export function validateEntries(entries) {
	const seenTargets = new Set();

	for (const entry of entries) {
		if (seenTargets.has(entry.target)) {
			throw new Error(`duplicate target path: ${entry.target}`);
		}

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
	return frontmatter;
}

function detectCorpusShape(entries, docs) {
	const sources = new Set(entries.map((entry) => entry.source));
	const targets = new Set(entries.map((entry) => entry.target));
	const docsSet = new Set(docs);

	const matchesSources = docs.length === sources.size && docs.every((doc) => sources.has(doc));
	const matchesTargets = docs.length === targets.size && docs.every((doc) => targets.has(doc));

	if (matchesSources) {
		return "legacy";
	}

	if (matchesTargets) {
		return "migrated";
	}

	const overlappingSources = docs.filter((doc) => sources.has(doc)).length;
	const overlappingTargets = docs.filter((doc) => targets.has(doc)).length;

	throw new Error(
		`docs corpus does not match registry sources or targets (sources=${overlappingSources}, targets=${overlappingTargets}, docs=${docsSet.size}, registry=${entries.length})`,
	);
}

function validateMigratedCorpus(entries, docs) {
	const entryByTarget = new Map(entries.map((entry) => [entry.target, entry]));

	for (const target of docs) {
		const frontmatter = validateDocumentFile(target);
		const entry = entryByTarget.get(target);

		if (!entry) {
			throw new Error(`missing registry entry for migrated document: ${target}`);
		}

		const ontology = frontmatter?.ontology ?? {};

		if (
			ontology.role !== entry.ontology.role ||
			ontology.domain !== entry.ontology.domain ||
			ontology.class !== entry.ontology.class ||
			ontology.instance !== entry.ontology.instance ||
			ontology.aspect !== entry.ontology.aspect
		) {
			throw new Error(`ontology mismatch: ${target}`);
		}
	}
}

export function validateCorpus({ entries = loadRegistry(), docs = inventory() } = {}) {
	validateEntries(entries);

	if (detectCorpusShape(entries, docs) === "legacy") {
		validateRegistryDeterminism(entries);

		for (const source of docs) {
			validateDocumentFile(source);
		}

		return;
	}

	validateMigratedCorpus(entries, docs);
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
