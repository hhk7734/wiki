const remarkMath = require("remark-math");
const mdxMermaid = require("mdx-mermaid");
const rehypeKatex = require("rehype-katex");

// const LocaleConfigs = {
//   en: {
//     label: "English",
//   },
//   ko: {
//     label: "한국어",
//   },
// };

module.exports = {
  title: "loliot",
  tagline: "loliot",
  url: "https://wiki.loliot.net",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "HandS",
  projectName: "wiki.loliot.net",
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
  ],
  stylesheets: [
    {
      href: "/katex/v0.13.9/katex.min.css",
      type: "text/css",
    },
  ],
  themeConfig: {
    algolia: {
      appId: "F91YRZWXMW",
      apiKey: "1531ea4b9a0f7187475dcdab1839fb21",
      indexName: "liliot_wiki",
    },
    colorMode: {
      defaultMode: "light",
      respectPrefersColorScheme: true,
    },
    footer: {
      style: "dark",
      copyright: `Copyright © ${new Date().getFullYear()} HandS. Built with Docusaurus.`,
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
        links = {
          Programming: {
            Design: "design",
            "C++": "cpp",
            Go: "go",
            Python: "python",
            Database: "db",
            JavaScript: "javascript",
            Flutter: "flutter",
            ShellScript: "shellscript",
            LabVIEW: "labview",
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
          .concat({
            href: "https://github.com/hhk7734/wiki.loliot.net",
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub",
          });
      })(),
    },
    prism: {
      // https://prismjs.com/#supported-languages
      additionalLanguages: [
        "apacheconf",
        "bnf",
        "cmake",
        "dart",
        "docker",
        "hcl",
        "http",
        "ini",
        "nginx",
        "protobuf",
        "sql",
        "yaml",
      ],
      theme: require("prism-react-renderer/themes/nightOwlLight"),
      darkTheme: require("prism-react-renderer/themes/vsDark"),
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
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          showLastUpdateTime: true,
          remarkPlugins: [remarkMath, mdxMermaid],
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
