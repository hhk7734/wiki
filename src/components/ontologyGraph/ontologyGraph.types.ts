export type OntologyGraphNodeType = "root" | "topic" | "group" | "doc";

export type OntologyGraphNode = {
	id: string;
	label: string;
	type: OntologyGraphNodeType;
	depth: number;
	topic?: string;
	docId?: string;
	href?: string;
	description?: string;
	childCount: number;
};

export type OntologyGraphLink = {
	source: string;
	target: string;
	kind: "hierarchy";
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
