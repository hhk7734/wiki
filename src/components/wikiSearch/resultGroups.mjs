export function buildWikiResultGroups(results) {
	return [
		{
			key: "documents",
			title: "Documents",
			kind: "document",
			items: results.documents ?? [],
		},
		{
			key: "subjects",
			title: "Subjects",
			kind: "subject",
			items: results.subjects ?? [],
		},
	].filter((group) => group.items.length > 0);
}
