import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CLASSIFICATION_REGISTRY_PATH } from "./bootstrap-registry.mjs";
import { inventory } from "./inventory.mjs";
import { buildCanonicalSubjectSnapshot, buildDocumentSnapshot, compareStrings, makeRelationId, selectCanonicalSubjectDocument, sortDocumentsByStableOrder } from "./wiki-knowledge-shared.mjs";
import { loadRegistry as loadValidatedRegistry, validateDocumentFile } from "./validate.mjs";

function loadRegistry() {
	return loadValidatedRegistry(CLASSIFICATION_REGISTRY_PATH);
}

function buildDocumentRecord(sourcePath, entry) {
	validateDocumentFile(sourcePath);

	return buildDocumentSnapshot(sourcePath, entry.ontology);
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

export function buildWikiKnowledgeCore(selectedSources = inventory()) {
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

	const orderedDocuments = sortDocumentsByStableOrder(documents);
	const subjectsById = new Map();

	for (const document of orderedDocuments) {
		const subjectId = document.subject_ref;
		if (!subjectsById.has(subjectId)) {
			subjectsById.set(subjectId, []);
		}

		subjectsById.get(subjectId).push(document);
	}

	const subjects = [...subjectsById.entries()]
		.map(([subjectId, docs]) => buildCanonicalSubjectSnapshot(subjectId, docs, selectCanonicalSubjectDocument(docs)))
		.sort((left, right) => compareStrings(left.id, right.id));
	const relations = orderedDocuments.map((document) => buildRelationRecord(document));

	return { documents: orderedDocuments, subjects, relations };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
	const core = buildWikiKnowledgeCore();
	console.log(
		JSON.stringify(
			{
				documents: core.documents.length,
				subjects: core.subjects.length,
				relations: core.relations.length,
			},
			null,
			2,
		),
	);
}
