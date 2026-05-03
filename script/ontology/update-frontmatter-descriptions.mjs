import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { replaceFrontmatter, splitFrontmatter } from "./frontmatter.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(SCRIPT_DIR, "../..");
const DOCS_DIR = join(ROOT_DIR, "docs");

const TARGET_WORD_COUNT = 100;
const MIN_WORD_COUNT = 90;
const MAX_WORD_COUNT = 115;

const ASPECT_LABELS = new Map([
	["overview", "overview"],
	["install", "installation"],
	["config", "configuration"],
	["authentication", "authentication"],
	["authorization", "authorization"],
	["crd", "custom resource definitions"],
	["crds", "custom resource definitions"],
	["ha", "high availability"],
	["middleware", "middleware"],
]);

function walkMdxFiles(directory, files = []) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);

		if (entry.isDirectory()) {
			walkMdxFiles(path, files);
			continue;
		}

		if (entry.isFile() && path.endsWith(".mdx") && entry.name !== "AGENTS.md") {
			files.push(path);
		}
	}

	return files.sort();
}

function words(value) {
	return String(value ?? "").match(/[A-Za-z0-9][A-Za-z0-9'_-]*/g) ?? [];
}

function toTitle(value) {
	return String(value ?? "")
		.replace(/[-_/]+/g, " ")
		.replace(/\b\w/g, (match) => match.toUpperCase())
		.trim();
}

function sentenceCase(value) {
	const text = String(value ?? "").trim();

	if (!text) {
		return "";
	}

	return text.charAt(0).toUpperCase() + text.slice(1);
}

function plainTextFromBody(body) {
	return body
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/:::[\s\S]*?:::/g, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/\[[^\]]+\]\([^)]+\)/g, " ")
		.replace(/[#>*_`|{}[\]();:,]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function headingsFromBody(body) {
	return [...body.matchAll(/^#{2,4}\s+(.+)$/gm)]
		.map((match) => match[1].replace(/[`*_]/g, "").trim())
		.filter(Boolean)
		.slice(0, 6);
}

function cleanToken(value) {
	return String(value ?? "")
		.replace(/[`"'()[\]{}]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

function unique(values) {
	const seen = new Set();
	const result = [];

	for (const value of values) {
		const cleaned = cleanToken(value);
		const key = cleaned.toLowerCase();

		if (!cleaned || seen.has(key)) {
			continue;
		}

		seen.add(key);
		result.push(cleaned);
	}

	return result;
}

function joinList(values) {
	const items = unique(values).slice(0, 5);

	if (items.length === 0) {
		return "";
	}

	if (items.length === 1) {
		return items[0];
	}

	return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function normalizeKeywords(data, title, subjectName, pathParts) {
	const generic = new Set(["index", "overview"]);
	const source = [
		...(Array.isArray(data.keywords) ? data.keywords : []),
		subjectName,
		title,
		data.ontology?.instance,
		data.ontology?.aspect,
		...pathParts.filter((part) => !generic.has(part)),
	];

	return unique(source.map((value) => String(value ?? "").toLowerCase()))
		.filter((keyword) => !generic.has(keyword))
		.slice(0, 10);
}

function countWords(text) {
	return words(text).length;
}

function trimToMaxWords(text) {
	if (countWords(text) <= MAX_WORD_COUNT) {
		return text;
	}

	const sentences = text.match(/[^.]+[.]/g) ?? [text];
	const kept = [];

	for (const sentence of sentences) {
		const candidate = [...kept, sentence.trim()].join(" ");
		if (countWords(candidate) > MAX_WORD_COUNT) {
			break;
		}

		kept.push(sentence.trim());
	}

	if (kept.length > 0) {
		return kept.join(" ");
	}

	return text;
}

function buildDescription({ data, body, sourcePath }) {
	const pathParts = sourcePath
		.replace(/^docs\//, "")
		.replace(/\.mdx$/, "")
		.split("/")
		.filter(Boolean);
	const title = cleanToken(data.title) || toTitle(basename(sourcePath, ".mdx"));
	const subjectName = cleanToken(data.subject?.canonical_name) || title;
	const domain = cleanToken(data.ontology?.domain) || cleanToken(pathParts[0]) || "documentation";
	const role = cleanToken(data.ontology?.role) || "document";
	const className = cleanToken(data.ontology?.class) || "topic";
	const aspect = cleanToken(data.ontology?.aspect) || cleanToken(pathParts.at(-1)) || "overview";
	const aspectLabel = ASPECT_LABELS.get(aspect) ?? toTitle(aspect).toLowerCase();
	const headings = headingsFromBody(body);
	const headingSummary = joinList(headings);
	const keywords = normalizeKeywords(data, title, subjectName, pathParts);
	const keywordSummary = joinList(keywords.filter((keyword) => keyword !== subjectName.toLowerCase()));
	const route = pathParts.join(" / ");
	const classification = role === className ? `${role} page` : `${role} page for the ${className} class`;
	const article = /^[aeiou]/i.test(role) ? "an" : "a";

	const sentences = [
		`${title} documents ${aspectLabel} material for ${subjectName} in the ${domain} domain.`,
		`It is classified as ${article} ${classification}, so readers can understand its topic, scope, and place in the wiki taxonomy.`,
		headingSummary
			? `The page highlights ${headingSummary}, with examples, commands, diagrams, or references kept close to the relevant explanation.`
			: `The page provides focused notes, examples, commands, diagrams, or references when the source content provides them.`,
		keywordSummary
			? `Important search terms include ${keywordSummary}, helping both humans and generated indexes connect this page with adjacent concepts.`
			: `The description is written for readers and generated indexes that need a useful summary before opening the full page.`,
		`The route is ${route}, and the frontmatter keeps the canonical subject, ontology role, and navigation context aligned with repository validation.`,
		`Use it for quick orientation, implementation reminders, and deeper research.`,
	];

	let description = sentences.join(" ");

	if (countWords(description) < MIN_WORD_COUNT) {
		description += ` The frontmatter preserves the canonical subject, ontology role, and navigation context so validation, search, and graph exports can describe the document consistently.`;
	}

	if (countWords(description) < TARGET_WORD_COUNT) {
		description += ` Use it when you need a quick orientation, implementation reminder, or starting point for deeper research.`;
	}

	return trimToMaxWords(description);
}

function normalizeFrontmatter(data, body, sourcePath) {
	const next = { ...data };
	const filenameId = basename(sourcePath, ".mdx");
	const pathParts = sourcePath
		.replace(/^docs\//, "")
		.replace(/\.mdx$/, "")
		.split("/")
		.filter(Boolean);
	const title = cleanToken(next.title) || toTitle(filenameId);
	const subjectName = cleanToken(next.subject?.canonical_name) || title;

	next.id = filenameId;
	next.title = title;
	next.sidebar_label = cleanToken(next.sidebar_label) || title;
	next.description = buildDescription({ data: next, body, sourcePath });
	next.keywords = normalizeKeywords(next, title, subjectName, pathParts);

	if (next.subject && !Array.isArray(next.subject.aliases)) {
		next.subject = {
			...next.subject,
			aliases: [],
		};
	}

	return next;
}

let changed = 0;
let minWords = Number.POSITIVE_INFINITY;
let maxWords = 0;

for (const file of walkMdxFiles(DOCS_DIR)) {
	const content = readFileSync(file, "utf8");
	const { data, body, hasFrontmatter } = splitFrontmatter(content);
	const sourcePath = relative(ROOT_DIR, file);

	if (!hasFrontmatter) {
		throw new Error(`missing frontmatter: ${sourcePath}`);
	}

	const nextData = normalizeFrontmatter(data, body, sourcePath);
	const nextContent = replaceFrontmatter(content, nextData);
	const descriptionWords = countWords(nextData.description);

	minWords = Math.min(minWords, descriptionWords);
	maxWords = Math.max(maxWords, descriptionWords);

	if (nextContent !== content) {
		writeFileSync(file, nextContent);
		changed += 1;
	}
}

console.log(
	JSON.stringify(
		{
			changed,
			descriptionWordRange: {
				min: minWords,
				max: maxWords,
			},
		},
		null,
		2,
	),
);
