import test from "node:test";
import assert from "node:assert/strict";

import { buildOntologyGraph } from "./buildOntologyGraph.mjs";

const ontologySections = {
	Entity: "entity",
	Concept: "concept",
};

const docs = [
	{
		id: "entity/platform/tool/git/git",
		sidebar: "entity",
		path: "/docs/entity/platform/tool/git/git",
	},
	{
		id: "concept/language/concept/goroutine/goroutine",
		sidebar: "concept",
		path: "/docs/concept/language/concept/goroutine/goroutine",
	},
];

const docMetadataById = new Map([
	[
		"entity/platform/tool/git/git",
		{
			id: "entity/platform/tool/git/git",
			title: "Git",
			description: "Distributed version control system.",
			frontMatter: {
				sidebar_label: "Git VCS",
			},
		},
	],
	[
		"concept/language/concept/goroutine/goroutine",
		{
			id: "concept/language/concept/goroutine/goroutine",
			title: "Goroutine",
			description: "Lightweight Go concurrency primitive.",
		},
	],
]);

test("buildOntologyGraph creates role, group, and doc nodes with stable ids", () => {
	const graph = buildOntologyGraph({
		docs,
		ontologySections,
		docMetadataById,
		rootLabel: "lol-IoT",
	});

	const nodeIds = new Set(graph.nodes.map((node) => node.id));

	assert.equal(graph.nodes.find((node) => node.id === "root")?.type, "root");
	assert.equal(graph.nodes.find((node) => node.id === "role:entity")?.type, "role");
	assert.equal(graph.nodes.find((node) => node.id === "role:concept")?.type, "role");
	assert.ok(nodeIds.has("group:entity:platform"));
	assert.ok(nodeIds.has("group:entity:platform/tool"));
	assert.ok(nodeIds.has("group:entity:platform/tool/git"));
	assert.ok(nodeIds.has("doc:entity/platform/tool/git/git"));
});

test("buildOntologyGraph prefers sidebar labels and preserves doc metadata", () => {
	const graph = buildOntologyGraph({
		docs,
		ontologySections,
		docMetadataById,
		rootLabel: "lol-IoT",
	});

	const gitDoc = graph.nodes.find((node) => node.id === "doc:entity/platform/tool/git/git");
	const goroutineDoc = graph.nodes.find((node) => node.id === "doc:concept/language/concept/goroutine/goroutine");

	assert.equal(gitDoc.label, "Git VCS");
	assert.equal(gitDoc.description, "Distributed version control system.");
	assert.equal(gitDoc.href, "/docs/entity/platform/tool/git/git");
	assert.equal(gitDoc.docId, "entity/platform/tool/git/git");
	assert.equal(goroutineDoc.label, "Goroutine");
});

test("buildOntologyGraph links parents to children and counts descendants", () => {
	const graph = buildOntologyGraph({
		docs,
		ontologySections,
		docMetadataById,
		rootLabel: "lol-IoT",
	});

	const linkPairs = new Set(graph.links.map((link) => `${link.source}->${link.target}`));
	const entityRole = graph.nodes.find((node) => node.id === "role:entity");
	const gitGroup = graph.nodes.find((node) => node.id === "group:entity:platform/tool/git");

	assert.ok(linkPairs.has("root->role:entity"));
	assert.ok(linkPairs.has("role:entity->group:entity:platform"));
	assert.ok(linkPairs.has("group:entity:platform/tool->group:entity:platform/tool/git"));
	assert.ok(linkPairs.has("group:entity:platform/tool/git->doc:entity/platform/tool/git/git"));
	assert.equal(entityRole.childCount, 1);
	assert.equal(gitGroup.childCount, 1);
});
