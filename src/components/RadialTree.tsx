import sidebarList from "../../sidebars";
import * as d3 from "d3";
import type {
	SidebarItem,
	SidebarItemDoc,
	SidebarItemLink,
	SidebarItemCategory,
} from "@docusaurus/plugin-content-docs/src/sidebars/types.js";
import React, { useEffect, useRef, useState } from "react";

interface TreeData {
	name: string;
	children?: TreeData[];
}

function itemToTreeData(item: string | SidebarItem): TreeData {
	if (typeof item === "string") {
		return docToTreeData(item);
	}
	switch (item.type) {
		case "doc":
			return docToTreeData(item);
		case "link":
			return linkToTreeData(item);
		case "category":
			return categoryToTreeData(item);
		default:
			throw new Error("Invalid item type");
	}
}

function docToTreeData(doc: string | SidebarItemDoc): TreeData {
	if (typeof doc === "string") {
		doc = doc.split("/").pop();
		const prefixList = ["arduino-", "cpp-", "flutter-", "llvm-", "python-", "sam-", "stm32-"];
		for (const prefix of prefixList) {
			if (doc.startsWith(prefix)) {
				doc = doc.slice(prefix.length);
			}
		}
		return { name: doc };
	}
	return { name: doc.label ?? doc.id };
}

function linkToTreeData(link: SidebarItemLink): TreeData {
	return { name: link.label };
}

function categoryToTreeData(category: SidebarItemCategory): TreeData {
	return {
		name: category.label,
		children: category.items.map((item) => {
			return itemToTreeData(item);
		}),
	};
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

		const sidebarData = Object.entries(sidebarList).map(([key, value]) => {
			return { name: key, children: value.map((item) => itemToTreeData(item)) };
		});

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
