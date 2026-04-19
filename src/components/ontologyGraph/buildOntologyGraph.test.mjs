import test from "node:test";
import assert from "node:assert/strict";

import { buildOntologyGraph } from "./buildOntologyGraph.mjs";

const wikiGraph = {
	nodes: [
		{
			id: "subject:data:storage-system:ceph",
			type: "subject",
			title: "Ceph",
			snippet: "Distributed storage cluster.",
			ontology: { domain: "data", class: "storage-system", instance: "ceph" },
			url: "/docs/data/ceph/overview",
			node_url: "/api/wiki/nodes/subject:data:storage-system:ceph.json",
			document_refs: ["doc:docs/data/ceph/overview.mdx"],
		},
		{
			id: "subject:language:framework:nextjs",
			type: "subject",
			title: "Next.js",
			snippet: "React framework.",
			ontology: { domain: "language", class: "framework", instance: "nextjs" },
			url: "/docs/language/nextjs/overview",
			node_url: "/api/wiki/nodes/subject:language:framework:nextjs.json",
			document_refs: ["doc:docs/language/nextjs/overview.mdx"],
		},
		{
			id: "subject:language:framework:react",
			type: "subject",
			title: "React",
			snippet: "UI library.",
			ontology: { domain: "language", class: "framework", instance: "react" },
			url: "/docs/language/react/overview",
			node_url: "/api/wiki/nodes/subject:language:framework:react.json",
			document_refs: ["doc:docs/language/react/overview.mdx"],
		},
		{
			id: "doc:docs/language/react/overview.mdx",
			type: "document",
			title: "React Overview",
			ontology: { role: "entity", domain: "language", class: "framework", instance: "react", aspect: "overview" },
			url: "/docs/language/react/overview",
			subject_ref: "subject:language:framework:react",
		},
	],
	edges: [
		{
			id: "relation:doc:docs/language/react/overview.mdx:about_subject:subject:language:framework:react",
			from: "doc:docs/language/react/overview.mdx",
			to: "subject:language:framework:react",
			predicate: "about_subject",
		},
		{
			id: "relation:subject:language:framework:nextjs:depends_on:subject:language:framework:react",
			from: "subject:language:framework:nextjs",
			to: "subject:language:framework:react",
			predicate: "depends_on",
		},
	],
};

test("buildOntologyGraph creates topic anchors and subject nodes from wiki graph subjects", () => {
	const graph = buildOntologyGraph({
		wikiGraph,
		rootLabel: "lol-IoT",
	});

	const nodeIds = new Set(graph.nodes.map((node) => node.id));

	assert.equal(graph.nodes.find((node) => node.id === "root")?.type, "root");
	assert.equal(graph.nodes.find((node) => node.id === "topic:data")?.type, "topic");
	assert.equal(graph.nodes.find((node) => node.id === "topic:language")?.type, "topic");
	assert.ok(nodeIds.has("subject:data:storage-system:ceph"));
	assert.ok(nodeIds.has("subject:language:framework:nextjs"));
	assert.ok(nodeIds.has("subject:language:framework:react"));
	assert.equal(graph.nodes.some((node) => node.id === "doc:docs/language/react/overview.mdx"), false);
});

test("buildOntologyGraph preserves subject metadata for preview and navigation", () => {
	const graph = buildOntologyGraph({
		wikiGraph,
		rootLabel: "lol-IoT",
	});

	const nextjsNode = graph.nodes.find((node) => node.id === "subject:language:framework:nextjs");

	assert.equal(nextjsNode.label, "Next.js");
	assert.equal(nextjsNode.description, "React framework.");
	assert.equal(nextjsNode.href, "/docs/language/nextjs/overview");
	assert.equal(nextjsNode.topic, "language");
	assert.equal(nextjsNode.ontology.instance, "nextjs");
});

test("buildOntologyGraph adds hierarchy links and semantic relation links between subjects", () => {
	const graph = buildOntologyGraph({
		wikiGraph,
		rootLabel: "lol-IoT",
	});

	const linkPairs = new Set(graph.links.map((link) => `${link.source}->${link.target}:${link.kind}`));
	const languageTopic = graph.nodes.find((node) => node.id === "topic:language");

	assert.ok(linkPairs.has("root->topic:language:hierarchy"));
	assert.ok(linkPairs.has("topic:language->subject:language:framework:nextjs:hierarchy"));
	assert.ok(linkPairs.has("subject:language:framework:nextjs->subject:language:framework:react:relation"));
	assert.equal(languageTopic.childCount, 2);
});
