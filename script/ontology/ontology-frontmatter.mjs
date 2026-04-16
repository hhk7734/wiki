export function normalizeOntologyBlock(parts) {
	return {
		ontology: {
			role: parts.role,
			domain: parts.domain,
			class: parts.className,
			instance: parts.instance,
			aspect: parts.aspect,
		},
		source: {
			status: parts.aspect === "overview" ? "canonical" : "supporting",
			confidence: "exact",
		},
	};
}
