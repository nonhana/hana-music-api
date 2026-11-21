/* cspell:ignore songprivilege simplealbum playlistuser unmodeled */
import { spawnSync } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import {
  isArrayLiteralExpression,
  isAsExpression,
  isBinaryExpression,
  isCallExpression,
  isIdentifier,
  isImportDeclaration,
  isNamedImports,
  isNumericLiteral,
  isObjectLiteralExpression,
  isPrefixUnaryExpression,
  isPropertyAccessExpression,
  isPropertyAssignment,
  isPropertySignatureDeclaration,
  isShorthandPropertyAssignment,
  isSpreadAssignment,
  isStringLiteral,
  isTypeAliasDeclaration,
  isTypeLiteralNode,
  isUnionTypeNode,
  isVariableStatement,
  SyntaxKind,
} from 'typescript/unstable/ast';
import type {
  Expression,
  Node,
  SourceFile,
  TypeNode,
} from 'typescript/unstable/ast';
import { API } from 'typescript/unstable/async';

import {
  modulePolicy,
  validateModuleActions,
} from '../src/core/request-actions.ts';
import type { ModuleActions } from '../src/core/request-actions.ts';
import { discoverModuleFiles } from '../src/server/module-discovery.ts';
import type { DiscoveredModuleFile } from '../src/server/module-discovery.ts';

const PROJECT_ROOT = resolve(import.meta.dir, '..');
const MODULES_DIRECTORY = resolve(PROJECT_ROOT, 'src/modules');
const UPSTREAM_SCHEMAS_PATH = resolve(
  PROJECT_ROOT,
  'src/core/upstream-schemas.ts',
);
const WEBSITE_API_DIRECTORY = resolve(PROJECT_ROOT, 'website/api');
const SHARED_TYPES_PATH = resolve(WEBSITE_API_DIRECTORY, 'shared-types.md');

type RequirementKind = 'required' | 'loose' | 'optional';

interface ObjectFieldSpec {
  readonly name: string;
  readonly type: SchemaTypeNode;
  readonly requirement: RequirementKind;
  readonly note?: string;
}

type SchemaTypeNode =
  | {
      readonly kind: 'primitive';
      readonly name: 'string' | 'number' | 'boolean' | 'null' | 'UnknownJson';
    }
  | { readonly kind: 'literal'; readonly value: string | number | boolean }
  | { readonly kind: 'union'; readonly members: ReadonlyArray<SchemaTypeNode> }
  | {
      readonly kind: 'array';
      readonly item: SchemaTypeNode;
    }
  | {
      readonly kind: 'record';
      readonly key: SchemaTypeNode;
      readonly value: SchemaTypeNode;
    }
  | {
      readonly kind: 'object';
      readonly fields: ReadonlyArray<ObjectFieldSpec>;
      readonly baseRef?: string;
      readonly omittedKeys?: ReadonlyArray<string>;
      readonly isSharedBase?: boolean;
    }
  | { readonly kind: 'ref'; readonly name: string; readonly isShared: boolean }
  | { readonly kind: 'uploadedFile' }
  | { readonly kind: 'emptyRecord' };

interface SharedEntitySpec {
  readonly name: string;
  readonly node: SchemaTypeNode;
}

interface InputFieldSpec {
  readonly name: string;
  readonly typeText: string;
  readonly tsType: string;
  readonly required: boolean;
  readonly defaultValue?: string;
  readonly enumValues?: ReadonlyArray<string | number>;
  readonly isArray: boolean;
  readonly isObjectArray: boolean;
  readonly isUploadedFile: boolean;
  readonly isNumberId: boolean;
  readonly isNumberIdList: boolean;
  readonly isBoolean: boolean;
  readonly isNumber: boolean;
}

interface ModuleInputSpec {
  readonly kind: 'none' | 'struct' | 'union' | 'record';
  readonly fields: ReadonlyArray<InputFieldSpec>;
  readonly nestedStructs: ReadonlyMap<string, ReadonlyArray<InputFieldSpec>>;
  readonly exclusivityNote?: string;
}

interface ModuleBodySpec {
  readonly modeled: boolean;
  readonly bodyNode?: SchemaTypeNode;
  readonly riskNode?: SchemaTypeNode;
  readonly localHelpers: ReadonlyMap<string, SchemaTypeNode>;
  readonly sharedRefs: ReadonlyArray<string>;
}

interface ExistingDocInfo {
  readonly path: string;
  readonly relativeRoutePath: string;
  readonly title: string;
  readonly description: string;
  readonly intro: string;
  readonly loginRequirement: string;
  readonly paramDescriptions: ReadonlyMap<string, string>;
  readonly paramDefaults: ReadonlyMap<string, string>;
  readonly cspellIgnores: ReadonlyArray<string>;
  readonly existingSdkCode?: string;
  readonly existingHttpCode?: string;
}

interface ParsedModuleContext {
  readonly identifier: string;
  readonly camelName: string;
  readonly pascalName: string;
  readonly route: string;
  readonly doc: ExistingDocInfo;
  readonly input: ModuleInputSpec;
  readonly body: ModuleBodySpec;
  readonly sharedCache: boolean;
  readonly isUpload: boolean;
  readonly isPureLocal: boolean;
  readonly decodeInput: (input: unknown) => Effect.Effect<unknown, unknown>;
}

const toCamelCase = (identifier: string): string =>
  identifier.replaceAll(/[/_-]+([a-zA-Z0-9])/g, (_match, char: string) =>
    char.toUpperCase(),
  );

