import assert from "node:assert/strict";
import test from "node:test";

import { getCameraFocusPosition } from "./cameraFocus.mjs";

test("getCameraFocusPosition keeps the same camera offset when refocusing", () => {
	const position = getCameraFocusPosition({
		cameraPosition: { x: 120, y: 80, z: 620 },
		targetPosition: { x: 0, y: 0, z: 0 },
		node: { type: "doc", x: 40, y: 10, z: -30 },
	});

	assert.deepEqual(position, {
		x: 160,
		y: 90,
		z: 590,
	});
});

test("getCameraFocusPosition recenters without changing zoom distance", () => {
	const position = getCameraFocusPosition({
		cameraPosition: { x: 320, y: 120, z: 420 },
		targetPosition: { x: 100, y: 20, z: 40 },
		node: { type: "group", x: -80, y: 60, z: 140 },
	});

	assert.deepEqual(position, {
		x: 140,
		y: 160,
		z: 520,
	});
});

test("getCameraFocusPosition falls back to the origin when no target is provided", () => {
	const position = getCameraFocusPosition({
		cameraPosition: { x: 0, y: 0, z: 620 },
		node: { type: "role", x: 80, y: -20, z: 160 },
	});

	assert.deepEqual(position, {
		x: 80,
		y: -20,
		z: 780,
	});
});
