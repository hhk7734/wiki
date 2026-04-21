import test from "node:test";
import assert from "node:assert/strict";

import { buildOntologyGraph } from "./buildOntologyGraph.mjs";

const wikiGraph = {
	nodes: [
		{
			id: "subject:infrastructure:storage-system:ceph",
			type: "subject",
			title: "Ceph",
			snippet: "Distributed storage cluster.",
			ontology: { domain: "infrastructure", class: "storage-system", instance: "ceph" },
			url: "/docs/infrastructure/storage/ceph/overview",
			node_url: "/api/wiki/nodes/subject:infrastructure:storage-system:ceph.json",
			document_refs: ["doc:docs/infrastructure/storage/ceph/overview.mdx"],
		},
		{
			id: "subject:infrastructure:iac-tool:terraform",
			type: "subject",
			title: "Terraform",
			snippet: "Infrastructure as code.",
			ontology: { domain: "infrastructure", class: "iac-tool", instance: "terraform" },
			url: "/docs/infrastructure/iac/terraform/overview",
			node_url: "/api/wiki/nodes/subject:infrastructure:iac-tool:terraform.json",
			document_refs: ["doc:docs/infrastructure/iac/terraform/overview.mdx"],
		},
		{
			id: "subject:infrastructure:networking-stack:cilium",
			type: "subject",
			title: "Cilium",
			snippet: "Kubernetes networking.",
			ontology: { domain: "infrastructure", class: "networking-stack", instance: "cilium" },
			url: "/docs/infrastructure/networking/cilium/overview",
			node_url: "/api/wiki/nodes/subject:infrastructure:networking-stack:cilium.json",
			document_refs: ["doc:docs/infrastructure/networking/cilium/overview.mdx"],
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
	assert.equal(graph.nodes.find((node) => node.id === "topic:infrastructure")?.type, "topic");
	assert.equal(graph.nodes.find((node) => node.id === "topic:language")?.type, "topic");
	assert.ok(nodeIds.has("subject:infrastructure:storage-system:ceph"));
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
	assert.ok(linkPairs.has("topic:language->class:language:framework:hierarchy"));
	assert.ok(linkPairs.has("class:language:framework->subject:language:framework:nextjs:hierarchy"));
	assert.ok(linkPairs.has("subject:language:framework:nextjs->subject:language:framework:react:relation"));
	assert.equal(languageTopic.childCount, 1);
});

test("buildOntologyGraph inserts ontology class nodes between topics and subjects", () => {
	const graph = buildOntologyGraph({
		wikiGraph,
		rootLabel: "lol-IoT",
	});

	const linkPairs = new Set(graph.links.map((link) => `${link.source}->${link.target}:${link.kind}`));
	const classNode = graph.nodes.find((node) => node.id === "class:language:framework");
	const reactNode = graph.nodes.find((node) => node.id === "subject:language:framework:react");

	assert.equal(classNode?.type, "class");
	assert.equal(classNode?.label, "Framework");
	assert.equal(classNode?.topic, "language");
	assert.equal(classNode?.ontology.class, "framework");
	assert.equal(classNode?.depth, 2);
	assert.equal(reactNode?.depth, 3);
	assert.ok(linkPairs.has("topic:language->class:language:framework:hierarchy"));
	assert.ok(linkPairs.has("class:language:framework->subject:language:framework:react:hierarchy"));
	assert.equal(classNode?.childCount, 2);
});

test("buildOntologyGraph uses infrastructure path sections as class-level map nodes", () => {
	const graph = buildOntologyGraph({
		wikiGraph,
		rootLabel: "lol-IoT",
	});

	const nodeIds = new Set(graph.nodes.map((node) => node.id));
	const linkPairs = new Set(graph.links.map((link) => `${link.source}->${link.target}:${link.kind}`));

	assert.ok(nodeIds.has("class:infrastructure:storage"));
	assert.ok(nodeIds.has("class:infrastructure:iac"));
	assert.ok(nodeIds.has("class:infrastructure:networking"));
	assert.equal(graph.nodes.find((node) => node.id === "class:infrastructure:iac")?.label, "IaC");
	assert.ok(linkPairs.has("topic:infrastructure->class:infrastructure:iac:hierarchy"));
	assert.ok(linkPairs.has("class:infrastructure:iac->subject:infrastructure:iac-tool:terraform:hierarchy"));
	assert.ok(linkPairs.has("class:infrastructure:networking->subject:infrastructure:networking-stack:cilium:hierarchy"));
});
