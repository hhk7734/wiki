import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CLASSIFICATION_REGISTRY_PATH, bootstrapRegistry } from "./bootstrap-registry.mjs";
import { ROOT_DIR } from "./constants.mjs";
import { inventory } from "./inventory.mjs";
import { parseFrontmatter } from "./frontmatter.mjs";

export function validateSourcePath(legacyPath) {
	if (legacyPath.includes("/etc/")) {
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

export function validateRegistryDeterminism(entries, expectedEntries = bootstrapRegistry()) {
	const actual = JSON.stringify(entries);
	const expected = JSON.stringify(expectedEntries);

	if (actual !== expected) {
		throw new Error("classification registry is out of date");
	}
}

export function validateDocumentFile(source) {
	const absolutePath = resolve(ROOT_DIR, source);
	const frontmatter = parseFrontmatter(readFileSync(absolutePath, "utf8"));

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
