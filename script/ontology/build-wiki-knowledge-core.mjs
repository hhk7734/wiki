import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CLASSIFICATION_REGISTRY_PATH } from "./bootstrap-registry.mjs";
import { inventory } from "./inventory.mjs";
import { parseTaxonomyPath } from "./taxonomy-paths.mjs";
import { buildCanonicalSubjectSnapshot, buildDocumentSnapshot, compareStrings, makeRelationId, selectCanonicalSubjectDocument, sortDocumentsByStableOrder } from "./wiki-knowledge-shared.mjs";
import { loadRegistry as loadValidatedRegistry, validateDocumentFile } from "./validate.mjs";

function loadRegistry() {
	return loadValidatedRegistry(CLASSIFICATION_REGISTRY_PATH);
}

function buildTaxonomyInfo(sourcePath) {
	try {
		return parseTaxonomyPath(sourcePath);
	} catch {
		return null;
	}
}

function buildDocumentRecord(sourcePath, entry) {
	const frontmatter = validateDocumentFile(sourcePath);

	return {
		...buildDocumentSnapshot(sourcePath, entry.ontology, {
		taxonomy: buildTaxonomyInfo(sourcePath),
		}),
		semantic_relations: frontmatter?.relations ?? {},
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

function normalizeRelationTargets(value) {
	if (Array.isArray(value)) {
		return value
			.map((item) => item?.toString().trim())
			.filter(Boolean);
	}

	if (typeof value !== "string") {
		return [];
	}

	const trimmed = value.trim();

	if (!trimmed || trimmed === "[]") {
		return [];
	}

	if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
		return trimmed
			.slice(1, -1)
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
	}

	return [trimmed];
}

function buildSubjectSemanticRelations(documents, subjects) {
	const subjectIds = new Set(subjects.map((subject) => subject.id));
	const byDomainAndInstance = new Map(
		subjects.map((subject) => [`${subject.ontology.domain}:${subject.ontology.instance}`, subject.id]),
	);
	const byInstance = new Map();

	for (const subject of subjects) {
		const instance = subject.ontology.instance;
		const ids = byInstance.get(instance) ?? [];
		ids.push(subject.id);
		byInstance.set(instance, ids);
	}

	const semanticRelations = [];
	const seen = new Set();

	for (const document of documents) {
		const from = document.subject_ref;
		const domain = document.ontology?.domain;
		const relationEntries = Object.entries(document.semantic_relations ?? {});

		for (const [predicate, rawTargets] of relationEntries) {
			if (predicate === "about_subject") {
				continue;
			}

			for (const targetInstance of normalizeRelationTargets(rawTargets)) {
				const preferred = byDomainAndInstance.get(`${domain}:${targetInstance}`);
				const fallbackIds = byInstance.get(targetInstance) ?? [];
				const to = preferred ?? (fallbackIds.length === 1 ? fallbackIds[0] : null);

				if (!to || !subjectIds.has(from) || !subjectIds.has(to)) {
					continue;
				}

				const id = makeRelationId(from, predicate, to);

				if (seen.has(id)) {
					continue;
				}

				seen.add(id);
				semanticRelations.push({
					type: "relation",
					id,
					from,
					predicate,
					to,
					snippet: document.snippet,
				});
			}
		}
	}

	return semanticRelations.sort((left, right) => compareStrings(left.id, right.id));
}

export function buildWikiKnowledgeCore(selectedSources = inventory(), { registry = loadRegistry() } = {}) {
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
	const relations = [
		...orderedDocuments.map((document) => buildRelationRecord(document)),
		...buildSubjectSemanticRelations(orderedDocuments, subjects),
	];

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
