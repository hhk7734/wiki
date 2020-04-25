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
      links: [
        {
          to: "/docs/lang/cpp/libraries/cpp-stl",
          label: "Programming",
          position: "left",
          items: [
            {
              label: "C/C++",
              to: "/docs/lang/cpp/libraries/cpp-stl",
            },
            {
              label: "Python",
              to: "/docs/lang/python/libraries/python-logging",
            },
          ],
        },
        {
          href: "https://github.com/hhk7734",
          label: "GitHub",
          position: "right",
        },
      ],
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
