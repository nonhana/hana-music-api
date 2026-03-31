import { defineConfig } from 'vitepress'

import { apiNavLink, apiSidebar } from './sidebar.generated.ts'

export default defineConfig({
  lang: 'zh-CN',
  title: 'hana-music-api',
  description: '网易云音乐 API 的 Bun + TypeScript + Hono 重写版本文档站点。',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      apiNavLink,
      { text: '更新日志', link: '/changelog' },
      { text: 'GitHub', link: 'https://github.com/nonhana/hana-music-api' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '上手指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '认证机制', link: '/guide/authentication' },
            { text: '调用约定', link: '/guide/request-convention' },
            { text: '编程式调用', link: '/guide/programmatic-api' },
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
      message:
        '文档内容综合整理自当前 TypeScript 模块实现与历史接口资料，若存在差异请以当前源码为准。',
      copyright: '© 2026 hana-music-api contributors',
    },
  },
})
