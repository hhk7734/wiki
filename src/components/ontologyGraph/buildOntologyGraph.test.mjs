import test from "node:test";
import assert from "node:assert/strict";

import { buildOntologyGraph } from "./buildOntologyGraph.mjs";

const topicSections = {
	Data: "data",
	Language: "language",
};

const docs = [
	{
		id: "data/ceph/overview",
		sidebar: "data",
		path: "/docs/data/ceph/overview",
	},
	{
		id: "language/concepts/goroutine",
		sidebar: "language",
		path: "/docs/language/concepts/goroutine",
	},
];

const docMetadataById = new Map([
	[
		"data/ceph/overview",
		{
			id: "data/ceph/overview",
			title: "Ceph Storage Cluster란?",
			description: "Distributed storage cluster.",
			frontMatter: {
				sidebar_label: "Ceph Overview",
			},
		},
	],
	[
		"language/concepts/goroutine",
		{
			id: "language/concepts/goroutine",
			title: "Goroutine",
			description: "Lightweight Go concurrency primitive.",
		},
	],
]);

test("buildOntologyGraph creates topic, group, and doc nodes with stable ids", () => {
	const graph = buildOntologyGraph({
		docs,
		topicSections,
		docMetadataById,
		rootLabel: "lol-IoT",
	});

	const nodeIds = new Set(graph.nodes.map((node) => node.id));

	assert.equal(graph.nodes.find((node) => node.id === "root")?.type, "root");
	assert.equal(graph.nodes.find((node) => node.id === "topic:data")?.type, "topic");
	assert.equal(graph.nodes.find((node) => node.id === "topic:language")?.type, "topic");
	assert.ok(nodeIds.has("group:data:ceph"));
	assert.ok(nodeIds.has("group:language:concepts"));
	assert.ok(nodeIds.has("doc:data/ceph/overview"));
});

test("buildOntologyGraph prefers sidebar labels and preserves doc metadata", () => {
	const graph = buildOntologyGraph({
		docs,
		topicSections,
		docMetadataById,
		rootLabel: "lol-IoT",
	});

	const cephDoc = graph.nodes.find((node) => node.id === "doc:data/ceph/overview");
	const goroutineDoc = graph.nodes.find((node) => node.id === "doc:language/concepts/goroutine");

	assert.equal(cephDoc.label, "Ceph Overview");
	assert.equal(cephDoc.description, "Distributed storage cluster.");
	assert.equal(cephDoc.href, "/docs/data/ceph/overview");
	assert.equal(cephDoc.docId, "data/ceph/overview");
	assert.equal(goroutineDoc.label, "Goroutine");
});

test("buildOntologyGraph links parents to children and counts descendants", () => {
	const graph = buildOntologyGraph({
		docs,
		topicSections,
		docMetadataById,
		rootLabel: "lol-IoT",
	});

	const linkPairs = new Set(graph.links.map((link) => `${link.source}->${link.target}`));
	const dataTopic = graph.nodes.find((node) => node.id === "topic:data");
	const cephGroup = graph.nodes.find((node) => node.id === "group:data:ceph");

	assert.ok(linkPairs.has("root->topic:data"));
	assert.ok(linkPairs.has("topic:data->group:data:ceph"));
	assert.ok(linkPairs.has("group:data:ceph->doc:data/ceph/overview"));
	assert.equal(dataTopic.childCount, 1);
	assert.equal(cephGroup.childCount, 1);
});
