import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT_DIR } from "./constants.mjs";
import { buildWikiKnowledgeCore } from "./build-wiki-knowledge-core.mjs";
import { compareStrings, selectCanonicalSubjectDocument, toDocRoute } from "./wiki-knowledge-shared.mjs";

export const WIKI_HUMAN_SEARCH_INDEX_PATH = resolve(ROOT_DIR, "static", "wiki-search-index.json");

function normalizeText(value) {
	return (value ?? "").toLowerCase().replace(/[^\p{L}\p{N}\s/-]+/gu, " ").replace(/\s+/g, " ").trim();
}

function buildDocumentUrl(document) {
	if (document.url) {
		return document.url;
	}

	if (document.source_path) {
		return `/${toDocRoute(document.source_path)}`;
	}

	return "";
}

function buildSubjectUrl(subject, canonicalDocumentBySubjectId) {
	const canonicalDocument = canonicalDocumentBySubjectId.get(subject.id);

	if (canonicalDocument) {
		return buildDocumentUrl(canonicalDocument);
	}

	return "";
}

function buildDocumentSearchText(document) {
	return normalizeText(
		[
			document.title,
			document.description,
			document.snippet,
			...(document.headings ?? []),
			...(document.keywords ?? []),
			document.ontology?.role,
			document.ontology?.domain,
			document.ontology?.class,
			document.ontology?.instance,
			document.ontology?.aspect,
		]
			.filter(Boolean)
			.join(" "),
	);
}

function buildSubjectSearchText(subject, documents) {
	return normalizeText(
		[
			subject.canonical_name,
			subject.snippet,
			...(subject.aliases ?? []),
			...(documents.map((document) => document.title)),
			...(documents.flatMap((document) => document.headings ?? [])),
			subject.ontology?.domain,
			subject.ontology?.class,
			subject.ontology?.instance,
		]
			.filter(Boolean)
			.join(" "),
	);
}

function buildSubjectRecord(subject, documents, canonicalDocumentBySubjectId) {
	return {
		type: "subject",
		id: subject.id,
		title: subject.canonical_name,
		description: subject.snippet ?? "",
		snippet: subject.snippet ?? "",
		url: buildSubjectUrl(subject, canonicalDocumentBySubjectId),
		document_refs: [...(subject.document_refs ?? [])],
		ontology: subject.ontology,
		search_text: buildSubjectSearchText(subject, documents),
		display: {
			label: subject.canonical_name,
			kind: "subject",
			document_count: subject.document_refs?.length ?? documents.length,
		},
	};
}

function buildDocumentRecord(document, subject) {
	return {
		type: "document",
		id: document.id,
		title: document.title,
		description: document.description ?? "",
		snippet: document.snippet ?? "",
		headings: [...(document.headings ?? [])],
		keywords: [...(document.keywords ?? [])],
		url: buildDocumentUrl(document),
		subject_ref: document.subject_ref,
		subject_title: subject?.canonical_name ?? "",
		ontology: document.ontology,
		search_text: buildDocumentSearchText(document),
		display: {
			label: document.title,
			kind: "document",
			subtitle: subject?.canonical_name ?? "",
		},
	};
}

export function buildWikiHumanSearchIndex(core = buildWikiKnowledgeCore()) {
	const subjectById = new Map(core.subjects.map((subject) => [subject.id, subject]));
	const documentsBySubject = new Map();

	for (const document of core.documents) {
		const subjectDocuments = documentsBySubject.get(document.subject_ref) ?? [];
		subjectDocuments.push(document);
		documentsBySubject.set(document.subject_ref, subjectDocuments);
	}

	const canonicalDocumentBySubjectId = new Map();
	for (const [subjectId, documents] of documentsBySubject.entries()) {
		canonicalDocumentBySubjectId.set(subjectId, selectCanonicalSubjectDocument(documents));
	}

	const subjects = [...core.subjects]
		.map((subject) => buildSubjectRecord(subject, documentsBySubject.get(subject.id) ?? [], canonicalDocumentBySubjectId))
		.sort((left, right) => compareStrings(left.title, right.title) || compareStrings(left.id, right.id));

	const documents = [...core.documents]
		.map((document) => buildDocumentRecord(document, subjectById.get(document.subject_ref)))
		.sort((left, right) => compareStrings(left.title, right.title) || compareStrings(left.id, right.id));

	return { subjects, documents };
}

function writeJsonFile(path, value) {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function writeWikiHumanSearchIndex(outputPath = WIKI_HUMAN_SEARCH_INDEX_PATH, core = buildWikiKnowledgeCore()) {
	const index = buildWikiHumanSearchIndex(core);
	writeJsonFile(outputPath, index);
	return {
		outputPath,
		subjectCount: index.subjects.length,
		documentCount: index.documents.length,
	};
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
	const result = writeWikiHumanSearchIndex();
	console.log(`Wrote wiki human search index to ${result.outputPath} (${result.subjectCount} subjects, ${result.documentCount} documents)`);
}
