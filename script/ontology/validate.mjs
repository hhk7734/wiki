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
		validateSourcePath(entry.source);

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

export function validateCorpus({ entries = loadRegistry(), docs = inventory() } = {}) {
	validateEntries(entries);
	validateRegistryDeterminism(entries);

	for (const source of docs) {
		validateDocumentFile(source);
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
