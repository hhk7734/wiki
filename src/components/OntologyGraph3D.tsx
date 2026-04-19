import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import globalData from "@generated/globalData";
import React, { useEffect, useRef, useState } from "react";
import type { ForceGraphMethods } from "react-force-graph-3d";
import * as THREE from "three";

import OntologyPreviewPanel from "./ontologyGraph/OntologyPreviewPanel";
import { buildOntologyGraph } from "./ontologyGraph/buildOntologyGraph.mjs";
import { getCameraFocusPosition } from "./ontologyGraph/cameraFocus.mjs";
import { getLinkVisuals } from "./ontologyGraph/linkStyling.mjs";
import { getPersistentLabelConfig } from "./ontologyGraph/persistentLabelConfig.mjs";
import styles from "./ontologyGraph/ontologyGraph.module.css";
import type { OntologyGraphData, OntologyGraphLink, OntologyGraphNode, SelectedOntologyNode } from "./ontologyGraph/ontologyGraph.types";

type GlobalDoc = {
	id: string;
	sidebar?: string;
	path?: string;
};

type DocMetadata = {
	id: string;
	title?: string;
	description?: string;
	permalink?: string;
	frontMatter?: {
		sidebar_label?: string;
	};
};

type DocsContext = {
	keys: () => string[];
	(key: string): DocMetadata;
};

declare const require: {
	context: (directory: string, useSubdirectories: boolean, regExp: RegExp) => DocsContext;
};

const topicSections = {
	Data: "data",
	Language: "language",
	MLOps: "mlops",
	Platform: "platform",
	Protocol: "protocol",
	Hardware: "hardware",
	Science: "science",
	Management: "management",
	Comparison: "comparison",
} as const;

const topicColors: Record<string, string> = {
	data: "#3b82f6",
	language: "#ef4444",
	mlops: "#10b981",
	platform: "#f59e0b",
	protocol: "#8b5cf6",
	hardware: "#f97316",
	science: "#06b6d4",
	management: "#ec4899",
	comparison: "#facc15",
};

const docMetadataById = (() => {
	const docsContext = require.context("../../.docusaurus/docusaurus-plugin-content-docs/default", false, /^\.\/site-docs-.*\.json$/);

	return new Map(
		docsContext.keys().map((key) => {
			const metadata = docsContext(key);
			return [metadata.id, metadata];
		}),
	);
})();

function hashString(value: string): number {
	let hash = 0;

	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) % 100000;
	}

	return hash;
}

function polarOffset(seed: string, radius: number) {
	const hash = hashString(seed);
	const angle = ((hash % 360) * Math.PI) / 180;
	const tilt = ((hash % 13) - 6) * 12;

	return {
		x: Math.cos(angle) * radius,
		y: tilt,
		z: Math.sin(angle) * radius,
	};
}

function withLayout(graph: OntologyGraphData): OntologyGraphData {
	const topicNodes = graph.nodes.filter((node) => node.type === "topic");
	const topicCenters = new Map<string, { x: number; y: number; z: number }>();

	topicNodes.forEach((node, index) => {
		const angle = (index / Math.max(topicNodes.length, 1)) * Math.PI * 2;
		const position = {
			x: Math.cos(angle) * 220,
			y: index % 2 === 0 ? 40 : -40,
			z: Math.sin(angle) * 220,
		};

		topicCenters.set(node.topic ?? node.id, position);
	});

	return {
		nodes: graph.nodes.map((node) => {
			if (node.type === "root") {
				return { ...node, fx: 0, fy: 0, fz: 0 };
			}

			if (node.type === "topic") {
				const center = topicCenters.get(node.topic ?? node.id) ?? { x: 0, y: 0, z: 0 };
				return { ...node, ...center, fx: center.x, fy: center.y, fz: center.z };
			}

			const center = topicCenters.get(node.topic ?? "") ?? { x: 0, y: 0, z: 0 };
			const offset = polarOffset(node.id, 55 + node.depth * 26);

			return {
				...node,
				x: center.x + offset.x,
				y: center.y + offset.y,
				z: center.z + offset.z,
			};
		}),
		links: graph.links,
	};
}

function getOntologyGraphData(): OntologyGraphData {
	const docs = (
		(globalData as Record<string, { default?: { versions?: Array<{ docs?: GlobalDoc[] }> } }>)[
			"docusaurus-plugin-content-docs"
		]?.default?.versions?.[0]?.docs ?? []
	).filter((doc): doc is GlobalDoc => typeof doc?.id === "string");

	const graph = buildOntologyGraph({
		docs,
		topicSections,
		docMetadataById,
		rootLabel: "lol-IoT",
	});

	return withLayout(graph as OntologyGraphData);
}

