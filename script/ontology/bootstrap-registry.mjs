import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT_DIR } from "./constants.mjs";
import { inventory } from "./inventory.mjs";
import { classifySeed } from "./pathing.mjs";

export const CLASSIFICATION_REGISTRY_PATH = resolve(ROOT_DIR, "ontology", "classification-registry.json");

function sourceSlug(source) {
	return source
		.replaceAll("\\", "/")
		.replace(/^docs\//, "")
		.replace(/\.mdx$/, "")
		.replaceAll("/", "-");
}

function uniqueTargets(entries) {
	const seen = new Set();

	return entries.map((entry) => {
		if (!seen.has(entry.target)) {
			seen.add(entry.target);
			return entry;
		}

		const disambiguator = sourceSlug(entry.source);
		const aspect = `${entry.ontology.aspect}--${disambiguator}`;
		const target = resolveUniqueTarget(entry, aspect);

		if (seen.has(target)) {
			throw new Error(`Unable to disambiguate duplicate target for ${entry.source}`);
		}

		seen.add(target);

		return {
			...entry,
			target,
			ontology: {
				...entry.ontology,
				aspect,
			},
		};
	});
}

function resolveUniqueTarget(entry, aspect) {
	return `docs/${entry.ontology.role}/${entry.ontology.domain}/${entry.ontology.class}/${entry.ontology.instance}/${aspect}.mdx`;
}

export function bootstrapRegistry() {
	return uniqueTargets(inventory().map((source) => classifySeed(source)));
}

export function writeClassificationRegistry(entries = bootstrapRegistry()) {
	mkdirSync(dirname(CLASSIFICATION_REGISTRY_PATH), { recursive: true });
	writeFileSync(CLASSIFICATION_REGISTRY_PATH, `${JSON.stringify(entries, null, 2)}\n`);
	return CLASSIFICATION_REGISTRY_PATH;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
	const entries = bootstrapRegistry();
	writeClassificationRegistry(entries);
	console.log(`Wrote ${entries.length} classification entries to ${CLASSIFICATION_REGISTRY_PATH}`);
}
