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

test("getPersistentLabelConfig distinguishes topic, class, and subject labels", () => {
	assert.deepEqual(getPersistentLabelConfig({ type: "topic" }), {
		fontSize: 28,
		color: "#f8fafc",
		scale: 38,
		yOffset: 12,
	});
	assert.deepEqual(getPersistentLabelConfig({ type: "class" }), {
		fontSize: 22,
		color: "#e0f2fe",
		scale: 28,
		yOffset: 9,
	});
	assert.deepEqual(getPersistentLabelConfig({ type: "subject" }), {
		fontSize: 18,
		color: "#dbeafe",
		scale: 22,
		yOffset: 7,
	});
});
