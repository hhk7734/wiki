import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT_DIR } from "./constants.mjs";
import { buildWikiKnowledgeCore } from "./build-wiki-knowledge-core.mjs";
import { compareStrings, selectCanonicalSubjectDocument, toDocRoute } from "./wiki-knowledge-shared.mjs";

export const WIKI_AGENT_API_DIR = resolve(ROOT_DIR, "static", "api", "wiki");
export const WIKI_AGENT_QUERY_INDEX_PATH = resolve(WIKI_AGENT_API_DIR, "query-index.json");
export const WIKI_AGENT_GRAPH_PATH = resolve(WIKI_AGENT_API_DIR, "graph.json");
export const WIKI_AGENT_NODES_DIR = resolve(WIKI_AGENT_API_DIR, "nodes");

function makeNodeUrl(id) {
	return `/api/wiki/nodes/${id}.json`;
}

function buildDisplayTitle(record) {
	return record.title || record.canonical_name || record.ontology?.instance || record.id;
}

function buildDocumentPageUrl(document) {
	if (document.url) {
		return document.url;
	}

	if (document.source_path) {
		return `/${toDocRoute(document.source_path)}`;
	}

	return "";
}

function buildPageUrl(record, canonicalDocumentBySubjectId) {
	if (record.type === "document") {
		return buildDocumentPageUrl(record);
	}

	const canonicalDocument = canonicalDocumentBySubjectId.get(record.id);

	if (canonicalDocument) {
		return buildDocumentPageUrl(canonicalDocument);
	}

	return "";
}

function buildQueryRecord(record, canonicalDocumentBySubjectId) {
	return {
		id: record.id,
		type: record.type,
		score: 0,
		score_kind: "neutral",
		title: buildDisplayTitle(record),
		snippet: record.snippet ?? "",
		ontology: record.ontology,
		url: buildPageUrl(record, canonicalDocumentBySubjectId),
		node_url: makeNodeUrl(record.id),
	};
}

function buildGraphNode(record, canonicalDocumentBySubjectId) {
	return {
		id: record.id,
		type: record.type,
		title: buildDisplayTitle(record),
		snippet: record.snippet ?? "",
		ontology: record.ontology,
		url: buildPageUrl(record, canonicalDocumentBySubjectId),
		node_url: makeNodeUrl(record.id),
		...(record.type === "subject"
			? { document_refs: [...(record.document_refs ?? [])] }
			: { subject_ref: record.subject_ref }),
	};
}

function buildRelationLookup(relations, id) {
	return relations
		.filter((relation) => relation.from === id || relation.to === id)
		.map((relation) => ({
			id: relation.id ?? `relation:${relation.from}:${relation.predicate}:${relation.to}`,
			predicate: relation.predicate,
			other_id: relation.from === id ? relation.to : relation.from,
			direction: relation.from === id ? "outgoing" : "incoming",
		}));
}

function buildDocumentLookupPayload(document, subject, canonicalDocumentBySubjectId, relations) {
	return {
		type: "document",
		id: document.id,
		title: document.title,
		snippet: document.snippet,
		ontology: document.ontology,
		url: buildDocumentPageUrl(document),
		node_url: makeNodeUrl(document.id),
		subject: subject
			? {
					id: subject.id,
					title: subject.canonical_name,
					ontology: subject.ontology,
					url: buildPageUrl(subject, canonicalDocumentBySubjectId),
			  }
			: null,
		relations,
	};
}

function buildSubjectLookupPayload(subject, documents, canonicalDocumentBySubjectId, relations) {
	return {
		type: "subject",
		id: subject.id,
		title: subject.canonical_name,
		snippet: subject.snippet,
		ontology: subject.ontology,
		url: buildPageUrl(subject, canonicalDocumentBySubjectId),
		node_url: makeNodeUrl(subject.id),
		document_refs: [...(subject.document_refs ?? [])],
		documents: documents.map((document) => ({
			id: document.id,
			title: document.title,
			url: buildDocumentPageUrl(document),
			snippet: document.snippet,
			ontology: document.ontology,
		})),
		relations,
	};
}

export function buildWikiAgentArtifacts(core = buildWikiKnowledgeCore()) {
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

	const queryIndex = {
		subjects: core.subjects.map((subject) => buildQueryRecord(subject, canonicalDocumentBySubjectId)),
		documents: core.documents.map((document) => buildQueryRecord(document, canonicalDocumentBySubjectId)),
	};

	const graph = {
		nodes: [...core.subjects.map((subject) => buildGraphNode(subject, canonicalDocumentBySubjectId)), ...core.documents.map((document) => buildGraphNode(document, canonicalDocumentBySubjectId))].sort((left, right) =>
			compareStrings(left.id, right.id),
		),
		edges: core.relations.map((relation) => ({ ...relation })),
	};

	const nodes = {};

	for (const subject of core.subjects) {
		const documents = documentsBySubject.get(subject.id) ?? [];
		nodes[subject.id] = buildSubjectLookupPayload(
			subject,
			documents,
			canonicalDocumentBySubjectId,
			buildRelationLookup(core.relations, subject.id),
		);
	}

	for (const document of core.documents) {
		nodes[document.id] = buildDocumentLookupPayload(
			document,
			subjectById.get(document.subject_ref),
			canonicalDocumentBySubjectId,
			buildRelationLookup(core.relations, document.id),
		);
	}

	return { queryIndex, graph, nodes };
}

function writeJsonFile(path, value) {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function writeWikiAgentArtifacts(outputDir = WIKI_AGENT_API_DIR, core = buildWikiKnowledgeCore()) {
	const artifacts = buildWikiAgentArtifacts(core);

	rmSync(outputDir, { recursive: true, force: true });
	writeJsonFile(resolve(outputDir, "query-index.json"), artifacts.queryIndex);
	writeJsonFile(resolve(outputDir, "graph.json"), artifacts.graph);

	mkdirSync(resolve(outputDir, "nodes"), { recursive: true });
	for (const [id, payload] of Object.entries(artifacts.nodes)) {
		writeJsonFile(resolve(outputDir, "nodes", `${id}.json`), payload);
	}

	return {
		outputDir,
		queryIndexPath: resolve(outputDir, "query-index.json"),
		graphPath: resolve(outputDir, "graph.json"),
		nodeCount: Object.keys(artifacts.nodes).length,
	};
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
	const result = writeWikiAgentArtifacts();
	console.log(`Wrote wiki agent artifacts to ${result.outputDir} (${result.nodeCount} nodes)`);
}
