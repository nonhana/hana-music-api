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
    description: '发起请求并查看返回结果。',
    id: 'request-debug',
    title: '接口',
  },
  {
    description: '扫码登录并查看当前状态。',
    id: 'auth',
    title: '登录',
  },
  {
    description: '上传图片并查看处理结果。',
    id: 'upload',
    title: '上传',
  },
  {
    description: '上传音频并查看识别结果。',
    id: 'experiments',
    title: '音频识别',
  },
] as const satisfies readonly DemoGroupDefinition[]

export const demoPages = [
  {
    description: '浏览全部功能入口。',
    groupId: 'request-debug',
    path: '/demo',
    status: 'ready',
    summary: '查看搜索、登录、上传和识别功能。',
    title: '首页',
  },
  {
    description: '填写 URI、加密方式和请求体后直接发送请求。',
    groupId: 'request-debug',
    path: '/demo/api-debug',
    status: 'ready',
    summary: '查看请求内容与返回结果。',
    title: 'API 请求',
  },
  {
    description: '按关键词搜索歌曲、专辑、歌手、歌单或用户。',
    groupId: 'request-debug',
    path: '/demo/search',
    status: 'ready',
    summary: '查看请求地址与搜索结果。',
    title: '搜索',
  },
  {
    description: '生成二维码并查看当前登录状态。',
    groupId: 'auth',
    path: '/demo/qr-login',
    status: 'ready',
    summary: '扫码后自动同步 Cookie。',
    title: '扫码登录',
  },
  {
    description: '读取歌单当前封面并上传新图片。',
    groupId: 'upload',
    path: '/demo/upload/playlist-cover',
    status: 'ready',
    summary: '支持预览封面和查看返回结果。',
    title: '歌单封面',
  },
  {
    description: '上传音频片段并识别歌曲，可选混入麦克风。',
    groupId: 'experiments',
    path: '/demo/experiments/audio-match',
    status: 'ready',
    summary: '查看波形、日志和识别结果。',
    title: '听歌识曲',
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
