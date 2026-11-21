import { withMermaid } from 'vitepress-plugin-mermaid';

import { apiNavLink, apiSidebar } from './sidebar.generated.ts';

const docsBase = normalizeDocsBase(process.env.DOCS_BASE);

export default withMermaid({
  base: docsBase,
  lang: 'zh-CN',
  title: 'hana-music-api',
  description: 'hana-music-api 接口文档与使用说明。',
  mermaid: {
    flowchart: { useMaxWidth: false },
    sequence: { useMaxWidth: false },
  },
  head: [
    [
      'link',
      { rel: 'icon', type: 'image/svg+xml', href: `${docsBase}logo.svg` },
    ],
  ],
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/introduction' },
      apiNavLink,
      { text: '升级指南', link: '/guide/migrating-to-v7' },
      {
        text: '更新日志',
        link: 'https://github.com/nonhana/hana-music-api/blob/main/CHANGELOG.md',
      },
      {
        text: 'GitHub',
        link: 'https://github.com/nonhana/hana-music-api/',
      },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '起步',
          items: [
            { text: '简介', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '导出入口与运行环境', link: '/guide/package-exports' },
          ],
        },
        {
          text: 'SDK 指南',
          items: [
            { text: '调用方式', link: '/guide/sdk-usage' },
            { text: '认证与登录', link: '/guide/authentication' },
            { text: '返回值与错误处理', link: '/guide/error-handling' },
            { text: '执行配置参考', link: '/guide/config' },
          ],
        },
        {
          text: '进阶用法',
          items: [
            { text: '超时、重试与限流', link: '/guide/resilience' },
            {
              text: '缓存、请求去重与身份池',
              link: '/guide/cache-and-identity-pool',
            },
            { text: '运行时状态与设备身份', link: '/guide/runtime-identity' },
            { text: '代理与自定义 fetcher', link: '/guide/proxy-and-fetcher' },
            { text: '调试与事件观测', link: '/guide/observability' },
            { text: '浏览器 Watchman', link: '/guide/watchman' },
            { text: '底层请求与加密协议', link: '/guide/low-level-request' },
          ],
        },
        {
          text: 'HTTP 服务',
          items: [
            { text: 'HTTP 调用约定', link: '/guide/http-conventions' },
            { text: '部署与服务配置', link: '/guide/http-deployment' },
          ],
        },
        {
          text: '架构与升级',
          items: [
            { text: '架构与数据流', link: '/guide/architecture' },
            { text: '从 6.x 升级到 7.x', link: '/guide/migrating-to-v7' },
          ],
        },
      ],
      '/api/': apiSidebar,
    },
    search: {
      provider: 'local',
    },
    outline: {
      level: [2, 3],
      label: '本页导航',
    },
    lastUpdated: {
      text: '最后更新',
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/nonhana/hana-music-api' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present non_hana',
    },
  },
});

function normalizeDocsBase(base?: string): string {
  if (!base) {
    return '/docs/';
  }

  if (base === '/') {
    return '/';
  }

  return `/${base.replace(/^\/+|\/+$/g, '')}/`;
}
