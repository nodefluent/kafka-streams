module.exports = {
  title: 'Kafka streams',
  tagline: 'equivalent to kafka-streams 🐙 for nodejs ✨🐢🚀✨',
  url: 'https://nodefluent.github.io',
  baseUrl: '/kafka-streams/',
  onBrokenLinks: 'throw',
  favicon: '🐙',
  organizationName: 'nodefluent', // Usually your GitHub org/user name.
  projectName: 'kafka-streams', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Kafka Streams 🐙',
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://github.com/nodefluent/kafka-streams',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Get Started',
              to: 'docs/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()}. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: 'quickStart',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/nodefluent/kafka-streams/tree/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
