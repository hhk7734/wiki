export function normalizeOntologyBlock(parts) {
	const sourceStatus = parts.sourceStatus ?? (parts.aspect === "overview" ? "canonical" : "supporting");

	return {
		ontology: {
			role: parts.role,
			domain: parts.domain,
			class: parts.className,
			instance: parts.instance,
			aspect: parts.aspect,
		},
		source: {
			status: sourceStatus,
			confidence: parts.sourceConfidence ?? "exact",
		},
	};
}
