import assert from "node:assert/strict";
import test from "node:test";

import { getLinkVisuals, isLinkConnectedToNode } from "./linkStyling.mjs";

const topicColors = {
	data: "#3b82f6",
	language: "#ef4444",
};

test("isLinkConnectedToNode matches string and object endpoints", () => {
	assert.equal(isLinkConnectedToNode({ source: "root", target: "topic:data" }, "root"), true);
	assert.equal(
		isLinkConnectedToNode({ source: { id: "topic:data" }, target: { id: "group:data:ceph" } }, "group:data:ceph"),
		true,
	);
	assert.equal(isLinkConnectedToNode({ source: "root", target: "topic:data" }, "topic:language"), false);
});

test("getLinkVisuals keeps baseline links readable with no active node", () => {
	const visuals = getLinkVisuals({
		link: {
			source: { id: "group:data:ceph", type: "group", topic: "data" },
			target: { id: "doc:data/ceph/overview", type: "doc", topic: "data" },
		},
		activeNodeId: null,
		topicColors,
	});

	assert.equal(visuals.color, "#93c5fd");
	assert.equal(visuals.opacity, 0.44);
	assert.equal(visuals.width, 1.1);
	assert.equal(visuals.particles, 2);
});

test("getLinkVisuals strongly emphasizes links connected to the active node", () => {
	const visuals = getLinkVisuals({
		link: {
			source: { id: "group:data:ceph", type: "group", topic: "data" },
			target: { id: "doc:data/ceph/overview", type: "doc", topic: "data" },
		},
		activeNodeId: "doc:data/ceph/overview",
		topicColors,
	});

	assert.equal(visuals.color, "#e0f2fe");
	assert.equal(visuals.opacity, 0.96);
	assert.equal(visuals.width, 2.6);
	assert.equal(visuals.particles, 7);
});

test("getLinkVisuals fades unrelated links when a node is active", () => {
	const visuals = getLinkVisuals({
		link: {
			source: { id: "topic:data", type: "topic", topic: "data" },
			target: { id: "group:data:ceph", type: "group", topic: "data" },
		},
		activeNodeId: "doc:language/concepts/goroutine",
		topicColors,
	});

	assert.equal(visuals.color, "#334155");
	assert.equal(visuals.opacity, 0.14);
	assert.equal(visuals.width, 0.75);
	assert.equal(visuals.particles, 0);
});
