import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseModuleRoute } from '../src/server/module-loader.ts'

type CategoryDefinition = {
  slug: string
  text: string
  description: string
}

type HeadingBlock = {
  level: number
  rawTitle: string
  title: string
  startLine: number
  endLine: number
  content: string
  routes: string[]
}

type ParameterDefinition = {
  name: string
  required: boolean
  description: string
  type: string
  defaultValue: string
}

type ModulePage = {
  identifier: string
  route: string
  slug: string
  category: CategoryDefinition
  title: string
  description: string
  needsLogin: boolean
  parameters: ParameterDefinition[]
  httpExamples: string[]
  block?: HeadingBlock
  order: number
  pageLink: string
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDirectory, '..')
const legacyRepoRoot = resolve(repoRoot, '../netease-music-api')
const modulesDirectory = resolve(repoRoot, 'src/modules')
const docsRoot = resolve(repoRoot, 'docs')
const apiRoot = resolve(docsRoot, 'api')
const vitepressRoot = resolve(docsRoot, '.vitepress')
const legacyDocumentPath = resolve(legacyRepoRoot, 'public/docs/home.md')
const sidebarFilePath = resolve(vitepressRoot, 'sidebar.generated.ts')
const apiIndexFilePath = resolve(apiRoot, 'index.md')

const categoryDefinitions: CategoryDefinition[] = [
  { slug: 'user', text: '用户与登录', description: '登录、账户、绑定、资料和验证码相关接口。' },
  {
    slug: 'music',
    text: '歌曲与播放',
    description: '歌曲详情、播放链接、歌词、私人 FM 与喜好管理。',
  },
  { slug: 'search', text: '搜索', description: '搜索、热搜、默认词与搜索建议接口。' },
  { slug: 'playlist', text: '歌单', description: '歌单详情、更新、导入、订阅与用户歌单接口。' },
  { slug: 'album', text: '专辑', description: '专辑详情、订阅、新碟与数字专辑相关接口。' },
  { slug: 'artist', text: '歌手', description: '歌手详情、专辑、MV、热门歌曲与订阅接口。' },
  {
    slug: 'comment',
    text: '评论',
    description: '评论列表、楼层评论、点赞、抱一抱与新版评论接口。',
  },
  {
    slug: 'recommend',
    text: '推荐与发现',
    description: '推荐歌单、日推、首页发现、Banner 与相似内容接口。',
  },
  { slug: 'toplist', text: '排行榜', description: '榜单、榜单详情、新歌与 MV 排行接口。' },
  { slug: 'dj', text: '电台与播客', description: 'DJ、电台、声音、播客与 DIFM 相关接口。' },
  { slug: 'video', text: '视频与 MV', description: '视频、MV、Mlog 与相关播放地址接口。' },
  { slug: 'social', text: '社交与消息', description: '动态、关注、私信、分享、话题与点赞接口。' },
  { slug: 'cloud', text: '云盘与上传', description: '云盘、导入、匹配和上传能力。' },
  { slug: 'listen', text: '听歌记录', description: '播放记录、最近收听与听歌足迹相关接口。' },
  { slug: 'together', text: '一起听', description: '一起听房间、状态、同步与控制相关接口。' },
  { slug: 'vip', text: '会员与云贝', description: 'VIP、云贝、音乐人、签到与成长值相关接口。' },
  { slug: 'style', text: '曲风', description: '曲风列表、偏好、曲风歌单与曲风歌曲接口。' },
  { slug: 'ugc', text: '百科与用户贡献', description: '音乐百科、歌手搜索与用户贡献内容接口。' },
  { slug: 'lyrics-mark', text: '歌词摘录', description: '歌词摘录、编辑与我的歌词本接口。' },
  { slug: 'fanscenter', text: '粉丝中心', description: '粉丝中心概览、基础信息与趋势接口。' },
  { slug: 'other', text: '其他工具', description: '批量请求、国家编码、广播电台与内部工具接口。' },
]

