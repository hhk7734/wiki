import { dirname, resolve } from "node:path";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ROOT_DIR } from "./constants.mjs";
import { inventory } from "./inventory.mjs";
import { splitFrontmatter } from "./frontmatter.mjs";
import { CLASSIFICATION_REGISTRY_PATH } from "./bootstrap-registry.mjs";
import { loadRegistry as loadValidatedRegistry } from "./validate.mjs";
import { buildCanonicalSubjectSnapshot, buildDocumentSnapshot, makeRelationId, sortDocumentsByStableOrder } from "./wiki-knowledge-shared.mjs";

export const GRAPHIFY_EXPORT_PATH = resolve(ROOT_DIR, "ontology", "graphify-export.jsonl");

function loadRegistry() {
	return loadValidatedRegistry(CLASSIFICATION_REGISTRY_PATH);
}

function buildDocumentRecord(sourcePath, entry) {
	const snapshot = buildDocumentSnapshot(sourcePath, entry.ontology);
	const content = readFileSync(resolve(ROOT_DIR, sourcePath), "utf8");
	const { data } = splitFrontmatter(content);

	return {
		...snapshot,
		relations: data.relations ?? {},
	};
}

function buildRelationRecord(document) {
	return {
		type: "relation",
		id: makeRelationId(document.id, "about_subject", document.subject_ref),
		from: document.id,
		predicate: "about_subject",
		to: document.subject_ref,
		snippet: document.snippet,
	};
}

export function buildGraphifyExport(selectedSources = inventory()) {
	const registry = loadRegistry();
	const entryBySource = new Map(registry.map((entry) => [entry.source, entry]));
	const documents = [];

	for (const sourcePath of selectedSources) {
		const entry = entryBySource.get(sourcePath);

		if (!entry) {
			throw new Error(`missing classification entry for ${sourcePath}`);
		}

		documents.push(buildDocumentRecord(sourcePath, entry));
	}

	const documentsBySubject = new Map();

	const orderedDocuments = sortDocumentsByStableOrder(documents);

	for (const document of orderedDocuments) {
		if (!documentsBySubject.has(document.subject_ref)) {
			documentsBySubject.set(document.subject_ref, []);
		}

		documentsBySubject.get(document.subject_ref).push(document);
	}

	const subjects = [...documentsBySubject.entries()]
		.map(([subjectId, docs]) => buildCanonicalSubjectSnapshot(subjectId, docs))
		.sort((left, right) => left.id.localeCompare(right.id));
	const relations = orderedDocuments.map((document) => buildRelationRecord(document));

	return [...orderedDocuments, ...subjects, ...relations];
}

export function serializeGraphifyJsonl(records) {
	return `${records.map((record) => JSON.stringify(record)).join("\n")}\n`;
}

export function writeGraphifyExport(outputPath = GRAPHIFY_EXPORT_PATH, selectedSources = inventory()) {
	const records = buildGraphifyExport(selectedSources);
	mkdirSync(dirname(outputPath), { recursive: true });
	writeFileSync(outputPath, serializeGraphifyJsonl(records));
	return { outputPath, recordCount: records.length };
}

function parseArgs(argv) {
	const args = [...argv];
	let outputPath = GRAPHIFY_EXPORT_PATH;

	for (let index = 0; index < args.length; index += 1) {
		if (args[index] === "--out" && args[index + 1]) {
			outputPath = resolve(ROOT_DIR, args[index + 1]);
			index += 1;
		}
	}

	return { outputPath };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
	const { outputPath } = parseArgs(process.argv.slice(2));
	const result = writeGraphifyExport(outputPath);
	console.log(`Wrote ${result.recordCount} graphify records to ${result.outputPath}`);
}
