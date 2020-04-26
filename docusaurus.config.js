const path = require("path");
const _fs = require("fs");

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
    "@docusaurus/plugin-sitemap",
    {
      cacheTime: 600 * 1000, // 600 sec - cache purge period
      changefreq: "weekly",
      priority: 0.5,
    },
  ],
  themeConfig: {
    googleAnalytics: {
      trackingID: "UA-82937088-4",
      anonymizeIP: true,
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
        const labelDic = { lang: "Programming", cpp: "C++", python: "Python" };

        _fs
          .readdirSync(path.join(path.dirname(__filename), "docs"))
          .map((rootDir) => {
            const link = {
              label: labelDic[rootDir],
              position: "left",
              items: [],
            };

            _fs
              .readdirSync(path.join(path.dirname(__filename), "docs", rootDir))
              .map((subDir, subIndex) => {
                link.items.push({
                  label: labelDic[subDir],
                  to: "",
                });
                if (subIndex === 0)
                  link["to"] = `/docs/${sidebarConfig[subDir][0]["items"][0]}`;
                link.items[subIndex][
                  "to"
                ] = `/docs/${sidebarConfig[subDir][0]["items"][0]}`;
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
        defaultDarkMode: true,
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          showLastUpdateTime: true,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
