import type { Config } from "@docusaurus/types";
import type { NavbarItem } from "@docusaurus/theme-common";
import { EnumChangefreq } from "sitemap";
import type * as Preset from "@docusaurus/preset-classic";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { themes } from "prism-react-renderer";
import tailwindPlugin from "./plugins/tailwind-config";
import { navbarItems } from "./navbar";

const config: Config = {
	title: "lol-IoT by HHK",
	tagline: "lol-IoT",
	favicon: "img/favicon.ico",

	url: "https://wiki.loliot.net",
	baseUrl: "/",

	organizationName: "hhk7734",
	projectName: "wiki.loliot.net",
	deploymentBranch: "main",
	trailingSlash: false,

	onBrokenLinks: "throw",
	onBrokenMarkdownLinks: "warn",

	i18n: {
		defaultLocale: "ko",
		locales: ["ko"],
	},

	markdown: {
		mermaid: true,
	},
	themes: ["@docusaurus/theme-mermaid"],

	presets: [
		[
			"classic",
			{
				docs: {
					sidebarPath: "./sidebars.ts",
					showLastUpdateTime: true,
					remarkPlugins: [remarkMath],
					rehypePlugins: [[rehypeKatex, { strict: false }]],
					editUrl: "https://github.com/hhk7734/wiki/tree/main",
				},
				theme: {
					customCss: "./src/css/custom.css",
				},
				sitemap: {
					changefreq: EnumChangefreq.WEEKLY,
					priority: 0.5,
				},
				googleAnalytics: {
					trackingID: "UA-82937088-4",
					anonymizeIP: true,
				},
			} satisfies Preset.Options,
		],
	],

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
		["@easyops-cn/docusaurus-search-local", { hashed: true }],
		"docusaurus-plugin-image-zoom",
		tailwindPlugin,
	],
	scripts: [
		{
			src: "https://www.draw.io/js/viewer.min.js",
			async: true,
		},
	],
	stylesheets: [
		{
			href: "https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css",
			type: "text/css",
			integrity: "sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM",
			crossorigin: "anonymous",
		},
	],

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
			title: "lol-IoT",
			logo: {
				alt: "lol-IoT Logo",
				src: "img/logo.svg",
			},
			items: (() => {
				return navbarItems.concat([
					{
						"aria-label": "LinkedIn",
						href: "https://www.linkedin.com/in/hyeonki-hong/",
						position: "right",
						className: "header-linkedin-link",
					},
					{
						"aria-label": "GitHub",
						href: "https://github.com/hhk7734/wiki",
						position: "right",
						className: "header-github-link",
					},
				]);
			})(),
		},
		prism: {
			// https://prismjs.com/#supported-languages
			// https://github.com/FormidableLabs/prism-react-renderer/blob/e6d323332b0363a633407fabab47b608088e3a4d/packages/generate-prism-languages/index.ts#L9-L25
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
				"lua",
				"makefile",
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
			options: {
				// https://github.com/mermaid-js/mermaid/blob/master/packages/mermaid/src/config.type.ts
				look: "handDrawn",
			},
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
	} satisfies Preset.ThemeConfig,
};

export default config;
