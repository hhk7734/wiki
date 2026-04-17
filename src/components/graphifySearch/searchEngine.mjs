const QUERY_EXPANSIONS = new Map([
	["방법", ["방법", "가이드", "설정", "사용", "관리"]],
	["관리", ["관리", "운영", "설정"]],
	["운영", ["운영", "관리"]],
	["설치", ["설치", "install", "배포"]],
	["설정", ["설정", "config", "구성"]],
	["예제", ["예제", "example", "샘플"]],
]);

const OPERATION_HINTS = new Set(["방법", "관리", "운영", "설치", "설정", "사용", "가이드", "how"]);
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
];

function normalizeText(value) {
	return (value ?? "").toLowerCase().replace(/[^\p{L}\p{N}\s/-]+/gu, " ").replace(/\s+/g, " ").trim();
}

function stripKoreanParticle(token) {
	for (const suffix of KOREAN_PARTICLE_SUFFIXES) {
		if (token.length > suffix.length + 1 && token.endsWith(suffix)) {
			return token.slice(0, -suffix.length);
		}
	}

	return token;
}

export function tokenizeQuery(query) {
	return [...new Set(normalizeText(query).split(" ").map(stripKoreanParticle).filter(Boolean))];
}

function expandTokens(tokens) {
	const expanded = new Set(tokens);

	for (const token of tokens) {
		for (const synonym of QUERY_EXPANSIONS.get(token) ?? []) {
			expanded.add(synonym);
		}
	}

	return [...expanded];
}

function scoreField(field, tokens, { exactWeight, tokenWeight }) {
	if (!field) {
		return 0;
	}

	let score = 0;

	for (const token of tokens) {
		if (field.includes(token)) {
			score += field === token ? exactWeight : tokenWeight;
		}
	}

	return score;
}

function scoreRecord(query, record) {
	const tokens = tokenizeQuery(query);
	const expandedTokens = expandTokens(tokens);
	const title = normalizeText(record.title);
	const description = normalizeText(record.description);
	const headings = normalizeText((record.headings ?? []).join(" "));
	const keywords = normalizeText((record.keywords ?? []).join(" "));
	const searchText = normalizeText(record.search_text);
	const instance = normalizeText(record.ontology?.instance);
	const aspect = normalizeText(record.ontology?.aspect);
	let score = 0;

	const phrase = normalizeText(query);

	if (phrase && title.includes(phrase)) {
		score += 120;
	}

	if (phrase && headings.includes(phrase)) {
		score += 80;
	}

	if (phrase && searchText.includes(phrase)) {
		score += 50;
	}

	score += scoreField(title, expandedTokens, { exactWeight: 30, tokenWeight: 18 });
	score += scoreField(headings, expandedTokens, { exactWeight: 20, tokenWeight: 12 });
	score += scoreField(keywords, expandedTokens, { exactWeight: 18, tokenWeight: 10 });
	score += scoreField(description, expandedTokens, { exactWeight: 10, tokenWeight: 6 });
	score += scoreField(searchText, expandedTokens, { exactWeight: 6, tokenWeight: 3 });
	score += scoreField(instance, expandedTokens, { exactWeight: 24, tokenWeight: 14 });
	score += scoreField(aspect, expandedTokens, { exactWeight: 20, tokenWeight: 12 });

	if (expandedTokens.some((token) => OPERATION_HINTS.has(token)) && record.ontology?.role === "operation") {
		score += 25;
	}

	if (tokens.every((token) => searchText.includes(token) || title.includes(token) || headings.includes(token))) {
		score += 20;
	}

	return score;
}

export function searchGraphifyIndex(query, records, { limit = 8 } = {}) {
	const trimmed = query.trim();

	if (!trimmed) {
		return [];
	}

	return records
		.map((record) => ({ ...record, score: scoreRecord(trimmed, record) }))
		.filter((record) => record.score > 0)
		.sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
		.slice(0, limit);
}
