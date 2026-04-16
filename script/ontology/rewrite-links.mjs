import { readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { walk } from "./inventory.mjs";
import { loadRegistry } from "./validate.mjs";
import { ROOT_DIR } from "./constants.mjs";

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

export function buildDocLinkMap(entries = loadRegistry()) {
	const linkMap = new Map();

	for (const entry of entries) {
		const variants = [
			[`/${entry.source}`, `/${entry.target}`],
			[`/${trimExtension(entry.source)}`, `/${trimExtension(entry.target)}`],
			[`/${toDocRoute(entry.source)}`, `/${toDocRoute(entry.target)}`],
		];

		for (const [oldPath, newPath] of variants) {
			if (!linkMap.has(oldPath)) {
				linkMap.set(oldPath, newPath);
			}
		}
	}

	return linkMap;
}

export function rewriteDocLinks(content, linkMap = buildDocLinkMap()) {
	let nextContent = content;

	const replacements = [...linkMap.entries()].sort((left, right) => right[0].length - left[0].length);

	for (const [oldDocPath, newDocPath] of replacements) {
		nextContent = nextContent.replaceAll(oldDocPath, newDocPath);
	}

	return nextContent;
}

export function listRewriteTargets() {
	return walk("docs").filter((file) => file.endsWith(".mdx") || file.endsWith(".md"));
}

export function rewriteAllDocLinks({ docs = listRewriteTargets(), linkMap = buildDocLinkMap() } = {}) {
	let rewrittenFiles = 0;

	for (const docPath of docs) {
		const absolutePath = resolve(ROOT_DIR, docPath);
		const content = readFileSync(absolutePath, "utf8");
		const nextContent = rewriteDocLinks(content, linkMap);

		if (nextContent === content) {
			continue;
		}

		writeFileSync(absolutePath, nextContent);
		rewrittenFiles += 1;
	}

	return rewrittenFiles;
}

function main() {
	const rewrittenFiles = rewriteAllDocLinks();
	console.log(`rewrote links in ${rewrittenFiles} files`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
	main();
}