function getNodeColor(node: OntologyGraphNode, selectedNode: SelectedOntologyNode): string {
	if (selectedNode?.id === node.id) {
		return "#f8fafc";
	}

	if (node.type === "root") {
		return "#ffffff";
	}

	if (node.type === "doc") {
		return "#cbd5e1";
	}

	return topicColors[node.topic ?? ""] ?? "#94a3b8";
}

function getNodeValue(node: OntologyGraphNode): number {
	switch (node.type) {
		case "root":
			return 9;
		case "topic":
			return 7;
		case "group":
			return 3.6;
		case "doc":
			return 2.2;
		default:
			return 2.2;
	}
}

function getNodeLabel(node: OntologyGraphNode): string {
	const topic = node.topic ? `${node.topic} / ` : "";
	return `${topic}${node.label}`;
}

function createLabelSprite(node: OntologyGraphNode): THREE.Sprite {
	const { color, fontSize, scale, yOffset } = getPersistentLabelConfig(node);
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");

	if (!context) {
		return new THREE.Sprite();
	}

	const fontFamily = "\"IBM Plex Sans\", \"Segoe UI\", sans-serif";
	context.font = `700 ${fontSize}px ${fontFamily}`;
	const metrics = context.measureText(node.label);
	const width = Math.ceil(metrics.width + fontSize * 1.2);
	const height = Math.ceil(fontSize * 2);

	canvas.width = width * 2;
	canvas.height = height * 2;

	context.scale(2, 2);
	context.font = `700 ${fontSize}px ${fontFamily}`;
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.lineJoin = "round";
	context.lineWidth = Math.max(4, fontSize * 0.22);
	context.strokeStyle = "rgba(2, 6, 23, 0.92)";
	context.fillStyle = color;
	context.strokeText(node.label, width / 2, height / 2);
	context.fillText(node.label, width / 2, height / 2);

	const texture = new THREE.CanvasTexture(canvas);
	texture.needsUpdate = true;

	const material = new THREE.SpriteMaterial({
		map: texture,
		transparent: true,
		depthWrite: false,
	});

	const sprite = new THREE.Sprite(material);
	sprite.scale.set(scale, scale * (height / width), 1);
	sprite.position.set(0, yOffset, 0);

	return sprite;
}