const toPascalCase = (identifier: string): string => {
  const name = toCamelCase(identifier);
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const FORBIDDEN_PATTERNS: ReadonlyArray<{
  readonly label: string;
  readonly pattern: RegExp;
}> = [
  { label: '收紧', pattern: /收紧/u },
  { label: '宽松', pattern: /宽松/u },
  { label: '可以没有的路径', pattern: /可以没有的路径/u },
  { label: '收窄', pattern: /收窄/u },
  { label: '动作声明', pattern: /动作声明/u },
  { label: '录制', pattern: /录制/u },
  { label: '补录', pattern: /补录/u },
  { label: '收口', pattern: /收口/u },
  { label: '契约测试', pattern: /契约测试/u },
  { label: '离线验收', pattern: /离线验收/u },
  { label: '本票', pattern: /本票/u },
  { label: 'tests/fixtures/', pattern: /tests\/fixtures\//u },
  { label: '.changeset/', pattern: /\.changeset\//u },
  { label: 'response-bodies', pattern: /response-bodies/u },
  { label: 'response-body-gaps', pattern: /response-body-gaps/u },
  { label: 'playlist-subscription', pattern: /playlist-subscription/u },
  { label: 'Campanula #30', pattern: /Campanula #30/u },
  { label: '暂时没有单独整理参数表', pattern: /暂时没有单独整理参数表/u },
  { label: '## 补充说明', pattern: /^## 补充说明/mu },
  { label: ':::', pattern: /^:::/mu },
  { label: '编号', pattern: /编号/u },
  { label: '总期限', pattern: /总期限/u },
  { label: '这批/本批', pattern: /(?:这批|本批)/u },
  { label: '实测/探针', pattern: /(?:实测|探针)/u },
  { label: '改造前', pattern: /改造前/u },
  { label: 'SPECIAL_STATUS_CODES', pattern: /SPECIAL_STATUS_CODES/u },
];

const ALLOWED_GUIDE_PATHS = new Set([
  '/guide/sdk-usage',
  '/guide/authentication',
  '/guide/error-handling',
  '/guide/config',
  '/guide/resilience',
  '/guide/cache-and-identity-pool',
  '/guide/watchman',
  '/guide/http-conventions',
  '/guide/http-deployment',
]);

const SHARED_ENTITY_GROUPS: ReadonlyArray<{
  readonly heading: string;
  readonly entities: ReadonlyArray<string>;
}> = [
  {
    heading: '歌曲与音质',
    entities: [
      'Song',
      'LooseSong',
      'SongPrivilege',
      'LooseSongPrivilege',
      'SongUrlData',
      'ProgramQuality',
      'ProgramMainSong',
      'MlogSong',
      'PrivateCloud',
      'LyricUser',
    ],
  },
  {
    heading: '专辑与歌手',
    entities: ['Artist', 'SimpleAlbum', 'AlbumSummary', 'AlbumInfo'],
  },
  {
    heading: '歌单与用户',
    entities: [
      'PlaylistSummary',
      'PlaylistUser',
      'Account',
      'UserProfile',
      'AvatarDetail',
      'VipRights',
    ],
  },
  {
    heading: '评论与动态',
    entities: [
      'CommentRecord',
      'CommentReply',
      'CommentUser',
      'EventInfo',
      'EventUser',
      'EventPic',
      'EventIpLocation',
    ],
  },
  {
    heading: '视频与 MV',
    entities: ['MvSummary', 'VideoResolutionEntry', 'VideoGroupRef'],
  },
  {
    heading: '电台与播客',
    entities: ['DjProgram', 'ProgramDj', 'ProgramDescPic', 'DjAnchorRank'],
  },
  {
    heading: '其他通用实体',
    entities: ['MultiTerminalInfo', 'StylePage', 'UgcArtistRef'],
  },
];

const ENTITY_DESCRIPTIONS: Readonly<Record<string, string>> = {
  Song: '歌曲核心实体，包含歌曲基础信息、歌手、专辑、各档音质与播放权限。云盘上传且未匹配曲库的歌曲，其 `cd` 可能为 `null`、`no` 为 `0`。',
  LooseSong:
    '嵌套在歌单、云盘或推荐容器中的歌曲实体，字段与 [Song](#song) 一致，但 `id` 允许缺失或为 `null`。',
  SongPrivilege:
    '歌曲版权、试听与下载权限信息，`id` 为必填数字；`st < 0` 通常表示灰色无版权资源。',
  LooseSongPrivilege:
    '嵌套在歌曲或其他容器中的权限对象，字段与 [SongPrivilege](#songprivilege) 一致，但 `id` 允许缺失或为 `null`。',
  SongUrlData:
    '歌曲播放或下载地址条目。无版权时 `url` 和 `level` 为 `null` 且 `code` 非 `200`；仅限试听时 `freeTrialInfo` 给出试听片段的起止秒数。',
  ProgramQuality: '旧版音频质量档位信息（用于节目主音频和部分历史歌曲结构）。',
  ProgramMainSong:
    '电台节目与部分推荐列表使用的旧版歌曲结构，内含专辑、歌手与 `bMusic`/`hMusic`/`mMusic`/`lMusic` 音质信息。',
  MlogSong: 'Mlog 视频中关联的歌曲简要信息。',
  PrivateCloud: '云盘歌曲对应的网盘文件元信息（MD5、码率、文件名、大小等）。',
  LyricUser: '歌词或翻译贡献者的用户信息。',
  Artist:
    '歌手基础信息实体。对于云盘未匹配公开曲库的歌曲，歌手 `id` 可能为 `0`、`name` 可能为 `null`。',
  SimpleAlbum: '精简版专辑对象，包含专辑名称、封面、发行时间与所属歌手。',
  AlbumSummary:
    '在 [SimpleAlbum](#simplealbum) 基础上要求必填 `id`，并补充 `info` 统计信息。',
  AlbumInfo: '专辑评论、点赞与分享统计信息。',
  PlaylistSummary:
    '歌单摘要实体，从根入口 `hana-music-api` 可直接导入其 TypeScript 类型。当登录态失效时，`subscribed` 通常为 `null`。',
  PlaylistUser:
    '歌单创建者、收藏者或关联用户资料，从根入口 `hana-music-api` 可直接导入其 TypeScript 类型。',
  Account:
    '账号核心状态对象，`anonimousUser` 为 `true` 表示当前处于匿名游客身份。',
  UserProfile:
    '完整用户资料对象，包含昵称、头像、关注数、粉丝数、VIP 类型与认证信息。',
  AvatarDetail: '用户头像角标与认证等级信息。',
  VipRights: '用户 VIP 权益详情（黑胶 VIP、音乐包、红心权益及等级计数）。',
  CommentRecord: '评论列表中的单条评论记录，`commentId` 为必填字段。',
  CommentReply: '评论中的被回复子评论结构。',
  CommentUser: '评论或回复条目的作者信息，含头像、昵称与 VIP 角标。',
  EventInfo: '动态关联的评论线程、点赞数、转发数与资源引用信息。',
  EventUser:
    '动态中的发布者资料，继承自 [UserProfile](#userprofile) 并将 `userId` 设为可选，另含 `urlAnalyze` 与 `vipRights`。',
  EventPic: '动态附带的图片与动图尺寸、多规格 URL 信息。',
  EventIpLocation: '动态或评论附带的 IP 属地信息。',
  MvSummary: 'MV 列表条目，含封面、时长、播放量与歌手列表。',
  VideoResolutionEntry: '视频支持的分辨率与对应文件大小条目。',
  VideoGroupRef: '视频关联的分类或标签引用。',
  DjProgram:
    '电台节目详情记录，`id` 为必填字段，内含主播、所属电台与 `mainSong`。',
  ProgramDj:
    '电台主播信息，继承自 [PlaylistUser](#playlistuser) 并额外包含电台品牌名 `brand`。',
  ProgramDescPic: '电台或节目的图文介绍片段。',
  DjAnchorRank:
    '主播排行榜单条目，`id` 为必填字段，包含排名、热度分数与直播状态。',
  MultiTerminalInfo: '最近播放记录中展示的播放终端设备图标与系统名称。',
  StylePage: '曲风接口通用的游标分页元信息。',
  UgcArtistRef: '音乐百科与用户贡献接口中的关联歌手引用（ID 与名称）。',
};

const SHARED_FIELD_NOTES: Readonly<Record<string, string>> = {
  id: '资源 ID',
  userId: '用户 ID',
  name: '名称或标题',
  nickname: '用户昵称',
  nickName: '主播昵称',
  avatarUrl: '头像图片 URL',
  picUrl: '封面或图片 URL',
  cover: '封面图片 URL',
  coverUrl: '封面图片 URL',
  coverImgUrl: '歌单封面图片 URL',
  url: '资源或音频访问地址',
  code: '状态码或业务码',
  status: '当前状态码',
  description: '简介说明',
  briefDesc: '简短介绍',
  signature: '个人签名',
  createTime: '创建时间戳（毫秒）',
  updateTime: '更新时间戳（毫秒）',
  publishTime: '发布时间戳（毫秒）',
  duration: '时长（毫秒）',
  dt: '歌曲时长（毫秒）',
  playCount: '播放次数',
  subscribed: '当前账号是否已收藏（未登录或凭据失效时可能为 `null`）',
  subscribedCount: '收藏人数',
  trackCount: '曲目数量',
  commentCount: '评论数',
  shareCount: '分享数',
  likedCount: '点赞数',
  liked: '当前账号是否已点赞',
  followed: '当前账号是否已关注',
  mutual: '是否互相关注',
  vipType: '会员类型（`0` 表示非会员）',
  gender: '性别（`0` 保密、`1` 男、`2` 女）',
  fee: '付费类型（`0` 免费/无版权、`1` VIP、`4` 购买专辑、`8` 会员高音质）',
  mark: '歌曲属性位掩码（如 `131072` 纯音乐、`1048576` 脏标、`262144` 杜比、`17179869184` Hi-Res）',
  t: '歌曲来源标记（`0` 普通曲库、`1` 云盘未匹配、`2` 云盘已匹配公开曲库）',
  st: '版权状态（`< 0` 通常为灰色无版权）',
  pl: '当前最高可试听码率',
  dl: '当前最高可下载码率',
  maxbr: '歌曲最高支持码率',
  br: '音频比特率（bps）',
  sr: '音频采样率（Hz）',
  size: '文件大小（字节）或数量',
  level: '实际返回的音质等级',
  expi: '链接有效时长（秒）',
  freeTrialInfo: '试听片段起止秒数（完整可播放时为 `null`）',
  anonimousUser: '是否为匿名游客账号',
  userName: '内部用户名',
  commentId: '评论 ID',
  content: '正文内容',
  time: '时间戳（毫秒）',
  timeStr: '格式化时间文本',
  beReplied: '被回复的原评论列表',
  user: '关联用户信息',
  creator: '歌单创建者信息',
  artists: '歌手列表',
  ar: '歌手列表',
  al: '所属专辑精简信息',
  album: '所属专辑信息',
  privilege: '歌曲播放与下载权限信息',
  tracks: '歌单曲目列表（部分接口仅返回部分曲目）',
  tags: '标签列表',
  alia: '别名列表',
  alias: '别名列表',
  tns: '译名列表',
  transNames: '译名列表',
  mv: '关联 MV ID（`0` 表示无 MV）',
  mvid: '关联 MV ID',
  artistId: '歌手 ID',
  artistName: '歌手名称',
  albumSize: '专辑数量',
  musicSize: '单曲数量',
  mvSize: 'MV 数量',
  commentThreadId: '评论线程 ID',
  threadId: '评论线程 ID',
  resourceId: '关联资源 ID',
  resourceType: '关联资源类型',
  dj: '主播资料',
  mainSong: '节目关联主音频信息',
  radio: '所属电台摘要',
  rank: '当前排名',
  lastRank: '上期排名',
  score: '热度或评分',
  cursor: '分页游标',
  more: '是否还有下一页',
  total: '总数量',
  location: 'IP 属地名称',
  width: '宽度（像素）',
  height: '高度（像素）',
  resolution: '视频清晰度（如 `480`、`720`、`1080`）',
  fileName: '原始文件名',
  fileSize: '文件大小（字节）',
  md5: '文件 MD5 校验值',
  songId: '曲库歌曲 ID',
  h: '高音质文件信息',
  m: '中音质文件信息',
  l: '低音质文件信息',
  sq: '无损音质文件信息',
  hr: 'Hi-Res 音质文件信息',
  hMusic: '高音质文件信息（旧版结构）',
  mMusic: '中音质文件信息（旧版结构）',
  lMusic: '低音质文件信息（旧版结构）',
  bMusic: '低码率音频文件信息（旧版结构）',
  os: '终端操作系统标识',
  osText: '终端操作系统展示名称',
  icon: '图标地址',
};

const DESCRIPTION_FIXES: Readonly<Record<string, string>> = {
  mv_detail:
    '传入 MV ID，获取对应 MV 的名称、歌手、发布时间、简介与分辨率等详细信息。',
  mv_detail_info: '传入 MV ID，获取对应 MV 的点赞、转发与评论统计数据。',
  user_social_status_edit:
    '登录后调用此接口，编辑当前用户的社交状态，可用参数可通过 `/user/social/status/support` 获取。',
  top_list:
    '传入榜单 ID 获取排行榜详情数据（也可使用歌单详情接口 `/playlist/detail`）。',
  related_playlist:
    '原网页抓取接口已失效，建议使用相关歌单推荐接口 `/playlist/detail/rcmd/get`。',
  album_detail: '传入数字专辑 ID，获取数字专辑商品详情、价格与售卖信息。',
  digitalAlbum_detail:
    '传入数字专辑 ID，获取数字专辑商品详情、价格与售卖信息。',
  song_url_v1:
    '传入歌曲 ID 数组与目标音质等级，获取对应音质的音乐播放链接与试听信息。',
  song_detail:
    '传入歌曲 ID 数组，获取歌曲基础信息、歌手、专辑、音质及播放权限详情。',
  song_url:
    '传入歌曲 ID 数组，获取对应码率的音乐播放链接；未登录或非会员曲目可能仅返回试听片段。',
  user_level: '获取当前登录账号的等级、听歌次数、登录天数及升级进度。',
  batch:
    '以 `/api/*` 路径为键批量转发多个上游子请求，并在同一次响应中返回各路由结果。',
};

const LOGIN_OVERRIDES: Readonly<Record<string, string>> = {
  album_sub: '是',
  artist_sub: '是',
  comment: '是',
  hug_comment: '是',
  dj_difm_channel_subscribe: '是',
  dj_difm_channel_unsubscribe: '是',
  voice_delete: '是',
  voicelist_trans: '是',
  fm_trash: '是',
  like: '是',
  playlist_create: '是',
  playlist_delete: '是',
  playlist_privacy: '是',
  resource_like: '是',
  mv_sub: '是',
  video_sub: '是',
  yunbei_task_finish: '是',
  yunbei: '是',
  yunbei_today: '是',
  playlist_mylike: '是',
  playlist_video_recent: '是',
  msg_forwards: '是',
  msg_notices: '是',
  verify_qrcodestatus: '是',
  voice_upload: '是（需具备播客发布权限）',
  playlist_cover_update: '是（需有权修改目标歌单）',
  playlist_track_all: '否（公开歌单可匿名访问，私有或完整列表需登录）',
  calendar: '否',
  search: '否（可使用游客身份）',
  style_preference: '否（匿名返回空偏好）',
  login_qr_check: '否',
};

const PARAM_DESCRIPTIONS: Readonly<Record<string, string>> = {
  'aidj_content_rcmd.latitude': '当前位置纬度（可选，与 `longitude` 搭配使用）',
  'aidj_content_rcmd.longitude': '当前位置经度（可选，与 `latitude` 搭配使用）',
  'album_detail.id': '数字专辑 ID',
  'album_list.area': '地区筛选，默认 `ALL`（`ALL`/`ZH`/`EA`/`KR`/`JP`）',
  'album_list.type': '列表类型筛选',
  'artist_fans.limit': '返回数量，默认 `20`',
  'artist_fans.offset': '偏移数量，用于分页，默认 `0`',
  'artist_mv.limit': '返回数量，默认 `30`',
  'artist_mv.offset': '偏移数量，用于分页，默认 `0`',
  'avatar_upload.imgFile':
    'JPEG 图片文件（HTTP 使用 multipart，SDK 传入文件对象）',
  'broadcast_channel_list.limit': '返回数量，默认 `20`',
  'broadcast_channel_list.lastId':
    '分页游标 ID（上一页最后一项的 ID），默认 `0`',
  'broadcast_channel_list.score': '分页游标分数，默认 `-1`',
  'calendar.startTime': '开始时间戳（毫秒），默认取当前时间',
  'calendar.endTime': '结束时间戳（毫秒），默认取当前时间',
  'cloud.album': '专辑名称（可选，缺省时默认为“未知专辑”）',
  'cloud.artist': '歌手名称（可选，缺省时默认为“未知艺术家”）',
  'cloud.song': '歌曲名称（可选，缺省时从上传文件名解析）',
  'cloud.songFile': '音频文件（HTTP 使用 multipart，SDK 传入文件对象）',
  'comment.threadId': '资源线程 ID（评论动态 `type=6` 时必填，用于代替 `id`）',
  'comment_event.threadId': '动态线程 ID（可从动态接口的 `threadId` 字段获取）',
  'comment_event.limit': '返回数量，默认 `20`',
  'comment_event.offset': '偏移数量，用于分页，默认 `0`',
  'comment_event.before': '分页游标，取上一页最后一条评论的 `time`，默认 `0`',
  'comment_hug_list.type': '资源类型，见下方枚举表，默认 `0`（歌曲）',
  'comment_like.threadId': '资源线程 ID（点赞动态评论 `type=6` 时使用）',
  'comment_new.showInner': '是否返回楼中楼回复，默认 `true`',
  'digitalAlbum_purchased.limit': '返回数量，默认 `30`',
  'digitalAlbum_purchased.offset': '偏移数量，用于分页，默认 `0`',
  'dj_sub.rid': '电台 ID',
  'dj_sub.t': '操作类型：`1` 为订阅，`0` 或省略为取消订阅',
  'dj_sublist.limit': '返回数量，默认 `25`',
  'dj_sublist.offset': '偏移数量，用于分页，默认 `0`',
  'dj_today_perfered.page': '页码，默认 `0`',
  'dj_toplist_newcomer.offset': '偏移数量（上游接口通常会忽略该参数）',
  'fm_trash.time': '移除前已播放秒数，默认 `25`',
  'hug_comment.type': '资源类型，见下方枚举表，默认 `0`（歌曲）',
  'login_qr_check.key': '由 `/login/qr/key` 获取的二维码 `unikey`',
  'login_qr_create.key': '由 `/login/qr/key` 获取的二维码 `unikey`',
  'login_qr_create.platform':
    '生成链接的平台类型，默认 `pc`（可选 `pc`、`web`）',
  'mv_sublist.limit': '返回数量，默认 `25`',
  'mv_sublist.offset': '偏移数量，用于分页，默认 `0`',
  'personal_fm_mode.limit': '返回歌曲数量',
  'personalized_newsong.areaId': '地区 ID（用于筛选新歌地区）',
  'playlist_cover_update.id': '目标歌单 ID',
  'playlist_cover_update.imgFile': 'JPEG 封面图片文件（与 `imgId` 二选一）',
  'playlist_cover_update.imgId':
    '通过 `/image/upload/token` 上传后得到的图片 ID（与 `imgFile` 二选一）',
  'playlist_detail_dynamic.s': '返回的最近收藏者数量，默认 `8`',
  'playlist_mylike.time': '分页游标时间戳，默认 `-1`',
  'playlist_mylike.limit': '返回数量，默认 `12`',
  'playlist_track_delete.id': '目标歌单 ID',
  'playlist_track_delete.ids': '要从歌单中移除的歌曲 ID 数组',
  'playlist_track_add.pid': '目标歌单 ID',
  'playlist_track_add.ids': '要添加到歌单的歌曲 ID 数组',
  'playmode_intelligence_list.count': '返回推荐曲目数量，默认 `1`',
  'program_recommend.type': '节目分类过滤标识（如 `PUBLIC`）',
  'resource_like.threadId': '动态资源线程 ID（点赞动态 `type=6` 时使用）',
  'search_multimatch.type': '搜索类型，默认 `1`',
  'send_album.userIds': '接收私信的用户 ID 数组',
  'send_playlist.playlist': '要分享的歌单 ID',
  'send_playlist.userIds': '接收私信的用户 ID 数组',
  'send_song.userIds': '接收私信的用户 ID 数组',
  'send_text.userIds': '接收私信的用户 ID 数组',
  'sheet_list.ab': 'A/B 实验分流参数，默认 `b`',
  'simi_playlist.limit': '返回数量，默认 `50`',
  'simi_playlist.offset': '偏移数量，用于分页，默认 `0`',
  'simi_song.limit': '返回数量，默认 `50`',
  'simi_song.offset': '偏移数量，用于分页，默认 `0`',
  'simi_user.limit': '返回数量，默认 `50`',
  'simi_user.offset': '偏移数量，用于分页，默认 `0`',
  'song_lyrics_mark_add.id': '歌曲 ID',
  'song_lyrics_mark_add.markId': '已有摘录 ID（修改摘录时传入，新增时可省略）',
  'song_lyrics_mark_add.marks': '歌词摘录条目数组，详见下方结构表',
  'song_url.ids': '歌曲 ID 数组（至少包含一个正整数或纯数字字符串 ID）',
  'song_url_v1.ids': '歌曲 ID 数组（至少包含一个正整数或纯数字字符串 ID）',
  'song_url_v1.level': '目标音质等级，见下方枚举表',
  'song_download_url_v1.level': '目标音质等级，见下方枚举表',
  'top_album.limit': '返回数量，默认 `50`',
  'top_album.offset': '偏移数量，用于分页，默认 `0`',
  'top_list.id': '排行榜歌单 ID，可通过 `/toplist` 获取',
  'top_list.idx':
    '已废弃的历史参数，传入会在本地直接返回 `code: 500`，请勿使用',
  'topic_detail.actid': '话题 ID',
  'topic_detail_event_hot.actid': '话题 ID',
  'ugc_detail.sortBy': '排序字段，默认 `createTime`',
  'user_cloud_detail.ids': '云盘歌曲 ID 数组',
  'user_dj.limit': '返回数量，默认 `30`',
  'user_dj.offset': '偏移数量，用于分页，默认 `0`',
  'user_event.offset': '偏移数量，用于分页，默认 `0`',
  'user_social_status_edit.type': '社交状态类型标识',
  'user_social_status_edit.iconUrl': '状态图标图片 URL',
  'user_social_status_edit.content': '状态展示文本',
  'user_social_status_edit.actionUrl': '点击状态后的跳转链接',
  'video_category_list.limit': '返回数量，默认 `99`',
  'video_category_list.offset': '偏移数量，用于分页，默认 `0`',
  'video_url.res': '目标分辨率（如 `1080`、`720`、`480`、`240`），默认 `1080`',
  'voice_upload.songFile': '音频文件（HTTP 使用 multipart，SDK 传入文件对象）',
  'voice_upload.voiceListId': '所属播客 ID',
  'voice_upload.coverImgId': '声音封面图片 ID',
  'voice_upload.categoryId': '一级分类 ID',
  'voice_upload.secondCategoryId': '二级分类 ID',
  'voice_upload.description': '声音简介',
  'voice_upload.songName': '声音名称（未传时从文件名整理）',
  'voice_upload.privacy': '是否设为仅自己可见',
  'voice_upload.publishTime': '定时发布时间戳（毫秒），立即发布可传 `0`',
  'voice_upload.autoPublish': '发布后是否同步发送动态',
  'voice_upload.autoPublishText': '同步动态文案，默认空字符串',
  'voice_upload.orderNo': '播客内排序序号，默认 `1`',
  'voice_upload.composedSongs': '关联歌曲 ID 列表或逗号分隔字符串',
  'voicelist_list_search.voiceListId':
    '所属播客 ID（不传则查询账号下所有声音）',
  'voicelist_list_search.limit': '返回数量，默认 `200`',
  'voicelist_list_search.offset': '偏移数量，用于分页，默认 `0`',
  'voicelist_list_search.name': '声音名称关键词',
  'voicelist_list_search.displayStatus':
    '声音展示状态（如 `ONLINE`、`AUDITING`、`ONLY_SELF_SEE`、`SCHEDULE_PUBLISH`、`TRANSCODE_FAILED`、`PUBLISHING`、`FAILED`）',
  'voicelist_list_search.type': '可见类型（如 `PUBLIC`、`PRIVATE`）',
  'voicelist_list_search.voiceFeeType':
    '付费类型（`-1` 全部、`0` 免费、`1` 收费）',
  'get_userids.nicknames': '用户昵称数组（每个昵称不能包含分号 `;`）',
  'playlist_import_name_task_create.local':
    '本地元数据条目数组（`name`、`artist`、`album`）',
  'playlist_import_name_task_create.text': '纯文本歌单内容（文字导入）',
  'playlist_import_name_task_create.link': '外部歌单链接数组（链接导入）',
  'playlist_import_name_task_create.playlistName': '生成的新歌单名称',
  'playlist_import_name_task_create.importStarPlaylist':
    '是否直接导入「我喜欢的音乐」，默认 `false`',
  'playlist_tracks.step':
    '分步模式：`initial` 仅发首次请求；`fallback` 直接发后备请求；省略时在 `512` 后自动后备',
  'listentogether_sync_list_command.displayList': '展示顺序的歌曲 ID 数组',
  'listentogether_sync_list_command.randomList': '随机播放顺序的歌曲 ID 数组',
  'listentogether_sync_list_command.userId': '发起本次列表变更的用户 ID',
  'listentogether_sync_list_command.version': '列表递增版本号',
};

const GENERIC_PARAM_DESCRIPTIONS: Readonly<Record<string, string>> = {
  id: '目标资源 ID',
  ids: '目标资源 ID 数组',
  uid: '用户 ID',
  pid: '歌单 ID',
  rid: '电台 ID',
  mvid: 'MV ID',
  cid: '评论 ID',
  sid: '资源 ID',
  vid: '验证配置 ID',
  limit: '返回条目数量',
  offset: '偏移数量，用于分页',
  page: '页码',
  pageNo: '页码（从 1 开始）',
  pageSize: '每页条目数量',
  before: '分页游标（通常取上一页末项时间）',
  cursor: '分页游标（传入上次返回的 `cursor`）',
  lasttime: '分页游标时间戳',
  time: '时间戳或时间参数',
  keywords: '搜索关键词',
  keyword: '搜索关键词或 ID',
  type: '类型参数',
  t: '操作类型标记',
  area: '地区筛选代码',
  order: '排序方式',
  cat: '分类标签名称',
  cookie: 'Cookie 字符串',
  phone: '手机号码',
  countrycode: '国家/地区区号，默认 `86`',
  ctcode: '国家/地区区号，默认 `86`',
  captcha: '短信验证码',
  email: '网易邮箱地址',
  password: '账号明文密码',
  md5_password: 'MD5 加密后的密码（优先于 `password`）',
  nickname: '用户昵称',
  content: '文本内容',
  msg: '附加文本消息',
  br: '目标音频码率（bps），默认 `999000`',
};

const COMMENT_TYPE_ENUM = `| \`type\` | 资源类型 |
| --- | --- |
| \`0\` | 歌曲 |
| \`1\` | MV |
| \`2\` | 歌单 |
| \`3\` | 专辑 |
| \`4\` | 电台节目 |
| \`5\` | 视频 |
| \`6\` | 动态（部分接口需改传 \`threadId\`） |
| \`7\` | 电台 |`;

const SEARCH_TYPE_ENUM = `| \`type\` | 搜索内容 |
| --- | --- |
| \`1\` | 单曲 |
| \`10\` | 专辑 |
| \`100\` | 歌手 |
| \`1000\` | 歌单 |
| \`1002\` | 用户 |
| \`1004\` | MV |
| \`1006\` | 歌词 |
| \`1009\` | 电台 |
| \`1014\` | 视频 |
| \`1018\` | 综合 |
| \`2000\` | 声音（使用独立搜索接口，返回体结构为 \`data\` 形态） |`;

const AUDIO_LEVEL_ENUM = `| \`level\` | 音质等级 |
| --- | --- |
| \`standard\` | 标准 |
| \`higher\` | 较高 |
| \`exhigh\` | 极高 |
| \`lossless\` | 无损 |
| \`hires\` | Hi-Res |
| \`jyeffect\` | 高清环绕声 |
| \`sky\` | 沉浸环绕声 |
| \`jymaster\` | 超清母带 |`;

const PARAM_ENUM_TABLES: Readonly<Record<string, string>> = {
  search: SEARCH_TYPE_ENUM,
  cloudsearch: SEARCH_TYPE_ENUM,
  comment: `| \`t\` | 操作 |
| --- | --- |
| \`1\` | 发送评论 |
| \`2\` | 回复评论（需传 \`commentId\`） |
| \`0\` | 删除评论（需传 \`commentId\`） |

${COMMENT_TYPE_ENUM}`,
  comment_floor: COMMENT_TYPE_ENUM,
  comment_hot: COMMENT_TYPE_ENUM,
  comment_like: COMMENT_TYPE_ENUM,
  comment_new: `${COMMENT_TYPE_ENUM}

| \`sortType\` | 排序方式 |
| --- | --- |
| \`99\` | 按推荐排序（默认） |
| \`2\` | 按热度排序 |
| \`3\` | 按时间排序（需配合 \`cursor\`） |`,
  comment_hug_list: COMMENT_TYPE_ENUM,
  hug_comment: COMMENT_TYPE_ENUM,
  resource_like: COMMENT_TYPE_ENUM,
  song_url_v1: AUDIO_LEVEL_ENUM,
  song_download_url_v1: AUDIO_LEVEL_ENUM,
  banner: `| \`type\` | 客户端类型 |
| --- | --- |
| \`0\` | PC（默认） |
| \`1\` | Android |
| \`2\` | iPhone |
| \`3\` | iPad |`,
  top_song: `| \`type\` | 地区分类 |
| --- | --- |
| \`0\` | 全部（默认） |
| \`7\` | 华语 |
| \`96\` | 欧美 |
| \`8\` | 日本 |
| \`16\` | 韩国 |`,
  toplist_artist: `| \`type\` | 地区分类 |
| --- | --- |
| \`1\` | 华语（默认） |
| \`2\` | 欧美 |
| \`3\` | 韩国 |
| \`4\` | 日本 |`,
  artist_list: `| \`type\` | 歌手类型 |
| --- | --- |
| \`-1\` | 全部 |
| \`1\` | 男歌手（默认） |
| \`2\` | 女歌手 |
| \`3\` | 乐队/组合 |

| \`area\` | 地区 |
| --- | --- |
| \`-1\` | 全部 |
| \`7\` | 华语 |
| \`96\` | 欧美 |
| \`8\` | 日本 |
| \`16\` | 韩国 |
| \`0\` | 其他 |`,
  album_new: `| \`area\` | 地区 |
| --- | --- |
| \`ALL\` | 全部（默认） |
| \`ZH\` | 华语 |
| \`EA\` | 欧美 |
| \`KR\` | 韩国 |
| \`JP\` | 日本 |`,
  album_list: `| \`area\` | 地区 |
| --- | --- |
| \`ALL\` | 全部（默认） |
| \`ZH\` | 华语 |
| \`EA\` | 欧美 |
| \`KR\` | 韩国 |
| \`JP\` | 日本 |`,
  top_album: `| \`area\` | 地区 |
| --- | --- |
| \`ALL\` | 全部（默认） |
| \`ZH\` | 华语 |
| \`EA\` | 欧美 |
| \`KR\` | 韩国 |
| \`JP\` | 日本 |`,
  album_list_style: `| \`area\` | 地区 |
| --- | --- |
| \`Z_H\` | 华语（默认） |
| \`E_A\` | 欧美 |
| \`KR\` | 韩国 |
| \`JP\` | 日本 |`,
  ugc_detail: `| \`type\` | 内容种类 |
| --- | --- |
| \`1\` | 曲库纠错 - 歌手（默认） |
| \`2\` | 曲库纠错 - 专辑 |
| \`3\` | 曲库纠错 - 歌曲 |
| \`4\` | 曲库纠错 - MV |
| \`5\` | 曲库纠错 - 歌词 |
| \`6\` | 曲库纠错 - 翻译 |
| \`101\` | 曲库补充 - 专辑 |
| \`103\` | 曲库补充 - MV |

| \`auditStatus\` | 审核状态 |
| --- | --- |
| \`0\` | 待审核 |
| \`-5\` | 未采纳 |
| \`1\` | 审核中 |
| \`4\` | 部分审核通过 |
| \`5\` | 审核通过 |`,
  user_update: `| \`gender\` | 性别 |
| --- | --- |
| \`0\` | 保密 |
| \`1\` | 男性 |
| \`2\` | 女性 |`,
  dj_difm_all_style_channel: `| \`sources\` 元素 | 来源 |
| --- | --- |
| \`0\` | 最嗨电音（默认） |
| \`1\` | 古典电台 |
| \`2\` | 爵士电台 |`,
  dj_difm_subscribe_channels_get: `| \`sources\` 元素 | 来源 |
| --- | --- |
| \`0\` | 最嗨电音（默认） |
| \`1\` | 古典电台 |
| \`2\` | 爵士电台 |`,
  dj_difm_playing_tracks_list: `| \`source\` | 来源 |
| --- | --- |
| \`0\` | 最嗨电音（默认） |
| \`1\` | 古典电台 |
| \`2\` | 爵士电台 |`,
  djRadio_top: `| \`sortIndex\` | 排序指标 |
| --- | --- |
| \`1\` | 播放数（默认） |
| \`2\` | 点赞数 |
| \`3\` | 评论数 |
| \`4\` | 分享数 |
| \`5\` | 收藏数 |`,
  daily_signin: `| \`type\` | 签到端 |
| --- | --- |
| \`0\` | Android 端（可获得 3 点经验，默认） |
| \`1\` | Web/PC 端（可获得 2 点经验） |`,
  playlist_create: `| \`privacy\` | 隐私设置 |
| --- | --- |
| \`0\` | 普通公开歌单（默认） |
| \`10\` | 隐私歌单 |

| \`type\` | 歌单类型 |
| --- | --- |
| \`NORMAL\` | 普通歌单（默认） |
| \`VIDEO\` | 视频歌单 |
| \`SHARED\` | 共享歌单 |`,
  user_follow_mixed: `| \`scene\` | 筛选范围 |
| --- | --- |
| \`0\` | 所有关注（默认） |
| \`1\` | 关注的歌手 |
| \`2\` | 关注的用户 |`,
  style_album: `| \`sort\` | 排序方式 |
| --- | --- |
| \`0\` | 按热度排序（默认） |
| \`1\` | 按时间排序 |`,
  style_song: `| \`sort\` | 排序方式 |
| --- | --- |
| \`0\` | 按热度排序（默认） |
| \`1\` | 按时间排序 |`,
  artist_video: `| \`order\` | 排序方式 |
| --- | --- |
| \`0\` | 按时间排序（默认） |
| \`1\` | 按热度排序 |`,
  digitalAlbum_ordering: `| \`payment\` | 支付方式 |
| --- | --- |
| \`'0'\` | 支付宝 |
| \`'3'\` | 微信 |`,
  song_lyrics_mark_add: `| \`marks[]\` 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| \`originalLyricsText\` | \`string\` | 是 | 原文歌词文本 |
| \`startTimeStamp\` | \`number\` | 是 | 歌词起始时间戳（毫秒） |
| \`translateLyricsText\` | \`string\` | 是 | 译文歌词文本 |
| \`translateType\` | \`number\` | 是 | 翻译类型标识 |`,
  playlist_import_name_task_create: `| \`local[]\` 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| \`name\` | \`string\` | 否 | 歌曲名称 |
| \`artist\` | \`string\` | 否 | 歌手名称 |
| \`album\` | \`string\` | 否 | 专辑名称 |`,
};

const ENDPOINT_NOTES: Readonly<Record<string, ReadonlyArray<string>>> = {
  album_detail: [
    '- **接口定位**：本接口用于获取**数字专辑商品**详情与售卖信息；普通免费专辑请调用 [获取专辑内容](/api/album/album)。',
    '- **异常状态**：传入未知专辑 ID 时上游返回 `code: 404`，SDK 按业务拒绝原样返回，详见 [错误处理](/guide/error-handling)。',
  ],
  digitalAlbum_detail: [
    '- **接口定位**：与 `/album/detail` 共用同一上游接口与返回体类型 `AlbumDetailBody`；普通专辑请调用 [获取专辑内容](/api/album/album)。',
    '- **异常状态**：传入未知专辑 ID 时上游返回 `code: 404`，SDK 按业务拒绝原样返回，详见 [错误处理](/guide/error-handling)。',
  ],
  digitalAlbum_sales: [
    '- **未知专辑行为**：传入未知专辑 ID 时仍返回 `code: 200`，对应销量值为 `0`。',
  ],
  album_sub: [
    '- **可选 `checkToken`**：SDK 调用支持在第二个参数配置 `checkToken`（固定字符串或异步 provider 函数），详见 [配置参考](/guide/config) 与 [Watchman](/guide/watchman)；HTTP 服务不接受 `checkToken` 参数。',
    '- **请求身份**：收藏（`/weapi/album/sub`）与取消收藏（`/weapi/album/unsub`）均固定使用网页端协议与浏览器请求头，并保留当前登录 Cookie；写操作不缓存、不自动重试。',
  ],
  artist_sub: [
    '- **可选 `checkToken`**：SDK 调用支持在第二个参数配置 `checkToken`（固定字符串或异步 provider 函数），详见 [配置参考](/guide/config) 与 [Watchman](/guide/watchman)；HTTP 服务不接受 `checkToken` 参数。',
    '- **请求身份**：收藏与取消收藏均固定使用网页端协议与浏览器请求头，并保留当前登录 Cookie；写操作不缓存、不自动重试。',
  ],
  artist_follow_count: [
    '- **未知歌手**：传入未知歌手 ID 时上游返回 `code: 404` 且 `data` 为 `null`。',
  ],
  playlist_subscribe: [
    '- **可选 `checkToken`**：高频连续收藏可能触发上游 405 限流，推荐在 SDK 配置中通过异步 `checkToken` provider 从稳定设备/会话现场获取令牌（不要硬编码或跨请求复用同一令牌），详见 [Watchman](/guide/watchman) 与 [配置参考](/guide/config)；HTTP 服务不接受 `checkToken` 参数。',
    '- **请求身份**：收藏（`t=1`）与取消收藏（`t=0` 或 `t=2`）均固定使用网页端协议与浏览器请求头，并保留当前登录 Cookie；写操作不缓存、不自动重试。',
    '- **业务限制**：尝试收藏自己创建的歌单会返回 `code: 401`（歌单创建者已设置隐私）。',
  ],
  playlist_tracks: [
    '- **分步后备机制**：省略 `step` 时，若首次操作返回业务码 `512`，SDK 会自动将 `tracks` 重复追加发送一次后备请求。',
    "- **手动分步控制**：传入 `step: 'initial'` 时遇到 `512` 会直接失败返回，可由应用自行决定后续是否传入 `step: 'fallback'`（如重新获取 `checkToken` 后执行）；分步调用不共享历史状态，也不提供跨调用事务或回滚。",
    '- **令牌配置**：自动模式下如需 `checkToken`，请传入异步 provider 函数以支持逐请求获取新令牌，详见 [SDK 使用指南](/guide/sdk-usage)。',
  ],
  playlist_detail: [
    '- **曲目列表完整性**：未登录或歌单曲目较多时，`playlist.tracks` 可能只包含部分曲目；`playlist.trackIds` 包含完整的曲目 ID 列表，可配合 [获取歌曲详情](/api/music/song-detail) 批量拉取全部歌曲信息。',
    '- **登录态识别**：当登录 Cookie 失效回落到游客视角时，`playlist.subscribed` 会返回 `null`。',
  ],
  playlist_track_all: [
    '- **两阶段请求**：模块先请求歌单详情获取 `trackIds` 并按 `limit`/`offset` 切片，再批量请求歌曲详情返回最终结果。',
  ],
  playlist_update_playcount: [
    '- **接口行为**：仅用于累加歌单播放计数，请求成功仅返回 `code: 200`；若缺少 `id` 参数，上游返回空字符串 `""`。',
  ],
  playlist_import_name_task_create: [
    '- **导入模式**：支持三种互斥导入方式——传 `local`（元数据数组）、`text`（纯文本）或 `link`（链接数组）。',
    '- **任务轮询**：创建任务后可通过返回的 `data.taskId` 调用 [歌单导入任务状态](/api/playlist/playlist-import-task-status) 查询导入进度。',
  ],
  image_upload_token: [
    '- **工作流程**：调用本接口获取 `uploadUrl`、`token` 和 `imgId` 后，由客户端直接向 `uploadUrl` 发送 `POST`（携带请求头 `x-nos-token` 和 `Content-Type: image/jpeg` 与图片原始字节）。',
    '- **设为封面**：直传完成后，将 `imgId` 传给 [更新歌单封面](/api/playlist/playlist-cover-update)；即使封面更新失败也可复用同一 `imgId` 重试，无需重复上传。',
  ],
  playlist_cover_update: [
    '- **两种传参方式**：必须传入 `imgFile` 或 `imgId` 二者之一；同时传入或同时缺失时均会返回 `status: 400`。',
    '- **图片要求**：当前按 JPEG 处理且不再支持裁剪参数（`imgSize`/`imgX`/`imgY`），请在上传前完成裁剪。',
  ],
  avatar_upload: [
    '- **图片格式**：当前上传流程按 JPEG 处理且不再支持裁剪参数（`imgSize`/`imgX`/`imgY`），请在上传前完成图片裁剪。',
  ],
  cloud: [
    '- **音频元信息**：如需指定歌名、歌手或专辑名，可通过可选字段 `song`、`artist`、`album` 传入；省略时自动使用上传文件名与默认值。',
  ],
  voice_upload: [
    '- **分块流程**：内部自动按最多 10 MiB 分块完成凭证申请、初始化、逐块上传、合并、预检与发布提交（可通过 `composedSongs` 传入关联歌曲 ID 数组）。',
  ],
  cloud_import: [
    '- **导入前提**：仅当音频文件已有其他用户上传至云盘，或文件属于网易云曲库音源（此时必须提供正确的歌曲 `id`）时可导入成功。',
    '- **码率换算**：使用歌曲链接接口获取的 `br` 时需换算为 kb/s：`bitrate = Math.floor(br / 1000)`。',
    '- **文件后缀**：导入后的云盘条目文件名后缀统一显示为 `.mp3`，实际播放文件格式不受影响。',
  ],
  song_detail: [
    '- **扩展字段说明**：`songs[].fee`、`songs[].mark`、`songs[].t` 及 `privileges[].st` 等枚举与位掩码含义见 [Song](/api/shared-types#song) 与 [SongPrivilege](/api/shared-types#songprivilege)。',
  ],
  song_url: [
    '- **响应结构**：模块按请求传入的 `ids` 顺序重排 `data` 并统一输出 `code: 200`；单项是否可播放或受限于版权请检查 `data[].code` 与 `data[].url`。',
    '- **试听与防盗链**：仅可试听时 `data[].freeTrialInfo` 给出试听起止秒数；浏览器播放若遇 403，请在页面 `<head>` 添加 `<meta name="referrer" content="no-referrer">`。',
  ],
  song_url_v1: [
    '- **音质与设备**：实际返回的 `data[].level` 可能低于请求等级；获取杜比全景声等高阶音质通常需要账号对应会员权限并在 Cookie 中携带 `os=pc`。',
    '- **链接有效期与试听**：`data[].expi` 为链接有效秒数；仅限试听时 `freeTrialInfo` 标明片段起止秒数，无版权时 `url` 与 `level` 均为 `null`。',
  ],
  song_download_url: [
    '- **响应形态**：与 `/song/url` 不同，本接口 `data` 为单个对象（而非数组）。',
  ],
  song_download_url_v1: [
    '- **响应形态**：与 `/song/url/v1` 不同，本接口 `data` 为单个对象（而非数组）；传入无权限或无版权歌曲时 `data.url` 为 `null`。',
  ],
  song_dynamic_cover: [
    '- **签名有效期**：`data.videoPlayUrl` 附带时效签名参数（`wsSecret`/`wsTime`），切勿长期缓存该链接；歌曲无动态封面时该字段可能缺失或为 `null`。',
  ],
  song_chorus: [
    '- **时间单位**：副歌起止时间 `startTime` 与 `endTime` 单位均为毫秒。',
  ],
  check_music: [
    '- **返回体说明**：SDK 会将上游校验结果整理为固定结构 `{ code, success, message }`返回。',
  ],
  lyric_new: [
    '- **歌词类型**：`lrc` 为逐行歌词，`tlyric`/`romalrc` 为翻译与音译；`yrc` 为逐字歌词，`ytlrc`/`yromalrc` 为逐字对齐翻译与音译。无歌词或无对应版本时字段可能缺失或 `lyric` 为空串。',
    '- **逐字歌词格式**：`yrc.lyric` 中可能包含按行组织的 JSON 歌曲元数据（含 `t`、`c`/`tx`、`li`、`or`），以及 `[行起始毫秒,行时长毫秒](字起始毫秒,字时长厘秒,0)文字` 格式的逐字时间戳。',
  ],
  dj_program: [
    '- **音频播放**：节目对象中的 `mp3Url` 通常为 `null`，如需播放节目音频，可读取节目的 `mainTrackId` 并传入 [获取音乐 URL](/api/music/song-url)。',
  ],
  dj_toplist_hours: [
    '- **分页限制**：上游接口不支持 `offset` 参数，仅支持通过 `limit` 控制返回条数。',
  ],
  dj_toplist_newcomer: [
    '- **分页限制**：上游接口会忽略 `offset` 参数，仅支持通过 `limit` 控制返回条数。',
  ],
  dj_toplist_pay: [
    '- **分页限制**：上游接口不支持 `offset` 参数，仅支持通过 `limit` 控制返回条数。',
  ],
  dj_toplist_popular: [
    '- **分页限制**：上游接口不支持 `offset` 参数，仅支持通过 `limit` 控制返回条数。',
  ],
  voicelist_list: [
    '- **权限范围**：工作台接口仅允许读取当前登录账号自己的播客；读取他人播客或不存在的播客将返回 `code: 400`。',
    '- **声音状态**：常见 `displayStatus` 取值为 `ONLINE`（已发布）、`AUDITING`（审核中）、`ONLY_SELF_SEE`（仅自己可见）。',
  ],
  voicelist_list_search: [
    '- **权限范围**：工作台接口仅查询当前登录账号下的声音；可选按 `displayStatus`、`type`、`voiceFeeType` 筛选。',
  ],
  login: [
    '- **凭据优先级**：`password` 与 `md5_password` 二选一，同时传入时优先使用 `md5_password`。',
    '- **会话保存**：SDK 不会自动将登录 Cookie 写入已有 client；请保存响应中的 `result.cookie` 并在后续请求通过 `{ cookie }` 传入，详见 [认证机制](/guide/authentication)。',
  ],
  login_cellphone: [
    '- **凭据优先级**：`captcha`、`md5_password`、`password` 三选一，同时传入多个时按 `captcha` → `md5_password` → `password` 顺序生效。',
    '- **风控拦截**：上游触发安全风险校验时，拒绝结果的 `body` 符合 `LoginCellphoneRiskBody`（`code: 10004`），可通过 `redirectUrl` 引导验证或改用扫码登录。',
    '- **会话保存**：SDK 不会自动持久化登录状态，请保存 `result.cookie` 供后续调用使用，详见 [认证机制](/guide/authentication)。',
  ],
  login_qr_create: [
    '- **二维码渲染**：接口仅返回扫码登录链接 `data.qrurl`，二维码图片请由应用层自行使用 `qrcode` 等库按 `qrurl` 生成。',
  ],
  login_qr_check: [
    '- **轮询状态码**：`800` 二维码过期、`801` 等待扫码、`802` 已扫码待确认（含 `nickname` 与 `avatarUrl`）、`803` 授权登录成功。',
    '- **风控与 HTTP 选项**：触发行为验证时可能返回业务码 `8821`（可配合 [获取验证二维码](/api/other/verify-get-qr) 处理）；HTTP 调用支持额外传入 `noCookie=true` 禁止向响应头写入 `Set-Cookie`。',
  ],
  login_refresh: [
    '- **凭据轮换**：刷新成功后新 Cookie 位于 `result.cookie` 与 `body.cookie`；续期不会立即使旧 Cookie 失效。',
  ],
  user_account: [
    '- **身份判断**：三种登录状态均返回 `code: 200`，需结合 `account` 与 `profile` 判断——已登录时两者均为对象且 `account.anonimousUser` 为 `false`；匿名游客时仅 `account` 为对象且 `anonimousUser` 为 `true`；凭据失效时两者均为 `null`。',
  ],
  login_status: [
    '- **数据结构**：返回体在外层包裹了 `data`，内部结构与 [获取账号信息](/api/user/user-account) 一致。',
  ],
  user_social_status_edit: [
    '- **参数校验**：`type`、`iconUrl`、`content`、`actionUrl` 不能全部为空，否则上游返回 `code: 500`。',
  ],
  verify_getQr: [
    '- **二维码渲染**：接口仅返回验证票据 `data.qrCode` 与验证链接 `data.qrurl`，二维码图片请由应用层自行使用 `qrcode` 等库按 `qrurl` 生成。',
  ],
  verify_qrcodestatus: [
    '- **状态码组合**：`data.qrCodeStatus` 表示扫描进度（`0` 已生成、`10` 已扫描、`20` 验证成功、`21` 已失效），`data.detailReason` 表示校验结果（`0` 正常、`303` 账号不一致）。',
  ],
  comment: [
    '- **动态评论**：当 `type=6`（动态）时，实际使用 `threadId` 字段标识动态，无需依赖数字资源 ID。',
  ],
  comment_like: [
    '- **动态评论点赞**：当 `type=6`（动态）时，需传入动态的 `threadId`。',
  ],
  resource_like: [
    '- **动态点赞**：当 `type=6`（动态）时，需传入动态的 `threadId`（可从动态接口获取）。',
  ],
  share_resource: [
    '- **内容限制**：分享文案 `msg` 限制 140 字以内，支持 emoji；`@用户名` 后需保留空格，暂不支持附带图片。',
  ],
  user_event: [
    '- **动态类型枚举**：返回事件 `type` 常见取值包括 `18` 分享单曲、`19` 分享专辑、`17`/`28` 分享电台节目、`22` 转发、`39` 发布视频、`35`/`13` 分享歌单、`24` 分享专栏、`41`/`21` 分享视频。',
  ],
  user_follow_mixed: [
    '- **歌手条目差异**：当记录表示关注的歌手（`type === 2`）时，`userProfile` 字段为 `null`。',
  ],
  scrobble: [
    '- **播放来源约定**：`source` 常用值与 `sourceid` 对应关系——`list`（歌单 ID）、`album`（专辑 ID）、`artist`（歌手 ID）；`recommend`/`search`/`download` 无容器 ID 时 `sourceid` 传 `0`。',
    '- **数据延迟**：听歌打卡计入用户听歌排行存在上游延迟，返回 `code: 200` 不代表排行立即更新。',
  ],
  mlog_music_rcmd: [
    '- **结果相关性**：在关联 Mlog 之后，接口偶尔会附带不相关的推荐视频，建议按需截断处理。',
  ],
  mlog_to_video: [
    '- **返回值说明**：转换成功后 `data` 返回长度为 32 位的十六进制视频 ID 字符串。',
  ],
  mv_detail: [
    '- **播放地址**：MV 视频链接存在防盗链处理，需配合 [获取 MV 播放地址](/api/video/mv-url) 获取可播放 URL。',
  ],
  listen_data_report: [
    '- **年份限制**：若当年尚未结束，暂不支持查询当年全年统计数据。',
  ],
  listen_data_realtime_report: [
    '- **年份限制**：若当年尚未结束，暂不支持查询当年实时统计数据。',
  ],
  summary_annual: [
    '- **年份字段差异**：2020 年及以后年份的年度报告使用长字段键，2017–2019 年使用 `userdata` 短键结构。',
  ],
  top_list: [
    '- **已废弃参数**：`idx` 参数已不再支持，传入会在本地直接返回 `code: 500`；请改用排行榜歌单 `id` 查询，或直接调用 [获取歌单详情](/api/playlist/playlist-detail)。',
  ],
  related_playlist: [
    '- **接口状态**：原上游网页抓取来源已失效，建议改用 [相关歌单推荐](/api/playlist/playlist-detail-rcmd-get)。',
  ],
  daily_signin: [
    '- **签到经验差异**：`type=0`（Android 端）签到可获得 3 点经验，`type=1`（Web/PC 端）签到可获得 2 点经验。',
  ],
  broadcast_channel_currentinfo: [
    '- **空闲频道状态**：当广播频道暂无正在播放节目时，`programId`、`startTime`、`endTime` 与 `duration` 为 `0`，`programName` 为 `null`。',
  ],
  listentogether_room_create: [
    '- **后续调用流程**：创建成功后取 `data.roomInfo.roomId` 与 `creatorId` 构造分享链接，并依次配合 [检查房间](/api/together/listentogether-room-check) 与 [同步播放列表](/api/together/listentogether-sync-list-command) 使用。',
  ],
  listentogether_accept: [
    '- **调用顺序**：从分享链接获取 `roomId` 与 `inviterId` → 调用本接口加入房间 → 调用 [检查房间](/api/together/listentogether-room-check) 与 [获取房间状态](/api/together/listentogether-status) 同步最新状态；加入已结束房间会返回 `code: 488`。',
  ],
  listentogether_status: [
    '- **房间状态判断**：当 `data.inRoom` 为 `false` 时，表示当前账号不在房间中，需要重新创建房间或接受邀请；在线成员列表位于 `data.roomInfo.roomUsers`。',
  ],
  listentogether_room_check: [
    '- **可用性字段**：`data.joinable` 表示房间当前是否可加入，`data.status` 常见可用状态为 `AVAILABLE`。',
  ],
  listentogether_play_command: [
    '- **心跳配合**：发送播放控制指令后，通常需配合 [上报一起听心跳](/api/together/listentogether-heatbeat) 维持房间播放状态。',
  ],
  listentogether_heatbeat: [
    '- **联动接口**：用于定时维持房间播放进度，常与 [播放控制指令](/api/together/listentogether-play-command) 及 [获取房间状态](/api/together/listentogether-status) 配合调用。',
  ],
  listentogether_sync_list_command: [
    '- **参数格式**：`displayList` 与 `randomList` 需传入数字/字符串 ID 数组，SDK 会自动编码为上游所需的列表同步载荷；推送后从机可调用 [获取同步歌单](/api/together/listentogether-sync-playlist-get) 拉取快照。',
  ],
  listentogether_sync_playlist_get: [
    '- **详情补全**：返回的列表快照包含歌曲 ID 列表（如 `data.playlist.displayList.result`），如需完整歌曲信息请再调用 [获取歌曲详情](/api/music/song-detail)。',
  ],
  listentogether_end: [
    '- **关闭房间**：房主结束一起听会话或前端清理无效房间时调用，可结合 `data.success` 判断是否关闭成功。',
  ],
  batch: [
    '- **子请求格式**：传入对象中所有以 `/api/` 开头的键都会作为子路由转发至上游（如 `"/api/v2/banner/get": { clientType: "pc" }`），每个值必须是对象参数字典。',
  ],
  search: [
    '- **声音搜索**：当 `type=2000` 时请求独立声音搜索接口，返回体结构位于 `data` 字段而非 `result`。',
  ],
  cloudsearch: [
    '- **声音搜索**：当 `type=2000` 时返回声音结构，建议在代码中按 `type` 分别读取 `result` 内的对应列表字段。',
  ],
};

const RESPONSE_FIELD_NOTES: Readonly<Record<string, string>> = {
  code: '业务状态码（`200` 表示成功）',
  msg: '提示信息',
  message: '返回说明信息',
  data: '接口返回的数据主体',
  result: '接口返回的结果主体',
  cookie: '拼接后的 Cookie 字符串',
  account: '账号状态信息（未登录或凭据失效时为 `null`）',
  profile: '用户资料信息（未登录或匿名账号时为 `null`）',
  bindings: '账号第三方绑定列表',
  songs: '歌曲列表',
  privileges: '歌曲播放与下载权限列表',
  playlists: '歌单列表',
  playlist: '歌单详情',
  artists: '歌手列表',
  artist: '歌手详情',
  albums: '专辑列表',
  album: '专辑信息',
  mvs: 'MV 列表',
  comments: '评论列表',
  hotComments: '热门评论列表',
  topComments: '置顶评论列表',
  programs: '电台节目列表',
  program: '电台节目详情',
  djRadios: '电台列表',
  subscribers: '订阅者列表',
  events: '动态列表',
  event: '动态列表',
  forwards: '@我 转发列表',
  notices: '系统通知列表',
  msgs: '私信会话列表',
  urls: '播放或下载链接列表',
  url: '资源访问地址',
  hasMore: '是否还有更多数据',
  more: '是否还有更多数据',
  total: '总条目数',
  count: '条目总数',
  totalCount: '评论或条目总数',
  cursor: '下一页分页游标',
  lasttime: '下一页游标时间戳',
  lastTime: '下一页游标时间戳',
  subed: '是否已收藏/订阅',
  subscribed: '是否已收藏',
  followed: '是否已关注',
  liked: '是否已点赞',
  likedCount: '点赞数',
  commentCount: '评论数',
  shareCount: '分享数',
  success: '操作是否成功',
  userId: '用户 ID',
  tagId: '曲风标签 ID',
  actId: '话题 ID',
  mvId: 'MV ID',
  songId: '歌曲 ID',
  taskId: '异步任务 ID',
  roomId: '一起听房间 ID',
  qrCode: '验证二维码标识',
  qrurl: '二维码对应的授权页面 URL',
  qrimg: '二维码图片 Data URL（未开启 `qrimg` 时为空字符串）',
  qrCodeStatus:
    '二维码状态（`0` 已生成、`10` 已扫描、`20` 验证成功、`21` 已失效）',
  detailReason: '状态原因码（`0` 正常、`303` 账号不一致）',
  unikey: '二维码登录唯一标识 key',
  version: '当前服务版本号',
  duplicated: '昵称是否已被占用',
  candidateNicknames: '推荐的可用替代昵称列表（仅昵称重复时出现）',
  lrc: '逐行歌词对象',
  tlyric: '歌词翻译对象',
  romalrc: '歌词音译对象',
  yrc: '逐字歌词对象',
  ytlrc: '逐字歌词翻译对象',
  yromalrc: '逐字歌词音译对象',
  klyric: '卡拉 OK 歌词对象',
  pureMusic: '是否为纯音乐',
  lyricUser: '歌词贡献者信息',
  transUser: '翻译贡献者信息',
  videoPlayUrl: '动态封面视频播放 URL',
  nicknames: '昵称到用户 ID 的映射字典',
  userPoint: '当前账号云贝余额与积分信息',
  balance: '当前云贝余额',
  growthPoint: '当前成长值',
  blocks: '首页发现模块列表',
  blockCode: '首页模块编码',
  creatives: '模块内容卡片列表（Banner 等特殊模块无此字段）',
  banners: '轮播 Banner 列表',
  hots: '热搜词列表',
  first: '热搜关键词',
  searchWord: '热搜关键词',
  showKeyword: '搜索框展示推荐词',
  realkeyword: '实际触发搜索的关键词',
  list: '结果条目列表',
  toplist: '排行榜列表',
  recommend: '推荐条目列表',
  records: '记录列表',
  details: '明细列表',
  products: '数字专辑商品列表',
  albumProducts: '数字专辑商品列表',
  product: '商品售价与简介信息',
  checkToken: '风控校验令牌',
  redirectUrl: '手机号复用风控验证页面 URL',
  id: '记录 ID',
  artistId: '歌手 ID',
  albumId: '专辑 ID',
  playlistId: '歌单 ID',
  creatorId: '创建者 ID',
  resourceId: '资源 ID',
  commentId: '评论 ID',
  threadId: '评论线程 ID',
  djId: '主播用户 ID',
  programId: '电台节目 ID',
  radioId: '电台 ID',
  videoId: '视频 ID',
  vid: '视频 ID',
  alg: '推荐算法标识',
  bindingTime: '绑定时间戳（毫秒）',
  expired: '是否已过期',
  expiresIn: '有效期时长（秒）',
  refreshTime: '令牌刷新时间戳',
  tokenJsonStr: '序列化令牌信息 JSON 字符串',
  hitType: '命中类型',
  loginType: '登录方式标识',
  token: '认证令牌',
  cover: '封面图片 URL',
  arTransName: '歌手译名',
  mark: '状态标记位',
  name: '名称',
  level: '当前等级',
  progress: '当前升级进度',
  nextLoginCount: '升至下一等级所需登录天数',
  nextPlayCount: '升至下一等级所需听歌次数',
  nowLoginCount: '当前累计登录天数',
  nowPlayCount: '当前累计听歌次数',
  full: '是否已达到满级',
  nickname: '用户昵称',
  avatarUrl: '头像图片 URL',
  duration: '时长（毫秒）',
  trackIds: '曲目 ID 列表',
  vipType: '会员类型标识',
  artistName: '歌手名称',
  artistNames: '歌手名称列表或文本',
  albumName: '专辑名称',
  playCount: '播放次数',
  bookCount: '收藏数',
  cloudCount: '云盘曲目数',
  fansSize: '粉丝数',
  price: '价格',
  saleNum: '销量',
  isFree: '是否免费',
  finished: '是否已完成或售罄',
  canBuy: '是否可购买',
  hasAlbum: '是否已拥有专辑',
  tags: '标签列表',
  title: '标题',
  description: '描述信息',
  desc: '简介信息',
  content: '正文内容',
};

const evaluateLiteral = (
  node: Expression,
): string | number | boolean | undefined => {
  if (isStringLiteral(node)) {
    return node.text;
  }
  if (isNumericLiteral(node)) {
    return Number(node.text);
  }
  if (node.kind === SyntaxKind.TrueKeyword) {
    return true;
  }
  if (node.kind === SyntaxKind.FalseKeyword) {
    return false;
  }
  if (isPrefixUnaryExpression(node)) {
    const operand = evaluateLiteral(node.operand);
    if (
      node.operator === SyntaxKind.MinusToken &&
      typeof operand === 'number'
    ) {
      return -operand;
    }
  }
  return undefined;
};

const parseSchemaExpression = (
  expr: Expression,
  source: SourceFile,
  locals: ReadonlyMap<string, Expression>,
  sharedSet: ReadonlySet<string>,
  localHelpers: Map<string, SchemaTypeNode>,
  localSpreads: ReadonlyMap<string, ReadonlyArray<ObjectFieldSpec>>,
  fallbacks: Array<string>,
): SchemaTypeNode => {
  if (isIdentifier(expr)) {
    const name = expr.text;
    if (sharedSet.has(name)) {
      return { kind: 'ref', name, isShared: true };
    }
    if (name === 'UploadedFile') {
      return { kind: 'uploadedFile' };
    }
    if (name === 'NumberId' || name === 'QueryIdentifier') {
      return {
        kind: 'union',
        members: [
          { kind: 'primitive', name: 'number' },
          { kind: 'primitive', name: 'string' },
        ],
      };
    }
    if (name === 'NumberIdList') {
      return {
        kind: 'array',
        item: {
          kind: 'union',
          members: [
            { kind: 'primitive', name: 'number' },
            { kind: 'primitive', name: 'string' },
          ],
        },
      };
    }
    if (
      name === 'NaturalValue' ||
      name === 'IntegerValue' ||
      name === 'NumberValue'
    ) {
      return { kind: 'primitive', name: 'number' };
    }
    if (name === 'BooleanValue') {
      return { kind: 'primitive', name: 'boolean' };
    }
    const localExpr = locals.get(name);
    if (localExpr) {
      if (isObjectLiteralExpression(localExpr)) {
        // Standalone fields object like styleTagFields passed directly to UpstreamObject(...)
        const fields = parseObjectFields(
          localExpr,
          source,
          locals,
          sharedSet,
          localHelpers,
          localSpreads,
          fallbacks,
        );
        return { kind: 'object', fields: fields.fields };
      }
      if (!localHelpers.has(name)) {
        // Placeholder first to prevent infinite recursion if ever self-referential
        localHelpers.set(name, { kind: 'emptyRecord' });
        const resolved = parseSchemaExpression(
          localExpr,
          source,
          locals,
          sharedSet,
          localHelpers,
          localSpreads,
          fallbacks,
        );
        localHelpers.set(name, resolved);
      }
      return { kind: 'ref', name, isShared: false };
    }
    fallbacks.push(`${source.fileName}: unhandled Identifier "${name}"`);
    return { kind: 'primitive', name: 'UnknownJson' };
  }

  if (isPropertyAccessExpression(expr)) {
    const text = expr.getText(source);
    if (text === 'Schema.String') return { kind: 'primitive', name: 'string' };
    if (text === 'Schema.Finite') return { kind: 'primitive', name: 'number' };
    if (text === 'Schema.Boolean') {
      return { kind: 'primitive', name: 'boolean' };
    }
    if (text === 'Schema.Null') return { kind: 'primitive', name: 'null' };
    if (text === 'Schema.Unknown') {
      return { kind: 'primitive', name: 'UnknownJson' };
    }
    fallbacks.push(`${source.fileName}: unhandled PropertyAccess "${text}"`);
    return { kind: 'primitive', name: 'UnknownJson' };
  }

  if (isCallExpression(expr)) {
    const callee = expr.expression;
    if (isPropertyAccessExpression(callee)) {
      const methodName = callee.name.text;
      if (methodName === 'annotate' || methodName === 'check') {
        return parseSchemaExpression(
          callee.expression,
          source,
          locals,
          sharedSet,
          localHelpers,
          localSpreads,
          fallbacks,
        );
      }
      if (methodName === 'pipe') {
        let current = parseSchemaExpression(
          callee.expression,
          source,
          locals,
          sharedSet,
          localHelpers,
          localSpreads,
          fallbacks,
        );
        for (const arg of expr.arguments) {
          const argText = arg.getText(source);
          if (argText === 'Schema.Array') {
            current = { kind: 'array', item: current };
          } else if (
            argText === 'Loose' ||
            argText === 'Optional' ||
            argText === 'Schema.optional'
          ) {
            // Requirement wrappers handled by field parser; if called standalone, wrap nullable
          } else {
            fallbacks.push(
              `${source.fileName}: unhandled pipe arg "${argText}"`,
            );
          }
        }
        return current;
      }
    }

    const calleeText = callee.getText(source);
    if (calleeText === 'defineModuleBody') {
      const first = expr.arguments[0];
      if (first) {
        return parseSchemaExpression(
          first,
          source,
          locals,
          sharedSet,
          localHelpers,
          localSpreads,
          fallbacks,
        );
      }
    }
    if (calleeText === 'UpstreamObject' || calleeText === 'Schema.Struct') {
      const arg = expr.arguments[0];
      if (!arg) return { kind: 'emptyRecord' };
      if (isIdentifier(arg)) {
        const target = locals.get(arg.text);
        if (target && isObjectLiteralExpression(target)) {
          const parsed = parseObjectFields(
            target,
            source,
            locals,
            sharedSet,
            localHelpers,
            localSpreads,
            fallbacks,
          );
          return parsed.fields.length === 0 && !parsed.baseRef
            ? { kind: 'emptyRecord' }
            : {
                kind: 'object',
                fields: parsed.fields,
                baseRef: parsed.baseRef,
                omittedKeys: parsed.omittedKeys,
                isSharedBase: parsed.isSharedBase,
              };
        }
      }
      if (isObjectLiteralExpression(arg)) {
        const parsed = parseObjectFields(
          arg,
          source,
          locals,
          sharedSet,
          localHelpers,
          localSpreads,
          fallbacks,
        );
        return parsed.fields.length === 0 && !parsed.baseRef
          ? { kind: 'emptyRecord' }
          : {
              kind: 'object',
              fields: parsed.fields,
              baseRef: parsed.baseRef,
              omittedKeys: parsed.omittedKeys,
              isSharedBase: parsed.isSharedBase,
            };
      }
      fallbacks.push(
        `${source.fileName}: non-object arg in ${calleeText}: ${arg.getText(source)}`,
      );
      return { kind: 'emptyRecord' };
    }
    if (
      calleeText === 'Loose' ||
      calleeText === 'Optional' ||
      calleeText === 'Schema.optional'
    ) {
      const inner = expr.arguments[0];
      if (inner) {
        return parseSchemaExpression(
          inner,
          source,
          locals,
          sharedSet,
          localHelpers,
          localSpreads,
          fallbacks,
        );
      }
    }
    if (calleeText === 'Schema.NullOr') {
      const inner = expr.arguments[0];
      if (inner) {
        const innerNode = parseSchemaExpression(
          inner,
          source,
          locals,
          sharedSet,
          localHelpers,
          localSpreads,
          fallbacks,
        );
        return {
          kind: 'union',
          members: [innerNode, { kind: 'primitive', name: 'null' }],
        };
      }
    }
    if (calleeText === 'Schema.Array') {
      const inner = expr.arguments[0];
      if (inner) {
        return {
          kind: 'array',
          item: parseSchemaExpression(
            inner,
            source,
            locals,
            sharedSet,
            localHelpers,
            localSpreads,
            fallbacks,
          ),
        };
      }
    }
    if (calleeText === 'Schema.Literal') {
      const arg = expr.arguments[0];
      if (arg) {
        const value = evaluateLiteral(arg);
        if (value !== undefined) {
          return { kind: 'literal', value };
        }
      }
      fallbacks.push(`${source.fileName}: unhandled Schema.Literal`);
      return { kind: 'primitive', name: 'UnknownJson' };
    }
    if (calleeText === 'Schema.Literals' || calleeText === 'NumberLiterals') {
      const arg = expr.arguments[0];
      const members: Array<SchemaTypeNode> = [];
      let listExpr = arg;
      if (arg && isIdentifier(arg)) {
        listExpr = locals.get(arg.text);
      }
      if (listExpr && isArrayLiteralExpression(listExpr)) {
        for (const el of listExpr.elements) {
          const val = evaluateLiteral(el);
          if (val !== undefined) {
            members.push({ kind: 'literal', value: val });
          }
        }
      }
      if (members.length > 0) {
        return members.length === 1 ? members[0]! : { kind: 'union', members };
      }
      fallbacks.push(`${source.fileName}: unhandled ${calleeText}`);
      return { kind: 'primitive', name: 'UnknownJson' };
    }
    if (calleeText === 'Schema.Record') {
      const keyArg = expr.arguments[0];
      const valArg = expr.arguments[1];
      if (keyArg && valArg) {
        return {
          kind: 'record',
          key: parseSchemaExpression(
            keyArg,
            source,
            locals,
            sharedSet,
            localHelpers,
            localSpreads,
            fallbacks,
          ),
          value: parseSchemaExpression(
            valArg,
            source,
            locals,
            sharedSet,
            localHelpers,
            localSpreads,
            fallbacks,
          ),
        };
      }
    }
    if (calleeText === 'Schema.Union') {
      const arr = expr.arguments[0];
      if (arr && isArrayLiteralExpression(arr)) {
        return {
          kind: 'union',
          members: arr.elements.map((el) =>
            parseSchemaExpression(
              el,
              source,
              locals,
              sharedSet,
              localHelpers,
              localSpreads,
              fallbacks,
            ),
          ),
        };
      }
    }
    fallbacks.push(`${source.fileName}: unhandled call "${calleeText}"`);
    return { kind: 'primitive', name: 'UnknownJson' };
  }

  fallbacks.push(
    `${source.fileName}: unhandled schema node ${SyntaxKind[expr.kind]} (${expr.getText(source).slice(0, 60)})`,
  );
  return { kind: 'primitive', name: 'UnknownJson' };
};

const parseObjectFields = (
  obj: Expression,
  source: SourceFile,
  locals: ReadonlyMap<string, Expression>,
  sharedSet: ReadonlySet<string>,
  localHelpers: Map<string, SchemaTypeNode>,
  localSpreads: ReadonlyMap<string, ReadonlyArray<ObjectFieldSpec>>,
  fallbacks: Array<string>,
): {
  readonly fields: Array<ObjectFieldSpec>;
  readonly baseRef?: string;
  readonly isSharedBase?: boolean;
  readonly omittedKeys?: Array<string>;
} => {
  if (!isObjectLiteralExpression(obj)) {
    return { fields: [] };
  }
  const fields: Array<ObjectFieldSpec> = [];
  const fieldNames = new Set<string>();
  let baseRef: string | undefined;
  let isSharedBase: boolean | undefined;

  // First pass: collect explicit fields so we know which base fields are overridden
  const explicitEntries: Array<{
    readonly name: string;
    readonly init: Expression;
  }> = [];
  const spreadExprs: Array<string> = [];

  for (const prop of obj.properties) {
    if (isSpreadAssignment(prop)) {
      spreadExprs.push(prop.expression.getText(source));
      continue;
    }
    if (isPropertyAssignment(prop)) {
      const propName = isStringLiteral(prop.name)
        ? prop.name.text
        : prop.name.getText(source);
      fieldNames.add(propName);
      explicitEntries.push({ name: propName, init: prop.initializer });
    } else if (isShorthandPropertyAssignment(prop) && isIdentifier(prop.name)) {
      const propName = prop.name.text;
      fieldNames.add(propName);
      explicitEntries.push({ name: propName, init: prop.name });
    } else {
      fallbacks.push(
        `${source.fileName}: unhandled object property ${SyntaxKind[prop.kind]}`,
      );
    }
  }

  for (const spreadText of spreadExprs) {
    if (spreadText.endsWith('.schema.fields')) {
      const targetName = spreadText.slice(0, -'.schema.fields'.length);
      if (sharedSet.has(targetName)) {
        baseRef = targetName;
        isSharedBase = true;
      } else if (locals.has(targetName)) {
        // Ensure local helper is parsed too
        if (!localHelpers.has(targetName)) {
          const targetInit = locals.get(targetName)!;
          localHelpers.set(targetName, { kind: 'emptyRecord' });
          localHelpers.set(
            targetName,
            parseSchemaExpression(
              targetInit,
              source,
              locals,
              sharedSet,
              localHelpers,
              localSpreads,
              fallbacks,
            ),
          );
        }
        baseRef = targetName;
        isSharedBase = false;
      } else {
        fallbacks.push(
          `${source.fileName}: unknown spread target "${spreadText}"`,
        );
      }
    } else {
      const localBag = localSpreads.get(spreadText);
      if (localBag) {
        for (const item of localBag) {
          if (!fieldNames.has(item.name)) {
            fields.push(item);
          }
        }
      } else {
        fallbacks.push(
          `${source.fileName}: unknown local spread "${spreadText}"`,
        );
      }
    }
  }

  const omittedKeys: Array<string> = [];
  if (baseRef) {
    for (const key of fieldNames) {
      omittedKeys.push(key);
    }
  }

  for (const entry of explicitEntries) {
    const { requirement, innerExpr } = unwrapFieldRequirement(
      entry.init,
      source,
    );
    const type = parseSchemaExpression(
      innerExpr,
      source,
      locals,
      sharedSet,
      localHelpers,
      localSpreads,
      fallbacks,
    );
    fields.push({
      name: entry.name,
      type,
      requirement,
    });
  }

  return {
    fields,
    baseRef,
    isSharedBase,
    omittedKeys: omittedKeys.length > 0 ? omittedKeys : undefined,
  };
};

const unwrapFieldRequirement = (
  expr: Expression,
  source: SourceFile,
): {
  readonly requirement: RequirementKind;
  readonly innerExpr: Expression;
} => {
  if (isCallExpression(expr)) {
    const calleeText = expr.expression.getText(source);
    if (calleeText === 'Loose' || calleeText === 'Schema.optional') {
      const arg = expr.arguments[0];
      if (arg) {
        return { requirement: 'loose', innerExpr: arg };
      }
    }
    if (calleeText === 'Optional') {
      const arg = expr.arguments[0];
      if (arg) {
        return { requirement: 'optional', innerExpr: arg };
      }
    }
    if (
      isPropertyAccessExpression(expr.expression) &&
      expr.expression.name.text === 'pipe'
    ) {
      const lastArg = expr.arguments.at(-1)?.getText(source);
      if (lastArg === 'Loose' || lastArg === 'Schema.optional') {
        // Strip the last Loose/Schema.optional from pipe? Actually keep Schema.Array if first arg
        const firstArg = expr.arguments[0]?.getText(source);
        if (firstArg === 'Schema.Array') {
          return { requirement: 'loose', innerExpr: expr };
        }
      }
      if (lastArg === 'Optional') {
        return { requirement: 'optional', innerExpr: expr };
      }
    }
  }
  return { requirement: 'required', innerExpr: expr };
};

const collectLocalsAndBags = (
  source: SourceFile,
  sharedSet: ReadonlySet<string>,
  fallbacks: Array<string>,
): {
  readonly locals: Map<string, Expression>;
  readonly localSpreads: Map<string, ReadonlyArray<ObjectFieldSpec>>;
  readonly localHelpers: Map<string, SchemaTypeNode>;
} => {
  const locals = new Map<string, Expression>();
  const localSpreads = new Map<string, ReadonlyArray<ObjectFieldSpec>>();
  const localHelpers = new Map<string, SchemaTypeNode>();

  for (const stmt of source.statements) {
    if (isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (decl.initializer) {
          locals.set(decl.name.getText(source), decl.initializer);
        }
      }
    }
  }

  for (const [name, init] of locals) {
    if (isObjectLiteralExpression(init)) {
      const parsed = parseObjectFields(
        init,
        source,
        locals,
        sharedSet,
        localHelpers,
        localSpreads,
        fallbacks,
      );
      localSpreads.set(name, parsed.fields);
    }
  }

  return { locals, localSpreads, localHelpers };
};

const inlinePrivateRefs = (
  node: SchemaTypeNode,
  exportedSet: ReadonlySet<string>,
  privateHelpers: ReadonlyMap<string, SchemaTypeNode>,
): SchemaTypeNode => {
  switch (node.kind) {
    case 'ref': {
      if (!node.isShared && !exportedSet.has(node.name)) {
        const helper = privateHelpers.get(node.name);
        if (helper) {
          return inlinePrivateRefs(helper, exportedSet, privateHelpers);
        }
      }
      return node;
    }
    case 'array':
      return {
        kind: 'array',
        item: inlinePrivateRefs(node.item, exportedSet, privateHelpers),
      };
    case 'record':
      return {
        kind: 'record',
        key: inlinePrivateRefs(node.key, exportedSet, privateHelpers),
        value: inlinePrivateRefs(node.value, exportedSet, privateHelpers),
      };
    case 'union':
      return {
        kind: 'union',
        members: node.members.map((member) =>
          inlinePrivateRefs(member, exportedSet, privateHelpers),
        ),
      };
    case 'object':
      return {
        ...node,
        fields: node.fields.map((field) => ({
          ...field,
          type: inlinePrivateRefs(field.type, exportedSet, privateHelpers),
        })),
      };
    case 'primitive':
    case 'literal':
    case 'emptyRecord':
    case 'uploadedFile':
      return node;
  }
  return node;
};

const parseSharedSchemas = (
  source: SourceFile,
  fallbacks: Array<string>,
): Map<string, SharedEntitySpec> => {
  const exportedNames: Array<string> = [];
  for (const stmt of source.statements) {
    if (
      isVariableStatement(stmt) &&
      stmt.modifiers?.some(
        (modifier) => modifier.kind === SyntaxKind.ExportKeyword,
      )
    ) {
      for (const decl of stmt.declarationList.declarations) {
        exportedNames.push(decl.name.getText(source));
      }
    }
  }
  const exportedSet = new Set(exportedNames);
  const { locals, localSpreads, localHelpers } = collectLocalsAndBags(
    source,
    exportedSet,
    fallbacks,
  );

  // Parse all non-exported helper schemas first
  for (const [name, init] of locals) {
    if (!exportedSet.has(name) && !isObjectLiteralExpression(init)) {
      if (!localHelpers.has(name)) {
        localHelpers.set(name, { kind: 'emptyRecord' });
        localHelpers.set(
          name,
          parseSchemaExpression(
            init,
            source,
            locals,
            exportedSet,
            localHelpers,
            localSpreads,
            fallbacks,
          ),
        );
      }
    }
  }

  const result = new Map<string, SharedEntitySpec>();
  for (const name of exportedNames) {
    const init = locals.get(name);
    if (!init) continue;
    const raw = parseSchemaExpression(
      init,
      source,
      locals,
      exportedSet,
      localHelpers,
      localSpreads,
      fallbacks,
    );
    result.set(name, {
      name,
      node: inlinePrivateRefs(raw, exportedSet, localHelpers),
    });
  }
  return result;
};

const extractQueryDefaults = (
  source: SourceFile,
): ReadonlyMap<string, string> => {
  const defaults = new Map<string, string>();
  const visit = (node: Node): void => {
    if (
      isBinaryExpression(node) &&
      (node.operatorToken.kind === SyntaxKind.QuestionQuestionToken ||
        node.operatorToken.kind === SyntaxKind.BarBarToken)
    ) {
      if (isPropertyAccessExpression(node.left)) {
        const targetObj = node.left.expression.getText(source);
        if (targetObj === 'query' || targetObj === 'input') {
          const propName = node.left.name.text;
          const rightText = node.right.getText(source).trim();
          const lit = evaluateLiteral(node.right);
          if (lit !== undefined) {
            if (!defaults.has(propName)) {
              defaults.set(propName, `\`${String(lit)}\``);
            }
          } else if (rightText === 'Date.now()') {
            if (!defaults.has(propName)) {
              defaults.set(propName, '当前时间戳');
            }
          } else if (rightText === '[0]') {
            if (!defaults.has(propName)) {
              defaults.set(propName, '`[0]`');
            }
          }
        }
      }
    }
    node.forEachChild(visit);
  };
  source.forEachChild(visit);
  return defaults;
};

const resolveInputTsType = (
  typeNode: TypeNode,
  source: SourceFile,
  typeAliases: ReadonlyMap<string, TypeNode>,
  schemaLocals: ReadonlyMap<string, Expression>,
  sharedSet: ReadonlySet<string>,
  localHelpers: Map<string, SchemaTypeNode>,
  localSpreads: ReadonlyMap<string, ReadonlyArray<ObjectFieldSpec>>,
  fallbacks: Array<string>,
): {
  readonly tsType: string;
  readonly isArray: boolean;
  readonly isObjectArray: boolean;
  readonly isUploadedFile: boolean;
  readonly isNumberId: boolean;
  readonly isNumberIdList: boolean;
  readonly isBoolean: boolean;
  readonly isNumber: boolean;
  readonly enumValues?: ReadonlyArray<string | number>;
} => {
  const raw = typeNode.getText(source).replaceAll(/\s+/gu, ' ').trim();
  if (raw === 'NumberId') {
    return {
      tsType: '`number | string`',
      isArray: false,
      isObjectArray: false,
      isUploadedFile: false,
      isNumberId: true,
      isNumberIdList: false,
      isBoolean: false,
      isNumber: false,
    };
  }
  if (raw === 'NumberIdList') {
    return {
      tsType: '`Array<number | string>`',
      isArray: true,
      isObjectArray: false,
      isUploadedFile: false,
      isNumberId: false,
      isNumberIdList: true,
      isBoolean: false,
      isNumber: false,
    };
  }
  if (raw === 'ReadonlyArray<NumberId>') {
    return {
      tsType: '`Array<number | string>`',
      isArray: true,
      isObjectArray: false,
      isUploadedFile: false,
      isNumberId: false,
      isNumberIdList: false,
      isBoolean: false,
      isNumber: false,
    };
  }
  if (raw === 'ReadonlyArray<NumberId> | string') {
    return {
      tsType: '`Array<number | string> | string`',
      isArray: false,
      isObjectArray: false,
      isUploadedFile: false,
      isNumberId: false,
      isNumberIdList: false,
      isBoolean: false,
      isNumber: false,
    };
  }
  if (raw === 'NumberId | NumberIdList') {
    return {
      tsType: '`number | string | Array<number | string>`',
      isArray: false,
      isObjectArray: false,
      isUploadedFile: false,
      isNumberId: false,
      isNumberIdList: false,
      isBoolean: false,
      isNumber: false,
    };
  }
  if (raw === 'NumberId | string') {
    return {
      tsType: '`number | string`',
      isArray: false,
      isObjectArray: false,
      isUploadedFile: false,
      isNumberId: false,
      isNumberIdList: false,
      isBoolean: false,
      isNumber: false,
    };
  }
  if (
    raw === 'NaturalValue' ||
    raw === 'IntegerValue' ||
    raw === 'NumberValue' ||
    raw === 'number'
  ) {
    return {
      tsType: '`number`',
      isArray: false,
      isObjectArray: false,
      isUploadedFile: false,
      isNumberId: false,
      isNumberIdList: false,
      isBoolean: false,
      isNumber: true,
    };
  }
  if (raw === 'BooleanValue' || raw === 'boolean') {
    return {
      tsType: '`boolean`',
      isArray: false,
      isObjectArray: false,
      isUploadedFile: false,
      isNumberId: false,
      isNumberIdList: false,
      isBoolean: true,
      isNumber: false,
    };
  }
  if (raw === 'string') {
    return {
      tsType: '`string`',
      isArray: false,
      isObjectArray: false,
      isUploadedFile: false,
      isNumberId: false,
      isNumberIdList: false,
      isBoolean: false,
      isNumber: false,
    };
  }
  if (raw === 'ReadonlyArray<string>') {
    return {
      tsType: '`Array<string>`',
      isArray: true,
      isObjectArray: false,
      isUploadedFile: false,
      isNumberId: false,
      isNumberIdList: false,
      isBoolean: false,
      isNumber: false,
    };
  }
  if (raw === 'string | ReadonlyArray<string>') {
    return {
      tsType: '`string | Array<string>`',
      isArray: false,
      isObjectArray: false,
      isUploadedFile: false,
      isNumberId: false,
      isNumberIdList: false,
      isBoolean: false,
      isNumber: false,
    };
  }
  if (raw === 'typeof UploadedFile.Type') {
    return {
      tsType: '上传文件对象',
      isArray: false,
      isObjectArray: false,
      isUploadedFile: true,
      isNumberId: false,
      isNumberIdList: false,
      isBoolean: false,
      isNumber: false,
    };
  }
  if (raw === 'ReadonlyArray<typeof LyricsMark.Type>') {
    return {
      tsType: '`Array<LyricsMark>`',
      isArray: true,
      isObjectArray: true,
      isUploadedFile: false,
      isNumberId: false,
      isNumberIdList: false,
      isBoolean: false,
      isNumber: false,
    };
  }
  if (raw === 'ReadonlyArray<typeof PlaylistImportLocalEntry.Type>') {
    return {
      tsType: '`Array<PlaylistImportLocalEntry>`',
      isArray: true,
      isObjectArray: true,
      isUploadedFile: false,
      isNumberId: false,
      isNumberIdList: false,
      isBoolean: false,
      isNumber: false,
    };
  }
  if (raw === 'ReadonlyArray<0 | 1 | 2>') {
    return {
      tsType: '`Array<0 | 1 | 2>`',
      isArray: true,
      isObjectArray: false,
      isUploadedFile: false,
      isNumberId: false,
      isNumberIdList: false,
      isBoolean: false,
      isNumber: false,
      enumValues: [0, 1, 2],
    };
  }
  if (raw === '(typeof SEARCH_TYPES)[number]') {
    const rawExpr = schemaLocals.get('SEARCH_TYPES');
    const expr =
      rawExpr && isAsExpression(rawExpr) ? rawExpr.expression : rawExpr;
    if (expr && isArrayLiteralExpression(expr)) {
      const vals = expr.elements
        .map(evaluateLiteral)
        .filter((val): val is number => typeof val === 'number');
      return {
        tsType: `\`${vals.join(' | ')}\``,
        isArray: false,
        isObjectArray: false,
        isUploadedFile: false,
        isNumberId: false,
        isNumberIdList: false,
        isBoolean: false,
        isNumber: true,
        enumValues: vals,
      };
    }
  }
  if (raw === 'typeof AudioLevel.Type' || raw === 'typeof ShareType.Type') {
    const varName = raw.slice('typeof '.length, -'.Type'.length);
    const expr = schemaLocals.get(varName);
    if (expr) {
      const parsed = parseSchemaExpression(
        expr,
        source,
        schemaLocals,
        sharedSet,
        localHelpers,
        localSpreads,
        fallbacks,
      );
      if (parsed.kind === 'union') {
        const vals = parsed.members
          .filter(
            (
              member,
            ): member is { readonly kind: 'literal'; readonly value: string } =>
              member.kind === 'literal' && typeof member.value === 'string',
          )
          .map((member) => member.value);
        return {
          tsType: `\`${vals.map((val) => `'${val}'`).join(' | ')}\``,
          isArray: false,
          isObjectArray: false,
          isUploadedFile: false,
          isNumberId: false,
          isNumberIdList: false,
          isBoolean: false,
          isNumber: false,
          enumValues: vals,
        };
      }
    }
  }
  if (
    raw === 'AlbumArea' ||
    raw === 'AlbumStyleArea' ||
    raw === 'ArtistSongsOrder'
  ) {
    const aliasNode = typeAliases.get(raw);
    if (aliasNode) {
      return resolveInputTsType(
        aliasNode,
        source,
        typeAliases,
        schemaLocals,
        sharedSet,
        localHelpers,
        localSpreads,
        fallbacks,
      );
    }
    // Imported type alias (like AlbumArea in album_new.ts)
    if (raw === 'AlbumArea') {
      return {
        tsType: "`'ALL' | 'ZH' | 'EA' | 'KR' | 'JP'`",
        isArray: false,
        isObjectArray: false,
        isUploadedFile: false,
        isNumberId: false,
        isNumberIdList: false,
        isBoolean: false,
        isNumber: false,
        enumValues: ['ALL', 'ZH', 'EA', 'KR', 'JP'],
      };
    }
  }
  if (isUnionTypeNode(typeNode)) {
    const literals: Array<string | number> = [];
    let allLiterals = true;
    for (const member of typeNode.types) {
      const mText = member.getText(source).trim();
      if (mText.startsWith("'") || mText.startsWith('"')) {
        literals.push(mText.slice(1, -1));
      } else if (/^-?\d+$/.test(mText)) {
        literals.push(Number(mText));
      } else {
        allLiterals = false;
      }
    }
    if (allLiterals && literals.length > 0) {
      return {
        tsType: `\`${raw}\``,
        isArray: false,
        isObjectArray: false,
        isUploadedFile: false,
        isNumberId: false,
        isNumberIdList: false,
        isBoolean: false,
        isNumber: typeof literals[0] === 'number',
        enumValues: literals,
      };
    }
    return {
      tsType: `\`${raw}\``,
      isArray: false,
      isObjectArray: false,
      isUploadedFile: false,
      isNumberId: false,
      isNumberIdList: false,
      isBoolean: false,
      isNumber: false,
    };
  }
  return {
    tsType: `\`${raw}\``,
    isArray: raw.startsWith('ReadonlyArray<') || raw.startsWith('Array<'),
    isObjectArray: false,
    isUploadedFile: false,
    isNumberId: false,
    isNumberIdList: false,
    isBoolean: false,
    isNumber: false,
  };
};

const parseModuleInputAst = (
  source: SourceFile,
  sharedSet: ReadonlySet<string>,
  fallbacks: Array<string>,
): ModuleInputSpec => {
  const typeAliases = new Map<string, TypeNode>();
  for (const stmt of source.statements) {
    if (isTypeAliasDeclaration(stmt)) {
      typeAliases.set(stmt.name.text, stmt.type);
    }
  }
  const { locals, localSpreads, localHelpers } = collectLocalsAndBags(
    source,
    sharedSet,
    fallbacks,
  );
  const queryDefaults = extractQueryDefaults(source);
  const inputTypeNode = typeAliases.get('ModuleInput');
  if (!inputTypeNode) {
    fallbacks.push(`${source.fileName}: missing ModuleInput`);
    return { kind: 'none', fields: [], nestedStructs: new Map() };
  }
  const rawInput = inputTypeNode.getText(source).trim();
  if (rawInput === 'NoInput') {
    return { kind: 'none', fields: [], nestedStructs: new Map() };
  }
  if (rawInput.startsWith('Partial<Record<')) {
    return { kind: 'record', fields: [], nestedStructs: new Map() };
  }
  if (isTypeLiteralNode(inputTypeNode)) {
    const fields: Array<InputFieldSpec> = [];
    for (const member of inputTypeNode.members) {
      if (isPropertySignatureDeclaration(member) && member.type) {
        const name = member.name.getText(source);
        const required = member.postfixToken?.kind !== SyntaxKind.QuestionToken;
        const resolved = resolveInputTsType(
          member.type,
          source,
          typeAliases,
          locals,
          sharedSet,
          localHelpers,
          localSpreads,
          fallbacks,
        );
        fields.push({
          name,
          typeText: member.type.getText(source),
          tsType: resolved.tsType,
          required,
          defaultValue: queryDefaults.get(name),
          enumValues: resolved.enumValues,
          isArray: resolved.isArray,
          isObjectArray: resolved.isObjectArray,
          isUploadedFile: resolved.isUploadedFile,
          isNumberId: resolved.isNumberId,
          isNumberIdList: resolved.isNumberIdList,
          isBoolean: resolved.isBoolean,
          isNumber: resolved.isNumber,
        });
      }
    }
    return { kind: 'struct', fields, nestedStructs: new Map() };
  }
  // Composite union inputs: login and login_cellphone
  const identifier = source.fileName.split('/').at(-1)?.replace(/\.ts$/, '');
  if (identifier === 'login') {
    return {
      kind: 'union',
      exclusivityNote:
        '`password` 与 `md5_password` 二选一必填，同时传入时优先使用 `md5_password`。',
      fields: [
        {
          name: 'email',
          typeText: 'string',
          tsType: '`string`',
          required: true,
          isArray: false,
          isObjectArray: false,
          isUploadedFile: false,
          isNumberId: false,
          isNumberIdList: false,
          isBoolean: false,
          isNumber: false,
        },
        {
          name: 'password',
          typeText: 'string',
          tsType: '`string`',
          required: false,
          isArray: false,
          isObjectArray: false,
          isUploadedFile: false,
          isNumberId: false,
          isNumberIdList: false,
          isBoolean: false,
          isNumber: false,
        },
        {
          name: 'md5_password',
          typeText: 'string',
          tsType: '`string`',
          required: false,
          isArray: false,
          isObjectArray: false,
          isUploadedFile: false,
          isNumberId: false,
          isNumberIdList: false,
          isBoolean: false,
          isNumber: false,
        },
      ],
      nestedStructs: new Map(),
    };
  }
  if (identifier === 'login_cellphone') {
    return {
      kind: 'union',
      exclusivityNote:
        '`captcha`、`md5_password`、`password` 三选一必填，实际生效优先级为 `captcha` → `md5_password` → `password`。',
      fields: [
        {
          name: 'phone',
          typeText: 'string',
          tsType: '`string`',
          required: true,
          isArray: false,
          isObjectArray: false,
          isUploadedFile: false,
          isNumberId: false,
          isNumberIdList: false,
          isBoolean: false,
          isNumber: false,
        },
        {
          name: 'password',
          typeText: 'string',
          tsType: '`string`',
          required: false,
          isArray: false,
          isObjectArray: false,
          isUploadedFile: false,
          isNumberId: false,
          isNumberIdList: false,
          isBoolean: false,
          isNumber: false,
        },
        {
          name: 'md5_password',
          typeText: 'string',
          tsType: '`string`',
          required: false,
          isArray: false,
          isObjectArray: false,
          isUploadedFile: false,
          isNumberId: false,
          isNumberIdList: false,
          isBoolean: false,
          isNumber: false,
        },
        {
          name: 'captcha',
          typeText: 'string',
          tsType: '`string`',
          required: false,
          isArray: false,
          isObjectArray: false,
          isUploadedFile: false,
          isNumberId: false,
          isNumberIdList: false,
          isBoolean: false,
          isNumber: false,
        },
        {
          name: 'countrycode',
          typeText: 'NumberId',
          tsType: '`number | string`',
          required: false,
          defaultValue: '`86`',
          isArray: false,
          isObjectArray: false,
          isUploadedFile: false,
          isNumberId: true,
          isNumberIdList: false,
          isBoolean: false,
          isNumber: false,
        },
      ],
      nestedStructs: new Map(),
    };
  }
  fallbacks.push(`${source.fileName}: unhandled union ModuleInput`);
  return { kind: 'none', fields: [], nestedStructs: new Map() };
};

const collectSharedRefs = (
  node: SchemaTypeNode,
  localHelpers: ReadonlyMap<string, SchemaTypeNode>,
  seenHelpers: Set<string>,
  sharedRefs: Set<string>,
): void => {
  switch (node.kind) {
    case 'ref':
      if (node.isShared) {
        sharedRefs.add(node.name);
      } else if (!seenHelpers.has(node.name)) {
        seenHelpers.add(node.name);
        const helper = localHelpers.get(node.name);
        if (helper) {
          collectSharedRefs(helper, localHelpers, seenHelpers, sharedRefs);
        }
      }
      return;
    case 'array':
      collectSharedRefs(node.item, localHelpers, seenHelpers, sharedRefs);
      return;
    case 'record':
      collectSharedRefs(node.key, localHelpers, seenHelpers, sharedRefs);
      collectSharedRefs(node.value, localHelpers, seenHelpers, sharedRefs);
      return;
    case 'union':
      for (const member of node.members) {
        collectSharedRefs(member, localHelpers, seenHelpers, sharedRefs);
      }
      return;
    case 'object':
      if (node.baseRef) {
        if (node.isSharedBase) {
          sharedRefs.add(node.baseRef);
        } else if (!seenHelpers.has(node.baseRef)) {
          seenHelpers.add(node.baseRef);
          const helper = localHelpers.get(node.baseRef);
          if (helper) {
            collectSharedRefs(helper, localHelpers, seenHelpers, sharedRefs);
          }
        }
      }
      for (const field of node.fields) {
        collectSharedRefs(field.type, localHelpers, seenHelpers, sharedRefs);
      }
      return;
    case 'primitive':
    case 'literal':
    case 'emptyRecord':
    case 'uploadedFile':
      return;
  }
};

const parseModuleBodyAst = (
  source: SourceFile,
  sharedSet: ReadonlySet<string>,
  sourceByIdentifier: ReadonlyMap<string, SourceFile>,
  fallbacks: Array<string>,
): ModuleBodySpec => {
  const { locals, localSpreads, localHelpers } = collectLocalsAndBags(
    source,
    sharedSet,
    fallbacks,
  );
  const bodyInit = locals.get('ModuleBody');
  if (!bodyInit) {
    return {
      modeled: false,
      localHelpers,
      sharedRefs: [],
    };
  }

  // Handle cross-module reuse: digitalAlbum_detail -> album_detail, login_status -> user_account
  let targetSource = source;
  let targetInit = bodyInit;
  let targetLocals = locals;
  let targetSpreads = localSpreads;
  let targetHelpers = localHelpers;

  const initText = bodyInit.getText(source).trim();
  if (initText === 'AlbumDetailBody') {
    const albumDetailSrc = sourceByIdentifier.get('album_detail');
    if (!albumDetailSrc) {
      fallbacks.push(`${source.fileName}: missing sibling album_detail`);
      return { modeled: false, localHelpers, sharedRefs: [] };
    }
    targetSource = albumDetailSrc;
    const sibling = collectLocalsAndBags(albumDetailSrc, sharedSet, fallbacks);
    targetLocals = sibling.locals;
    targetSpreads = sibling.localSpreads;
    targetHelpers = sibling.localHelpers;
    targetInit = targetLocals.get('ModuleBody')!;
  }

  // Check if ModuleBody references userAccountBodySchema imported from ./user_account.ts
  for (const stmt of source.statements) {
    if (isImportDeclaration(stmt)) {
      const spec = stmt.moduleSpecifier.getText(source).slice(1, -1);
      if (
        spec === './user_account.ts' &&
        stmt.importClause?.namedBindings &&
        isNamedImports(stmt.importClause.namedBindings)
      ) {
        const userAccountSrc = sourceByIdentifier.get('user_account');
        if (userAccountSrc) {
          const uaCollected = collectLocalsAndBags(
            userAccountSrc,
            sharedSet,
            fallbacks,
          );
          const uaBodyExpr = uaCollected.locals.get('userAccountBodySchema');
          if (uaBodyExpr) {
            const uaNode = parseSchemaExpression(
              uaBodyExpr,
              userAccountSrc,
              uaCollected.locals,
              sharedSet,
              targetHelpers,
              uaCollected.localSpreads,
              fallbacks,
            );
            targetHelpers.set('UserAccountBody', uaNode);
            // Replace userAccountBodySchema ref after parsing
          }
        }
      }
    }
  }

  let bodyNode = parseSchemaExpression(
    targetInit,
    targetSource,
    targetLocals,
    sharedSet,
    targetHelpers,
    targetSpreads,
    fallbacks,
  );

  // If login_status had userAccountBodySchema as a fallback ref, fix it to UserAccountBody
  const fixUserAccountRef = (node: SchemaTypeNode): SchemaTypeNode => {
    if (node.kind === 'object') {
      return {
        ...node,
        fields: node.fields.map((field) => ({
          ...field,
          type:
            field.type.kind === 'primitive' &&
            field.type.name === 'UnknownJson' &&
            field.name === 'data'
              ? { kind: 'ref', name: 'UserAccountBody', isShared: false }
              : fixUserAccountRef(field.type),
        })),
      };
    }
    return node;
  };
  if (source.fileName.endsWith('login_status.ts')) {
    // Filter out the expected identifier fallback for userAccountBodySchema
    for (let idx = fallbacks.length - 1; idx >= 0; idx -= 1) {
      if (fallbacks[idx]?.includes('userAccountBodySchema')) {
        fallbacks.splice(idx, 1);
      }
    }
    bodyNode = fixUserAccountRef(bodyNode);
  }

  let riskNode: SchemaTypeNode | undefined;
  const riskInit = locals.get('RiskBody');
  if (riskInit) {
    riskNode = parseSchemaExpression(
      riskInit,
      source,
      locals,
      sharedSet,
      targetHelpers,
      localSpreads,
      fallbacks,
    );
  }

  const sharedRefs = new Set<string>();
  const seenHelpers = new Set<string>();
  collectSharedRefs(bodyNode, targetHelpers, seenHelpers, sharedRefs);
  if (riskNode) {
    collectSharedRefs(riskNode, targetHelpers, seenHelpers, sharedRefs);
  }

  return {
    modeled: true,
    bodyNode,
    riskNode,
    localHelpers: targetHelpers,
    sharedRefs: [...sharedRefs].toSorted((left, right) =>
      left.localeCompare(right),
    ),
  };
};

const renderTsType = (
  node: SchemaTypeNode,
  indentLevel = 0,
  inlineEmptyAsRecord = true,
): string => {
  const indent = '  '.repeat(indentLevel);
  const innerIndent = '  '.repeat(indentLevel + 1);
  switch (node.kind) {
    case 'primitive':
      return node.name;
    case 'literal':
      return typeof node.value === 'string'
        ? `'${node.value.replaceAll("'", "\\'")}'`
        : String(node.value);
    case 'uploadedFile':
      return '{ data: ArrayBuffer | Uint8Array; name: string; mimetype: string; size: number; md5?: string }';
    case 'emptyRecord':
      return inlineEmptyAsRecord ? 'Record<string, UnknownJson>' : '{}';
    case 'ref':
      return node.name;
    case 'array': {
      const inner = renderTsType(node.item, indentLevel, inlineEmptyAsRecord);
      return `Array<${inner}>`;
    }
    case 'record': {
      const keyStr = renderTsType(node.key, indentLevel, inlineEmptyAsRecord);
      const valStr = renderTsType(node.value, indentLevel, inlineEmptyAsRecord);
      return `Record<${keyStr}, ${valStr}>`;
    }
    case 'union': {
      return node.members
        .map((member) => renderTsType(member, indentLevel, inlineEmptyAsRecord))
        .join(' | ');
    }
    case 'object': {
      const fieldLines = node.fields.map((field) => {
        const typeStr = renderTsType(
          field.type,
          indentLevel + 1,
          inlineEmptyAsRecord,
        );
        const optionalMark = field.requirement === 'required' ? '' : '?';
        const nullableSuffix =
          field.requirement === 'required' || typeStr.endsWith('| null')
            ? ''
            : ' | null';
        const propKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(field.name)
          ? field.name
          : `'${field.name.replaceAll("'", "\\'")}'`;
        return `${innerIndent}${propKey}${optionalMark}: ${typeStr}${nullableSuffix};`;
      });
      const bodyBlock =
        fieldLines.length > 0 ? `{\n${fieldLines.join('\n')}\n${indent}}` : '';
      if (node.baseRef) {
        const basePart =
          node.omittedKeys && node.omittedKeys.length > 0
            ? `Omit<${node.baseRef}, ${node.omittedKeys.map((key) => `'${key}'`).join(' | ')}>`
            : node.baseRef;
        return bodyBlock ? `${basePart} & ${bodyBlock}` : basePart;
      }
      return bodyBlock || 'Record<string, UnknownJson>';
    }
  }
  return 'UnknownJson';
};

const collectLocalHelperOrder = (
  root: SchemaTypeNode,
  localHelpers: ReadonlyMap<string, SchemaTypeNode>,
): ReadonlyArray<string> => {
  const ordered: Array<string> = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visitNode = (node: SchemaTypeNode): void => {
    switch (node.kind) {
      case 'ref':
        if (!node.isShared && localHelpers.has(node.name)) {
          visitHelper(node.name);
        }
        return;
      case 'array':
        visitNode(node.item);
        return;
      case 'record':
        visitNode(node.key);
        visitNode(node.value);
        return;
      case 'union':
        for (const member of node.members) visitNode(member);
        return;
      case 'object':
        if (
          node.baseRef &&
          !node.isSharedBase &&
          localHelpers.has(node.baseRef)
        ) {
          visitHelper(node.baseRef);
        }
        for (const field of node.fields) visitNode(field.type);
        return;
      case 'primitive':
      case 'literal':
      case 'emptyRecord':
      case 'uploadedFile':
        return;
    }
  };

  const visitHelper = (name: string): void => {
    if (visited.has(name) || visiting.has(name)) return;
    visiting.add(name);
    const helperNode = localHelpers.get(name);
    if (helperNode) {
      visitNode(helperNode);
    }
    visiting.delete(name);
    visited.add(name);
    ordered.push(name);
  };

  visitNode(root);
  return ordered;
};

const escapeTableCell = (value: string): string =>
  value.replaceAll(/(?<!\\)\|/gu, '\\|').replaceAll(/\r?\n/gu, ' ');

const splitMarkdownTableRow = (line: string): Array<string> => {
  const trimmed = line.trim();
  const inner = trimmed.replace(/^\|/u, '').replace(/\|$/u, '');
  const cells: Array<string> = [];
  let current = '';
  for (let index = 0; index < inner.length; index += 1) {
    const char = inner[index]!;
    if (char === '\\' && inner[index + 1] === '|') {
      current += '|';
      index += 1;
      continue;
    }
    if (char === '|') {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
};

const formatInlineTypeForTable = (
  node: SchemaTypeNode,
  sharedSet: ReadonlySet<string>,
): string => {
  switch (node.kind) {
    case 'primitive':
      return `\`${node.name}\``;
    case 'literal':
      return `\`${typeof node.value === 'string' ? `'${node.value}'` : String(node.value)}\``;
    case 'emptyRecord':
      return '`Record<string, UnknownJson>`';
    case 'uploadedFile':
      return '上传文件对象';
    case 'ref':
      if (node.isShared || sharedSet.has(node.name)) {
        return `[${node.name}](/api/shared-types#${node.name.toLowerCase()})`;
      }
      return `\`${node.name}\``;
    case 'array': {
      const inner = formatInlineTypeForTable(node.item, sharedSet);
      if (inner.startsWith('[') && inner.includes('](/api/shared-types#')) {
        return `Array\\<${inner}\\>`;
      }
      const cleanInner = inner.replaceAll(/^`|`$/gu, '');
      return `\`Array<${cleanInner}>\``;
    }
    case 'record': {
      const keyStr = formatInlineTypeForTable(node.key, sharedSet).replaceAll(
        /^`|`$/gu,
        '',
      );
      const valRaw = formatInlineTypeForTable(node.value, sharedSet);
      if (valRaw.startsWith('[') && valRaw.includes('](/api/shared-types#')) {
        return `Record\\<${keyStr}, ${valRaw}\\>`;
      }
      return `\`Record<${keyStr}, ${valRaw.replaceAll(/^`|`$/gu, '')}>\``;
    }
    case 'union': {
      const parts = node.members.map((member) =>
        formatInlineTypeForTable(member, sharedSet),
      );
      if (parts.some((part) => part.includes('](/api/shared-types#'))) {
        return parts.join(' \\| ');
      }
      return `\`${parts.map((part) => part.replaceAll(/^`|`$/gu, '')).join(' \\| ')}\``;
    }
    case 'object': {
      if (node.baseRef && node.isSharedBase) {
        return `[${node.baseRef}](/api/shared-types#${node.baseRef.toLowerCase()}) 扩展对象`;
      }
      return '`object`';
    }
  }
  return '`UnknownJson`';
};

interface ResponseTableRow {
  readonly path: string;
  readonly typeCell: string;
  readonly requiredLabel: '是' | '否' | '可空';
  readonly note: string;
}

const requirementLabel = (req: RequirementKind): '是' | '否' | '可空' =>
  req === 'required' ? '是' : req === 'optional' ? '可空' : '否';

const describeResponseField = (
  fieldName: string,
  node: SchemaTypeNode,
  localHelpers: ReadonlyMap<string, SchemaTypeNode>,
): string => {
  const known = RESPONSE_FIELD_NOTES[fieldName];
  if (known) return known;
  if (node.kind === 'ref' && node.isShared) {
    return `${node.name} 实体`;
  }
  if (node.kind === 'array' && node.item.kind === 'ref' && node.item.isShared) {
    return `${node.item.name} 列表`;
  }
  if (node.kind === 'ref' && !node.isShared) {
    const resolved = localHelpers.get(node.name);
    if (
      resolved?.kind === 'object' &&
      resolved.baseRef &&
      resolved.isSharedBase
    ) {
      return `继承自 [${resolved.baseRef}](/api/shared-types#${resolved.baseRef.toLowerCase()})`;
    }
  }
  if (
    node.kind === 'array' &&
    node.item.kind === 'ref' &&
    !node.item.isShared
  ) {
    const resolved = localHelpers.get(node.item.name);
    if (
      resolved?.kind === 'object' &&
      resolved.baseRef &&
      resolved.isSharedBase
    ) {
      return `条目列表，继承自 [${resolved.baseRef}](/api/shared-types#${resolved.baseRef.toLowerCase()})`;
    }
  }
  if (fieldName === 'id') {
    return '记录 ID';
  }
  if (fieldName.endsWith('Id')) {
    return `${fieldName.slice(0, -2)} ID`;
  }
  if (fieldName.endsWith('Url') || fieldName.endsWith('url')) {
    return '资源访问链接';
  }
  if (fieldName.endsWith('Time') || fieldName.endsWith('time')) {
    return '时间戳';
  }
  return '-';
};

const mergeTypeCells = (cells: ReadonlyArray<string>): string => {
  const parts: Array<string> = [];
  for (const cell of cells) {
    const trimmed = cell.trim();
    const unwrapped =
      trimmed.startsWith('`') && trimmed.endsWith('`')
        ? trimmed.slice(1, -1)
        : trimmed;
    for (const part of unwrapped.split(/\s*(?:\\\||\|)\s*/u)) {
      const token = part.trim();
      if (token && !parts.includes(token)) {
        parts.push(token);
      }
    }
  }
  if (parts.some((part) => part.includes('](/api/shared-types#'))) {
    return parts
      .map((part) =>
        part.includes('](/api/shared-types#') ? part : `\`${part}\``,
      )
      .join(' | ');
  }
  return `\`${parts.join(' | ')}\``;
};

const mergeRequirementLabels = (
  labels: ReadonlyArray<'是' | '否' | '可空'>,
  branchCount: number,
): '是' | '否' | '可空' => {
  if (labels.length < branchCount) {
    return '否';
  }
  if (labels.every((label) => label === '是')) {
    return '是';
  }
  if (labels.includes('可空')) {
    return '可空';
  }
  return '否';
};

const buildResponseFieldRows = (
  node: SchemaTypeNode,
  localHelpers: ReadonlyMap<string, SchemaTypeNode>,
  sharedSet: ReadonlySet<string>,
  prefix = '',
  depth = 0,
): Array<ResponseTableRow> => {
  const rows: Array<ResponseTableRow> = [];
  const maxDepth = 2;

  const unwrapTarget = (
    target: SchemaTypeNode,
  ):
    | {
        readonly kind: 'object';
        readonly spec: Extract<SchemaTypeNode, { readonly kind: 'object' }>;
        readonly isArray: boolean;
      }
    | undefined => {
    if (target.kind === 'object') {
      return { kind: 'object', spec: target, isArray: false };
    }
    if (target.kind === 'ref' && !target.isShared) {
      const resolved = localHelpers.get(target.name);
      if (resolved?.kind === 'object') {
        return { kind: 'object', spec: resolved, isArray: false };
      }
    }
    if (target.kind === 'array') {
      if (target.item.kind === 'object') {
        return { kind: 'object', spec: target.item, isArray: true };
      }
      if (target.item.kind === 'ref' && !target.item.isShared) {
        const resolved = localHelpers.get(target.item.name);
        if (resolved?.kind === 'object') {
          return { kind: 'object', spec: resolved, isArray: true };
        }
      }
    }
    return undefined;
  };

  if (node.kind === 'union') {
    // Describe union object branches cleanly (e.g. login_qr_check, top_list, empty-string fallbacks)
    const objBranches = node.members.filter(
      (member) =>
        member.kind === 'object' ||
        (member.kind === 'ref' &&
          !member.isShared &&
          localHelpers.get(member.name)?.kind === 'object'),
    );
    if (objBranches.length === 1) {
      return buildResponseFieldRows(
        objBranches[0]!,
        localHelpers,
        sharedSet,
        prefix,
        depth,
      );
    }
    if (objBranches.length > 1) {
      const grouped = new Map<string, Array<ResponseTableRow>>();
      for (const branch of objBranches) {
        const branchRows = buildResponseFieldRows(
          branch,
          localHelpers,
          sharedSet,
          prefix,
          depth,
        );
        for (const row of branchRows) {
          const list = grouped.get(row.path) ?? [];
          list.push(row);
          grouped.set(row.path, list);
        }
      }
      const merged: Array<ResponseTableRow> = [];
      for (const [path, branchRows] of grouped.entries()) {
        const typeCell = mergeTypeCells(branchRows.map((row) => row.typeCell));
        const requiredLabel = mergeRequirementLabels(
          branchRows.map((row) => row.requiredLabel),
          objBranches.length,
        );
        let note =
          branchRows.find((row) => row.note !== '-')?.note ??
          branchRows[0]!.note;
        if (
          path === 'code' &&
          typeCell !== '`200`' &&
          typeCell !== "`200 | '200'`"
        ) {
          note = '业务状态码';
        }
        merged.push({ path, typeCell, requiredLabel, note });
      }
      return merged;
    }
  }

  const resolvedObj =
    node.kind === 'ref' && !node.isShared ? localHelpers.get(node.name) : node;

  if (!resolvedObj || resolvedObj.kind !== 'object') {
    return rows;
  }

  for (const field of resolvedObj.fields) {
    const path = prefix ? `${prefix}.${field.name}` : field.name;
    const typeCell = formatInlineTypeForTable(field.type, sharedSet);
    const req = requirementLabel(field.requirement);
    const note = describeResponseField(field.name, field.type, localHelpers);
    rows.push({ path, typeCell, requiredLabel: req, note });

    const nested = unwrapTarget(field.type);
    if (nested && depth < maxDepth) {
      const childPrefix = nested.isArray ? `${path}[]` : path;
      // Do not explode huge shared-entity expansions beyond showing required/added overrides
      if (nested.spec.baseRef && nested.spec.isSharedBase) {
        for (const subField of nested.spec.fields) {
          if (
            subField.requirement === 'required' ||
            nested.spec.fields.length <= 6
          ) {
            rows.push({
              path: `${childPrefix}.${subField.name}`,
              typeCell: formatInlineTypeForTable(subField.type, sharedSet),
              requiredLabel: requirementLabel(subField.requirement),
              note: describeResponseField(
                subField.name,
                subField.type,
                localHelpers,
              ),
            });
          }
        }
      } else if (nested.spec.fields.length <= 12) {
        rows.push(
          ...buildResponseFieldRows(
            nested.spec,
            localHelpers,
            sharedSet,
            childPrefix,
            depth + 1,
          ),
        );
      }
    }
  }

  return rows;
};

const cleanTextForReader = (text: string): string => {
  const replaced = text
    .replaceAll('编号', 'ID')
    .replaceAll('总期限', '总超时时间')
    .replaceAll('期限', '超时时间')
    .replaceAll('拿不到', '无法获取')
    .replaceAll('拿到', '获取')
    .replaceAll('拼出', '构造')
    .replaceAll('拼好', '构造好')
    .replaceAll('放行', '透传')
    .replaceAll('改掉', '修改')
    .replaceAll('丢掉', '忽略')
    .replaceAll('照常用', '正常使用')
    .replaceAll('（对应页面', '（对应');

  return replaced
    .split(/(`[^`\n]*`|https?:\/\/\S+)/gu)
    .map((segment, index) => {
      if (index % 2 === 1) {
        return segment === '`，`' ? '`,`' : segment;
      }
      return segment.replaceAll(/,\s*/gu, '，');
    })
    .join('')
    .trim();
};

const parseFrontmatter = (
  markdown: string,
): {
  readonly title: string;
  readonly description: string;
  readonly body: string;
} => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { title: '', description: '', body: markdown };
  }
  const frontmatter = match[1]!;
  const body = match[2]!;
  const extractField = (fieldName: string): string => {
    const single = frontmatter.match(
      new RegExp(`^${fieldName}:\\s*'((?:[^']|'')*)'$`, 'm'),
    );
    if (single) return single[1]!.replaceAll("''", "'");
    const dbl = frontmatter.match(
      new RegExp(`^${fieldName}:\\s*"([^"]*)"$`, 'm'),
    );
    if (dbl) return dbl[1]!;
    const bare = frontmatter.match(new RegExp(`^${fieldName}:\\s*(.+)$`, 'm'));
    return bare ? bare[1]!.trim() : '';
  };
  return {
    title: extractField('title'),
    description: extractField('description'),
    body,
  };
};

const extractLegacyParamMap = (
  markdown: string,
): {
  readonly descriptions: Map<string, string>;
  readonly defaults: Map<string, string>;
} => {
  const descriptions = new Map<string, string>();
  const defaults = new Map<string, string>();

  const paramSection = markdown.match(
    /## (?:请求参数|文件参数)([\s\S]*?)(?:\n## |$)/,
  )?.[1];
  if (paramSection) {
    const firstTable = paramSection.match(/\| 参数[\s\S]*?(?:\n\n|$)/)?.[0];
    if (firstTable) {
      const lines = firstTable.split('\n');
      const headerCols = splitMarkdownTableRow(lines[0] ?? '').filter(Boolean);
      const hasDefaultCol = headerCols.includes('默认值');
      for (const line of lines.slice(2)) {
        const cols = splitMarkdownTableRow(line);
        const nameMatch = cols[0]?.match(/^`([A-Za-z0-9_]+)`$/);
        if (!nameMatch) continue;
        const paramName = nameMatch[1]!;
        if (hasDefaultCol && cols.length >= 5) {
          const defVal = cols[3]!;
          if (defVal && defVal !== '-' && defVal !== '无') {
            defaults.set(paramName, defVal);
          }
          const descVal = cols[4]!;
          if (
            descVal &&
            !descVal.includes('~~') &&
            !descVal.includes('**接口地址')
          ) {
            descriptions.set(paramName, descVal);
          }
        } else if (cols.length >= 3) {
          const descVal = cols.at(-1) ?? '';
          if (
            descVal &&
            !descVal.includes('~~') &&
            !descVal.includes('**接口地址')
          ) {
            descriptions.set(paramName, descVal);
          }
        }
      }
    }
  }

  // Fallback to ## 补充说明 lines like `param`: description
  const supplement = markdown.match(/## 补充说明([\s\S]*?)(?:\n## |$)/)?.[1];
  if (supplement) {
    for (const match of supplement.matchAll(
      /^`([A-Za-z0-9_]+)`\s*[:：]\s*(.+)$/gm,
    )) {
      const paramName = match[1]!;
      const desc = match[2]!.trim();
      if (!descriptions.has(paramName) && !desc.includes('~~')) {
        descriptions.set(paramName, desc);
      }
    }
  }

  return { descriptions, defaults };
};

const scanExistingDocs = async (): Promise<Map<string, ExistingDocInfo>> => {
  const result = new Map<string, ExistingDocInfo>();
  const categories = (
    await readdir(WEBSITE_API_DIRECTORY, { withFileTypes: true })
  )
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .toSorted();

  for (const category of categories) {
    const dirPath = resolve(WEBSITE_API_DIRECTORY, category);
    const files = (await readdir(dirPath))
      .filter((name) => name.endsWith('.md'))
      .toSorted();
    for (const fileName of files) {
      const filePath = resolve(dirPath, fileName);
      const raw = await readFile(filePath, 'utf8');
      const moduleMatch = raw.match(/\|\s*对应模块\s*\|\s*`([^`]+)`\s*\|/);
      if (!moduleMatch) {
        throw new Error(`Missing 对应模块 in ${filePath}`);
      }
      const identifier = moduleMatch[1]!;
      const { title, description, body } = parseFrontmatter(raw);
      const cleanTitle = title.trim();
      const fixedDesc =
        DESCRIPTION_FIXES[identifier] ??
        cleanTextForReader(description.replaceAll(/~~/gu, ''));

      // Extract intro paragraph between `# <title>` and first `##` / marker
      let intro = fixedDesc;
      const headingIdx = body.indexOf(`# ${cleanTitle}`);
      if (headingIdx >= 0) {
        const afterHeading = body
          .slice(headingIdx + cleanTitle.length + 2)
          .trim();
        const nextBoundary = afterHeading.search(/\n(?:## |<!-- )/);
        const introBlock = (
          nextBoundary >= 0 ? afterHeading.slice(0, nextBoundary) : ''
        ).trim();
        if (
          introBlock &&
          !introBlock.startsWith('>') &&
          !DESCRIPTION_FIXES[identifier]
        ) {
          intro = cleanTextForReader(introBlock);
        }
      }

      const rawLogin =
        raw.match(/\|\s*需要登录\s*\|\s*([^|\n]+?)\s*\|/)?.[1] ??
        raw.match(/\|\s*身份要求\s*\|\s*([^|\n]+?)\s*\|/)?.[1] ??
        '否';
      const loginRequirement = LOGIN_OVERRIDES[identifier] ?? rawLogin.trim();

      const { descriptions, defaults } = extractLegacyParamMap(raw);

      // Extract existing code blocks if present (allowing explanatory prose before code block)
      const extractSectionCodeBlock = (
        headingPattern: RegExp,
        langPattern: string,
      ): string | undefined => {
        const headingMatch = headingPattern.exec(raw);
        if (!headingMatch) return undefined;
        const afterHeading = raw.slice(
          headingMatch.index + headingMatch[0].length,
        );
        const nextSectionIdx = afterHeading.search(
          /\n(?:##(?:#)?\s+|<!--\s*api-doc:)/u,
        );
        const sectionBody =
          nextSectionIdx >= 0
            ? afterHeading.slice(0, nextSectionIdx)
            : afterHeading;
        const codeMatch = sectionBody.match(
          new RegExp(`\`\`\`(?:${langPattern})\\n([\\s\\S]*?)\\n\`\`\``),
        );
        return codeMatch?.[1]?.trim();
      };

      const existingSdkCode =
        extractSectionCodeBlock(/^### SDK\s*$/mu, 'ts') ??
        extractSectionCodeBlock(/^## 编程式调用\s*$/mu, 'ts');
      const existingHttpCode =
        extractSectionCodeBlock(/^### HTTP\s*$/mu, 'bash|http') ??
        extractSectionCodeBlock(/^## HTTP 示例\s*$/mu, 'bash|http');

      const cspellIgnores = [
        ...raw.matchAll(/<!--\s*cSpell:ignore\s+([^\n>]+?)\s*-->/giu),
      ].flatMap((match) => match[1]!.trim().split(/\s+/u).filter(Boolean));

      result.set(identifier, {
        path: filePath,
        relativeRoutePath: `/api/${category}/${fileName.replace(/\.md$/u, '')}`,
        title: cleanTitle,
        description: fixedDesc,
        intro,
        loginRequirement,
        paramDescriptions: descriptions,
        paramDefaults: defaults,
        cspellIgnores,
        existingSdkCode,
        existingHttpCode,
      });
    }
  }
  return result;
};

const sampleValueForField = (
  identifier: string,
  field: InputFieldSpec,
): unknown => {
  if (field.enumValues && field.enumValues.length > 0) {
    return field.isArray ? [field.enumValues[0]] : field.enumValues[0];
  }
  if (field.isUploadedFile) {
    return undefined;
  }
  if (field.isObjectArray) {
    if (identifier === 'song_lyrics_mark_add') {
      return [
        {
          originalLyricsText: '示例歌词',
          startTimeStamp: 800,
          translateLyricsText: '示例译文',
          translateType: 1,
        },
      ];
    }
    if (identifier === 'playlist_import_name_task_create') {
      return [{ name: '示例歌曲', artist: '示例歌手', album: '示例专辑' }];
    }
    return [];
  }
  if (field.isNumberIdList) {
    if (field.name === 'userIds') return [32953014];
    if (field.name === 'tracks') return [347231];
    return [347230];
  }
  if (field.isArray) {
    if (field.name === 'nicknames') return ['云音乐小秘书'];
    if (field.name === 'displayList' || field.name === 'randomList') {
      return [1372188635, 186016];
    }
    if (field.name === 'ids') {
      return field.typeText.includes('NumberId') ? [347230] : ['your-task-id'];
    }
    return ['example'];
  }
  if (field.isNumberId) {
    if (field.name === 'uid' || field.name === 'userId') return 32953014;
    if (field.name === 'pid' || field.name === 'playlist') return 24381616;
    if (field.name === 'mvid') return 5436712;
    if (field.name === 'rid') return 336355127;
    if (field.name === 'cid') return 12840183;
    if (field.name === 'voiceListId') return 999999;
    return 347230;
  }
  if (field.isBoolean) {
    return true;
  }
  if (field.isNumber) {
    if (field.name === 'year') return 2024;
    if (field.name === 'limit') return 30;
    if (field.name === 'offset') return 0;
    if (field.name === 'duration') return 120;
    if (field.name === 'version') return 1;
    if (field.name === 'quantity') return 1;
    if (field.name === 'br') return 999000;
    return 1;
  }
  if (field.name === 'keywords' || field.name === 'keyword') return '海阔天空';
  if (field.name === 'phone') return '13800138000';
  if (field.name === 'email') return 'user@163.com';
  if (field.name === 'password') return 'your-password';
  if (field.name === 'captcha') return '1234';
  if (field.name === 'key') return 'your-qr-key';
  if (field.name === 'qr') return 'your-verify-qr';
  if (field.name === 'nickname') return 'example-nickname';
  if (field.name === 'name') return '新建歌单';
  if (field.name === 'content' || field.name === 'msg') return '你好';
  if (field.name === 'roomId') return 'your-room-id';
  if (field.name === 'commandType') return 'REPLACE';
  if (field.name === 'payment') return '0';
  if (field.name === 'md5') return 'd41d8cd98f00b204e9800998ecf8427e';
  if (field.name === 'audioFP') return 'your-audio-fingerprint';
  if (field.name === 'startTime' || field.name === 'endTime') {
    return '2024-01-01';
  }
  return 'example';
};

const isLoginRequired = (loginText: string): boolean =>
  loginText.startsWith('是');

const parseSimpleJsLiteral = (text: string): unknown => {
  let cursor = 0;
  const skipSpace = (): void => {
    while (cursor < text.length && /\s/u.test(text[cursor]!)) {
      cursor += 1;
    }
  };
  const parseString = (quote: string): string => {
    cursor += 1;
    let out = '';
    while (cursor < text.length) {
      const char = text[cursor]!;
      if (char === '\\') {
        cursor += 1;
        out += text[cursor] ?? '';
        cursor += 1;
        continue;
      }
      if (char === quote) {
        cursor += 1;
        return out;
      }
      out += char;
      cursor += 1;
    }
    throw new Error('unterminated string');
  };
  const parseValue = (): unknown => {
    skipSpace();
    const char = text[cursor];
    if (char === undefined) throw new Error('unexpected end');
    if (char === "'" || char === '"') return parseString(char);
    if (char === '{') {
      cursor += 1;
      const obj: Record<string, unknown> = {};
      while (cursor < text.length) {
        skipSpace();
        if (text[cursor] === '}') {
          cursor += 1;
          return obj;
        }
        const keyChar = text[cursor];
        let key: string;
        if (keyChar === "'" || keyChar === '"') {
          key = parseString(keyChar);
        } else {
          const ident = text.slice(cursor).match(/^[A-Za-z_$][A-Za-z0-9_$]*/u);
          if (!ident) throw new Error('invalid object key');
          key = ident[0];
          cursor += key.length;
        }
        skipSpace();
        if (text[cursor] !== ':') throw new Error('expected colon');
        cursor += 1;
        obj[key] = parseValue();
        skipSpace();
        if (text[cursor] === ',') {
          cursor += 1;
        } else if (text[cursor] === '}') {
          cursor += 1;
          return obj;
        } else {
          throw new Error('expected comma or closing brace');
        }
      }
      throw new Error('unclosed object');
    }
    if (char === '[') {
      cursor += 1;
      const arr: Array<unknown> = [];
      while (cursor < text.length) {
        skipSpace();
        if (text[cursor] === ']') {
          cursor += 1;
          return arr;
        }
        arr.push(parseValue());
        skipSpace();
        if (text[cursor] === ',') {
          cursor += 1;
        } else if (text[cursor] === ']') {
          cursor += 1;
          return arr;
        } else {
          throw new Error('expected comma or closing bracket');
        }
      }
      throw new Error('unclosed array');
    }
    const rest = text.slice(cursor);
    const numMatch = rest.match(/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?/u);
    if (numMatch) {
      cursor += numMatch[0].length;
      return Number(numMatch[0]);
    }
    if (rest.startsWith('true')) {
      cursor += 4;
      return true;
    }
    if (rest.startsWith('false')) {
      cursor += 5;
      return false;
    }
    if (rest.startsWith('null')) {
      cursor += 4;
      return null;
    }
    throw new Error('unsupported literal');
  };
  const result = parseValue();
  skipSpace();
  if (cursor !== text.length) throw new Error('trailing tokens');
  return result;
};

const extractLiteralArgFromSdkCode = (
  code: string,
  fnName: string,
): Record<string, unknown> | undefined => {
  const callMatch = code.match(
    new RegExp(`\\b${fnName}\\s*\\(\\s*(\\{[\\s\\S]*?\\})\\s*(?:,|\\))`),
  );
  if (!callMatch) return undefined;
  try {
    const val = parseSimpleJsLiteral(callMatch[1]!);
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      return val as Record<string, unknown>;
    }
  } catch {
    return undefined;
  }
  return undefined;
};

const coerceExistingArgForSdk = (
  arg: Record<string, unknown>,
  fields: ReadonlyArray<InputFieldSpec>,
): Record<string, unknown> | undefined => {
  const fieldMap = new Map(fields.map((field) => [field.name, field]));
  const normalized: Record<string, unknown> = {};
  for (const [key, rawValue] of Object.entries(arg)) {
    const field = fieldMap.get(key);
    if (!field || field.isUploadedFile) {
      return undefined;
    }
    if (field.enumValues && field.enumValues.length > 0 && !field.isArray) {
      if (field.enumValues.includes(rawValue as string | number)) {
        normalized[key] = rawValue;
        continue;
      }
      if (
        typeof rawValue === 'string' &&
        rawValue.trim() !== '' &&
        Number.isFinite(Number(rawValue)) &&
        field.enumValues.includes(Number(rawValue))
      ) {
        normalized[key] = Number(rawValue);
        continue;
      }
      return undefined;
    }
    if (field.isBoolean && !field.isArray) {
      if (typeof rawValue === 'boolean') {
        normalized[key] = rawValue;
        continue;
      }
      if (rawValue === 'true' || rawValue === 1 || rawValue === '1') {
        normalized[key] = true;
        continue;
      }
      if (rawValue === 'false' || rawValue === 0 || rawValue === '0') {
        normalized[key] = false;
        continue;
      }
      return undefined;
    }
    if (field.isNumber && !field.isNumberId && !field.isArray) {
      if (typeof rawValue === 'number') {
        normalized[key] = rawValue;
        continue;
      }
      if (
        typeof rawValue === 'string' &&
        rawValue.trim() !== '' &&
        Number.isFinite(Number(rawValue))
      ) {
        normalized[key] = Number(rawValue);
        continue;
      }
      return undefined;
    }
    normalized[key] = rawValue;
  }
  return normalized;
};

const verifyDecoderInput = (
  decodeInput: (input: unknown) => Effect.Effect<unknown, unknown>,
  inputObj: Record<string, unknown>,
): boolean => {
  const exit = Effect.runSyncExit(decodeInput(inputObj));
  return Exit.isSuccess(exit);
};

const buildExamples = (
  ctx: ParsedModuleContext,
): { readonly sdk: string; readonly http: string } => {
  const needsLogin = isLoginRequired(ctx.doc.loginRequirement);
  const cookieConfig = "{ cookie: 'MUSIC_U=your-cookie' }";

  // Preserve hand-crafted custom examples for special multi-step / upload / auth endpoints
  if (
    ctx.identifier === 'cloud' ||
    ctx.identifier === 'avatar_upload' ||
    ctx.identifier === 'voice_upload' ||
    ctx.identifier === 'playlist_cover_update'
  ) {
    if (ctx.doc.existingSdkCode && ctx.doc.existingHttpCode) {
      return {
        sdk: ctx.doc.existingSdkCode,
        http: ctx.doc.existingHttpCode,
      };
    }
  }

  if (ctx.identifier === 'image_upload_token') {
    return {
      sdk: `import { imageUploadToken } from 'hana-music-api';

const result = await imageUploadToken(
  {},
  ${cookieConfig},
);
console.log(result.body);`,
      http: `curl 'http://127.0.0.1:3021/image/upload/token' \\
  -H 'Cookie: MUSIC_U=your-cookie'`,
    };
  }

  if (ctx.identifier === 'batch') {
    const sampleBatch = {
      '/api/v2/banner/get': { clientType: 'pc' },
    };
    if (!verifyDecoderInput(ctx.decodeInput, sampleBatch)) {
      throw new Error('batch example failed decoder check');
    }
    return {
      sdk: `import { ${ctx.camelName} } from 'hana-music-api';

const result = await ${ctx.camelName}(
  {
    '/api/v2/banner/get': { clientType: 'pc' },
  },
  ${cookieConfig},
);
console.log(result.body);`,
      http: `curl 'http://127.0.0.1:3021/batch' \\
  -H 'Content-Type: application/json' \\
  -H 'Cookie: MUSIC_U=your-cookie' \\
  --data '{"/api/v2/banner/get":{"clientType":"pc"}}'`,
    };
  }

  if (ctx.input.kind === 'none') {
    if (!verifyDecoderInput(ctx.decodeInput, {})) {
      throw new Error(`${ctx.identifier} empty example failed decoder check`);
    }
    const sdk = needsLogin
      ? `import { ${ctx.camelName} } from 'hana-music-api';

const result = await ${ctx.camelName}({}, ${cookieConfig});
console.log(result.body);`
      : `import { ${ctx.camelName} } from 'hana-music-api';

const result = await ${ctx.camelName}();
console.log(result.body);`;
    const http = needsLogin
      ? `curl 'http://127.0.0.1:3021${ctx.route}' \\
  -H 'Cookie: MUSIC_U=your-cookie'`
      : `curl 'http://127.0.0.1:3021${ctx.route}'`;
    return { sdk, http };
  }

  // Check if existing SDK example is clean, complete, and passes decodeModuleInput
  const existingSdk = ctx.doc.existingSdkCode;
  const rawExistingArg = existingSdk
    ? extractLiteralArgFromSdkCode(existingSdk, ctx.camelName)
    : undefined;
  const existingArg = rawExistingArg
    ? coerceExistingArgForSdk(rawExistingArg, ctx.input.fields)
    : undefined;
  const existingSdkHasCookie =
    existingSdk !== undefined &&
    (existingSdk.includes('cookie') ||
      existingSdk.includes('createHanaMusicApi'));

  // Synthesize or reuse validated argument object
  let sampleInput: Record<string, unknown> | undefined;
  const allowedKeys = new Set(ctx.input.fields.map((field) => field.name));

  if (existingArg && verifyDecoderInput(ctx.decodeInput, existingArg)) {
    const allKeysAllowed = Object.keys(existingArg).every((key) =>
      allowedKeys.has(key),
    );
    const hasAllRequired = ctx.input.fields
      .filter((field) => field.required)
      .every((field) => existingArg[field.name] !== undefined);
    // Prefer preserving valid existing arguments when keys match schema
    if (
      allKeysAllowed &&
      hasAllRequired &&
      Object.keys(existingArg).length > 0
    ) {
      sampleInput = existingArg;
    }
  }

  if (!sampleInput) {
    const built: Record<string, unknown> = {};
    if (ctx.identifier === 'login') {
      built.email = 'user@163.com';
      built.password = 'your-password';
    } else if (ctx.identifier === 'login_cellphone') {
      built.phone = '13800138000';
      built.captcha = '1234';
    } else if (ctx.identifier === 'top_list') {
      built.id = 19723756;
    } else if (ctx.identifier === 'playlist_import_name_task_create') {
      built.text = '周杰伦 - 晴天';
    } else if (ctx.identifier === 'user_social_status_edit') {
      built.content = '听歌中';
    } else if (ctx.identifier === 'cloud_import') {
      built.song = '最伟大的作品';
      built.artist = '周杰伦';
      built.album = '最伟大的作品';
      built.fileType = 'flac';
      built.fileSize = 50412168;
      built.bitrate = 1652;
      built.md5 = 'd02b8ab79d91c01167ba31e349fe5275';
    } else {
      for (const field of ctx.input.fields) {
        if (field.required) {
          built[field.name] = sampleValueForField(ctx.identifier, field);
        }
      }
      if (Object.keys(built).length === 0 && ctx.input.fields.length > 0) {
        const firstField = ctx.input.fields[0]!;
        const val = sampleValueForField(ctx.identifier, firstField);
        if (val !== undefined) {
          built[firstField.name] = val;
        }
      }
    }
    if (!verifyDecoderInput(ctx.decodeInput, built)) {
      throw new Error(
        `Synthesized example for ${ctx.identifier} failed decoder: ${JSON.stringify(built)}`,
      );
    }
    sampleInput = built;
  }

  // Keep valid hand-crafted multi-line SDK examples (like login_cellphone, login_qr_check, search, playlist_tracks)
  let sdkCode: string;
  if (
    existingSdk &&
    existingArg &&
    verifyDecoderInput(ctx.decodeInput, existingArg) &&
    (!needsLogin || existingSdkHasCookie) &&
    (ctx.identifier === 'login_cellphone' ||
      ctx.identifier === 'login_qr_check' ||
      ctx.identifier === 'playlist_tracks' ||
      ctx.identifier === 'search')
  ) {
    sdkCode = existingSdk;
  } else {
    const formattedArg = JSON.stringify(sampleInput, null, 2);
    sdkCode = needsLogin
      ? `import { ${ctx.camelName} } from 'hana-music-api';

const result = await ${ctx.camelName}(
  ${formattedArg.replaceAll('\n', '\n  ')},
  ${cookieConfig},
);
console.log(result.body);`
      : `import { ${ctx.camelName} } from 'hana-music-api';

const result = await ${ctx.camelName}(${formattedArg});
console.log(result.body);`;
  }

  const hasNonScalar = Object.values(sampleInput).some(
    (val) => typeof val === 'object' && val !== null,
  );
  const isAuthEndpoint =
    ctx.identifier === 'login' ||
    ctx.identifier === 'login_cellphone' ||
    ctx.identifier === 'register_cellphone' ||
    ctx.identifier === 'rebind' ||
    ctx.identifier === 'user_replacephone';

  let httpCode: string;
  if (hasNonScalar || isAuthEndpoint) {
    const lines = [`curl 'http://127.0.0.1:3021${ctx.route}' \\`];
    lines.push("  -H 'Content-Type: application/json' \\");
    if (needsLogin) {
      lines.push("  -H 'Cookie: MUSIC_U=your-cookie' \\");
    }
    lines.push(`  --data '${JSON.stringify(sampleInput)}'`);
    httpCode = lines.join('\n');
  } else {
    const entries = Object.entries(sampleInput);
    const lines = [`curl --get 'http://127.0.0.1:3021${ctx.route}' \\`];
    if (needsLogin) {
      lines.push("  -H 'Cookie: MUSIC_U=your-cookie' \\");
    }
    entries.forEach(([key, val], idx) => {
      const suffix = idx < entries.length - 1 ? ' \\' : '';
      lines.push(`  --data-urlencode '${key}=${String(val)}'${suffix}`);
    });
    if (entries.length === 0 && lines.at(-1)?.endsWith(' \\')) {
      lines[lines.length - 1] = lines.at(-1)!.slice(0, -2);
    }
    httpCode = lines.join('\n');
  }

  return { sdk: sdkCode, http: httpCode };
};

const renderSharedTypesMarkdown = (
  sharedSchemas: ReadonlyMap<string, SharedEntitySpec>,
): string => {
  const sharedSet = new Set(sharedSchemas.keys());
  const assigned = new Set(
    SHARED_ENTITY_GROUPS.flatMap((group) => group.entities),
  );
  const extraEntities = [...sharedSchemas.keys()].filter(
    (name) => !assigned.has(name),
  );

  const lines: Array<string> = [
    '---',
    "title: '公共数据结构'",
    "description: '多个接口共用的已建模返回体实体与字段说明。'",
    '---',
    '',
    '# 公共数据结构',
    '',
    '多个已建模接口在返回体中共同引用以下实体结构。',
    '',
    '> 标记为**可选**的字段类型为 `T | null | undefined`，在数据缺失、为 `null` 或类型异常时会忽略；未声明的上游扩展字段会以 `UnknownJson` 原样保留。',
    '',
    '根入口 `hana-music-api` 直接导出 `PlaylistSummary`、`PlaylistUser` 与各接口独立的 `*Body` 类型（如 `SongDetailBody`）。',
    '',
    '```ts',
    "import type { PlaylistSummary, PlaylistUser, SongDetailBody } from 'hana-music-api';",
    '```',
    '',
    '- **运行时校验**：如需在运行时校验返回体，可从 `hana-music-api/schemas` 或 `hana-music-api/schemas/<module>` 导入对应的 `*Body` 校验器。',
    '- **实体引用**：其余公共实体用于描述各接口 `*Body` 内部嵌套的歌曲、专辑、用户与评论结构。',
    '',
  ];

  const groups =
    extraEntities.length > 0
      ? [
          ...SHARED_ENTITY_GROUPS,
          { heading: '未分组实体', entities: extraEntities },
        ]
      : SHARED_ENTITY_GROUPS;

  for (const group of groups) {
    lines.push(`## ${group.heading}`, '');
    for (const entityName of group.entities) {
      const entity = sharedSchemas.get(entityName);
      if (!entity) continue;
      const summary =
        ENTITY_DESCRIPTIONS[entityName] ?? `${entityName} 公共实体结构。`;
      lines.push(`### ${entityName}`, '', summary, '');
      lines.push('```ts');
      lines.push(`type ${entityName} = ${renderTsType(entity.node, 0, true)};`);
      lines.push('```', '');

      if (entity.node.kind === 'object') {
        lines.push(
          '| 字段 | 类型 | 必填 | 说明 |',
          '| --- | --- | --- | --- |',
        );
        if (entity.node.baseRef) {
          lines.push(
            `| *(继承字段)* | [${entity.node.baseRef}](#${entity.node.baseRef.toLowerCase()}) | - | 继承自 \`${entity.node.baseRef}\`，同名字段以下方声明为准 |`,
          );
        }
        for (const field of entity.node.fields) {
          const typeCell = formatInlineTypeForTable(field.type, sharedSet);
          const req = field.requirement === 'required' ? '是' : '否';
          const note =
            SHARED_FIELD_NOTES[field.name] ??
            describeResponseField(field.name, field.type, new Map());
          lines.push(
            `| \`${field.name}\` | ${escapeTableCell(typeCell)} | ${req} | ${escapeTableCell(note)} |`,
          );
        }
        lines.push('');
      }
    }
  }

  return `${lines.join('\n')}\n`;
};

const resolveParamDescription = (
  identifier: string,
  field: InputFieldSpec,
  existingDoc: ExistingDocInfo,
): string => {
  const override = PARAM_DESCRIPTIONS[`${identifier}.${field.name}`];
  if (override) return override;
  const fromDoc = existingDoc.paramDescriptions.get(field.name);
  if (fromDoc) {
    return cleanTextForReader(fromDoc);
  }
  const generic = GENERIC_PARAM_DESCRIPTIONS[field.name];
  if (generic) return generic;
  return `${field.name} 参数`;
};

const renderModuleMarkdown = (
  ctx: ParsedModuleContext,
  sharedSet: ReadonlySet<string>,
): string => {
  const needsLogin = isLoginRequired(ctx.doc.loginRequirement);
  const httpMethod =
    ctx.identifier === 'playlist_cover_update'
      ? '`POST`（上传文件用 `multipart/form-data`，传 `imgId` 可用 `GET` / `POST`）'
      : ctx.isUpload
        ? '`POST`（`multipart/form-data`）'
        : '`GET` / `POST`';

  const bodyTypeDisplay =
    ctx.identifier === 'login_cellphone'
      ? '`LoginCellphoneBody` / `LoginCellphoneRiskBody`'
      : ctx.body.modeled
        ? `\`${ctx.pascalName}Body\`（已建模返回体）`
        : '`UnknownJson`（未建模接口）';

  const frontmatterLines: Array<string> = [
    '---',
    `title: '${ctx.doc.title.replaceAll("'", "''")}'`,
    `description: '${ctx.doc.description.replaceAll("'", "''")}'`,
    '---',
  ];

  const lines: Array<string> = [
    `# ${ctx.doc.title}`,
    '',
    ctx.doc.intro,
    '',
    '<!-- api-doc:meta:start -->',
    '## 接口信息',
    '',
    '| 项目 | 值 |',
    '| --- | --- |',
    `| 接口地址 | \`${ctx.route}\` |`,
    `| 请求方式 | ${escapeTableCell(httpMethod)} |`,
    `| 需要登录 | ${escapeTableCell(ctx.doc.loginRequirement)} |`,
    `| 对应模块 | \`${ctx.identifier}\` |`,
    `| SDK 函数 | \`${ctx.camelName}\`（\`hana-music-api/api/${ctx.identifier}\`） |`,
    `| 返回体类型 | ${escapeTableCell(bodyTypeDisplay)} |`,
  ];

  if (ctx.sharedCache) {
    lines.push(
      '| 读缓存 | 支持共享读缓存与并发请求去重，详见 [缓存与身份池](/guide/cache-and-identity-pool) |',
    );
  }
  lines.push('<!-- api-doc:meta:end -->', '');

  // Examples
  const examples = buildExamples(ctx);
  lines.push(
    '## 调用示例',
    '',
    '### SDK',
    '',
    '```ts',
    examples.sdk,
    '```',
    '',
    '### HTTP',
    '',
    '```bash',
    examples.http,
    '```',
    '',
  );

  // Params section
  lines.push('<!-- api-doc:params:start -->', '## 请求参数', '');
  if (ctx.input.kind === 'none') {
    lines.push('无业务参数。', '');
  } else if (ctx.input.kind === 'record') {
    lines.push(
      '| 参数 | 类型 | 必填 | 默认值 | 说明 |',
      '| --- | --- | --- | --- | --- |',
      '| `/api/*` | `Record<string, unknown>` | 否 | - | 以 `/api/` 开头的目标上游子路由键，值为传给对应子接口的参数对象 |',
      '',
    );
  } else {
    if (ctx.input.exclusivityNote) {
      lines.push(`> ${ctx.input.exclusivityNote}`, '');
    }
    lines.push(
      '| 参数 | 类型 | 必填 | 默认值 | 说明 |',
      '| --- | --- | --- | --- | --- |',
    );
    for (const field of ctx.input.fields) {
      let reqCol = field.required ? '是' : '否';
      if (
        ctx.identifier === 'login' &&
        (field.name === 'password' || field.name === 'md5_password')
      ) {
        reqCol = '二选一';
      } else if (
        ctx.identifier === 'login_cellphone' &&
        (field.name === 'captcha' ||
          field.name === 'md5_password' ||
          field.name === 'password')
      ) {
        reqCol = '三选一';
      } else if (
        ctx.identifier === 'playlist_cover_update' &&
        (field.name === 'imgFile' || field.name === 'imgId')
      ) {
        reqCol = '二选一';
      }
      const defVal =
        field.defaultValue ?? ctx.doc.paramDefaults.get(field.name) ?? '-';
      const desc = resolveParamDescription(ctx.identifier, field, ctx.doc);
      lines.push(
        `| \`${field.name}\` | ${escapeTableCell(field.tsType)} | ${reqCol} | ${escapeTableCell(defVal)} | ${escapeTableCell(desc)} |`,
      );
    }
    lines.push('');
    const enumTable = PARAM_ENUM_TABLES[ctx.identifier];
    if (enumTable) {
      lines.push(enumTable, '');
    }
  }
  lines.push('<!-- api-doc:params:end -->', '');

  // Response section
  lines.push('<!-- api-doc:response:start -->', '## 返回值', '');
  if (!ctx.body.modeled || !ctx.body.bodyNode) {
    if (ctx.identifier === 'batch') {
      lines.push(
        '该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`。返回对象以各个请求的 `/api/*` 子路由为键，对应子请求的上游响应结果。',
        '',
      );
    } else {
      lines.push(
        '该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。',
        '',
      );
    }
  } else {
    const bodyTypeName = `${ctx.pascalName}Body`;
    lines.push(
      `返回体类型：\`${bodyTypeName}\`（可从 \`hana-music-api\` 导入类型，或从 \`hana-music-api/api/${ctx.identifier}\`、\`hana-music-api/schemas/${ctx.identifier}\` 导入运行时校验器）。`,
      '',
    );

    const helperOrder = collectLocalHelperOrder(
      ctx.body.bodyNode,
      ctx.body.localHelpers,
    );
    const tsLines: Array<string> = [];
    for (const helperName of helperOrder) {
      const helperNode = ctx.body.localHelpers.get(helperName);
      if (helperNode) {
        tsLines.push(
          `type ${helperName} = ${renderTsType(helperNode, 0, true)};`,
          '',
        );
      }
    }
    tsLines.push(
      `type ${bodyTypeName} = ${renderTsType(ctx.body.bodyNode, 0, true)};`,
    );
    if (ctx.body.riskNode) {
      tsLines.push(
        '',
        `type LoginCellphoneRiskBody = ${renderTsType(ctx.body.riskNode, 0, true)};`,
      );
    }

    lines.push('```ts', ...tsLines, '```', '');

    if (ctx.body.sharedRefs.length > 0) {
      const refLinks = ctx.body.sharedRefs
        .map((name) => `[${name}](/api/shared-types#${name.toLowerCase()})`)
        .join('、');
      lines.push(`- **公共类型**：${refLinks}`, '');
    }

    const rows = buildResponseFieldRows(
      ctx.body.bodyNode,
      ctx.body.localHelpers,
      sharedSet,
    );
    if (rows.length > 0) {
      const hasOptionalPath = rows.some((row) => row.requiredLabel === '可空');
      if (hasOptionalPath) {
        lines.push(
          '> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。',
          '',
        );
      }
      lines.push('| 字段 | 类型 | 必填 | 说明 |', '| --- | --- | --- | --- |');
      for (const row of rows) {
        lines.push(
          `| \`${row.path}\` | ${escapeTableCell(row.typeCell)} | ${row.requiredLabel} | ${escapeTableCell(row.note)} |`,
        );
      }
      lines.push('');
    }
    if (ctx.body.bodyNode.kind === 'union') {
      const hasEmptyString = ctx.body.bodyNode.members.some(
        (member) => member.kind === 'literal' && member.value === '',
      );
      if (hasEmptyString) {
        lines.push(
          '> 当参数格式异常时，上游可能返回空响应，此时返回体为 `""`。',
          '',
        );
      }
    }
    if (ctx.body.riskNode) {
      lines.push(
        '### 风控失败返回体（`LoginCellphoneRiskBody`）',
        '',
        '当触发风控拦截时，拒绝对象的 `body` 结构如下：',
        '',
        '| 字段 | 类型 | 必填 | 说明 |',
        '| --- | --- | --- | --- |',
        '| `code` | `10004` | 是 | 风控拦截状态码 |',
        '| `message` | `string` | 是 | 风控提示文本 |',
        '| `redirectUrl` | `string` | 是 | 手机号复用验证页面 URL |',
        '',
      );
    }
  }
  lines.push('<!-- api-doc:response:end -->', '');

  // Notes section (ONLY if non-empty!)
  const notes: Array<string> = [];
  if (ctx.sharedCache) {
    notes.push(
      '- **读缓存与并发请求去重**：本接口支持共享读缓存与并发请求去重，未声明的请求字段会在输入校验时被拒绝，详见 [缓存与身份池](/guide/cache-and-identity-pool)。',
    );
  }
  if (ctx.isUpload) {
    notes.push(
      '- **HTTP 体积限制**：HTTP 服务默认请求体上限为 `10 MiB`，上传更大文件需调整服务配置 `maxBodyBytes`，详见 [HTTP 服务部署](/guide/http-deployment)；SDK 直接调用不受此限制。',
      '- **阶段超时与部分完成**：上传按阶段分别计时（单阶段最多 `60s`，整体最多 `5min`），可通过 `timeoutMs` 缩短总超时时间；失败若返回 `partialCompletion: true`，`completedStages` 表示已完成阶段数（非百分比），且已完成的阶段不会自动回滚，详见 [弹性与超时](/guide/resilience) 与 [错误处理](/guide/error-handling)。',
    );
  }
  if (ctx.isPureLocal && ctx.identifier === 'inner_version') {
    notes.push(
      '- **本地执行**：本接口在本地直接返回服务构建版本号，不向上游发送网络请求。',
    );
  }
  const curated = ENDPOINT_NOTES[ctx.identifier];
  if (curated) {
    notes.push(...curated);
  }
  if (needsLogin && ctx.identifier === 'user_level') {
    notes.push(
      '- **身份要求**：需要传入有效登录 Cookie，详见 [认证机制](/guide/authentication)。',
    );
  }

  if (notes.length > 0) {
    lines.push('## 注意事项', '', ...notes, '');
  }

  const bodyText = lines.join('\n');
  const ignoreWords = new Set<string>(
    ctx.doc.cspellIgnores.filter((word) => bodyText.includes(word)),
  );
  if (bodyText.includes('nodataToast')) {
    ignoreWords.add('nodata');
  }
  const cspellBlock =
    ignoreWords.size > 0
      ? ['', `<!-- cSpell:ignore ${[...ignoreWords].toSorted().join(' ')} -->`]
      : [];

  return `${[...frontmatterLines, ...cspellBlock, '', bodyText].join('\n')}\n`;
};

const validateGeneratedOutput = (
  files: ReadonlyArray<{ readonly path: string; readonly contents: string }>,
  validApiRoutes: ReadonlySet<string>,
): void => {
  const errors: Array<string> = [];
  for (const file of files) {
    for (const rule of FORBIDDEN_PATTERNS) {
      if (rule.pattern.test(file.contents)) {
        errors.push(`${file.path}: matched forbidden term "${rule.label}"`);
      }
    }
    for (const match of file.contents.matchAll(/\]\((\/[^)#]+)/gu)) {
      const linkPath = match[1]!;
      if (linkPath.startsWith('/guide/')) {
        if (!ALLOWED_GUIDE_PATHS.has(linkPath)) {
          errors.push(`${file.path}: unapproved guide link "${linkPath}"`);
        }
      } else if (linkPath.startsWith('/api/')) {
        if (linkPath !== '/api/shared-types' && !validApiRoutes.has(linkPath)) {
          errors.push(`${file.path}: broken api link "${linkPath}"`);
        }
      }
    }
  }
  if (errors.length > 0) {
    throw new Error(
      `Generated doc validation failed (${errors.length} issues):\n${errors.slice(0, 20).join('\n')}`,
    );
  }
};

const formatFiles = (targets: ReadonlyArray<string>): void => {
  const chunkSize = 100;
  for (let idx = 0; idx < targets.length; idx += chunkSize) {
    const chunk = targets.slice(idx, idx + chunkSize);
    const result = spawnSync(
      'bun',
      [
        'x',
        'oxfmt',
        '--config',
        resolve(PROJECT_ROOT, 'oxfmt.config.ts'),
        ...chunk,
      ],
      {
        cwd: PROJECT_ROOT,
        stdio: 'inherit',
      },
    );
    if (result.status !== 0) {
      throw new Error('Failed to format generated API docs with oxfmt');
    }
  }
};

const buildAllDocs = async (): Promise<{
  readonly files: ReadonlyArray<{
    readonly path: string;
    readonly contents: string;
  }>;
  readonly stats: {
    readonly total: number;
    readonly modeled: number;
    readonly unmodeled: number;
    readonly withParams: number;
    readonly withNotes: number;
    readonly astFallbacks: number;
  };
}> => {
  const discovered: Array<DiscoveredModuleFile> =
    await discoverModuleFiles(MODULES_DIRECTORY);
  const sorted = discovered.toSorted((left, right) =>
    left.identifier.localeCompare(right.identifier),
  );
  const existingDocs = await scanExistingDocs();
  const validApiRoutes = new Set(
    [...existingDocs.values()].map((doc) => doc.relativeRoutePath),
  );

  const allPaths = [
    UPSTREAM_SCHEMAS_PATH,
    ...sorted.map((moduleFile) => moduleFile.filePath),
  ];

  const compiler = new API();
  const fallbacks: Array<string> = [];
  const filesToWrite: Array<{
    readonly path: string;
    readonly contents: string;
  }> = [];
  let modeledCount = 0;
  let unmodeledCount = 0;
  let withParamsCount = 0;
  let withNotesCount = 0;

  try {
    const snapshot = await compiler.updateSnapshot({ openFiles: allPaths });
    try {
      const upstreamProject = (await snapshot.getDefaultProjectForFile(
        UPSTREAM_SCHEMAS_PATH,
      ))!;
      const upstreamSource = (await upstreamProject.program.getSourceFile(
        UPSTREAM_SCHEMAS_PATH,
      ))!;
      const sharedSchemas = parseSharedSchemas(upstreamSource, fallbacks);
      const sharedSet = new Set(sharedSchemas.keys());

      const sourceByIdentifier = new Map<string, SourceFile>();
      for (const moduleFile of sorted) {
        const project = (await snapshot.getDefaultProjectForFile(
          moduleFile.filePath,
        ))!;
        const source = (await project.program.getSourceFile(
          moduleFile.filePath,
        ))!;
        sourceByIdentifier.set(moduleFile.identifier, source);
      }

      filesToWrite.push({
        path: SHARED_TYPES_PATH,
        contents: renderSharedTypesMarkdown(sharedSchemas),
      });

      for (const moduleFile of sorted) {
        const doc = existingDocs.get(moduleFile.identifier);
        if (!doc) {
          throw new Error(
            `Missing existing doc file for module "${moduleFile.identifier}"`,
          );
        }
        const source = sourceByIdentifier.get(moduleFile.identifier)!;
        const imported = (await import(
          pathToFileURL(moduleFile.filePath).href
        )) as {
          readonly moduleActions: ModuleActions;
          readonly decodeModuleInput: (
            input: unknown,
          ) => Effect.Effect<unknown, unknown>;
        };
        const actions = validateModuleActions(imported.moduleActions);
        const policy = modulePolicy(actions);

        const inputSpec = parseModuleInputAst(source, sharedSet, fallbacks);
        const bodySpec = parseModuleBodyAst(
          source,
          sharedSet,
          sourceByIdentifier,
          fallbacks,
        );

        const ctx: ParsedModuleContext = {
          identifier: moduleFile.identifier,
          camelName: toCamelCase(moduleFile.identifier),
          pascalName: toPascalCase(moduleFile.identifier),
          route: moduleFile.route,
          doc,
          input: inputSpec,
          body: bodySpec,
          sharedCache: policy.shared,
          isUpload: policy.upload,
          isPureLocal: Object.keys(actions).length === 0,
          decodeInput: imported.decodeModuleInput,
        };

        const rendered = renderModuleMarkdown(ctx, sharedSet);
        if (bodySpec.modeled) modeledCount += 1;
        else unmodeledCount += 1;
        if (inputSpec.kind !== 'none') withParamsCount += 1;
        if (rendered.includes('\n## 注意事项\n')) withNotesCount += 1;

        filesToWrite.push({
          path: doc.path,
          contents: rendered,
        });
      }
    } finally {
      await snapshot.dispose();
    }
  } finally {
    await compiler.close();
  }

  if (fallbacks.length > 0) {
    throw new Error(
      `AST parsing encountered ${fallbacks.length} fallback(s):\n${fallbacks.join('\n')}`,
    );
  }

  validateGeneratedOutput(filesToWrite, validApiRoutes);

  return {
    files: filesToWrite,
    stats: {
      total: sorted.length,
      modeled: modeledCount,
      unmodeled: unmodeledCount,
      withParams: withParamsCount,
      withNotes: withNotesCount,
      astFallbacks: fallbacks.length,
    },
  };
};

const writeDocs = async (): Promise<void> => {
  const { files, stats } = await buildAllDocs();
  for (const file of files) {
    await mkdir(dirname(file.path), { recursive: true });
    await writeFile(file.path, file.contents, 'utf8');
  }
  formatFiles(files.map((file) => relative(PROJECT_ROOT, file.path)));
  console.log(
    `Synced ${stats.total} API docs + shared-types.md (modeled=${stats.modeled}, unmodeled=${stats.unmodeled}, params=${stats.withParams}, notes=${stats.withNotes}, fallbacks=${stats.astFallbacks})`,
  );
};

const checkDocs = async (): Promise<void> => {
  const { files, stats } = await buildAllDocs();
  const temporary = await mkdtemp(resolve(tmpdir(), 'hana-api-docs-'));
  try {
    const staged = files.map((file) => ({
      actual: file.path,
      expected: resolve(temporary, relative(PROJECT_ROOT, file.path)),
      contents: file.contents,
    }));
    for (const file of staged) {
      await mkdir(dirname(file.expected), { recursive: true });
      await writeFile(file.expected, file.contents, 'utf8');
    }
    formatFiles([temporary]);
    const outdated: Array<string> = [];
    for (const file of staged) {
      const expected = await readFile(file.expected, 'utf8');
      const actual = await readFile(file.actual, 'utf8').catch(() => '');
      if (expected !== actual) {
        outdated.push(relative(PROJECT_ROOT, file.actual));
      }
    }
    if (outdated.length > 0) {
      console.error(
        `API docs are out of date (${outdated.length} files):\n${outdated.map((item) => `  - ${item}`).join('\n')}`,
      );
      process.exitCode = 1;
      return;
    }
    console.log(
      `API docs are up to date (${stats.total} modules + shared-types.md, modeled=${stats.modeled}, unmodeled=${stats.unmodeled}, params=${stats.withParams}, notes=${stats.withNotes}, fallbacks=${stats.astFallbacks})`,
    );
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
};

if (import.meta.main) {
  if (process.argv.includes('--check')) {
    await checkDocs();
  } else {
    await writeDocs();
  }
}
