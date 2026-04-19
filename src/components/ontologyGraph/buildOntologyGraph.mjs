function toDisplayLabel(value) {
	return value
		.split("/")
		.at(-1)
		?.replaceAll(/[-_]+/g, " ")
		.replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? value;
}

function getDocHref(doc, metadata) {
	return metadata?.permalink ?? doc.path ?? doc.permalink ?? `/docs/${doc.id}`;
}

function getDocLabel(docId, metadata) {
	return metadata?.frontMatter?.sidebar_label ?? metadata?.title ?? toDisplayLabel(docId);
}

function createNode(node) {
	return {
		childCount: 0,
		description: undefined,
		docId: undefined,
		href: undefined,
		topic: undefined,
		...node,
	};
}

export function buildOntologyGraph({
	docs,
	topicSections,
	docMetadataById,
	rootLabel = "lol-IoT",
}) {
	const nodes = [createNode({ id: "root", label: rootLabel, type: "root", depth: 0 })];
	const links = [];
	const nodeById = new Map(nodes.map((node) => [node.id, node]));

	for (const [topicLabel, sidebarId] of Object.entries(topicSections)) {
		const sectionDocs = docs.filter((doc) => doc.sidebar === sidebarId);

		if (!sectionDocs.length) {
			continue;
		}

		const topicNodeId = `topic:${sidebarId}`;
		const topicNode = createNode({
			id: topicNodeId,
			label: topicLabel,
			type: "topic",
			depth: 1,
			topic: sidebarId,
		});

		nodes.push(topicNode);
		nodeById.set(topicNodeId, topicNode);
		links.push({ source: "root", target: topicNodeId, kind: "hierarchy" });

		for (const doc of sectionDocs) {
			const metadata = docMetadataById.get(doc.id);
			const segments = doc.id.split("/");
			const groupSegments = segments.slice(1, -1);
			let parentId = topicNodeId;

			groupSegments.forEach((segment, index) => {
				const partialPath = groupSegments.slice(0, index + 1).join("/");
				const groupNodeId = `group:${sidebarId}:${partialPath}`;

				if (!nodeById.has(groupNodeId)) {
					const groupNode = createNode({
						id: groupNodeId,
						label: toDisplayLabel(segment),
						type: "group",
						depth: index + 2,
						topic: sidebarId,
					});

					nodes.push(groupNode);
					nodeById.set(groupNodeId, groupNode);
					links.push({ source: parentId, target: groupNodeId, kind: "hierarchy" });
				}

				parentId = groupNodeId;
			});

			const docNodeId = `doc:${doc.id}`;
			const docNode = createNode({
				id: docNodeId,
				label: getDocLabel(doc.id, metadata),
				type: "doc",
				depth: groupSegments.length + 2,
				topic: sidebarId,
				docId: doc.id,
				href: getDocHref(doc, metadata),
				description: metadata?.description,
			});

			nodes.push(docNode);
			nodeById.set(docNodeId, docNode);
			links.push({ source: parentId, target: docNodeId, kind: "hierarchy" });
		}
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