const titleOverrides: Record<string, string> = {
  cloudsearch: '云搜索',
  register_anonimous: '游客登录',
  verify_getQr: '验证接口 - 二维码生成',
  verify_qrcodestatus: '验证接口 - 二维码检测',
}

const descriptionOverrides: Record<string, string> = {
  cloudsearch: '和搜索接口相同，但结果更完整。',
}

await main()

async function main(): Promise<void> {
  const legacyMarkdown = await readUtf8(legacyDocumentPath)
  const headingBlocks = parseHeadingBlocks(legacyMarkdown)
  const modules = await collectModuleIdentifiers(modulesDirectory)
  const routeToBlock = buildRouteToBlockMap(headingBlocks)

  const pages = modules
    .map((identifier) => buildModulePage(identifier, routeToBlock))
    .toSorted(compareModulePages)

  const linkByTitle = new Map<string, string>()
  const linkByRoute = new Map<string, string>()

  for (const page of pages) {
    linkByRoute.set(page.route, page.pageLink)
    linkByTitle.set(normalizeLookupKey(page.title), page.pageLink)
    if (page.block) {
      linkByTitle.set(normalizeLookupKey(page.block.title), page.pageLink)
    }
  }

  await rm(apiRoot, { recursive: true, force: true })
  await mkdir(apiRoot, { recursive: true })
  await mkdir(vitepressRoot, { recursive: true })

  for (const category of categoryDefinitions) {
    await mkdir(resolve(apiRoot, category.slug), { recursive: true })
  }

  for (const page of pages) {
    const filePath = resolve(apiRoot, page.category.slug, `${page.slug}.md`)
    const markdown = renderModulePage(page, linkByTitle, linkByRoute)
    await writeFile(filePath, markdown, 'utf8')
  }

  await writeFile(apiIndexFilePath, renderApiIndex(pages), 'utf8')
  await writeFile(sidebarFilePath, renderSidebarFile(pages), 'utf8')

  console.log(`Generated ${pages.length} API pages into ${relative(repoRoot, apiRoot)}`)
}

async function collectModuleIdentifiers(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const identifiers: string[] = []

  for (const entry of entries) {
    const filePath = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      identifiers.push(...(await collectModuleIdentifiers(filePath)))
      continue
    }

    if (!entry.isFile() || !entry.name.endsWith('.ts') || entry.name.startsWith('_')) {
      continue
    }

    const relativePath = relative(modulesDirectory, filePath)
    identifiers.push(relativePath.replace(/\.ts$/u, '').replaceAll('\\', '/'))
  }

  return identifiers
}

