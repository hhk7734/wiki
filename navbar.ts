import fs from "node:fs";
import path from "node:path";
import type { NavbarItem } from "@docusaurus/theme-common";

const ontologySections = {
	Entity: "entity",
	Concept: "concept",
	Operation: "operation",
	Specification: "specification",
	Troubleshooting: "troubleshooting",
	Comparison: "comparison",
} as const;

function hasDocsDir(dirName: string): boolean {
	return fs.existsSync(path.join(process.cwd(), "docs", dirName));
}

export const navbar = {
	Ontology: Object.fromEntries(Object.entries(ontologySections).filter(([, sidebarId]) => hasDocsDir(sidebarId))),
};

export const navbarItems: NavbarItem[] = Object.entries(navbar)
	.filter(([, categories]) => Object.keys(categories).length > 0)
	.map(([key, categories]) => {
		return {
			type: "dropdown",
			label: key,
			position: "left",
			items: Object.entries(categories).map(([label, to]) => {
				return {
					type: "docSidebar",
					label,
					sidebarId: to,
				};
			}),
		};
	});
