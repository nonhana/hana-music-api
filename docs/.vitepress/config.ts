import { withMermaid } from 'vitepress-plugin-mermaid'

import { apiNavLink, apiSidebar } from './sidebar.generated.ts'

export default withMermaid({
  base: '/docs/',
  lang: 'zh-CN',
  title: 'hana-music-api',
  description: 'hana-music-api 接口文档与使用说明。',
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/docs/logo.svg' }]],
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      apiNavLink,
      { text: '更新日志', link: '/changelog' },
      {
        text: 'GitHub',
        link: 'https://github.com/nonhana/hana-music-api/blob/master/CHANGELOG.md',
      },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '上手指南',
          items: [
            { text: '什么是 hana-music-api', link: '/guide/what-is-hana-music-api' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '认证机制', link: '/guide/authentication' },
            { text: '调用约定', link: '/guide/request-convention' },
            { text: '编程式调用', link: '/guide/programmatic-api' },
            { text: 'SDK 使用边界', link: '/guide/sdk-package-contract' },
          ],
        },
        {
          text: '请求层进阶',
          items: [
            { text: '请求层架构总览', link: '/guide/request-layer-overview' },
            { text: '执行配置完整参考', link: '/guide/config-reference' },
            { text: '加密模式', link: '/guide/crypto-modes' },
            { text: '自定义 fetcher', link: '/guide/custom-fetcher' },
            { text: '重试、超时与连接策略', link: '/guide/retry-timeout-resilience' },
            { text: '调试与可观测性', link: '/guide/observability' },
            { text: '运行时状态与身份伪装', link: '/guide/runtime-identity' },
            { text: 'SDK 缓存与身份池', link: '/guide/sdk-cache-and-identity-pool' },
            { text: '直接使用请求原语', link: '/guide/create-request-and-create-option' },
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
    socialLinks: [{ icon: 'github', link: 'https://github.com/nonhana/hana-music-api' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present non_hana',
    },
  },
})
