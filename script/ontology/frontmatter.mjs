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

function findFrontmatterBounds(content) {
	const lines = content.split(/\r?\n/);

	if (lines[0] !== "---") {
		return null;
	}

	const relativeClosingIndex = lines.slice(1).findIndex((line) => line === "---");

	if (relativeClosingIndex === -1) {
		throw new Error("unterminated frontmatter block");
	}

	return {
		lines,
		closingIndex: relativeClosingIndex + 1,
	};
}

function isPlainObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function formatScalar(value) {
	if (typeof value === "string") {
		if (/^[A-Za-z0-9_./-]+$/.test(value)) {
			return value;
		}

		return JSON.stringify(value);
	}

	if (typeof value === "boolean") {
		return value ? "true" : "false";
	}

	if (value === null) {
		return "";
	}

	return String(value);
}

function appendKeyValue(lines, key, value, indent = 0) {
	const prefix = " ".repeat(indent);

	if (Array.isArray(value)) {
		lines.push(`${prefix}${key}:`);

		for (const item of value) {
			if (isPlainObject(item) || Array.isArray(item)) {
				throw new Error(`unsupported frontmatter list value for key: ${key}`);
			}

			lines.push(`${prefix}  - ${formatScalar(item)}`);
		}

		return;
	}

	if (isPlainObject(value)) {
		lines.push(`${prefix}${key}:`);

		for (const [childKey, childValue] of Object.entries(value)) {
			appendKeyValue(lines, childKey, childValue, indent + 2);
		}

		return;
	}

	if (value === null) {
		lines.push(`${prefix}${key}:`);
		return;
	}

	lines.push(`${prefix}${key}: ${formatScalar(value)}`);
}

export function parseFrontmatter(content) {
	const bounds = findFrontmatterBounds(content);

	if (!bounds) {
		return {};
	}

	return parseBlock(bounds.lines.slice(1, bounds.closingIndex)).data;
}

export function splitFrontmatter(content) {
	const bounds = findFrontmatterBounds(content);

	if (!bounds) {
		return {
			data: {},
			body: content,
			hasFrontmatter: false,
		};
	}

	return {
		data: parseBlock(bounds.lines.slice(1, bounds.closingIndex)).data,
		body: bounds.lines.slice(bounds.closingIndex + 1).join("\n"),
		hasFrontmatter: true,
	};
}

export function stringifyFrontmatter(data) {
	const lines = ["---"];

	for (const [key, value] of Object.entries(data)) {
		appendKeyValue(lines, key, value);
	}

	lines.push("---");
	return `${lines.join("\n")}\n`;
}

export function replaceFrontmatter(content, data) {
	const { body, hasFrontmatter } = splitFrontmatter(content);
	const nextBody = hasFrontmatter ? body : content;

	return `${stringifyFrontmatter(data)}${nextBody}`;
}

export function readFrontmatter(filePath) {
	return parseFrontmatter(readFileSync(filePath, "utf8"));
}
