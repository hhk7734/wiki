import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT_DIR } from "./constants.mjs";
import { parseFrontmatter, replaceFrontmatter } from "./frontmatter.mjs";
import { normalizeOntologyBlock } from "./ontology-frontmatter.mjs";
import { buildDocLinkMap, listRewriteTargets, rewriteAllDocLinks, rewriteDocLinks } from "./rewrite-links.mjs";
import { loadRegistry, validateEntries } from "./validate.mjs";

function toOntologyParts(ontology) {
	return {
		role: ontology.role,
		domain: ontology.domain,
		className: ontology.class,
		instance: ontology.instance,
		aspect: ontology.aspect,
	};
}

function rewriteMigratedFrontmatter(content, entry, linkMap) {
	const frontmatter = {
		...parseFrontmatter(content),
	};
	const normalized = normalizeOntologyBlock(toOntologyParts(entry.ontology));
	const filename = basename(entry.target, ".mdx");

	frontmatter.id = filename;
	frontmatter.ontology = normalized.ontology;

	return rewriteDocLinks(replaceFrontmatter(content, frontmatter), linkMap);
}

function pruneEmptyDirectories(startDir) {
	const superpowersDir = resolve(ROOT_DIR, "docs", "superpowers");

	for (const entry of readdirSync(startDir, { withFileTypes: true })) {
		if (!entry.isDirectory()) {
			continue;
		}

		const absolutePath = resolve(startDir, entry.name);

		if (absolutePath === superpowersDir) {
			continue;
		}

		pruneEmptyDirectories(absolutePath);

		if (readdirSync(absolutePath).length === 0) {
			rmSync(absolutePath, { recursive: true, force: true });
		}
	}
}

function assertSourceDocumentsExist(entries) {
	for (const entry of entries) {
		const sourcePath = resolve(ROOT_DIR, entry.source);

		if (!existsSync(sourcePath)) {
			throw new Error(`missing source document: ${entry.source}`);
		}
	}
}

function normalizeMappingEntry(entry) {
	return {
		source: entry.source?.replaceAll("\\", "/"),
		target: entry.target?.replaceAll("\\", "/"),
	};
}

export function loadPathMapping(mappingPath) {
	if (!mappingPath) {
		throw new Error("path mapping path is required");
	}

	if (!existsSync(mappingPath)) {
		throw new Error(`missing path mapping file: ${mappingPath}`);
	}

	const parsed = JSON.parse(readFileSync(mappingPath, "utf8"));
	const mappings = Array.isArray(parsed) ? parsed : parsed.mappings;

	if (!Array.isArray(mappings)) {
		throw new Error(`invalid path mapping file: ${mappingPath}`);
	}

	return mappings.map(normalizeMappingEntry);
}

export function buildMigrationEntries(entries = loadRegistry(), mappingEntries) {
	if (!Array.isArray(mappingEntries)) {
		throw new Error("mapping entries are required");
	}

	if (mappingEntries.length === 0) {
		throw new Error("path mapping must include at least one entry");
	}

	const entriesBySource = new Map(entries.map((entry) => [entry.source, entry]));
	const migrationEntries = mappingEntries.map((mapping) => {
		const entry = entriesBySource.get(mapping.source);

		if (!entry) {
			throw new Error(`missing registry entry for mapped source: ${mapping.source}`);
		}

		return {
			...entry,
			target: mapping.target,
		};
	});

	validateEntries(migrationEntries, {
		validateSourcePaths: true,
		allowEditorialBuckets: true,
	});
	return migrationEntries;
}

function resolveMigrationEntries(entries, { mappingPath, mappingEntries } = {}) {
	if (mappingEntries !== undefined) {
		return buildMigrationEntries(entries, mappingEntries);
	}

	if (!mappingPath) {
		throw new Error("migration requires explicit mapping entries or --mapping <path>");
	}

	const pathMappings = loadPathMapping(mappingPath);

	if (pathMappings.length === 0) {
		throw new Error(`path mapping file has no entries: ${mappingPath}`);
	}

	const entriesBySource = new Set(entries.map((entry) => entry.source));
	const missingSources = pathMappings
		.map((mapping) => mapping.source)
		.filter((source) => !entriesBySource.has(source));

	if (missingSources.length > 0) {
		throw new Error(`missing registry entries for mapped sources: ${missingSources.join(", ")}`);
	}

	return buildMigrationEntries(entries, pathMappings);
}

export function migrateRegistryEntries(entries = loadRegistry(), { dryRun = false, mappingPath, mappingEntries, docs } = {}) {
	const migrationEntries = resolveMigrationEntries(entries, { mappingPath, mappingEntries });
	assertSourceDocumentsExist(migrationEntries);
	const linkMap = buildDocLinkMap(migrationEntries);

	for (const entry of migrationEntries) {
		console.log(`${entry.source} -> ${entry.target}`);
	}

	if (dryRun) {
		return migrationEntries.length;
	}

	for (const entry of migrationEntries) {
		const sourcePath = resolve(ROOT_DIR, entry.source);
		const targetPath = resolve(ROOT_DIR, entry.target);

		const content = readFileSync(sourcePath, "utf8");
		const nextContent = rewriteMigratedFrontmatter(content, entry, linkMap);

		mkdirSync(dirname(targetPath), { recursive: true });
		writeFileSync(targetPath, nextContent);
		rmSync(sourcePath, { force: true });
	}

	pruneEmptyDirectories(resolve(ROOT_DIR, "docs"));
	rewriteAllDocLinks({
		docs: docs ?? listRewriteTargets(),
		linkMap,
	});

	return migrationEntries.length;
}

function parseArgs(argv) {
	const mappingIndex = argv.indexOf("--mapping");
	const mappingPath =
		mappingIndex !== -1 && argv[mappingIndex + 1]
			? resolve(ROOT_DIR, argv[mappingIndex + 1])
			: undefined;
	const write = argv.includes("--write");

	return {
		dryRun: argv.includes("--dry-run") || !write,
		mappingPath,
	};
}

function main() {
	const options = parseArgs(process.argv.slice(2));

	if (!options.mappingPath) {
		throw new Error("--mapping <path> is required");
	}

	migrateRegistryEntries(loadRegistry(), options);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
	try {
		main();
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}
