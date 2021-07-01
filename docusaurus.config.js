const path = require('path');
const _fs = require('fs');
const remarkMath = require('remark-math');
const rehypeKatex = require('rehype-katex');

// const LocaleConfigs = {
//   en: {
//     label: "English",
//   },
//   ko: {
//     label: "한국어",
//   },
// };

module.exports = {
  title: 'loliot',
  tagline: 'loliot',
  url: 'https://wiki.loliot.net',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'HandS',
  projectName: 'wiki.loliot.net',
  plugins: ['docusaurus-plugin-google-adsense'],
  stylesheets: [
    {
      href: '/katex/v0.13.9/katex.min.css',
      type: 'text/css',
    },
  ],
  themeConfig: {
    algolia: {
      apiKey: '882821d106ded887254b7b5ec5690c5b',
      indexName: 'liliot_wiki',
    },
    colorMode: {
      defaultMode: 'light',
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} HandS. Built with Docusaurus.`,
    },
    googleAnalytics: {
      trackingID: 'UA-82937088-4',
      anonymizeIP: true,
    },
    googleAdsense: {
      dataAdClient: 'ca-pub-5199357432848758',
    },
    navbar: {
      title: 'loliot',
      logo: {
        alt: 'loliot Logo',
        src: 'img/logo.svg',
      },
      items: (() => {
        const links = [];

        const sidebarConfig = require('./sidebars');
        const labelDic = {
          etc: 'Etc',
          circuit: 'Circuit',
          memo: 'Memo',
          project: 'Project',
          //
          lang: 'Programming',
          cpp: 'C++',
          flutter: 'Flutter',
          labview: 'LabVIEW',
          nodejs: 'Node.js',
          python: 'Python',
          //
          linux: 'Linux',
          'debian-package': 'Debian package',
          'linux-kernel': 'Linux kernel',
          'linux-tools': 'Linux tools',
          'linux-uboot': 'u-boot',
          //
          mcu: 'MCU',
          arduino: 'Arduino',
          avr: 'AVR',
          espressif: 'Espressif',
          infineon: 'Infineon',
          nordic: 'Nordic',
          sam: 'SAM',
          stm32: 'STM32',
          //
          mlops: 'MLOps',
          nn: 'NN',
          basics: 'Basics',
        };

        _fs
          .readdirSync(path.join(path.dirname(__filename), 'docs'))
          .map((rootDir) => {
            // rootDir => /docs/lang, /docs/mcu, ...
            const link = {
              label: labelDic[rootDir],
              position: 'left',
              items: [],
            };

            _fs
              .readdirSync(path.join(path.dirname(__filename), 'docs', rootDir))
              .map((subDir, subIndex) => {
                // subDir => /docs/lang/cpp, /docs/mcu/infineon, ...
                link.items.push({
                  label: labelDic[subDir],
                  to: '',
                });

                // sub link
                let linkPath;
                let item = sidebarConfig[subDir][0];
                while (typeof item === 'object') {
                  item = item['items'][0];
                }

                linkPath = `/docs/${item}`;

                link.items[subIndex]['to'] = linkPath;

                // root link == first sub link
                if (subIndex === 0) link['to'] = linkPath;
              });
            links.push(link);
          });

        // right
        // links.push({
        //   type: "localeDropdown",
        //   position: "right",
        // });

        links.push({
          href: 'https://github.com/hhk7734/wiki.loliot.net',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub',
        });

        return links;
      })(),
    },
    prism: {
      // https://prismjs.com/#supported-languages
      additionalLanguages: [
        'apacheconf',
        'bnf',
        'cmake',
        'dart',
        'ini',
        'nginx',
        'yaml',
      ],
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          showLastUpdateTime: true,
          remarkPlugins: [remarkMath],
          rehypePlugins: [[rehypeKatex, { strict: false }]],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
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
