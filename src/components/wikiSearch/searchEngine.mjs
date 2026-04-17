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
	return (value ?? "")
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s/-]+/gu, " ")
		.replace(/\s+/g, " ")
		.trim();
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

function scoreSubject(query, subject) {
	const tokens = tokenizeQuery(query);
	const expandedTokens = expandTokens(tokens);
	const title = normalizeText(subject.title);
	const description = normalizeText(subject.description);
	const snippet = normalizeText(subject.snippet);
	const searchText = normalizeText(subject.search_text);
	const domain = normalizeText(subject.ontology?.domain);
	const className = normalizeText(subject.ontology?.class);
	const instance = normalizeText(subject.ontology?.instance);
	let score = 0;
	const phrase = normalizeText(query);

	if (phrase && title.includes(phrase)) {
		score += 120;
	}

	if (phrase && searchText.includes(phrase)) {
		score += 50;
	}

	score += scoreField(title, expandedTokens, { exactWeight: 30, tokenWeight: 18 });
	score += scoreField(description, expandedTokens, { exactWeight: 12, tokenWeight: 6 });
	score += scoreField(snippet, expandedTokens, { exactWeight: 10, tokenWeight: 5 });
	score += scoreField(searchText, expandedTokens, { exactWeight: 6, tokenWeight: 3 });
	score += scoreField(domain, expandedTokens, { exactWeight: 22, tokenWeight: 12 });
	score += scoreField(className, expandedTokens, { exactWeight: 18, tokenWeight: 10 });
	score += scoreField(instance, expandedTokens, { exactWeight: 22, tokenWeight: 12 });

	if (tokens.every((token) => searchText.includes(token) || title.includes(token))) {
		score += 16;
	}

	return score;
}

function scoreDocument(query, document) {
	const tokens = tokenizeQuery(query);
	const expandedTokens = expandTokens(tokens);
	const title = normalizeText(document.title);
	const description = normalizeText(document.description);
	const snippet = normalizeText(document.snippet);
	const headings = normalizeText((document.headings ?? []).join(" "));
	const keywords = normalizeText((document.keywords ?? []).join(" "));
	const searchText = normalizeText(document.search_text);
	const role = normalizeText(document.ontology?.role);
	const domain = normalizeText(document.ontology?.domain);
	const className = normalizeText(document.ontology?.class);
	const instance = normalizeText(document.ontology?.instance);
	const aspect = normalizeText(document.ontology?.aspect);
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
	score += scoreField(snippet, expandedTokens, { exactWeight: 10, tokenWeight: 5 });
	score += scoreField(searchText, expandedTokens, { exactWeight: 6, tokenWeight: 3 });
	score += scoreField(role, expandedTokens, { exactWeight: 24, tokenWeight: 14 });
	score += scoreField(domain, expandedTokens, { exactWeight: 16, tokenWeight: 8 });
	score += scoreField(className, expandedTokens, { exactWeight: 16, tokenWeight: 8 });
	score += scoreField(instance, expandedTokens, { exactWeight: 20, tokenWeight: 10 });
	score += scoreField(aspect, expandedTokens, { exactWeight: 18, tokenWeight: 10 });

	if (expandedTokens.some((token) => OPERATION_HINTS.has(token)) && role === "operation") {
		score += 25;
	}

	if (tokens.every((token) => searchText.includes(token) || title.includes(token) || headings.includes(token))) {
		score += 20;
	}

	return score;
}

function rankAndLimit(records, scorer, query, limit) {
	return records
		.map((record) => ({ ...record, score: scorer(query, record) }))
		.filter((record) => record.score > 0)
		.sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
		.slice(0, limit);
}

export function searchWikiIndex(query, index, { limit = 6 } = {}) {
	const trimmed = query.trim();

	if (!trimmed) {
		return { subjects: [], documents: [] };
	}

	return {
		subjects: rankAndLimit(index.subjects ?? [], scoreSubject, trimmed, limit),
		documents: rankAndLimit(index.documents ?? [], scoreDocument, trimmed, limit),
	};
}
