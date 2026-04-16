import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inventory } from "./inventory.mjs";
import { classifySeed } from "./pathing.mjs";

export const CLASSIFICATION_REGISTRY_PATH = resolve("ontology", "classification-registry.json");

export function bootstrapRegistry() {
	const entries = inventory().map((source) => classifySeed(source));

	return entries;
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