function parseHeadingBlocks(markdown: string): HeadingBlock[] {
  const normalized = markdown.replace(/\r\n/gu, '\n')
  const lines = normalized.split('\n')
  const apiStartLine = lines.findIndex((line) => line.trim() === '## 接口文档')
  const apiLines = apiStartLine === -1 ? lines : lines.slice(apiStartLine + 1)
  const headings = apiLines
    .map((line, index) => {
      const match = /^(#{3,5})\s+(.+)$/u.exec(line)
      if (!match) {
        return null
      }

      const headingHashes = match[1] ?? '###'
      const rawTitle = match[2]?.trim() ?? ''

      return {
        level: headingHashes.length,
        rawTitle,
        lineIndex: index,
      }
    })
    .filter(
      (value): value is { level: number; rawTitle: string; lineIndex: number } => value !== null,
    )

  return headings.map((heading, index) => {
    const nextHeadingIndex = headings.find((candidate, candidateIndex) => {
      return candidateIndex > index && candidate.level <= heading.level
    })
    const endLine = nextHeadingIndex ? nextHeadingIndex.lineIndex : apiLines.length
    const content = apiLines
      .slice(heading.lineIndex + 1, endLine)
      .join('\n')
      .trim()

    return {
      level: heading.level,
      rawTitle: heading.rawTitle,
      title: cleanHeadingTitle(heading.rawTitle),
      startLine: heading.lineIndex + apiStartLine + 2,
      endLine: endLine + apiStartLine + 1,
      content,
      routes: extractRoutes(content),
    }
  })
}

function buildRouteToBlockMap(blocks: HeadingBlock[]): Map<string, HeadingBlock> {
  const routeToBlocks = new Map<string, HeadingBlock[]>()

  for (const block of blocks) {
    for (const route of block.routes) {
      const matched = routeToBlocks.get(route) ?? []
      matched.push(block)
      routeToBlocks.set(route, matched)
    }
  }

  const routeToBlock = new Map<string, HeadingBlock>()
  for (const [route, candidates] of routeToBlocks) {
    const best = [...candidates].toSorted((left, right) => {
      if (left.level !== right.level) {
        return right.level - left.level
      }

      const leftSpan = left.endLine - left.startLine
      const rightSpan = right.endLine - right.startLine
      return leftSpan - rightSpan
    })[0]

    if (best) {
      routeToBlock.set(route, best)
    }
  }

  return routeToBlock
}

function buildModulePage(identifier: string, routeToBlock: Map<string, HeadingBlock>): ModulePage {
  const route = parseModuleRoute(identifier)
  const block = routeToBlock.get(route) ?? routeToBlock.get(route.toLowerCase())
  const category = resolveCategory(identifier)
  const slug = toDocSlug(identifier)
  const title = titleOverrides[identifier] ?? block?.title ?? humanizeIdentifier(identifier)
  const description =
    descriptionOverrides[identifier] ?? extractDescription(block?.content) ?? `${title} 接口文档。`
  const parameters = block ? extractParameters(block.content) : []
  const httpExamples = block ? extractHttpExamples(block.content, route) : [route]
  const needsLogin = block ? detectRequiresLogin(block.content) : false

  return {
    identifier,
    route,
    slug,
    category,
    title,
    description,
    needsLogin,
    parameters,
    httpExamples,
    block,
    order: block?.startLine ?? Number.MAX_SAFE_INTEGER,
    pageLink: `/api/${category.slug}/${slug}`,
  }
}

function resolveCategory(identifier: string): CategoryDefinition {
  const categorySlug = resolveCategorySlug(identifier)
  const fallbackCategory = categoryDefinitions[categoryDefinitions.length - 1]
  return (
    categoryDefinitions.find((category) => category.slug === categorySlug) ??
    fallbackCategory ?? {
      slug: 'other',
      text: '其他工具',
      description: '未命中分类规则的接口。',
    }
  )
}

function resolveCategorySlug(identifier: string): string {
  if (identifier.startsWith('song_lyrics_mark')) return 'lyrics-mark'
  if (identifier.startsWith('user_playlist')) return 'playlist'
  if (identifier.startsWith('user_cloud')) return 'cloud'
  if (identifier === 'user_record') return 'listen'
  if (identifier === 'user_comment_history') return 'comment'
  if (identifier === 'user_dj' || identifier === 'user_audio') return 'dj'
  if (
    identifier.startsWith('user_event') ||
    identifier.startsWith('user_follow') ||
    identifier.startsWith('user_mutualfollow')
  )
    return 'social'
  if (
    identifier.startsWith('listen_data_') ||
    identifier.startsWith('record_recent_') ||
    identifier.startsWith('recent_listen_') ||
    identifier === 'summary_annual'
  )
    return 'listen'
  if (
    identifier.startsWith('login_') ||
    identifier === 'login' ||
    identifier.startsWith('register_') ||
    identifier.startsWith('captcha_') ||
    identifier.startsWith('cellphone_') ||
    identifier.startsWith('activate_') ||
    identifier === 'logout' ||
    identifier === 'nickname_check' ||
    identifier === 'rebind' ||
    identifier === 'avatar_upload' ||
    identifier === 'setting' ||
    identifier === 'get_userids'
  )
    return 'user'
  if (identifier.startsWith('user_')) return 'user'
  if (
    identifier.startsWith('song_') ||
    identifier.startsWith('lyric') ||
    identifier === 'check_music' ||
    identifier === 'like' ||
    identifier === 'likelist' ||
    identifier === 'scrobble' ||
    identifier === 'audio_match' ||
    identifier === 'personal_fm' ||
    identifier === 'personal_fm_mode' ||
    identifier === 'fm_trash'
  )
    return 'music'
  if (identifier === 'search' || identifier.startsWith('search_') || identifier === 'cloudsearch')
    return 'search'
  if (
    identifier.startsWith('playlist_') ||
    identifier === 'top_playlist' ||
    identifier === 'top_playlist_highquality' ||
    identifier === 'related_playlist'
  )
    return 'playlist'
  if (
    identifier.startsWith('album') ||
    identifier.startsWith('digitalAlbum') ||
    identifier === 'top_album'
  )
    return 'album'
  if (
    identifier === 'artists' ||
    identifier.startsWith('artist_') ||
    identifier === 'simi_artist' ||
    identifier === 'top_artists' ||
    identifier === 'toplist_artist'
  )
    return 'artist'
  if (
    identifier === 'comment' ||
    identifier.startsWith('comment_') ||
    identifier === 'hug_comment' ||
    identifier === 'starpick_comments_summary'
  )
    return 'comment'
  if (
    identifier.startsWith('recommend_') ||
    identifier.startsWith('personalized') ||
    identifier === 'banner' ||
    identifier.startsWith('history_recommend') ||
    identifier.startsWith('homepage_') ||
    identifier.startsWith('playmode_') ||
    identifier.startsWith('program_recommend') ||
    identifier.startsWith('simi_') ||
    identifier === 'aidj_content_rcmd' ||
    identifier === 'calendar'
  )
    return 'recommend'
  if (
    identifier === 'toplist' ||
    identifier.startsWith('toplist_') ||
    identifier === 'top_list' ||
    identifier === 'top_song' ||
    identifier === 'top_mv'
  )
    return 'toplist'
  if (
    identifier.startsWith('dj') ||
    identifier.startsWith('voice_') ||
    identifier.startsWith('voicelist_') ||
    identifier === 'djRadio_top'
  )
    return 'dj'
  if (
    identifier.startsWith('mv_') ||
    identifier.startsWith('video_') ||
    identifier.startsWith('mlog_') ||
    identifier === 'related_allvideo'
  )
    return 'video'
  if (
    identifier === 'event' ||
    identifier.startsWith('event_') ||
    identifier === 'follow' ||
    identifier.startsWith('msg_') ||
    identifier.startsWith('send_') ||
    identifier === 'share_resource' ||
    identifier === 'resource_like' ||
    identifier.startsWith('topic_') ||
    identifier === 'hot_topic'
  )
    return 'social'
  if (identifier === 'cloud' || identifier.startsWith('cloud_') || identifier === 'voice_upload')
    return 'cloud'
  if (identifier.startsWith('listentogether_')) return 'together'
  if (
    identifier.startsWith('vip_') ||
    identifier.startsWith('yunbei') ||
    identifier.startsWith('musician_') ||
    identifier === 'daily_signin' ||
    identifier === 'sign_happy_info' ||
    identifier === 'signin_progress'
  )
    return 'vip'
  if (identifier.startsWith('style_')) return 'style'
  if (identifier.startsWith('ugc_')) return 'ugc'
  if (identifier.startsWith('fanscenter_')) return 'fanscenter'
  return 'other'
}

function extractRoutes(content: string): string[] {
  const routeSource =
    extractLabeledBlock(content, '接口地址') ?? extractLabeledBlock(content, '调用例子') ?? ''

  const matches = [...routeSource.matchAll(/(?<![A-Za-z0-9.])\/[-A-Za-z0-9_/]+/gu)].map(
    (match) => match[0],
  )
  return [...new Set(matches)]
}

function cleanHeadingTitle(title: string): string {
  return title
    .replace(/^\d+(?:\.\d+)*\s*[.、]\s*/u, '')
    .replace(/^[-*]\s*/u, '')
    .trim()
}

function extractDescription(content: string | undefined): string | undefined {
  if (!content) {
    return undefined
  }

  const match = content.match(/说明\s*:?\s*([^\n]+)/u)
  if (match?.[1]) {
    return sanitizeInline(match[1])
  }

  const firstMeaningfulLine = content
    .split('\n')
    .map((line) => line.trim())
    .find(
      (line) =>
        line &&
        !line.startsWith('**') &&
        !line.startsWith('```') &&
        !line.startsWith('>') &&
        !line.startsWith('`'),
    )

  return firstMeaningfulLine ? sanitizeInline(firstMeaningfulLine) : undefined
}

function extractParameters(content: string): ParameterDefinition[] {
  const parameters = [
    ...extractParametersFromSection(content, '必选参数', true),
    ...extractParametersFromSection(content, '可选参数', false),
  ]

  return dedupeParameters(parameters)
}

function extractParametersFromSection(
  content: string,
  label: string,
  required: boolean,
): ParameterDefinition[] {
  const block = extractLabeledBlock(content, label)
  if (!block) {
    return []
  }

  const lines = block.split('\n')
  const parameters: ParameterDefinition[] = []
  let current: ParameterDefinition | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line === '```') {
      continue
    }

    const backtickMatch = line.match(/^`([^`]+)`\s*:?\s*(.*)$/u)
    const plainMatch = !backtickMatch ? line.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*:?\s*(.*)$/u) : null

    const match = backtickMatch ?? plainMatch
    if (match) {
      const name = match[1]?.trim() ?? ''
      const description = sanitizeInline(match[2]?.trim() || '-')
      current = {
        name,
        required,
        description,
        type: inferParameterType(name, description),
        defaultValue: inferDefaultValue(description),
      }
      parameters.push(current)
      continue
    }

    if (current) {
      current.description = `${current.description}<br>${sanitizeInline(line)}`
      if (current.defaultValue === '-') {
        current.defaultValue = inferDefaultValue(current.description)
      }
      current.type = inferParameterType(current.name, current.description)
    }
  }

  return parameters
}

function extractLabeledBlock(content: string, label: string): string | undefined {
  const pattern = new RegExp(
    String.raw`\*\*${escapeRegExp(label)}\s*:?\*\*\s*([\s\S]*?)(?=\n\*\*[^\n]+:\*\*|\n###\s|\n####\s|\n#####\s|$)`,
    'u',
  )
  return content.match(pattern)?.[1]?.trim()
}

