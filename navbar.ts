import type { NavbarItem } from "@docusaurus/theme-common";

const ontologySections = {
	Entity: "entity",
	Concept: "concept",
	Operation: "operation",
	Specification: "specification",
	Troubleshooting: "troubleshooting",
	Comparison: "comparison",
} as const;

export const navbar = {
	Ontology: ontologySections,
};

export const navbarItems: NavbarItem[] = Object.entries(navbar).map(([key, categories]) => {
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
