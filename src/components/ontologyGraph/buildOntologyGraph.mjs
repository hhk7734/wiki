function createNode(node) {
	return {
		childCount: 0,
		description: undefined,
		href: undefined,
		nodeUrl: undefined,
		ontology: undefined,
		topic: undefined,
		...node,
	};
}

function toTopicLabel(topic) {
	return topic.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function buildOntologyGraph({
	wikiGraph,
	rootLabel = "lol-IoT",
}) {
	const subjectRecords = (wikiGraph?.nodes ?? []).filter((node) => node.type === "subject");
	const subjectIds = new Set(subjectRecords.map((node) => node.id));
	const nodes = [createNode({ id: "root", label: rootLabel, type: "root", depth: 0 })];
	const links = [];
	const nodeById = new Map(nodes.map((node) => [node.id, node]));
	const topicNodeIds = new Map();

	for (const record of subjectRecords) {
		const topic = record.ontology?.domain ?? "unknown";
		const topicNodeId = `topic:${topic}`;

		if (!topicNodeIds.has(topic)) {
			const topicNode = createNode({
				id: topicNodeId,
				label: toTopicLabel(topic),
				type: "topic",
				depth: 1,
				topic,
			});

			nodes.push(topicNode);
			nodeById.set(topicNodeId, topicNode);
			topicNodeIds.set(topic, topicNodeId);
			links.push({ source: "root", target: topicNodeId, kind: "hierarchy" });
		}

		const subjectNode = createNode({
			id: record.id,
			label: record.title,
			type: "subject",
			depth: 2,
			topic,
			href: record.url,
			nodeUrl: record.node_url,
			description: record.snippet,
			ontology: record.ontology,
		});

		nodes.push(subjectNode);
		nodeById.set(subjectNode.id, subjectNode);
		links.push({ source: topicNodeIds.get(topic), target: subjectNode.id, kind: "hierarchy" });
	}

	for (const edge of wikiGraph?.edges ?? []) {
		if (edge.predicate === "about_subject") {
			continue;
		}

		if (!subjectIds.has(edge.from) || !subjectIds.has(edge.to)) {
			continue;
		}

		links.push({
			source: edge.from,
			target: edge.to,
			kind: "relation",
			predicate: edge.predicate,
		});
	}

	const childCounts = new Map();

	for (const link of links) {
		childCounts.set(link.source, (childCounts.get(link.source) ?? 0) + 1);
	}

	for (const node of nodes) {
		node.childCount = childCounts.get(node.id) ?? 0;
	}

	return { nodes, links };
}
