import { basename, resolve } from "node:path";
import { ROOT_DIR } from "./constants.mjs";
import { readFrontmatter, requireSemanticFrontmatter } from "./frontmatter.mjs";
import { hasApprovedTaxonomyTopicPrefix, parseTaxonomyPath, validateTaxonomyPath } from "./taxonomy-paths.mjs";

function normalizeSourcePath(source) {
	return source.replaceAll("\\", "/").replace(/^\.?\//, "");
}

function fileStem(source) {
	return basename(source, ".mdx");
}

function taxonomyPathInfo(source) {
	try {
		return parseTaxonomyPath(source);
	} catch {
		return null;
	}
}

function frontmatterOntology(frontmatter) {
	return {
		role: frontmatter.ontology.role,
		domain: frontmatter.ontology.domain,
		class: frontmatter.ontology.class,
		instance: frontmatter.ontology.instance,
		aspect: frontmatter.ontology.aspect,
	};
}

function assertFrontmatterIdMatchesSource(frontmatter, sourcePath) {
	const docId = frontmatter?.id;
	const expectedId = fileStem(sourcePath);

	if (docId !== expectedId) {
		throw new Error(`id mismatch: ${docId} != ${expectedId}`);
	}
}

export function classifySeedFromFrontmatter(source) {
	const sourcePath = normalizeSourcePath(source);
	const frontmatter = readFrontmatter(resolve(ROOT_DIR, sourcePath));

	assertFrontmatterIdMatchesSource(frontmatter, sourcePath);
	requireSemanticFrontmatter(frontmatter, sourcePath);

	return {
		source: sourcePath,
		target: sourcePath,
		ontology: frontmatterOntology(frontmatter),
	};
}

export function isMaintainedTaxonomyPath(source) {
	return taxonomyPathInfo(normalizeSourcePath(source)) !== null;
}

export function classifySeed(source) {
	const sourcePath = normalizeSourcePath(source);

	if (!hasApprovedTaxonomyTopicPrefix(sourcePath)) {
		throw new Error(`unsupported taxonomy path: ${sourcePath}`);
	}

	validateTaxonomyPath(sourcePath);
	return classifySeedFromFrontmatter(sourcePath);
}
