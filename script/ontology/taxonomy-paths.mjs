const APPROVED_TOPICS = new Set([
	"comparison",
	"language",
	"platform",
	"hardware",
	"protocol",
	"data",
	"mlops",
	"science",
	"management",
]);

const RESERVED_TOPIC_BUCKETS = new Set(["concepts", "comparisons", "reference"]);

function normalizeTaxonomyPath(sourcePath) {
	return sourcePath.replaceAll("\\", "/").replace(/^\.?\//, "");
}

function splitTaxonomyPath(sourcePath) {
	return normalizeTaxonomyPath(sourcePath).split("/");
}

export function hasApprovedTaxonomyTopicPrefix(sourcePath) {
	const parts = splitTaxonomyPath(sourcePath);
	return parts[0] === "docs" && APPROVED_TOPICS.has(parts[1] ?? "");
}

function assertApprovedTopic(topic, sourcePath) {
	if (!APPROVED_TOPICS.has(topic)) {
		throw new Error(`unsupported topic bucket: ${topic} (${sourcePath})`);
	}
}

function assertNotReservedPathSegment(segment, sourcePath) {
	if (RESERVED_TOPIC_BUCKETS.has(segment)) {
		throw new Error(`unsupported taxonomy shape: ${sourcePath}`);
	}
}

function assertDocsSource(parts, sourcePath) {
	if (parts[0] !== "docs") {
		throw new Error(`unsupported taxonomy path: ${sourcePath}`);
	}

	if (!sourcePath.endsWith(".mdx")) {
		throw new Error(`unsupported taxonomy path: ${sourcePath}`);
	}

	if (parts.some((part) => part.length === 0)) {
		throw new Error(`unsupported taxonomy path: ${sourcePath}`);
	}

	if (parts.some((part) => part === "." || part === "..")) {
		throw new Error(`unsupported taxonomy path: ${sourcePath}`);
	}

	const basename = parts.at(-1)?.replace(/\.mdx$/, "") ?? "";
	if (basename.length === 0) {
		throw new Error(`unsupported taxonomy path: ${sourcePath}`);
	}
}

function pageName(parts) {
	return parts.at(-1).replace(/\.mdx$/, "");
}

export function parseTaxonomyPath(sourcePath) {
	const parts = splitTaxonomyPath(sourcePath);

	assertDocsSource(parts, sourcePath);

	const topic = parts[1];
	assertApprovedTopic(topic, sourcePath);

	if (topic === "comparison") {
		if (parts.length === 6) {
			assertNotReservedPathSegment(parts[2], sourcePath);
			assertNotReservedPathSegment(parts[3], sourcePath);
			assertNotReservedPathSegment(parts[4], sourcePath);

			return {
				topic,
				subject: `${parts[2]}/${parts[3]}`,
				facet: parts[4],
				page: pageName(parts),
				kind: "comparison-facet-page",
				area: parts[2],
				subject_group: parts[3],
			};
		}

		throw new Error(`unsupported taxonomy shape: ${sourcePath}`);
	}

	if (parts.length === 4 && parts[2] === "concepts") {
		return {
			topic,
			subject: parts[3].replace(/\.mdx$/, ""),
			facet: null,
			page: pageName(parts),
			kind: "topic-concept",
		};
	}

	if (parts.length === 4 && parts[2] === "comparisons") {
		return {
			topic,
			subject: parts[3].replace(/\.mdx$/, ""),
			facet: null,
			page: pageName(parts),
			kind: "topic-comparison",
		};
	}

	if (parts.length === 4 && parts[2] === "reference") {
		return {
			topic,
			subject: parts[3].replace(/\.mdx$/, ""),
			facet: null,
			page: pageName(parts),
			kind: "topic-reference",
		};
	}

	if (parts.length === 4) {
		assertNotReservedPathSegment(parts[2], sourcePath);

		return {
			topic,
			subject: parts[2],
			facet: null,
			page: pageName(parts),
			kind: "subject-page",
		};
	}

	if (parts.length === 5) {
		assertNotReservedPathSegment(parts[2], sourcePath);
		assertNotReservedPathSegment(parts[3], sourcePath);

		return {
			topic,
			subject: parts[2],
			facet: parts[3],
			page: pageName(parts),
			kind: "facet-page",
		};
	}

	throw new Error(`unsupported taxonomy shape: ${sourcePath}`);
}

export function validateTaxonomyPath(sourcePath) {
	return parseTaxonomyPath(sourcePath);
}
