import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT_DIR } from "./constants.mjs";

function normalizePath(value) {
	return value.replaceAll("\\", "/");
}

export function walk(startDir) {
	const absoluteStart = resolve(ROOT_DIR, startDir);
	const results = [];

	function visit(currentDir, relativeDir) {
		for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
			const absolutePath = join(currentDir, entry.name);
			const relativePath = normalizePath(join(relativeDir, entry.name));

			if (entry.isDirectory()) {
				visit(absolutePath, relativePath);
				continue;
			}

			if (entry.isFile()) {
				results.push(relativePath);
			}
		}
	}

	visit(absoluteStart, normalizePath(startDir));
	return results.sort();
}

export function inventory() {
	return walk("docs").filter((file) => file.endsWith(".mdx"));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
	console.log(JSON.stringify(inventory(), null, 2));
}