function dedupeParameters(parameters: ParameterDefinition[]): ParameterDefinition[] {
  const map = new Map<string, ParameterDefinition>()

  for (const parameter of parameters) {
    const key = parameter.name
    const existing = map.get(key)
    if (!existing) {
      map.set(key, parameter)
      continue
    }

    existing.required = existing.required || parameter.required
    if (existing.description === '-' && parameter.description !== '-') {
      existing.description = parameter.description
    }
    if (existing.defaultValue === '-' && parameter.defaultValue !== '-') {
      existing.defaultValue = parameter.defaultValue
    }
  }

  return [...map.values()]
}

function inferParameterType(name: string, description: string): string {
  const combined = `${name} ${description}`.toLowerCase()
  if (combined.includes('布尔') || combined.includes('true') || combined.includes('false')) {
    return 'boolean'
  }

  if (
    combined.includes('数组') ||
    combined.includes('列表') ||
    combined.includes('多个') ||
    combined.includes('用`,`隔开') ||
    combined.includes('用 `,` 隔开') ||
    combined.includes('用逗号隔开')
  ) {
    return 'string[] | string'
  }

  if (
    combined.includes('时间戳') ||
    combined.includes('页数') ||
    combined.includes('数量') ||
    combined.includes('偏移') ||
    combined.includes('码率') ||
    combined.includes('分辨率') ||
    combined.includes('时长') ||
    /(^|_)(limit|offset|page|pagesize|pageNo|pageSize|cursor|before|time|birthday|imgSize|imgX|imgY)$/u.test(
      name,
    )
  ) {
    return 'number | string'
  }

  return 'string'
}

