const path = require("path");
const _fs = require("fs");
const remarkMath = require("remark-math");
const rehypeKatex = require("rehype-katex");

module.exports = {
  title: "loliot",
  tagline: "loliot",
  url: "https://wiki.loliot.net",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "HandS",
  projectName: "wiki.loliot.net",
  plugins: [
    "@docusaurus/plugin-google-analytics",
    "docusaurus-plugin-google-adsense",
  ],
  themeConfig: {
    googleAnalytics: {
      trackingID: "UA-82937088-4",
      anonymizeIP: true,
    },
    googleAdsense: {
      dataAdClient: "ca-pub-5199357432848758",
    },
    defaultDarkMode: false,
    algolia: {
      apiKey: "882821d106ded887254b7b5ec5690c5b",
      indexName: "liliot_wiki",
    },
    navbar: {
      title: "loliot",
      logo: {
        alt: "loliot Logo",
        src: "img/logo.svg",
      },
      links: (() => {
        const links = [];

        const sidebarConfig = require("./sidebars");
        const labelDic = {
          arduino: "Arduino",
          avr: "AVR",
          cpp: "C++",
          circuit: "Circuit",
          "debian-package": "Debian package",
          etc: "Etc",
          flutter: "Flutter",
          infineon: "Infineon",
          labview: "LabVIEW",
          lang: "Programming",
          linux: "Linux",
          "linux-kernel": "Linux kernel",
          "linux-tools": "Linux tools",
          "linux-uboot": "u-boot",
          mcu: "MCU",
          memo: "Memo",
          nodejs: "Node.js",
          project: "Project",
          python: "Python",
          stm32: "STM32",
        };

        _fs
          .readdirSync(path.join(path.dirname(__filename), "docs"))
          .map((rootDir) => {
            // rootDir => /docs/lang, /docs/mcu, ...
            const link = {
              label: labelDic[rootDir],
              position: "left",
              items: [],
            };

            _fs
              .readdirSync(path.join(path.dirname(__filename), "docs", rootDir))
              .map((subDir, subIndex) => {
                // subDir => /docs/lang/cpp, /docs/mcu/infineon, ...
                link.items.push({
                  label: labelDic[subDir],
                  to: "",
                });

                // sub link
                let linkPath;
                let item = sidebarConfig[subDir][0];
                while (typeof item === "object") {
                  item = item["items"][0];
                }

                linkPath = `/docs/${item}`;

                link.items[subIndex]["to"] = linkPath;

                // root link == first sub link
                if (subIndex === 0) link["to"] = linkPath;
              });
            links.push(link);
          });

        links.push({
          href: "https://github.com/hhk7734/wiki.loliot.net",
          label: "GitHub",
          position: "right",
        });
        return links;
      })(),
    },
    footer: {
      style: "dark",
      copyright: `Copyright © ${new Date().getFullYear()} HandS. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          showLastUpdateTime: true,
          remarkPlugins: [remarkMath],
          rehypePlugins: [[rehypeKatex, {strict: false}]],
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        sitemap: {
          cacheTime: 600 * 1000, // 600 sec - cache purge period
          changefreq: "weekly",
          priority: 0.5,
        },
      },
    ],
  ],
};
