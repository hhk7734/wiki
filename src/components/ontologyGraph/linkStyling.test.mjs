import assert from "node:assert/strict";
import test from "node:test";

import { getLinkVisuals, isLinkConnectedToNode } from "./linkStyling.mjs";

const roleColors = {
	entity: "#38bdf8",
	concept: "#f97316",
};

test("isLinkConnectedToNode matches string and object endpoints", () => {
	assert.equal(isLinkConnectedToNode({ source: "root", target: "role:entity" }, "root"), true);
	assert.equal(
		isLinkConnectedToNode({ source: { id: "role:entity" }, target: { id: "group:entity:platform" } }, "group:entity:platform"),
		true,
	);
	assert.equal(isLinkConnectedToNode({ source: "root", target: "role:entity" }, "role:concept"), false);
});

test("getLinkVisuals keeps baseline links readable with no active node", () => {
	const visuals = getLinkVisuals({
		link: {
			source: { id: "group:entity:platform", type: "group", role: "entity" },
			target: { id: "doc:entity/platform/tool/git/git", type: "doc", role: "entity" },
		},
		activeNodeId: null,
		roleColors,
	});

	assert.equal(visuals.color, "#7dd3fc");
	assert.equal(visuals.opacity, 0.44);
	assert.equal(visuals.width, 1.1);
	assert.equal(visuals.particles, 2);
});

test("getLinkVisuals strongly emphasizes links connected to the active node", () => {
	const visuals = getLinkVisuals({
		link: {
			source: { id: "group:entity:platform", type: "group", role: "entity" },
			target: { id: "doc:entity/platform/tool/git/git", type: "doc", role: "entity" },
		},
		activeNodeId: "doc:entity/platform/tool/git/git",
		roleColors,
	});

	assert.equal(visuals.color, "#e0f2fe");
	assert.equal(visuals.opacity, 0.96);
	assert.equal(visuals.width, 2.6);
	assert.equal(visuals.particles, 7);
});

test("getLinkVisuals fades unrelated links when a node is active", () => {
	const visuals = getLinkVisuals({
		link: {
			source: { id: "role:entity", type: "role", role: "entity" },
			target: { id: "group:entity:platform", type: "group", role: "entity" },
		},
		activeNodeId: "doc:concept/language/concept/goroutine/goroutine",
		roleColors,
	});

	assert.equal(visuals.color, "#334155");
	assert.equal(visuals.opacity, 0.14);
	assert.equal(visuals.width, 0.75);
	assert.equal(visuals.particles, 0);
});
