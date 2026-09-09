const fs = require('node:fs');
const path = require('node:path');
const guide = require('./docs.json');

module.exports = {
  title: guide.name,
  tagline: guide.description,
  favicon: 'img/favicon.svg',
  url: process.env.GUIDE_SITE_URL || 'https://wondermove-inc.github.io',
  baseUrl: process.env.GUIDE_BASE_URL || '/clawpod-guide/',
  organizationName: 'Wondermove-Inc',
  projectName: 'clawpod-guide',
  trailingSlash: true,
  onBrokenLinks: 'throw',
  onDuplicateRoutes: 'throw',
  markdown: { hooks: { onBrokenMarkdownLinks: 'throw', onBrokenMarkdownImages: 'throw' } },
  i18n: { defaultLocale: 'ko', locales: ['ko'] },
  presets: [
    ['classic', {
      docs: {
        path: '.',
        routeBasePath: '/',
        sidebarPath: require.resolve('./sidebars.js'),
        include: ['*.md', '*.mdx', 'admin/**/*.mdx', 'capabilities/**/*.mdx', 'concepts/**/*.mdx', 'guides/**/*.mdx', 'help/**/*.mdx', 'start/**/*.mdx', 'workspace-files/**/*.mdx', '_templates/**/*.mdx'],
        exclude: ['README.md'],
        numberPrefixParser: false,
      },
      blog: false,
      pages: false,
      theme: { customCss: require.resolve('./src/css/custom.css') },
    }],
  ],
  plugins: [function publicGuideFiles() {
    return {
      name: 'public-guide-files',
      async postBuild({ outDir }) {
        // Keep raw Markdown URLs in llms.txt valid without moving MCP source files.
        const references = fs.readFileSync(path.join(__dirname, 'llms.txt'), 'utf8');
        const documentPages = guide.navigation.groups.flatMap((group) => group.pages);
        const previousPages = require('./scripts/public-compatibility-pages.json');
        const files = new Set([
          'llms.txt', 'guide-index.json', 'AGENTS.md', 'DOCUMENTATION.md', 'README.md',
          ...documentPages.map((page) => `${page}.mdx`),
          ...previousPages.map((page) => `${page}.mdx`),
          '_templates/task-guide.mdx', '_templates/capability-guide.mdx',
        ]);
        for (const match of references.matchAll(/\]\(\.\/([^\s)]+)\)/g)) files.add(match[1]);
        for (const file of files) {
          const target = path.join(outDir, file);
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.copyFileSync(path.join(__dirname, file), target);
        }
      },
    };
  }],
  themeConfig: {
    colorMode: { defaultMode: 'light', respectPrefersColorScheme: true },
    navbar: {
      title: 'ClawPod 가이드',
      items: [
        { type: 'docSidebar', sidebarId: 'guideSidebar', label: '사용 가이드', position: 'left' },
        { href: 'https://github.com/Wondermove-Inc/clawpod-guide', label: 'GitHub', position: 'right' },
        { type: 'search', position: 'right' },
      ],
    },
    footer: { style: 'light', copyright: 'ClawPod 사용자 가이드' },
  },
};
