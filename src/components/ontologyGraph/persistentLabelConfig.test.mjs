import assert from "node:assert/strict";
import test from "node:test";

import { getPersistentLabelConfig } from "./persistentLabelConfig.mjs";

test("getPersistentLabelConfig gives the root the largest label treatment", () => {
	assert.deepEqual(getPersistentLabelConfig({ type: "root" }), {
		fontSize: 40,
		color: "#f8fafc",
		scale: 62,
		yOffset: 16,
	});
});

test("getPersistentLabelConfig distinguishes topic, group, and doc labels", () => {
	assert.deepEqual(getPersistentLabelConfig({ type: "topic" }), {
		fontSize: 28,
		color: "#f8fafc",
		scale: 38,
		yOffset: 12,
	});
	assert.deepEqual(getPersistentLabelConfig({ type: "group" }), {
		fontSize: 20,
		color: "#dbeafe",
		scale: 26,
		yOffset: 8,
	});
	assert.deepEqual(getPersistentLabelConfig({ type: "doc" }), {
		fontSize: 16,
		color: "#cbd5e1",
		scale: 18,
		yOffset: 5,
	});
});
