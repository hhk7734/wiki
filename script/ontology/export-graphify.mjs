import { basename, dirname, resolve } from "node:path";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ROOT_DIR } from "./constants.mjs";
import { inventory } from "./inventory.mjs";
import { splitFrontmatter } from "./frontmatter.mjs";
import { CLASSIFICATION_REGISTRY_PATH } from "./bootstrap-registry.mjs";
import { loadRegistry as loadValidatedRegistry } from "./validate.mjs";

export const GRAPHIFY_EXPORT_PATH = resolve(ROOT_DIR, "ontology", "graphify-export.jsonl");

function loadRegistry() {
	return loadValidatedRegistry(CLASSIFICATION_REGISTRY_PATH);
}

function makeSubjectId(ontology) {
	return `subject:${ontology.domain}:${ontology.class}:${ontology.instance}`;
}

function makeDocumentId(sourcePath) {
	return `doc:${sourcePath}`;
}

function extractHeadings(body) {
	return body
		.split(/\r?\n/)
		.map((line) => line.match(/^#{1,6}\s+(.+)$/)?.[1]?.trim())
		.filter(Boolean);
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

function buildDocumentRecord(sourcePath, entry) {
	const content = readFileSync(resolve(ROOT_DIR, sourcePath), "utf8");
	const { data, body } = splitFrontmatter(content);
	const headings = extractHeadings(body);
	const text = normalizeMdxText(body);
	const ontology = entry.ontology;
	const aliases = Array.isArray(data.subject?.aliases) ? data.subject.aliases : [];

	return {
		type: "document",
		id: makeDocumentId(sourcePath),
		source_path: sourcePath,
		url: `/${toDocRoute(sourcePath)}`,
		title: data.title ?? "",
		description: data.description ?? "",
		keywords: Array.isArray(data.keywords) ? data.keywords : [],
		ontology,
		subject_ref: makeSubjectId(ontology),
		headings,
		aliases,
		text,
		relations: data.relations ?? {},
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
	};
}

function buildRelationRecord(document) {
	return {
		type: "relation",
		from: document.id,
		predicate: "about_subject",
		to: document.subject_ref,
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

	for (const document of documents) {
		if (!documentsBySubject.has(document.subject_ref)) {
			documentsBySubject.set(document.subject_ref, []);
		}

		documentsBySubject.get(document.subject_ref).push(document);
	}

	const subjects = [...documentsBySubject.entries()].map(([subjectId, docs]) =>
		buildSubjectRecord(subjectId, docs[0].ontology, docs[0], docs.map((doc) => doc.id).sort()),
	);
	const relations = documents.map((document) => buildRelationRecord(document));

	return [...documents, ...subjects, ...relations];
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
