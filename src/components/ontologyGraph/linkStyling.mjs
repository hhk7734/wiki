function getNodeId(nodeOrId) {
	if (!nodeOrId) {
		return null;
	}

	return typeof nodeOrId === "object" ? nodeOrId.id ?? null : nodeOrId;
}

function getTopic(link) {
	return link?.target?.topic ?? link?.source?.topic ?? null;
}

function getBaselineColor(topic, topicColors) {
	switch (topic) {
		case "data":
			return "#93c5fd";
		case "language":
			return "#fca5a5";
		case "mlops":
			return "#6ee7b7";
		case "platform":
			return "#fcd34d";
		case "protocol":
			return "#c4b5fd";
		case "hardware":
			return "#fdba74";
		case "science":
			return "#67e8f9";
		case "management":
			return "#f9a8d4";
		case "comparison":
			return "#fde68a";
		default:
			return topicColors?.[topic] ?? "#64748b";
	}
}

function getPredicateColor(predicate) {
	switch (predicate) {
		case "depends_on":
			return "#f59e0b";
		case "part_of":
			return "#22c55e";
		case "prerequisite_for":
			return "#38bdf8";
		case "related_to":
			return "#a78bfa";
		case "implements":
			return "#fb7185";
		case "uses":
			return "#14b8a6";
		default:
			return "#94a3b8";
	}
}

export function isLinkConnectedToNode(link, nodeId) {
	if (!nodeId) {
		return false;
	}

	return getNodeId(link?.source) === nodeId || getNodeId(link?.target) === nodeId;
}

export function getLinkVisuals({ link, activeNodeId, topicColors }) {
	if (activeNodeId && isLinkConnectedToNode(link, activeNodeId)) {
		return {
			color: "#e0f2fe",
			opacity: 0.96,
			width: 2.6,
			particles: 7,
			particleSpeed: 0.01,
		};
	}

	if (activeNodeId) {
		return {
			color: "#334155",
			opacity: 0.14,
			width: 0.75,
			particles: 0,
			particleSpeed: 0.004,
		};
	}

	return {
		color: link?.kind === "relation" ? getPredicateColor(link?.predicate) : getBaselineColor(getTopic(link), topicColors),
		opacity: 0.44,
		width: link?.kind === "relation" ? 1.9 : 1.35,
		particles: link?.kind === "relation" ? 3 : 1,
		particleSpeed: 0.0045,
	};
}
