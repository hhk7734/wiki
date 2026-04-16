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

function splitUrlSuffix(url) {
	const suffixStart = url.search(/[?#]/);

	if (suffixStart === -1) {
		return { base: url, suffix: "" };
	}

	return {
		base: url.slice(0, suffixStart),
		suffix: url.slice(suffixStart),
	};
}

function rewriteUrl(url, linkMap) {
	const { base, suffix } = splitUrlSuffix(url);
	const nextBase = linkMap.get(base);

	if (!nextBase) {
		return url;
	}

	return `${nextBase}${suffix}`;
}

function rewriteNonCodeChunk(content, linkMap) {
	return content
		.replace(/\]\((\/docs\/[^)\s]+)\)/g, (_match, url) => `](${rewriteUrl(url, linkMap)})`)
		.replace(/\b(href|to)=(["'])(\/docs\/[^"']+)\2/g, (_match, attribute, quote, url) => {
			return `${attribute}=${quote}${rewriteUrl(url, linkMap)}${quote}`;
		});
}

function rewriteOutsideFences(content, rewriter) {
	const lines = content.split("\n");
	const output = [];
	const proseBuffer = [];
	let fence = null;

	function flushProse() {
		if (proseBuffer.length === 0) {
			return;
		}

		output.push(rewriter(proseBuffer.join("\n")));
		proseBuffer.length = 0;
	}

	for (const line of lines) {
		const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);

		if (!fence) {
			if (fenceMatch) {
				flushProse();
				fence = {
					char: fenceMatch[1][0],
					length: fenceMatch[1].length,
				};
				output.push(line);
				continue;
			}

			proseBuffer.push(line);
			continue;
		}

		output.push(line);

		const closingPattern = new RegExp(`^\\s*${fence.char}{${fence.length},}\\s*$`);
		if (closingPattern.test(line)) {
			fence = null;
		}
	}

	flushProse();
	return output.join("\n");
}

export function rewriteDocLinks(content, linkMap = buildDocLinkMap()) {
	return rewriteOutsideFences(content, (chunk) => rewriteNonCodeChunk(chunk, linkMap));
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