function inferDefaultValue(description: string): string {
  const numericMatch = description.match(/默认(?:值为|为|设置了)?\s*`?(\d+(?:\.\d+)?)`?/u)
  if (numericMatch?.[1]) {
    return numericMatch[1]
  }

  const genericMatch = description.match(/默认(?:值为|为|设置了)?\s*`?([^`，。\s]+)`?/u)
  return genericMatch?.[1] ?? '-'
}

function extractHttpExamples(content: string, route: string): string[] {
  const labeled = extractLabeledBlock(content, '调用例子')
  const source = labeled ?? content
  const matches = [...source.matchAll(/(?<![A-Za-z0-9.])\/[-A-Za-z0-9_/]+(?:\?[^\s`]+)?/gu)].map(
    (match) => match[0],
  )
  const filtered = matches.filter((value) => value.startsWith(route))
  const unique = [...new Set(filtered.length > 0 ? filtered : matches)]
  return unique.length > 0 ? unique.slice(0, 4) : [route]
}

function detectRequiresLogin(content: string): boolean {
  return /登录后调用此接口|(?<!不)需要登录|需登录|授权登录成功/u.test(content)
}

function renderModulePage(
  page: ModulePage,
  linkByTitle: Map<string, string>,
  linkByRoute: Map<string, string>,
): string {
  const header = [
    '---',
    `title: ${toYamlString(page.title)}`,
    `description: ${toYamlString(page.description)}`,
    '---',
    '',
    `# ${page.title}`,
    '',
    `> ${page.description}`,
    '',
    '## 接口信息',
    '',
    '| 项目 | 值 |',
    '| --- | --- |',
    `| 接口地址 | \`${page.route}\` |`,
    '| 请求方式 | `GET` / `POST` |',
    `| 需要登录 | ${page.needsLogin ? '是' : '否'} |`,
    `| 对应模块 | \`${page.identifier}\` |`,
    `| 文档分类 | ${page.category.text} |`,
    '',
    '## 请求参数',
    '',
    renderParameterTable(page.parameters),
    '',
    '## HTTP 示例',
    '',
    '```bash',
    ...page.httpExamples.map((example) => `GET ${example}`),
    '```',
    '',
    '## 编程式调用',
    '',
    '```ts',
    ...renderProgrammaticExample(page),
    '```',
    '',
  ]

  const legacySection = page.block
    ? [
        '## 补充说明',
        '',
        rewriteInternalLinks(normalizeLegacyContent(page.block.content), linkByTitle, linkByRoute),
        '',
      ]
    : [
        '## 说明',
        '',
        '当前未在整理后的历史接口资料中找到完全对应的章节，本页内容由当前公开模块、路由和调用约定自动生成。若需要补充更精细的返回字段说明，请优先参考对应模块实现。',
        '',
      ]

  const footer = [
    '## 维护说明',
    '',
    '- 本页由脚本根据当前模块与整理后的接口说明自动生成。',
    '- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。',
    '- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。',
    '',
  ]

  return [...header, ...legacySection, ...footer].join('\n')
}

