export function getPersistentLabelConfig(node) {
	switch (node?.type) {
		case "root":
			return { fontSize: 40, color: "#f8fafc", scale: 62, yOffset: 16 };
		case "topic":
			return { fontSize: 28, color: "#f8fafc", scale: 38, yOffset: 12 };
		case "class":
			return { fontSize: 22, color: "#e0f2fe", scale: 28, yOffset: 9 };
		case "subject":
			return { fontSize: 18, color: "#dbeafe", scale: 22, yOffset: 7 };
		default:
			return { fontSize: 16, color: "#cbd5e1", scale: 18, yOffset: 5 };
	}
}
