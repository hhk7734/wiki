import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { themes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */
const config = {
	title: "loliot by HHK",
	tagline: "loliot",
	url: "https://wiki.loliot.net",
	baseUrl: "/",
	favicon: "img/favicon.ico",
	organizationName: "HandS",
	projectName: "wiki.loliot.net",
	markdown: {
		mermaid: true,
	},
	themes: ["@docusaurus/theme-mermaid"],
	plugins: [
		"docusaurus-plugin-google-adsense",
		[
			// https://docusaurus.io/ko/docs/next/api/plugins/@docusaurus/plugin-ideal-image
			"@docusaurus/plugin-ideal-image",
			{
				disableInDev: false,
				size: 750,
			},
		],
		[
			"@docusaurus/plugin-google-gtag",
			{
				trackingID: "G-E8VGH1197Y",
				anonymizeIP: false,
			},
		],
		[
			"@docusaurus/plugin-client-redirects",
			{
				redirects: [
					// DEPRECATED: 2024-04-01
					{
						from: "/docs/linux/linux-tools/zsh-and-utility",
						to: "/docs/lang/etc/command-line-tools/utility",
					},
					{
						from: "/docs/lang/cpp/build/cpp-cmake",
						to: "/docs/lang/cpp/build/cmake",
					},
					// DEPRECATED: 2024-05-01
					{
						from: "/docs/linux/linux-tools/git/git-basics",
						to: "/docs/lang/etc/command-line-tools/git",
					},
					{
						from: "/docs/linux/linux-tools/git/git-commit-message",
						to: "/docs/lang/etc/command-line-tools/commit-message",
					},
					{
						from: "/docs/linux/linux-tools/git/git-fork-pull-request",
						to: "/docs/lang/etc/command-line-tools/fork-pull-request",
					},
				],
			},
		],
		["@easyops-cn/docusaurus-search-local", { hashed: true }],
		"docusaurus-plugin-image-zoom",
	],
	stylesheets: [
		{
			href: "https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css",
			type: "text/css",
			integrity: "sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM",
			crossorigin: "anonymous",
		},
	],
	/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
	themeConfig: {
		colorMode: {
			defaultMode: "dark",
			respectPrefersColorScheme: true,
		},
		footer: {
			style: "dark",
			copyright: `Copyright © 2020-${new Date().getFullYear()} HandS. Built with Docusaurus.`,
		},
		googleAdsense: {
			dataAdClient: "ca-pub-5199357432848758",
		},
		navbar: {
			title: "loliot",
			logo: {
				alt: "loliot Logo",
				src: "img/logo.svg",
			},
			items: (() => {
				const links = {
					Programming: {
						Design: "design",
						"C++": "cpp",
						Go: "go",
						Rust: "rust",
						Python: "python",
						Database: "db",
						JavaScript: "javascript",
						Flutter: "flutter",
						ShellScript: "shellscript",
						LabVIEW: "labview",
						Etc: "programmingetc",
					},
					MLOps: {
						MLOps: "mlops",
						NueralNetwork: "nn",
					},
					Linux: {
						Package: "linux-package",
						Kernel: "linux-kernel",
						Tools: "linux-tools",
						"u-boot": "linux-uboot",
					},
					MCU: {
						STM32: "stm32",
						AVR: "avr",
						Arduino: "arduino",
						Espressif: "espressif",
						SAM: "sam",
						Infineon: "infineon",
						Nordic: "nordic",
					},
					Etc: {
						BioChemistry: "biochemistry",
						Circuit: "circuit",
						Memo: "memo",
						Project: "project",
					},
				};

				return Object.entries(links)
					.map(([key, categories]) => {
						return {
							type: "dropdown",
							label: key,
							position: "left",
							items: Object.entries(categories).map(([label, to]) => {
								return {
									type: "docSidebar",
									label: label,
									sidebarId: to,
								};
							}),
						};
					})
					.concat([
						{
							href: "https://www.linkedin.com/in/hyeonki-hong/",
							position: "right",
							className: "header-linkedin-link",
							"aria-label": "LinkedIn",
						},
						{
							href: "https://github.com/hhk7734/wiki.loliot.net",
							position: "right",
							className: "header-github-link",
							"aria-label": "GitHub",
						},
					]);
			})(),
		},
		prism: {
			// https://prismjs.com/#supported-languages
			// https://github.com/FormidableLabs/prism-react-renderer/blob/prism-react-renderer%402.1.0/packages/generate-prism-languages/index.ts
			additionalLanguages: [
				"apacheconf",
				"awk",
				"bash",
				"bnf",
				"cmake",
				"dart",
				"docker",
				"hcl",
				"http",
				"ignore",
				"ini",
				"json",
				"nginx",
				"promql",
				"protobuf",
				"sql",
				"toml",
				"yaml",
			],
			theme: themes.nightOwlLight,
			darkTheme: themes.vsDark,
		},
		tableOfContents: {
			minHeadingLevel: 2,
			maxHeadingLevel: 5,
		},
		docs: {
			sidebar: {
				hideable: true,
				autoCollapseCategories: true,
			},
		},
		mermaid: {
			theme: { light: "base", dark: "dark" },
		},
		zoom: {
			selector: ".markdown :not(em) > img",
			background: {
				light: "rgb(255, 255, 255, .5)",
				dark: "rgb(50, 50, 50, .5)",
			},
			config: {
				// options you can specify via https://github.com/francoischalifour/medium-zoom#usage
				margin: 24,
				scrollOffset: 200,
			},
		},
	},
	presets: [
		[
			"@docusaurus/preset-classic",
			/** @type {import('@docusaurus/preset-classic').Options} */
			{
				docs: {
					sidebarPath: require.resolve("./sidebars.js"),
					showLastUpdateTime: true,
					remarkPlugins: [remarkMath],
					rehypePlugins: [[rehypeKatex, { strict: false }]],
				},
				theme: {
					customCss: require.resolve("./src/css/custom.css"),
				},
				sitemap: {
					changefreq: "weekly",
					priority: 0.5,
				},
				googleAnalytics: {
					trackingID: "UA-82937088-4",
					anonymizeIP: true,
				},
			},
		],
	],
	// i18n: {
	//   defaultLocale: "en",
	//   locales: Object.keys(LocaleConfigs),
	//   localeConfigs: LocaleConfigs,
	// },
};

export default config;