function renderParameterTable(parameters: ParameterDefinition[]): string {
  if (parameters.length === 0) {
    return '当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。'
  }

  const header = ['| 参数 | 类型 | 必填 | 默认值 | 说明 |', '| --- | --- | :---: | --- | --- |']
  const rows = parameters.map((parameter) => {
    return `| \`${escapeTableCell(parameter.name)}\` | ${escapeTableCell(parameter.type)} | ${parameter.required ? '✅' : '—'} | ${escapeTableCell(parameter.defaultValue)} | ${escapeTableCell(parameter.description)} |`
  })

  return [...header, ...rows].join('\n')
}

function renderProgrammaticExample(page: ModulePage): string[] {
  const exampleQuery = buildProgrammaticQuery(page)
  const invocation =
    exampleQuery.length > 0
      ? [
          `const result = await api.${page.identifier}({`,
          ...exampleQuery.map((line) => `  ${line}`),
          '})',
        ]
      : [`const result = await api.${page.identifier}()`]

  return [
    "import { createModuleApi } from 'hana-music-api'",
    '',
    'const api = createModuleApi()',
    '',
    ...invocation,
    '',
    'console.log(result.body)',
  ]
}

function buildProgrammaticQuery(page: ModulePage): string[] {
  const fromHttpExample = extractQueryObjectFromHttpExample(page.httpExamples[0] ?? page.route)
  if (fromHttpExample.length > 0) {
    return fromHttpExample
  }

  const sourceParameters = page.parameters.filter((parameter) => parameter.required).slice(0, 4)
  return sourceParameters.map(
    (parameter) =>
      `${parameter.name}: ${buildPlaceholderValue(parameter.name, parameter.defaultValue)},`,
  )
}

