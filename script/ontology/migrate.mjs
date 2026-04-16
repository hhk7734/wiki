import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT_DIR } from "./constants.mjs";
import { parseFrontmatter, replaceFrontmatter } from "./frontmatter.mjs";
import { normalizeOntologyBlock } from "./ontology-frontmatter.mjs";
import { loadRegistry } from "./validate.mjs";

function toOntologyParts(ontology) {
	return {
		role: ontology.role,
		domain: ontology.domain,
		className: ontology.class,
		instance: ontology.instance,
		aspect: ontology.aspect,
	};
}

function rewriteMigratedFrontmatter(content, entry) {
	const frontmatter = {
		...parseFrontmatter(content),
	};
	const normalized = normalizeOntologyBlock(toOntologyParts(entry.ontology));
	const filename = basename(entry.target, ".mdx");

	frontmatter.id = filename;
	frontmatter.ontology = normalized.ontology;

	return replaceFrontmatter(content, frontmatter);
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

export function migrateRegistryEntries(entries = loadRegistry(), { dryRun = false } = {}) {
	for (const entry of entries) {
		console.log(`${entry.source} -> ${entry.target}`);
	}

	if (dryRun) {
		return entries.length;
	}

	for (const entry of entries) {
		const sourcePath = resolve(ROOT_DIR, entry.source);
		const targetPath = resolve(ROOT_DIR, entry.target);

		if (!existsSync(sourcePath)) {
			if (existsSync(targetPath)) {
				continue;
			}

			throw new Error(`missing source document: ${entry.source}`);
		}

		const content = readFileSync(sourcePath, "utf8");
		const nextContent = rewriteMigratedFrontmatter(content, entry);

		mkdirSync(dirname(targetPath), { recursive: true });
		writeFileSync(targetPath, nextContent);
		rmSync(sourcePath, { force: true });
	}

	pruneEmptyDirectories(resolve(ROOT_DIR, "docs"));
	return entries.length;
}

function parseArgs(argv) {
	return {
		dryRun: argv.includes("--dry-run"),
	};
}

function main() {
	migrateRegistryEntries(loadRegistry(), parseArgs(process.argv.slice(2)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
	try {
		main();
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}
