import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");

export const ROOT_DIR = repoRoot;
export const DOCS_DIR = resolve(repoRoot, "docs");
export const ONTOLOGY_VOCABULARY_PATH = resolve(repoRoot, "ontology", "vocabulary.json");

export function loadOntologyVocabulary() {
	return JSON.parse(readFileSync(ONTOLOGY_VOCABULARY_PATH, "utf8"));
}
