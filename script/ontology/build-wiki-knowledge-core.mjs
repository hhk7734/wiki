import { readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CLASSIFICATION_REGISTRY_PATH } from "./bootstrap-registry.mjs";
import { ROOT_DIR } from "./constants.mjs";
import { inventory } from "./inventory.mjs";
import { splitFrontmatter } from "./frontmatter.mjs";
import { loadRegistry as loadValidatedRegistry, validateDocumentFile } from "./validate.mjs";

function loadRegistry() {
	return loadValidatedRegistry(CLASSIFICATION_REGISTRY_PATH);
}

function trimExtension(pathname) {
	return pathname.replace(/\.mdx$/, "");
}

function toDocRoute(pathname) {
	const withoutExtension = trimExtension(pathname);
	const stem = basename(withoutExtension);
	const parent = basename(dirname(withoutExtension));

	if (stem === parent) {
		return dirname(withoutExtension);
	}

	return withoutExtension;
}

function normalizeWhitespace(value) {
	return value.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeMdxText(body) {
	return normalizeWhitespace(
		body
			.replace(/^import\s.+$/gm, "")
			.replace(/^export\s.+$/gm, "")
			.replace(/^:::+.*$/gm, "")
			.replace(/<\/?Tabs[^>]*>/g, "")
			.replace(/<\/?TabItem[^>]*>/g, "")
			.replace(/<\/?[A-Z][A-Za-z0-9._-]*[^>]*>/g, "")
			.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
			.replace(/`([^`]+)`/g, "$1")
			.replace(/^\s*```[^\n]*$/gm, "")
			.replace(/^\s*---\s*$/gm, "")
			.replace(/^\s*>\s?/gm, "")
			.replace(/<[^>]+>/g, "")
			.replace(/[ \t]+\n/g, "\n"),
	);
}

function extractHeadings(body) {
	return body
		.split(/\r?\n/)
		.map((line) => line.match(/^#{1,6}\s+(.+)$/)?.[1]?.trim())
		.filter(Boolean);
}

function makeDocumentId(sourcePath) {
	return `doc:${sourcePath}`;
}

function makeSubjectId(ontology) {
	return `subject:${ontology.domain}:${ontology.class}:${ontology.instance}`;
}

function makeRelationId(documentId, predicate, targetId) {
	return `relation:${documentId}:${predicate}:${targetId}`;
}

function summarizeText(text, { title = "", keywords = [], ontology = {} } = {}) {
	const lowerText = text.toLowerCase();
	const terms = [
		ontology.aspect,
		ontology.instance,
		...keywords,
		...title.split(/\s+/),
	]
		.map((term) => term?.toString().trim())
		.filter(Boolean);

	for (const term of terms) {
		const index = lowerText.indexOf(term.toLowerCase());

		if (index === -1) {
			continue;
		}

		const radius = 80;
		const start = Math.max(0, index - radius);
		const end = Math.min(text.length, index + term.length + radius);
		const prefix = start > 0 ? "…" : "";
		const suffix = end < text.length ? "…" : "";

		return normalizeWhitespace(`${prefix}${text.slice(start, end)}${suffix}`);
	}

	return normalizeWhitespace(text.slice(0, 160));
}

function buildDocumentRecord(sourcePath, entry) {
	validateDocumentFile(sourcePath);

	const absolutePath = resolve(ROOT_DIR, sourcePath);
	const content = readFileSync(absolutePath, "utf8");
	const { data, body } = splitFrontmatter(content);
	const ontology = entry.ontology;
	const keywords = Array.isArray(data.keywords) ? data.keywords : [];
	const text = normalizeMdxText(body);
	const snippet = summarizeText(text, {
		title: data.title ?? "",
		keywords,
		ontology,
	});
	const aliases = Array.isArray(data.subject?.aliases) ? data.subject.aliases : [];

	return {
		type: "document",
		id: makeDocumentId(sourcePath),
		source_path: sourcePath,
		url: `/${toDocRoute(sourcePath)}`,
		title: data.title ?? "",
		description: data.description ?? "",
		keywords,
		ontology,
		subject_ref: makeSubjectId(ontology),
		headings: extractHeadings(body),
		aliases,
		text,
		snippet,
	};
}

function buildSubjectRecord(subjectId, ontology, document, documentRefs) {
	return {
		type: "subject",
		id: subjectId,
		canonical_name: document.title || ontology.instance,
		ontology: {
			domain: ontology.domain,
			class: ontology.class,
			instance: ontology.instance,
		},
		aliases: document.aliases,
		document_refs: documentRefs,
		snippet: document.snippet,
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

	const subjectsById = new Map();

	for (const document of documents) {
		const subjectId = document.subject_ref;
		const current = subjectsById.get(subjectId);

		if (current) {
			current.document_refs.push(document.id);
			continue;
		}

		subjectsById.set(subjectId, buildSubjectRecord(subjectId, document.ontology, document, [document.id]));
	}

	const subjects = [...subjectsById.values()]
		.map((subject) => ({
			...subject,
			document_refs: [...subject.document_refs].sort(),
		}))
		.sort((left, right) => left.id.localeCompare(right.id));
	const relations = documents.map((document) => buildRelationRecord(document));

	return { documents, subjects, relations };
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
