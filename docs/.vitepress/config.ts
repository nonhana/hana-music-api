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
      { text: '指南', link: '/guide/getting-started' },
      apiNavLink,
      {
        text: '更新日志',
        link: 'https://github.com/nonhana/hana-music-api/blob/master/CHANGELOG.md',
      },
      {
        text: 'GitHub',
        link: 'https://github.com/nonhana/hana-music-api/',
      },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            {
              text: '什么是 hana-music-api',
              link: '/guide/what-is-hana-music-api',
            },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '编程式调用', link: '/guide/programmatic-api' },
            { text: '返回体结构', link: '/guide/response-bodies' },
            { text: '认证机制', link: '/guide/authentication' },
            { text: 'HTTP 调用约定', link: '/guide/request-convention' },
            { text: '部署 HTTP 服务', link: '/guide/server-deployment' },
            { text: 'SDK 使用边界', link: '/guide/sdk-package-contract' },
          ],
        },
        {
          text: '请求配置进阶',
          items: [
            { text: '执行配置参考', link: '/guide/config-reference' },
            { text: '加密模式', link: '/guide/crypto-modes' },
            { text: '自定义 fetcher', link: '/guide/custom-fetcher' },
            {
              text: '重试、超时与连接策略',
              link: '/guide/retry-timeout-resilience',
            },
            { text: '调试与可观测性', link: '/guide/observability' },
            { text: '运行时状态与身份', link: '/guide/runtime-identity' },
            {
              text: 'SDK 缓存与身份池',
              link: '/guide/sdk-cache-and-identity-pool',
            },
            {
              text: '直接使用底层请求',
              link: '/guide/create-request-and-create-option',
            },
          ],
        },
        {
          text: '内部架构',
          items: [
            {
              text: 'hana-music-api 架构详解',
              link: '/guide/request-layer-overview',
            },
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
