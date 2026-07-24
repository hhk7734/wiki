import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");

export const ROOT_DIR = repoRoot;
export const DOCS_DIR = resolve(repoRoot, "docs");
export const ONTOLOGY_VOCABULARY_PATH = resolve(repoRoot, "ontology", "vocabulary.json");

function requireUniqueStringArray(value, field) {
	if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== "string" || !item.trim())) {
		throw new Error(`${field} must be a non-empty string array`);
	}

	if (new Set(value).size !== value.length) {
		throw new Error(`${field} must contain unique values`);
	}

	return Object.freeze([...value]);
}

export function loadOntologyVocabulary(vocabularyPath = ONTOLOGY_VOCABULARY_PATH) {
	const vocabulary = JSON.parse(readFileSync(vocabularyPath, "utf8"));

	return Object.freeze({
		roles: requireUniqueStringArray(vocabulary.roles, "roles"),
		domains: requireUniqueStringArray(vocabulary.domains, "domains"),
	});
}

export const ONTOLOGY_VOCABULARY = loadOntologyVocabulary();

const ONTOLOGY_ROLE_SET = new Set(ONTOLOGY_VOCABULARY.roles);
const ONTOLOGY_DOMAIN_SET = new Set(ONTOLOGY_VOCABULARY.domains);

export function isOntologyRole(value) {
	return ONTOLOGY_ROLE_SET.has(value);
}

export function isOntologyDomain(value) {
	return ONTOLOGY_DOMAIN_SET.has(value);
}