function extractQueryObjectFromHttpExample(example: string): string[] {
  const queryIndex = example.indexOf('?')
  if (queryIndex === -1) {
    return []
  }

  const queryString = example.slice(queryIndex + 1)
  const searchParams = new URLSearchParams(queryString)
  return [...searchParams.entries()].map(([key, value]) => `${key}: ${JSON.stringify(value)},`)
}

function buildPlaceholderValue(name: string, defaultValue: string): string {
  if (defaultValue !== '-' && /^\d+(?:\.\d+)?$/u.test(defaultValue)) {
    return defaultValue
  }

  if (defaultValue !== '-' && /^(true|false)$/u.test(defaultValue)) {
    return defaultValue.toLowerCase()
  }

  const numericParameterNames = new Set(['id', 'uid', 'pid', 'mvid', 'cid'])
  if (numericParameterNames.has(name)) {
    return JSON.stringify('123456')
  }

  if (/^(limit|offset|page|pageNo|pageSize|time|before|cursor)$/u.test(name)) {
    return '0'
  }

  if (name === 'phone') {
    return JSON.stringify('13800138000')
  }

  if (name === 'password' || name === 'md5_password' || name === 'captcha' || name === 'cookie') {
    return JSON.stringify(`your-${name}`)
  }

  return defaultValue !== '-' ? JSON.stringify(defaultValue) : JSON.stringify(`your-${name}`)
}

