import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT_DIR } from "./constants.mjs";
import { buildGraphifyExport } from "./export-graphify.mjs";

export const GRAPHIFY_SEARCH_INDEX_PATH = resolve(ROOT_DIR, "static", "graphify-search-index.json");

const KOREAN_PARTICLE_SUFFIXES = [
	"으로",
	"에서",
	"에게",
	"까지",
	"부터",
	"보다",
	"처럼",
	"하고",
	"은",
	"는",
	"이",
	"가",
	"을",
	"를",
	"의",
	"에",
	"와",
	"과",
	"도",
	"만",
	"법",
];

function normalizeText(value) {
	return value.toLowerCase().replace(/[^\p{L}\p{N}\s/-]+/gu, " ").replace(/\s+/g, " ").trim();
}

function stripKoreanParticle(token) {
	for (const suffix of KOREAN_PARTICLE_SUFFIXES) {
		if (token.length > suffix.length + 1 && token.endsWith(suffix)) {
			return token.slice(0, -suffix.length);
		}
	}

	return token;
}

function tokenize(value) {
	return [...new Set(normalizeText(value).split(" ").map(stripKoreanParticle).filter(Boolean))];
}

function buildSearchText(document) {
	return normalizeText(
		[
			document.title,
			document.description,
			...(document.keywords ?? []),
			...(document.headings ?? []),
			document.ontology.role,
			document.ontology.domain,
			document.ontology.class,
			document.ontology.instance,
			document.ontology.aspect,
			document.text,
		]
			.filter(Boolean)
			.join(" "),
	);
}

export function buildGraphifySearchIndex(records = buildGraphifyExport()) {
	return records
		.filter((record) => record.type === "document")
		.map((document) => {
			const searchText = buildSearchText(document);

			return {
				id: document.id,
				url: document.url,
				title: document.title,
				description: document.description,
				keywords: document.keywords ?? [],
				headings: document.headings ?? [],
				ontology: document.ontology,
				search_text: searchText,
				terms: tokenize(searchText),
			};
		});
}

export function writeGraphifySearchIndex(outputPath = GRAPHIFY_SEARCH_INDEX_PATH, records = buildGraphifySearchIndex()) {
	mkdirSync(dirname(outputPath), { recursive: true });
	writeFileSync(outputPath, `${JSON.stringify(records, null, 2)}\n`);
	return { outputPath, recordCount: records.length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
	const result = writeGraphifySearchIndex();
	console.log(`Wrote ${result.recordCount} graphify search records to ${result.outputPath}`);
}
