export function buildTargetPath({ role, domain, className, instance, aspect }) {
	const filename = aspect === "overview" ? instance : aspect;
	return `docs/${role}/${domain}/${className}/${instance}/${filename}.mdx`;
}
