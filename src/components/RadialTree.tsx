import globalData from "@generated/globalData";
import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";

interface TreeData {
	name: string;
	children?: TreeData[];
}

interface GlobalDoc {
	id: string;
	sidebar?: string;
}

const ontologySections = {
	Entity: "entity",
	Concept: "concept",
	Operation: "operation",
	Specification: "specification",
	Troubleshooting: "troubleshooting",
	Comparison: "comparison",
} as const;

function ensureChild(parent: TreeData, name: string): TreeData {
	const existingChild = parent.children?.find((child) => child.name === name);
	if (existingChild) {
		return existingChild;
	}

	const child = { name, children: [] };
	parent.children = [...(parent.children ?? []), child];
	return child;
}

function docToTreeData(doc: string): { categoryPath: string[]; leafName: string } {
	const segments = doc.split("/").slice(1);
	return {
		categoryPath: segments.slice(0, -2),
		leafName: doc.split("/").slice(-2, -1)[0] ?? doc,
	};
}

function buildSectionTree(name: string, docIds: string[]): TreeData {
	const root: TreeData = { name, children: [] };

	for (const docId of docIds) {
		const { categoryPath, leafName } = docToTreeData(docId);
		let current = root;

		for (const category of categoryPath) {
			current = ensureChild(current, category);
		}

		if (!current.children?.some((child) => child.name === leafName)) {
			current.children = [...(current.children ?? []), { name: leafName }];
		}
	}

	return root;
}

function getOntologyTreeData(): TreeData[] {
	const docs = (
		(globalData as Record<string, { default?: { versions?: Array<{ docs?: GlobalDoc[] }> } }>)[
			"docusaurus-plugin-content-docs"
		]?.default?.versions?.[0]?.docs ?? []
	).filter((doc): doc is GlobalDoc => typeof doc?.id === "string");

	return Object.entries(ontologySections)
		.map(([label, sidebarId]) => {
			const docIds = docs.filter((doc) => doc.sidebar === sidebarId).map((doc) => doc.id);
			return buildSectionTree(label, docIds);
		})
		.filter((section) => (section.children?.length ?? 0) > 0);
}

export default function RadialTree() {
	const svgRef = useRef(null);
	const [windowWidth, setDimensions] = useState(0);

	useEffect(() => {
		// Function to update dimensions based on the current window size
		const updateDimensions = () => {
			const width = window.innerWidth;
			setDimensions(width);
		};

		// Initialize dimensions and set resize event listener
		updateDimensions();
		window.addEventListener("resize", updateDimensions);

		return () => {
			window.removeEventListener("resize", updateDimensions);
		};
	}, []);

	useEffect(() => {
		if (!windowWidth) return;

		const svg = d3.select(svgRef.current);
		const width = windowWidth;
		const height = width;
		const cx = width * 0.5; // adjust as needed to fit
		const cy = height * 0.5; // adjust as needed to fit
		const radius = width / 2 - 30;

		// Create a radial tree layout. The layout’s first dimension (x)
		// is the angle, while the second (y) is the radius.
		const tree = d3
			.tree()
			.size([2 * Math.PI, radius])
			.separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

		// convert sidebarList to data
		// sidebar is object with key: value pairs
		// key is the name of the category
		// value is an array of objects

		// // 2024-12-13 까지
		// const sidebarData = Object.entries(sidebarList).map(([key, value]) => {
		// 	return { name: key, children: value.map((item) => itemToTreeData(item)) };
		// });

		const sidebarData = getOntologyTreeData();

		const root = tree(
			d3.hierarchy({ name: "lol-IoT", children: sidebarData }).sort((a, b) => d3.ascending(a.data.name, b.data.name)),
		);

		// Clear previous SVG content
		svg.selectAll("*").remove();

		svg
			.attr("width", width)
			.attr("height", height)
			.attr("viewBox", [-cx, -cy, width, height])
			.attr("style", "width: 100%; height: 100%; font: 10px sans-serif; font-color: black;");
		svg
			.append("g")
			.attr("fill", "none")
			.attr("stroke", "#000000")
			.attr("stroke-opacity", 0.4)
			.attr("stroke-width", 2)
			.selectAll()
			.data(root.links())
			.join("path")
			.attr(
				"d",
				d3
					.linkRadial()
					.angle((d) => d.x)
					.radius((d) => d.y),
			);
		svg
			.append("g")
			.selectAll()
			.data(root.descendants())
			.join("circle")
			.attr("transform", (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`)
			.attr("fill", (d) => (d.children ? "#ff0000" : "#0000ff"))
			.attr("r", 2.5);
		svg
			.append("g")
			.attr("stroke-linejoin", "round")
			.attr("stroke-width", 3)
			.selectAll()
			.data(root.descendants())
			.join("text")
			.attr(
				"transform",
				(d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0) rotate(${d.x >= Math.PI ? 180 : 0})`,
			)
			.attr("dy", "0.31em")
			.attr("x", (d) => (d.x < Math.PI === !d.children ? 6 : -6))
			.attr("text-anchor", (d) => (d.x < Math.PI === !d.children ? "start" : "end"))
			.attr("paint-order", "stroke")
			.attr("stroke", "white")
			.attr("fill", "currentColor")
			.text((d) => d.data.name);
	}, [windowWidth]);

	return (
		<div className={`h-[${windowWidth}px] bg-white`}>
			<svg className="text-black" ref={svgRef} />
		</div>
	);
}
