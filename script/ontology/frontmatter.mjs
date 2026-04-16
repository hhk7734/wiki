import { readFileSync } from "node:fs";

function parseScalar(value) {
	if (value === "true") {
		return true;
	}

	if (value === "false") {
		return false;
	}

	if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
		return value.slice(1, -1);
	}

	return value;
}

function parseBlock(lines, startIndex = 0, indent = 0) {
	const data = {};
	let index = startIndex;

	while (index < lines.length) {
		const line = lines[index];

		if (line.trim() === "") {
			index += 1;
			continue;
		}

		const currentIndent = line.match(/^\s*/)?.[0].length ?? 0;

		if (currentIndent < indent) {
			break;
		}

		if (currentIndent > indent) {
			throw new Error(`invalid frontmatter indentation near: ${line.trim()}`);
		}

		const trimmed = line.trim();
		const match = trimmed.match(/^([A-Za-z0-9_-]+):(.*)$/);

		if (!match) {
			throw new Error(`unsupported frontmatter line: ${trimmed}`);
		}

		const [, key, rawValue] = match;
		const value = rawValue.trim();

		if (value !== "") {
			data[key] = parseScalar(value);
			index += 1;
			continue;
		}

		const nextLine = lines[index + 1];

		if (!nextLine) {
			data[key] = null;
			index += 1;
			continue;
		}

		const nextIndent = nextLine.match(/^\s*/)?.[0].length ?? 0;

		if (nextIndent <= currentIndent) {
			data[key] = null;
			index += 1;
			continue;
		}

		if (nextLine.trim().startsWith("- ")) {
			const items = [];
			index += 1;

			while (index < lines.length) {
				const itemLine = lines[index];
				const itemIndent = itemLine.match(/^\s*/)?.[0].length ?? 0;

				if (itemLine.trim() === "") {
					index += 1;
					continue;
				}

				if (itemIndent < nextIndent) {
					break;
				}

				if (itemIndent !== nextIndent || !itemLine.trim().startsWith("- ")) {
					throw new Error(`unsupported frontmatter list item: ${itemLine.trim()}`);
				}

				items.push(parseScalar(itemLine.trim().slice(2).trim()));
				index += 1;
			}

			data[key] = items;
			continue;
		}

		const nested = parseBlock(lines, index + 1, nextIndent);
		data[key] = nested.data;
		index = nested.index;
	}

	return { data, index };
}

export function parseFrontmatter(content) {
	const lines = content.split(/\r?\n/);

	if (lines[0] !== "---") {
		return {};
	}

	const closingIndex = lines.slice(1).findIndex((line) => line === "---");

	if (closingIndex === -1) {
		throw new Error("unterminated frontmatter block");
	}

	return parseBlock(lines.slice(1, closingIndex + 1)).data;
}

export function readFrontmatter(filePath) {
	return parseFrontmatter(readFileSync(filePath, "utf8"));
}
