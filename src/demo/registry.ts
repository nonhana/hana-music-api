export type DemoPageStatus = 'ready' | 'planned'

export interface DemoGroupDefinition {
  readonly description: string
  readonly id: string
  readonly title: string
}

export interface DemoPageDefinition {
  readonly description: string
  readonly groupId: DemoGroupDefinition['id']
  readonly path: string
  readonly status: DemoPageStatus
  readonly summary: string
  readonly title: string
}

export const demoGroups = [
  {
    description: '围绕接口探查、请求拼装和响应查看的页面。',
    id: 'request-debug',
    title: '请求调试',
  },
  {
    description: '围绕登录态观察、二维码轮询和本地 Cookie 暂存的页面。',
    id: 'auth',
    title: '登录调试',
  },
  {
    description: '围绕 multipart 上传、资源预览和上传结果校验的页面。',
    id: 'upload',
    title: '上传调试',
  },
  {
    description: '复杂浏览器能力或仍在迁移中的实验页。',
    id: 'experiments',
    title: '实验页面',
  },
] as const satisfies readonly DemoGroupDefinition[]

export const demoPages = [
  {
    description: '统一入口、迁移状态与页面导航。',
    groupId: 'request-debug',
    path: '/demo',
    status: 'ready',
    summary: '查看本地调试页分组、迁移进度和入口说明。',
    title: 'Demo 首页',
  },
  {
    description: '直接构造 `/api` 请求并查看原始 JSON 响应。',
    groupId: 'request-debug',
    path: '/demo/api-debug',
    status: 'ready',
    summary: '适合验证 `uri`、`crypto` 和任意 JSON 请求体。',
    title: 'API Debug',
  },
  {
    description: '对 `/search` 发起常用搜索请求并查看结果。',
    groupId: 'request-debug',
    path: '/demo/search',
    status: 'ready',
    summary: '替代旧 `home.html` 的轻量查询入口，保留 Cookie 注入能力。',
    title: 'Search Probe',
  },
  {
    description: '生成二维码、轮询登录状态并管理本地调试 Cookie。',
    groupId: 'auth',
    path: '/demo/qr-login',
    status: 'ready',
    summary: '统一替代 `qrlogin.html` 与 `qrlogin-nocookie.html`。',
    title: 'QR Login',
  },
  {
    description: '读取歌单封面、上传新图片并观察返回数据。',
    groupId: 'upload',
    path: '/demo/upload/playlist-cover',
    status: 'ready',
    summary: '首批代表性上传页，覆盖 playlist cover 更新链路。',
    title: 'Playlist Cover Upload',
  },
  {
    description: '重浏览器能力页，保留为后续单独迁移专题。',
    groupId: 'experiments',
    path: '/demo/experiments/audio-match',
    status: 'planned',
    summary: '当前只提供占位说明，后续再恢复音频指纹与麦克风采集能力。',
    title: 'Audio Match',
  },
] as const satisfies readonly DemoPageDefinition[]

export function getDemoPageByPath(path: string): DemoPageDefinition | undefined {
  return demoPages.find((page) => page.path === path)
}

export function getGroupedDemoPages(): Array<{
  readonly group: DemoGroupDefinition
  readonly pages: DemoPageDefinition[]
}> {
  return demoGroups.map((group) => ({
    group,
    pages: demoPages.filter((page) => page.groupId === group.id),
  }))
}

export function getReadyDemoPages(): DemoPageDefinition[] {
  return demoPages.filter((page) => page.status === 'ready' && page.path !== '/demo')
}
