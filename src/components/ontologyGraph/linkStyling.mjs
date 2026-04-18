function getNodeId(nodeOrId) {
	if (!nodeOrId) {
		return null;
	}

	return typeof nodeOrId === "object" ? nodeOrId.id ?? null : nodeOrId;
}

function getRole(link) {
	return link?.target?.role ?? link?.source?.role ?? null;
}

function getBaselineColor(role, roleColors) {
	switch (role) {
		case "entity":
			return "#7dd3fc";
		case "concept":
			return "#fdba74";
		case "operation":
			return "#5eead4";
		case "specification":
			return "#c4b5fd";
		case "troubleshooting":
			return "#fda4af";
		case "comparison":
			return "#fde68a";
		default:
			return roleColors?.[role] ?? "#64748b";
	}
}

export function isLinkConnectedToNode(link, nodeId) {
	if (!nodeId) {
		return false;
	}

	return getNodeId(link?.source) === nodeId || getNodeId(link?.target) === nodeId;
}

export function getLinkVisuals({ link, activeNodeId, roleColors }) {
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
		color: getBaselineColor(getRole(link), roleColors),
		opacity: 0.44,
		width: link?.target?.type === "doc" ? 1.1 : 1.35,
		particles: link?.target?.type === "doc" ? 2 : 1,
		particleSpeed: 0.0045,
	};
}
