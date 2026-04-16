import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT_DIR } from "./constants.mjs";
import { inventory } from "./inventory.mjs";
import { buildTargetPath, classifySeed } from "./pathing.mjs";

export const CLASSIFICATION_REGISTRY_PATH = resolve(ROOT_DIR, "ontology", "classification-registry.json");

function sourceSlug(source) {
	return source
		.replaceAll("\\", "/")
		.replace(/^docs\//, "")
		.replace(/\.mdx$/, "")
		.replaceAll("/", "-");
}

function buildDisambiguatedEntry(entry) {
	const disambiguator = sourceSlug(entry.source);
	const aspectBase = entry.ontology.aspect.split("--")[0];
	const aspect = `${aspectBase}--${disambiguator}`;

	return {
		...entry,
		target: buildTargetPath({
			role: entry.ontology.role,
			domain: entry.ontology.domain,
			className: entry.ontology.class,
			instance: entry.ontology.instance,
			aspect,
		}),
		ontology: {
			...entry.ontology,
			aspect,
		},
	};
}

export function stabilizeTargets(entries) {
	const counts = new Map();

	for (const entry of entries) {
		counts.set(entry.target, (counts.get(entry.target) ?? 0) + 1);
	}

	return entries.map((entry) => {
		if ((counts.get(entry.target) ?? 0) < 2) {
			return entry;
		}

		return buildDisambiguatedEntry(entry);
	});
}

export function bootstrapRegistry() {
	return stabilizeTargets(inventory().map((source) => classifySeed(source)));
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
