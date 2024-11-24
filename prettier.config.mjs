export default {
	printWidth: 120,
	singleQuote: false,
	trailingComma: "all",
	useTabs: true,
	plugins: [
		"prettier-plugin-tailwindcss", // 다른 플러그인과 호환성을 위해 마지막에 추가
	],
	tailwindFunctions: ["clsx"],
};