export default function OntologyGraph3D() {
	const graphRef = useRef<ForceGraphMethods<OntologyGraphNode, OntologyGraphLink>>();
	const labelSpriteCache = useRef<Map<string, THREE.Sprite>>(new Map());
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [selectedNode, setSelectedNode] = useState<SelectedOntologyNode>(null);
	const [hoveredNode, setHoveredNode] = useState<SelectedOntologyNode>(null);
	const [graphData] = useState<OntologyGraphData>(() => getOntologyGraphData());
	const ForceGraph3D = ExecutionEnvironment.canUseDOM ? require("react-force-graph-3d").default : null;
	const activeNodeId = hoveredNode?.id ?? selectedNode?.id ?? null;

	useEffect(() => {
		const updateDimensions = () => {
			setDimensions({
				width: window.innerWidth,
				height: Math.max(window.innerHeight - 60, 640),
			});
		};

		updateDimensions();
		window.addEventListener("resize", updateDimensions);

		return () => {
			window.removeEventListener("resize", updateDimensions);
		};
	}, []);

	useEffect(() => {
		if (!graphRef.current) {
			return;
		}

		const linkForce = graphRef.current.d3Force("link");
		const chargeForce = graphRef.current.d3Force("charge");
		const centerForce = graphRef.current.d3Force("center");

		linkForce?.distance?.((link: { source?: { type?: string }; target?: { type?: string } }) => {
			if (link.target?.type === "doc") {
				return 28;
			}

			return link.source?.type === "root" ? 140 : 75;
		});
		linkForce?.strength?.((link: { target?: { type?: string } }) => (link.target?.type === "doc" ? 0.4 : 0.8));
		chargeForce?.strength?.((node: OntologyGraphNode) => {
			if (node.type === "root" || node.type === "topic") {
				return -220;
			}

			return node.type === "doc" ? -32 : -80;
		});
		centerForce?.strength?.(0.08);
		graphRef.current.d3ReheatSimulation();
		graphRef.current.cameraPosition({ z: 620 }, { x: 0, y: 0, z: 0 }, 0);
	}, []);

	useEffect(() => {
		if (!selectedNode || !graphRef.current) {
			return;
		}

		if (
			typeof (selectedNode as OntologyGraphNode & { x?: number }).x !== "number" ||
			typeof (selectedNode as OntologyGraphNode & { y?: number }).y !== "number" ||
			typeof (selectedNode as OntologyGraphNode & { z?: number }).z !== "number"
		) {
			return;
		}

		const positionedNode = selectedNode as OntologyGraphNode & { x: number; y: number; z: number };
		const camera = graphRef.current.camera();
		const controls = graphRef.current.controls() as { target?: { x: number; y: number; z: number } } | undefined;
		const cameraPosition = getCameraFocusPosition({
			cameraPosition: {
				x: camera.position.x,
				y: camera.position.y,
				z: camera.position.z,
			},
			targetPosition: controls?.target
				? {
						x: controls.target.x,
						y: controls.target.y,
						z: controls.target.z,
					}
				: undefined,
			node: positionedNode,
		});

		graphRef.current.cameraPosition(
			cameraPosition,
			{ x: positionedNode.x, y: positionedNode.y, z: positionedNode.z },
			900,
		);
	}, [selectedNode]);

	if (!graphData.nodes.length) {
		return (
			<div className={styles.graphShell}>
				<div className={styles.emptyState}>
					<div className={styles.emptyStateCard}>
						<h2>Ontology graph unavailable</h2>
						<p>The homepage could not derive topic graph data from the current docs metadata.</p>
					</div>
				</div>
			</div>
		);
	}

	if (!ForceGraph3D) {
		return null;
	}

	return (
		<div className={styles.graphShell}>
			<div className={styles.statusPill}>
				<span className={styles.statusDot} />
				<span>{graphData.nodes.length} topic graph nodes live on the homepage map</span>
			</div>

			<div className={styles.graphCanvas}>
				{dimensions.width > 0 ? (
					<ForceGraph3D<OntologyGraphNode, OntologyGraphLink>
						ref={graphRef}
						width={dimensions.width}
						height={dimensions.height}
						graphData={graphData}
						backgroundColor="#020617"
						showNavInfo={false}
						nodeLabel={getNodeLabel}
						nodeThreeObject={(node) => {
							const typedNode = node as OntologyGraphNode;
							const cachedSprite = labelSpriteCache.current.get(typedNode.id);

							if (cachedSprite) {
								return cachedSprite;
							}

							const sprite = createLabelSprite(typedNode);
							labelSpriteCache.current.set(typedNode.id, sprite);
							return sprite;
						}}
						nodeThreeObjectExtend
						nodeColor={(node) => getNodeColor(node as OntologyGraphNode, selectedNode)}
						nodeVal={(node) => getNodeValue(node as OntologyGraphNode)}
						linkColor={(link) => {
							return getLinkVisuals({
								link,
								activeNodeId,
								topicColors,
							}).color;
						}}
						linkOpacity={(link) =>
							getLinkVisuals({
								link,
								activeNodeId,
								topicColors,
							}).opacity
						}
						linkWidth={(link) => {
							return getLinkVisuals({
								link,
								activeNodeId,
								topicColors,
							}).width;
						}}
						linkDirectionalParticles={(link) => {
							return getLinkVisuals({
								link,
								activeNodeId,
								topicColors,
							}).particles;
						}}
						linkDirectionalParticleSpeed={(link) =>
							getLinkVisuals({
								link,
								activeNodeId,
								topicColors,
							}).particleSpeed
						}
						enableNodeDrag={false}
						enableNavigationControls
						showPointerCursor={(item) => Boolean(item)}
						onNodeHover={(node) => {
							setHoveredNode((node as OntologyGraphNode | null) ?? null);
						}}
						onNodeClick={(node) => {
							setSelectedNode(node as OntologyGraphNode);
						}}
						onBackgroundClick={() => {
							setHoveredNode(null);
							setSelectedNode(null);
							graphRef.current?.cameraPosition({ x: 0, y: 0, z: 620 }, { x: 0, y: 0, z: 0 }, 900);
						}}
					/>
				) : null}
			</div>

			<OntologyPreviewPanel selectedNode={selectedNode} onClose={() => setSelectedNode(null)} />
		</div>
	);
}