function normalizeLegacyContent(content: string): string {
  return content
    .replace(/\n##\s+(离线访问此文档|关于此文档|License)[\s\S]*$/u, '')
    .replace(/\n###\s+(离线访问此文档|关于此文档|License)[\s\S]*$/u, '')
    .replace(/^!>\s*(.+)$/gmu, '> [!WARNING] $1')
    .replace(/http:\/\/localhost:3000\/([A-Za-z0-9_.-]+)/gu, (_match, path: string) => {
      const normalizedPath = path.includes('.') ? path : `${path}.html`
      return `\`/${normalizedPath}\``
    })
    .replace(/^此文档由 \[docsify\][^\n]*$/gmu, '')
    .replace(/当前旧版文档未明确列出参数/gu, '当前整理后的接口资料未明确列出参数')
    .replace(/\n{3,}/gu, '\n\n')
    .trim()
}

function rewriteInternalLinks(
  markdown: string,
  linkByTitle: Map<string, string>,
  linkByRoute: Map<string, string>,
): string {
  return markdown.replace(/\[([^\]]+)\]\(#([^)]+)\)/gmu, (_match, text: string, anchor: string) => {
    const titleLink = linkByTitle.get(normalizeLookupKey(anchor))
    if (titleLink) {
      return `[${text}](${titleLink})`
    }

    const routeLink = linkByRoute.get(text)
    if (routeLink) {
      return `[${text}](${routeLink})`
    }

    return `[${text}](#${anchor})`
  })
}

function renderApiIndex(pages: ModulePage[]): string {
  const grouped = groupPagesByCategory(pages)
  const lines = [
    '# API 参考',
    '',
    '所有页面均由当前公开模块与整理后的接口说明自动生成。你可以按分类浏览，也可以直接使用站点搜索快速定位接口。',
    '',
    '## 分类概览',
    '',
    '| 分类 | 数量 | 说明 |',
    '| --- | ---: | --- |',
    ...categoryDefinitions.map((category) => {
      const items = grouped.get(category.slug) ?? []
      return `| [${category.text}](/api/${category.slug}/${items[0]?.slug ?? ''}) | ${items.length} | ${category.description} |`
    }),
    '',
    '## 说明',
    '',
    '- 若某一页内容较为简略，通常表示整理后的历史资料中没有更细的原始说明。',
    '- 站点中的接口地址、模块标识和页面路径以当前 `hana-music-api` 源码扫描结果为准。',
    '- 分类规则来自迁移设计文档，目的主要是让搜索和侧边栏更好用。',
    '',
  ]

  return lines.join('\n')
}

function renderSidebarFile(pages: ModulePage[]): string {
  const grouped = groupPagesByCategory(pages)
  const sidebar = categoryDefinitions.map((category) => {
    const items = grouped.get(category.slug) ?? []
    return {
      text: category.text,
      collapsed:
        category.slug !== 'user' && category.slug !== 'music' && category.slug !== 'search',
      items: items.map((page) => ({
        text: page.title,
        link: page.pageLink,
      })),
    }
  })

  const firstApiPage = pages[0]?.pageLink ?? '/api/'
  return [
    `export const apiNavLink = ${JSON.stringify({ text: 'API 参考', link: firstApiPage }, null, 2)} as const`,
    '',
    `export const apiSidebar = ${JSON.stringify(sidebar, null, 2)} as const`,
    '',
  ].join('\n')
}

function groupPagesByCategory(pages: ModulePage[]): Map<string, ModulePage[]> {
  const grouped = new Map<string, ModulePage[]>()

  for (const category of categoryDefinitions) {
    grouped.set(category.slug, [])
  }

  for (const page of pages) {
    const list = grouped.get(page.category.slug)
    if (list) {
      list.push(page)
    }
  }

  return grouped
}

function compareModulePages(left: ModulePage, right: ModulePage): number {
  const leftCategoryIndex = categoryDefinitions.findIndex(
    (category) => category.slug === left.category.slug,
  )
  const rightCategoryIndex = categoryDefinitions.findIndex(
    (category) => category.slug === right.category.slug,
  )

  if (leftCategoryIndex !== rightCategoryIndex) {
    return leftCategoryIndex - rightCategoryIndex
  }

  if (left.order !== right.order) {
    return left.order - right.order
  }

  return left.title.localeCompare(right.title, 'zh-CN')
}

function toDocSlug(identifier: string): string {
  return identifier
    .replace(/([a-z0-9])([A-Z])/gu, '$1-$2')
    .replaceAll('_', '-')
    .toLowerCase()
}

function humanizeIdentifier(identifier: string): string {
  return identifier
    .replace(/([a-z0-9])([A-Z])/gu, '$1 $2')
    .replaceAll('_', ' ')
    .replace(/\s+/gu, ' ')
    .trim()
}

function normalizeLookupKey(value: string): string {
  return value.replace(/[-_]/gu, ' ').trim().toLowerCase()
}

function sanitizeInline(value: string): string {
  return value.replace(/\s+/gu, ' ').trim()
}

function escapeTableCell(value: string): string {
  return value.replace(/\|/gu, '\\|')
}

function toYamlString(value: string): string {
  return JSON.stringify(value.replace(/\s+/gu, ' ').trim())
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

async function readUtf8(filePath: string): Promise<string> {
  return readFile(filePath, 'utf8')
}
