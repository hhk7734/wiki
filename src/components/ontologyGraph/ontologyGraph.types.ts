export type OntologyGraphNodeType = "root" | "topic" | "subject";

export type OntologyGraphNode = {
	id: string;
	label: string;
	type: OntologyGraphNodeType;
	depth: number;
	topic?: string;
	href?: string;
	description?: string;
	nodeUrl?: string;
	ontology?: {
		domain?: string;
		class?: string;
		instance?: string;
		aspect?: string;
		role?: string;
	};
	layoutTarget?: {
		x: number;
		y: number;
		z: number;
	};
	childCount: number;
};

export type OntologyGraphLink = {
	source: string;
	target: string;
	kind: "hierarchy" | "relation";
	predicate?: string;
};

export type OntologyGraphData = {
	nodes: OntologyGraphNode[];
	links: OntologyGraphLink[];
};

export type SelectedOntologyNode = OntologyGraphNode | null;

export type OntologyPreviewPanelProps = {
	selectedNode: SelectedOntologyNode;
	onClose: () => void;
};
