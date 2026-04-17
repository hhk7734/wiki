import { readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { ROOT_DIR } from "./constants.mjs";
import { splitFrontmatter } from "./frontmatter.mjs";

export function trimExtension(pathname) {
	return pathname.replace(/\.mdx$/, "");
}

export function toDocRoute(pathname) {
	const withoutExtension = trimExtension(pathname);
	const stem = basename(withoutExtension);
	const parent = basename(dirname(withoutExtension));

	if (stem === parent) {
		return dirname(withoutExtension);
	}

	return withoutExtension;
}

export function normalizeWhitespace(value) {
	return value.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function normalizeMdxText(body) {
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

export function extractHeadings(body) {
	return body
		.split(/\r?\n/)
		.map((line) => line.match(/^#{1,6}\s+(.+)$/)?.[1]?.trim())
		.filter(Boolean);
}

export function makeDocumentId(sourcePath) {
	return `doc:${sourcePath}`;
}

export function makeSubjectId(ontology) {
	return `subject:${ontology.domain}:${ontology.class}:${ontology.instance}`;
}

export function makeRelationId(documentId, predicate, targetId) {
	return `relation:${documentId}:${predicate}:${targetId}`;
}

function roleRank(role = "") {
	return (
		{
			entity: 0,
			concept: 1,
			specification: 2,
			operation: 3,
			troubleshooting: 4,
			comparison: 5,
		}[role] ?? 99
	);
}

function aspectRank(aspect = "") {
	return aspect === "overview" ? 0 : 1;
}

export function compareDocuments(left, right) {
	return (
		aspectRank(left.ontology?.aspect) - aspectRank(right.ontology?.aspect) ||
		roleRank(left.ontology?.role) - roleRank(right.ontology?.role) ||
		(left.source_path ?? left.id).localeCompare(right.source_path ?? right.id) ||
		left.id.localeCompare(right.id)
	);
}

export function sortDocumentsByStableOrder(documents) {
	return [...documents].sort(compareDocuments);
}

function uniqueSorted(values) {
	return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function canonicalAspectRank(aspect = "") {
	return aspect === "overview" ? 0 : 1;
}

function canonicalRoleRank(role = "") {
	return (
		{
			entity: 0,
			concept: 1,
			specification: 2,
			operation: 3,
			troubleshooting: 4,
			comparison: 5,
		}[role] ?? 99
	);
}

export function selectCanonicalSubjectDocument(documents) {
	if (documents.length === 0) {
		throw new Error("cannot select canonical subject document from an empty set");
	}

	return [...documents].sort((left, right) =>
		canonicalAspectRank(left.ontology?.aspect) - canonicalAspectRank(right.ontology?.aspect) ||
		canonicalRoleRank(left.ontology?.role) - canonicalRoleRank(right.ontology?.role) ||
		(left.title ?? "").localeCompare(right.title ?? "") ||
		(left.source_path ?? left.id).localeCompare(right.source_path ?? right.id) ||
		left.id.localeCompare(right.id),
	)[0];
}

export function summarizeText(text, { title = "", keywords = [], ontology = {} } = {}) {
	const lowerText = text.toLowerCase();
	const terms = [
		ontology.aspect,
		ontology.instance,
		...keywords,
		...title.split(/\s+/),
	]
		.map((term) => term?.toString().trim())
		.filter(Boolean)
		.sort((left, right) => right.length - left.length || left.localeCompare(right));

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

export function buildDocumentSnapshot(sourcePath, ontology, filePath = resolve(ROOT_DIR, sourcePath)) {
	const content = readFileSync(filePath, "utf8");
	const { data, body } = splitFrontmatter(content);
	const keywords = Array.isArray(data.keywords) ? data.keywords : [];
	const aliases = Array.isArray(data.subject?.aliases) ? data.subject.aliases : [];
	const text = normalizeMdxText(body);

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
		snippet: summarizeText(text, {
			title: data.title ?? "",
			keywords,
			ontology,
		}),
	};
}

export function buildCanonicalSubjectSnapshot(subjectId, documents, canonicalDocument = selectCanonicalSubjectDocument(documents)) {
	const sortedDocuments = sortDocumentsByStableOrder(documents);
	const primaryDocument = canonicalDocument;
	const ontology = primaryDocument.ontology ?? {};

	return {
		type: "subject",
		id: subjectId,
		canonical_name: primaryDocument.title || ontology.instance,
		ontology: {
			domain: ontology.domain,
			class: ontology.class,
			instance: ontology.instance,
		},
		aliases: uniqueSorted(sortedDocuments.flatMap((document) => document.aliases ?? [])),
		document_refs: sortedDocuments.map((document) => document.id),
		snippet: primaryDocument.snippet,
	};
}
