---
title: '公共数据结构'
description: '多个接口共用的已建模返回体实体与字段说明。'
---

# 公共数据结构

多个已建模接口在返回体中共同引用以下实体结构。

> 标记为**可选**的字段类型为 `T | null | undefined`，在数据缺失、为 `null` 或类型异常时会忽略；未声明的上游扩展字段会以 `UnknownJson` 原样保留。

根入口 `hana-music-api` 直接导出 `PlaylistSummary`、`PlaylistUser` 与各接口独立的 `*Body` 类型（如 `SongDetailBody`）。

```ts
import type {
  PlaylistSummary,
  PlaylistUser,
  SongDetailBody,
} from 'hana-music-api';
```

- **运行时校验**：如需在运行时校验返回体，可从 `hana-music-api/schemas` 或 `hana-music-api/schemas/<module>` 导入对应的 `*Body` 校验器。
- **实体引用**：其余公共实体用于描述各接口 `*Body` 内部嵌套的歌曲、专辑、用户与评论结构。

## 歌曲与音质

### Song

歌曲核心实体，包含歌曲基础信息、歌手、专辑、各档音质与播放权限。云盘上传且未匹配曲库的歌曲，其 `cd` 可能为 `null`、`no` 为 `0`。

```ts
type Song = {
  id: number;
  name?: string | null;
  ar?: Array<Artist> | null;
  al?: {
    id?: number | null;
    name?: string | null;
    picUrl?: string | null;
    alia?: Array<string> | null;
    pic?: number | null;
    pic_str?: string | null;
    tns?: Array<string> | null;
  } | null;
  dt?: number | null;
  fee?: number | null;
  no?: number | null;
  cd?: string | null;
  alia?: Array<string> | null;
  tns?: Array<string> | null;
  publishTime?: number | null;
  additionalTitle?: string | null;
  alg?: string | null;
  alias?: Array<string> | null;
  album?: SimpleAlbum | null;
  artists?: Array<Artist> | null;
  artistClassics?: boolean | null;
  awardName?: string | null;
  cf?: string | null;
  copyright?: number | null;
  copyrightId?: number | null;
  cp?: number | null;
  djId?: number | null;
  displayReason?: string | null;
  duration?: number | null;
  ftype?: number | null;
  h?: {
    br?: number | null;
    fid?: number | null;
    size?: number | null;
    sr?: number | null;
    vd?: number | null;
  } | null;
  hr?: {
    br?: number | null;
    fid?: number | null;
    size?: number | null;
    sr?: number | null;
    vd?: number | null;
  } | null;
  l?: {
    br?: number | null;
    fid?: number | null;
    size?: number | null;
    sr?: number | null;
    vd?: number | null;
  } | null;
  m?: {
    br?: number | null;
    fid?: number | null;
    size?: number | null;
    sr?: number | null;
    vd?: number | null;
  } | null;
  mainTitle?: string | null;
  mark?: number | null;
  markTags?: Array<{
    tagKey?: string | null;
    tagValue?: string | null;
  }> | null;
  mst?: number | null;
  mv?: number | null;
  mvid?: number | null;
  noCopyrightRcmd?: {
    type?: number | null;
    typeDesc?: string | null;
  } | null;
  originCoverType?: number | null;
  originSongSimpleData?: {
    albumMeta?: {
      id?: number | null;
      name?: string | null;
    } | null;
    artists?: Array<Artist> | null;
    name?: string | null;
    songId?: number | null;
  } | null;
  pc?: {
    alb?: string | null;
    ar?: string | null;
    br?: number | null;
    cid?: string | null;
    fn?: string | null;
    nickname?: string | null;
    privateCloud?: PrivateCloud | null;
    sn?: string | null;
    uid?: number | null;
    version?: number | null;
  } | null;
  pop?: number | null;
  privilege?: LooseSongPrivilege | null;
  pst?: number | null;
  reason?: string | null;
  recommendReason?: string | null;
  resourceState?: boolean | null;
  rt?: string | null;
  rtype?: number | null;
  s_id?: number | null;
  single?: number | null;
  sq?: {
    br?: number | null;
    fid?: number | null;
    size?: number | null;
    sr?: number | null;
    vd?: number | null;
  } | null;
  st?: number | null;
  status?: number | null;
  t?: number | null;
  transNames?: Array<string> | null;
  v?: number | null;
  version?: number | null;
};
```

| 字段                   | 类型                                                       | 必填 | 说明                                                                                      |
| ---------------------- | ---------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------- |
| `id`                   | `number`                                                   | 是   | 资源 ID                                                                                   |
| `name`                 | `string`                                                   | 否   | 名称或标题                                                                                |
| `ar`                   | Array\<[Artist](/api/shared-types#artist)\>                | 否   | 歌手列表                                                                                  |
| `al`                   | `object`                                                   | 否   | 所属专辑精简信息                                                                          |
| `dt`                   | `number`                                                   | 否   | 歌曲时长（毫秒）                                                                          |
| `fee`                  | `number`                                                   | 否   | 付费类型（`0` 免费/无版权、`1` VIP、`4` 购买专辑、`8` 会员高音质）                        |
| `no`                   | `number`                                                   | 否   | -                                                                                         |
| `cd`                   | `string`                                                   | 否   | -                                                                                         |
| `alia`                 | `Array<string>`                                            | 否   | 别名列表                                                                                  |
| `tns`                  | `Array<string>`                                            | 否   | 译名列表                                                                                  |
| `publishTime`          | `number`                                                   | 否   | 发布时间戳（毫秒）                                                                        |
| `additionalTitle`      | `string`                                                   | 否   | -                                                                                         |
| `alg`                  | `string`                                                   | 否   | 推荐算法标识                                                                              |
| `alias`                | `Array<string>`                                            | 否   | 别名列表                                                                                  |
| `album`                | [SimpleAlbum](/api/shared-types#simplealbum)               | 否   | 所属专辑信息                                                                              |
| `artists`              | Array\<[Artist](/api/shared-types#artist)\>                | 否   | 歌手列表                                                                                  |
| `artistClassics`       | `boolean`                                                  | 否   | -                                                                                         |
| `awardName`            | `string`                                                   | 否   | -                                                                                         |
| `cf`                   | `string`                                                   | 否   | -                                                                                         |
| `copyright`            | `number`                                                   | 否   | -                                                                                         |
| `copyrightId`          | `number`                                                   | 否   | copyright ID                                                                              |
| `cp`                   | `number`                                                   | 否   | -                                                                                         |
| `djId`                 | `number`                                                   | 否   | 主播用户 ID                                                                               |
| `displayReason`        | `string`                                                   | 否   | -                                                                                         |
| `duration`             | `number`                                                   | 否   | 时长（毫秒）                                                                              |
| `ftype`                | `number`                                                   | 否   | -                                                                                         |
| `h`                    | `object`                                                   | 否   | 高音质文件信息                                                                            |
| `hr`                   | `object`                                                   | 否   | Hi-Res 音质文件信息                                                                       |
| `l`                    | `object`                                                   | 否   | 低音质文件信息                                                                            |
| `m`                    | `object`                                                   | 否   | 中音质文件信息                                                                            |
| `mainTitle`            | `string`                                                   | 否   | -                                                                                         |
| `mark`                 | `number`                                                   | 否   | 歌曲属性位掩码（如 `131072` 纯音乐、`1048576` 脏标、`262144` 杜比、`17179869184` Hi-Res） |
| `markTags`             | `Array<object>`                                            | 否   | -                                                                                         |
| `mst`                  | `number`                                                   | 否   | -                                                                                         |
| `mv`                   | `number`                                                   | 否   | 关联 MV ID（`0` 表示无 MV）                                                               |
| `mvid`                 | `number`                                                   | 否   | 关联 MV ID                                                                                |
| `noCopyrightRcmd`      | `object`                                                   | 否   | -                                                                                         |
| `originCoverType`      | `number`                                                   | 否   | -                                                                                         |
| `originSongSimpleData` | `object`                                                   | 否   | -                                                                                         |
| `pc`                   | `object`                                                   | 否   | -                                                                                         |
| `pop`                  | `number`                                                   | 否   | -                                                                                         |
| `privilege`            | [LooseSongPrivilege](/api/shared-types#loosesongprivilege) | 否   | 歌曲播放与下载权限信息                                                                    |
| `pst`                  | `number`                                                   | 否   | -                                                                                         |
| `reason`               | `string`                                                   | 否   | -                                                                                         |
| `recommendReason`      | `string`                                                   | 否   | -                                                                                         |
| `resourceState`        | `boolean`                                                  | 否   | -                                                                                         |
| `rt`                   | `string`                                                   | 否   | -                                                                                         |
| `rtype`                | `number`                                                   | 否   | -                                                                                         |
| `s_id`                 | `number`                                                   | 否   | -                                                                                         |
| `single`               | `number`                                                   | 否   | -                                                                                         |
| `sq`                   | `object`                                                   | 否   | 无损音质文件信息                                                                          |
| `st`                   | `number`                                                   | 否   | 版权状态（`< 0` 通常为灰色无版权）                                                        |
| `status`               | `number`                                                   | 否   | 当前状态码                                                                                |
| `t`                    | `number`                                                   | 否   | 歌曲来源标记（`0` 普通曲库、`1` 云盘未匹配、`2` 云盘已匹配公开曲库）                      |
| `transNames`           | `Array<string>`                                            | 否   | 译名列表                                                                                  |
| `v`                    | `number`                                                   | 否   | -                                                                                         |
| `version`              | `number`                                                   | 否   | 当前服务版本号                                                                            |

### LooseSong

嵌套在歌单、云盘或推荐容器中的歌曲实体，字段与 [Song](#song) 一致，但 `id` 允许缺失或为 `null`。

```ts
type LooseSong = Omit<Song, 'id'> & {
  id?: number | null;
};
```

| 字段         | 类型          | 必填 | 说明                                  |
| ------------ | ------------- | ---- | ------------------------------------- |
| _(继承字段)_ | [Song](#song) | -    | 继承自 `Song`，同名字段以下方声明为准 |
| `id`         | `number`      | 否   | 资源 ID                               |

### SongPrivilege

歌曲版权、试听与下载权限信息，`id` 为必填数字；`st < 0` 通常表示灰色无版权资源。

```ts
type SongPrivilege = {
  id: number;
  st?: number | null;
  pl?: number | null;
  chargeInfoList?: Array<{
    chargeType?: number | null;
    rate?: number | null;
  }> | null;
  code?: number | null;
  cp?: number | null;
  cs?: boolean | null;
  dl?: number | null;
  dlLevel?: string | null;
  downloadMaxBrLevel?: string | null;
  downloadMaxbr?: number | null;
  fee?: number | null;
  fl?: number | null;
  flLevel?: string | null;
  flag?: number | null;
  freeTrialPrivilege?: {
    cannotListenReason?: number | null;
    listenType?: number | null;
    resConsumable?: boolean | null;
    userConsumable?: boolean | null;
  } | null;
  maxBrLevel?: string | null;
  maxbr?: number | null;
  paidBigBang?: boolean | null;
  payed?: number | null;
  plLevel?: string | null;
  playMaxBrLevel?: string | null;
  playMaxbr?: number | null;
  preSell?: boolean | null;
  realPayed?: number | null;
  rightSource?: number | null;
  rscl?: number | null;
  sp?: number | null;
  subp?: number | null;
  toast?: boolean | null;
};
```

| 字段                 | 类型            | 必填 | 说明                                                               |
| -------------------- | --------------- | ---- | ------------------------------------------------------------------ |
| `id`                 | `number`        | 是   | 资源 ID                                                            |
| `st`                 | `number`        | 否   | 版权状态（`< 0` 通常为灰色无版权）                                 |
| `pl`                 | `number`        | 否   | 当前最高可试听码率                                                 |
| `chargeInfoList`     | `Array<object>` | 否   | -                                                                  |
| `code`               | `number`        | 否   | 状态码或业务码                                                     |
| `cp`                 | `number`        | 否   | -                                                                  |
| `cs`                 | `boolean`       | 否   | -                                                                  |
| `dl`                 | `number`        | 否   | 当前最高可下载码率                                                 |
| `dlLevel`            | `string`        | 否   | -                                                                  |
| `downloadMaxBrLevel` | `string`        | 否   | -                                                                  |
| `downloadMaxbr`      | `number`        | 否   | -                                                                  |
| `fee`                | `number`        | 否   | 付费类型（`0` 免费/无版权、`1` VIP、`4` 购买专辑、`8` 会员高音质） |
| `fl`                 | `number`        | 否   | -                                                                  |
| `flLevel`            | `string`        | 否   | -                                                                  |
| `flag`               | `number`        | 否   | -                                                                  |
| `freeTrialPrivilege` | `object`        | 否   | -                                                                  |
| `maxBrLevel`         | `string`        | 否   | -                                                                  |
| `maxbr`              | `number`        | 否   | 歌曲最高支持码率                                                   |
| `paidBigBang`        | `boolean`       | 否   | -                                                                  |
| `payed`              | `number`        | 否   | -                                                                  |
| `plLevel`            | `string`        | 否   | -                                                                  |
| `playMaxBrLevel`     | `string`        | 否   | -                                                                  |
| `playMaxbr`          | `number`        | 否   | -                                                                  |
| `preSell`            | `boolean`       | 否   | -                                                                  |
| `realPayed`          | `number`        | 否   | -                                                                  |
| `rightSource`        | `number`        | 否   | -                                                                  |
| `rscl`               | `number`        | 否   | -                                                                  |
| `sp`                 | `number`        | 否   | -                                                                  |
| `subp`               | `number`        | 否   | -                                                                  |
| `toast`              | `boolean`       | 否   | -                                                                  |

### LooseSongPrivilege

嵌套在歌曲或其他容器中的权限对象，字段与 [SongPrivilege](#songprivilege) 一致，但 `id` 允许缺失或为 `null`。

```ts
type LooseSongPrivilege = Omit<SongPrivilege, 'id'> & {
  id?: number | null;
};
```

| 字段         | 类型                            | 必填 | 说明                                           |
| ------------ | ------------------------------- | ---- | ---------------------------------------------- |
| _(继承字段)_ | [SongPrivilege](#songprivilege) | -    | 继承自 `SongPrivilege`，同名字段以下方声明为准 |
| `id`         | `number`                        | 否   | 资源 ID                                        |

### SongUrlData

歌曲播放或下载地址条目。无版权时 `url` 和 `level` 为 `null` 且 `code` 非 `200`；仅限试听时 `freeTrialInfo` 给出试听片段的起止秒数。

```ts
type SongUrlData = {
  id: number;
  url: string | null;
  code: number;
  level?: string | null;
  expi?: number | null;
  freeTrialInfo?: {
    start?: number | null;
    end?: number | null;
    fragmentType?: number | null;
    algData?: {
      audioEffect?: number | null;
      fragSource?: string | null;
    } | null;
  } | null;
  auEff?: number | null;
  beatType?: number | null;
  br?: number | null;
  canExtend?: boolean | null;
  closedGain?: number | null;
  closedPeak?: number | null;
  encodeType?: string | null;
  fee?: number | null;
  flag?: number | null;
  freeTimeTrialPrivilege?: {
    remainTime?: number | null;
    resConsumable?: boolean | null;
    type?: number | null;
    userConsumable?: boolean | null;
  } | null;
  freeTrialPrivilege?: {
    cannotListenReason?: number | null;
    listenType?: number | null;
    resConsumable?: boolean | null;
    userConsumable?: boolean | null;
  } | null;
  gain?: number | null;
  md5?: string | null;
  musicId?: string | null;
  payed?: number | null;
  peak?: number | null;
  rightSource?: number | null;
  size?: number | null;
  sr?: number | null;
  time?: number | null;
  type?: string | null;
  urlSource?: number | null;
};
```

| 字段                     | 类型             | 必填 | 说明                                                               |
| ------------------------ | ---------------- | ---- | ------------------------------------------------------------------ |
| `id`                     | `number`         | 是   | 资源 ID                                                            |
| `url`                    | `string \| null` | 是   | 资源或音频访问地址                                                 |
| `code`                   | `number`         | 是   | 状态码或业务码                                                     |
| `level`                  | `string`         | 否   | 实际返回的音质等级                                                 |
| `expi`                   | `number`         | 否   | 链接有效时长（秒）                                                 |
| `freeTrialInfo`          | `object`         | 否   | 试听片段起止秒数（完整可播放时为 `null`）                          |
| `auEff`                  | `number`         | 否   | -                                                                  |
| `beatType`               | `number`         | 否   | -                                                                  |
| `br`                     | `number`         | 否   | 音频比特率（bps）                                                  |
| `canExtend`              | `boolean`        | 否   | -                                                                  |
| `closedGain`             | `number`         | 否   | -                                                                  |
| `closedPeak`             | `number`         | 否   | -                                                                  |
| `encodeType`             | `string`         | 否   | -                                                                  |
| `fee`                    | `number`         | 否   | 付费类型（`0` 免费/无版权、`1` VIP、`4` 购买专辑、`8` 会员高音质） |
| `flag`                   | `number`         | 否   | -                                                                  |
| `freeTimeTrialPrivilege` | `object`         | 否   | -                                                                  |
| `freeTrialPrivilege`     | `object`         | 否   | -                                                                  |
| `gain`                   | `number`         | 否   | -                                                                  |
| `md5`                    | `string`         | 否   | 文件 MD5 校验值                                                    |
| `musicId`                | `string`         | 否   | music ID                                                           |
| `payed`                  | `number`         | 否   | -                                                                  |
| `peak`                   | `number`         | 否   | -                                                                  |
| `rightSource`            | `number`         | 否   | -                                                                  |
| `size`                   | `number`         | 否   | 文件大小（字节）或数量                                             |
| `sr`                     | `number`         | 否   | 音频采样率（Hz）                                                   |
| `time`                   | `number`         | 否   | 时间戳（毫秒）                                                     |
| `type`                   | `string`         | 否   | -                                                                  |
| `urlSource`              | `number`         | 否   | -                                                                  |

### ProgramQuality

旧版音频质量档位信息（用于节目主音频和部分历史歌曲结构）。

```ts
type ProgramQuality = {
  bitrate?: number | null;
  dfsId?: number | null;
  extension?: string | null;
  id?: number | null;
  name?: string | null;
  playTime?: number | null;
  size?: number | null;
  sr?: number | null;
  volumeDelta?: number | null;
};
```

| 字段          | 类型     | 必填 | 说明                   |
| ------------- | -------- | ---- | ---------------------- |
| `bitrate`     | `number` | 否   | -                      |
| `dfsId`       | `number` | 否   | dfs ID                 |
| `extension`   | `string` | 否   | -                      |
| `id`          | `number` | 否   | 资源 ID                |
| `name`        | `string` | 否   | 名称或标题             |
| `playTime`    | `number` | 否   | 时间戳                 |
| `size`        | `number` | 否   | 文件大小（字节）或数量 |
| `sr`          | `number` | 否   | 音频采样率（Hz）       |
| `volumeDelta` | `number` | 否   | -                      |

### ProgramMainSong

电台节目与部分推荐列表使用的旧版歌曲结构，内含专辑、歌手与 `bMusic`/`hMusic`/`mMusic`/`lMusic` 音质信息。

```ts
type ProgramMainSong = {
  album?: SimpleAlbum | null;
  artists?: Array<Artist> | null;
  bMusic?: ProgramQuality | null;
  commentThreadId?: string | null;
  copyFrom?: string | null;
  copyright?: number | null;
  copyrightId?: number | null;
  dayPlays?: number | null;
  disc?: string | null;
  duration?: number | null;
  fee?: number | null;
  ftype?: number | null;
  hMusic?: ProgramQuality | null;
  hearTime?: number | null;
  id?: number | null;
  lMusic?: ProgramQuality | null;
  mark?: number | null;
  mMusic?: ProgramQuality | null;
  mvid?: number | null;
  name?: string | null;
  no?: number | null;
  originCoverType?: number | null;
  playedNum?: number | null;
  popularity?: number | null;
  position?: number | null;
  publishTime?: number | null;
  ringtone?: string | null;
  rtype?: number | null;
  score?: number | null;
  single?: number | null;
  starred?: boolean | null;
  starredNum?: number | null;
  status?: number | null;
};
```

| 字段              | 类型                                               | 必填 | 说明                                                                                      |
| ----------------- | -------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------- |
| `album`           | [SimpleAlbum](/api/shared-types#simplealbum)       | 否   | 所属专辑信息                                                                              |
| `artists`         | Array\<[Artist](/api/shared-types#artist)\>        | 否   | 歌手列表                                                                                  |
| `bMusic`          | [ProgramQuality](/api/shared-types#programquality) | 否   | 低码率音频文件信息（旧版结构）                                                            |
| `commentThreadId` | `string`                                           | 否   | 评论线程 ID                                                                               |
| `copyFrom`        | `string`                                           | 否   | -                                                                                         |
| `copyright`       | `number`                                           | 否   | -                                                                                         |
| `copyrightId`     | `number`                                           | 否   | copyright ID                                                                              |
| `dayPlays`        | `number`                                           | 否   | -                                                                                         |
| `disc`            | `string`                                           | 否   | -                                                                                         |
| `duration`        | `number`                                           | 否   | 时长（毫秒）                                                                              |
| `fee`             | `number`                                           | 否   | 付费类型（`0` 免费/无版权、`1` VIP、`4` 购买专辑、`8` 会员高音质）                        |
| `ftype`           | `number`                                           | 否   | -                                                                                         |
| `hMusic`          | [ProgramQuality](/api/shared-types#programquality) | 否   | 高音质文件信息（旧版结构）                                                                |
| `hearTime`        | `number`                                           | 否   | 时间戳                                                                                    |
| `id`              | `number`                                           | 否   | 资源 ID                                                                                   |
| `lMusic`          | [ProgramQuality](/api/shared-types#programquality) | 否   | 低音质文件信息（旧版结构）                                                                |
| `mark`            | `number`                                           | 否   | 歌曲属性位掩码（如 `131072` 纯音乐、`1048576` 脏标、`262144` 杜比、`17179869184` Hi-Res） |
| `mMusic`          | [ProgramQuality](/api/shared-types#programquality) | 否   | 中音质文件信息（旧版结构）                                                                |
| `mvid`            | `number`                                           | 否   | 关联 MV ID                                                                                |
| `name`            | `string`                                           | 否   | 名称或标题                                                                                |
| `no`              | `number`                                           | 否   | -                                                                                         |
| `originCoverType` | `number`                                           | 否   | -                                                                                         |
| `playedNum`       | `number`                                           | 否   | -                                                                                         |
| `popularity`      | `number`                                           | 否   | -                                                                                         |
| `position`        | `number`                                           | 否   | -                                                                                         |
| `publishTime`     | `number`                                           | 否   | 发布时间戳（毫秒）                                                                        |
| `ringtone`        | `string`                                           | 否   | -                                                                                         |
| `rtype`           | `number`                                           | 否   | -                                                                                         |
| `score`           | `number`                                           | 否   | 热度或评分                                                                                |
| `single`          | `number`                                           | 否   | -                                                                                         |
| `starred`         | `boolean`                                          | 否   | -                                                                                         |
| `starredNum`      | `number`                                           | 否   | -                                                                                         |
| `status`          | `number`                                           | 否   | 当前状态码                                                                                |

### MlogSong

Mlog 视频中关联的歌曲简要信息。

```ts
type MlogSong = {
  id?: number | null;
  name?: string | null;
  albumName?: string | null;
  coverUrl?: string | null;
  duration?: number | null;
  artists?: Array<{
    artistId?: number | null;
    artistName?: string | null;
  }> | null;
};
```

| 字段        | 类型            | 必填 | 说明         |
| ----------- | --------------- | ---- | ------------ |
| `id`        | `number`        | 否   | 资源 ID      |
| `name`      | `string`        | 否   | 名称或标题   |
| `albumName` | `string`        | 否   | 专辑名称     |
| `coverUrl`  | `string`        | 否   | 封面图片 URL |
| `duration`  | `number`        | 否   | 时长（毫秒） |
| `artists`   | `Array<object>` | 否   | 歌手列表     |

### PrivateCloud

云盘歌曲对应的网盘文件元信息（MD5、码率、文件名、大小等）。

```ts
type PrivateCloud = {
  addTime?: number | null;
  album?: string | null;
  artist?: string | null;
  bitrate?: number | null;
  convertLyric?: number | null;
  cover?: number | null;
  cue?: number | null;
  fileName?: string | null;
  fileSize?: number | null;
  id?: number | null;
  lrcType?: string | null;
  lyric?: number | null;
  md5?: string | null;
  originalAudioSongId?: number | null;
  song?: string | null;
  songDfsId?: number | null;
  songId?: number | null;
  status?: number | null;
  userId?: number | null;
  version?: number | null;
};
```

| 字段                  | 类型     | 必填 | 说明                 |
| --------------------- | -------- | ---- | -------------------- |
| `addTime`             | `number` | 否   | 时间戳               |
| `album`               | `string` | 否   | 所属专辑信息         |
| `artist`              | `string` | 否   | 歌手详情             |
| `bitrate`             | `number` | 否   | -                    |
| `convertLyric`        | `number` | 否   | -                    |
| `cover`               | `number` | 否   | 封面图片 URL         |
| `cue`                 | `number` | 否   | -                    |
| `fileName`            | `string` | 否   | 原始文件名           |
| `fileSize`            | `number` | 否   | 文件大小（字节）     |
| `id`                  | `number` | 否   | 资源 ID              |
| `lrcType`             | `string` | 否   | -                    |
| `lyric`               | `number` | 否   | -                    |
| `md5`                 | `string` | 否   | 文件 MD5 校验值      |
| `originalAudioSongId` | `number` | 否   | originalAudioSong ID |
| `song`                | `string` | 否   | -                    |
| `songDfsId`           | `number` | 否   | songDfs ID           |
| `songId`              | `number` | 否   | 曲库歌曲 ID          |
| `status`              | `number` | 否   | 当前状态码           |
| `userId`              | `number` | 否   | 用户 ID              |
| `version`             | `number` | 否   | 当前服务版本号       |

### LyricUser

歌词或翻译贡献者的用户信息。

```ts
type LyricUser = {
  demand?: number | null;
  id?: number | null;
  nickname?: string | null;
  status?: number | null;
  uptime?: number | null;
  userid?: number | null;
};
```

| 字段       | 类型     | 必填 | 说明       |
| ---------- | -------- | ---- | ---------- |
| `demand`   | `number` | 否   | -          |
| `id`       | `number` | 否   | 资源 ID    |
| `nickname` | `string` | 否   | 用户昵称   |
| `status`   | `number` | 否   | 当前状态码 |
| `uptime`   | `number` | 否   | 时间戳     |
| `userid`   | `number` | 否   | -          |

## 专辑与歌手

### Artist

歌手基础信息实体。对于云盘未匹配公开曲库的歌曲，歌手 `id` 可能为 `0`、`name` 可能为 `null`。

```ts
type Artist = {
  id?: number | null;
  name?: string | null;
  accountId?: number | null;
  albumSize?: number | null;
  alia?: Array<string> | null;
  alias?: Array<string> | null;
  briefDesc?: string | null;
  followed?: boolean | null;
  img1v1?: number | null;
  img1v1Id?: number | null;
  img1v1Id_str?: string | null;
  img1v1Url?: string | null;
  musicSize?: number | null;
  mvSize?: number | null;
  picId?: number | null;
  picId_str?: string | null;
  picUrl?: string | null;
  tns?: Array<string> | null;
  topicPerson?: number | null;
  trans?: string | null;
  transNames?: Array<string> | null;
};
```

| 字段           | 类型            | 必填 | 说明               |
| -------------- | --------------- | ---- | ------------------ |
| `id`           | `number`        | 否   | 资源 ID            |
| `name`         | `string`        | 否   | 名称或标题         |
| `accountId`    | `number`        | 否   | account ID         |
| `albumSize`    | `number`        | 否   | 专辑数量           |
| `alia`         | `Array<string>` | 否   | 别名列表           |
| `alias`        | `Array<string>` | 否   | 别名列表           |
| `briefDesc`    | `string`        | 否   | 简短介绍           |
| `followed`     | `boolean`       | 否   | 当前账号是否已关注 |
| `img1v1`       | `number`        | 否   | -                  |
| `img1v1Id`     | `number`        | 否   | img1v1 ID          |
| `img1v1Id_str` | `string`        | 否   | -                  |
| `img1v1Url`    | `string`        | 否   | 资源访问链接       |
| `musicSize`    | `number`        | 否   | 单曲数量           |
| `mvSize`       | `number`        | 否   | MV 数量            |
| `picId`        | `number`        | 否   | pic ID             |
| `picId_str`    | `string`        | 否   | -                  |
| `picUrl`       | `string`        | 否   | 封面或图片 URL     |
| `tns`          | `Array<string>` | 否   | 译名列表           |
| `topicPerson`  | `number`        | 否   | -                  |
| `trans`        | `string`        | 否   | -                  |
| `transNames`   | `Array<string>` | 否   | 译名列表           |

### SimpleAlbum

精简版专辑对象，包含专辑名称、封面、发行时间与所属歌手。

```ts
type SimpleAlbum = {
  id?: number | null;
  name?: string | null;
  artist?: Artist | null;
  artists?: Array<Artist> | null;
  alias?: Array<string> | null;
  blurPicUrl?: string | null;
  briefDesc?: string | null;
  commentThreadId?: string | null;
  company?: string | null;
  companyId?: number | null;
  copyrightId?: number | null;
  description?: string | null;
  dolbyMark?: number | null;
  gapless?: number | null;
  idStr?: string | null;
  info?: Record<string, UnknownJson> | null;
  isSub?: boolean | null;
  mark?: number | null;
  onSale?: boolean | null;
  paid?: boolean | null;
  pic?: number | null;
  picId?: number | null;
  picId_str?: string | null;
  picUrl?: string | null;
  publishTime?: number | null;
  size?: number | null;
  status?: number | null;
  subType?: string | null;
  tags?: string | null;
  transNames?: Array<string> | null;
  type?: string | null;
};
```

| 字段              | 类型                                        | 必填 | 说明                                                                                      |
| ----------------- | ------------------------------------------- | ---- | ----------------------------------------------------------------------------------------- |
| `id`              | `number`                                    | 否   | 资源 ID                                                                                   |
| `name`            | `string`                                    | 否   | 名称或标题                                                                                |
| `artist`          | [Artist](/api/shared-types#artist)          | 否   | 歌手详情                                                                                  |
| `artists`         | Array\<[Artist](/api/shared-types#artist)\> | 否   | 歌手列表                                                                                  |
| `alias`           | `Array<string>`                             | 否   | 别名列表                                                                                  |
| `blurPicUrl`      | `string`                                    | 否   | 资源访问链接                                                                              |
| `briefDesc`       | `string`                                    | 否   | 简短介绍                                                                                  |
| `commentThreadId` | `string`                                    | 否   | 评论线程 ID                                                                               |
| `company`         | `string`                                    | 否   | -                                                                                         |
| `companyId`       | `number`                                    | 否   | company ID                                                                                |
| `copyrightId`     | `number`                                    | 否   | copyright ID                                                                              |
| `description`     | `string`                                    | 否   | 简介说明                                                                                  |
| `dolbyMark`       | `number`                                    | 否   | -                                                                                         |
| `gapless`         | `number`                                    | 否   | -                                                                                         |
| `idStr`           | `string`                                    | 否   | -                                                                                         |
| `info`            | `Record<string, UnknownJson>`               | 否   | -                                                                                         |
| `isSub`           | `boolean`                                   | 否   | -                                                                                         |
| `mark`            | `number`                                    | 否   | 歌曲属性位掩码（如 `131072` 纯音乐、`1048576` 脏标、`262144` 杜比、`17179869184` Hi-Res） |
| `onSale`          | `boolean`                                   | 否   | -                                                                                         |
| `paid`            | `boolean`                                   | 否   | -                                                                                         |
| `pic`             | `number`                                    | 否   | -                                                                                         |
| `picId`           | `number`                                    | 否   | pic ID                                                                                    |
| `picId_str`       | `string`                                    | 否   | -                                                                                         |
| `picUrl`          | `string`                                    | 否   | 封面或图片 URL                                                                            |
| `publishTime`     | `number`                                    | 否   | 发布时间戳（毫秒）                                                                        |
| `size`            | `number`                                    | 否   | 文件大小（字节）或数量                                                                    |
| `status`          | `number`                                    | 否   | 当前状态码                                                                                |
| `subType`         | `string`                                    | 否   | -                                                                                         |
| `tags`            | `string`                                    | 否   | 标签列表                                                                                  |
| `transNames`      | `Array<string>`                             | 否   | 译名列表                                                                                  |
| `type`            | `string`                                    | 否   | -                                                                                         |

### AlbumSummary

在 [SimpleAlbum](#simplealbum) 基础上要求必填 `id`，并补充 `info` 统计信息。

```ts
type AlbumSummary = Omit<SimpleAlbum, 'id' | 'info'> & {
  id: number;
  info?: AlbumInfo | null;
};
```

| 字段         | 类型                                     | 必填 | 说明                                         |
| ------------ | ---------------------------------------- | ---- | -------------------------------------------- |
| _(继承字段)_ | [SimpleAlbum](#simplealbum)              | -    | 继承自 `SimpleAlbum`，同名字段以下方声明为准 |
| `id`         | `number`                                 | 是   | 资源 ID                                      |
| `info`       | [AlbumInfo](/api/shared-types#albuminfo) | 否   | AlbumInfo 实体                               |

### AlbumInfo

专辑评论、点赞与分享统计信息。

```ts
type AlbumInfo = {
  commentCount?: number | null;
  commentThread?: {
    commentCount?: number | null;
    hotCount?: number | null;
    id?: string | null;
    likedCount?: number | null;
    resourceId?: number | null;
    resourceInfo?: {
      id?: number | null;
      imgUrl?: string | null;
      name?: string | null;
      userId?: number | null;
    } | null;
    resourceOwnerId?: number | null;
    resourceTitle?: string | null;
    resourceType?: number | null;
    shareCount?: number | null;
  } | null;
  liked?: boolean | null;
  likedCount?: number | null;
  resourceId?: number | null;
  resourceType?: number | null;
  shareCount?: number | null;
  threadId?: string | null;
};
```

| 字段            | 类型      | 必填 | 说明               |
| --------------- | --------- | ---- | ------------------ |
| `commentCount`  | `number`  | 否   | 评论数             |
| `commentThread` | `object`  | 否   | -                  |
| `liked`         | `boolean` | 否   | 当前账号是否已点赞 |
| `likedCount`    | `number`  | 否   | 点赞数             |
| `resourceId`    | `number`  | 否   | 关联资源 ID        |
| `resourceType`  | `number`  | 否   | 关联资源类型       |
| `shareCount`    | `number`  | 否   | 分享数             |
| `threadId`      | `string`  | 否   | 评论线程 ID        |

## 歌单与用户

### PlaylistSummary

歌单摘要实体，从根入口 `hana-music-api` 可直接导入其 TypeScript 类型。当登录态失效时，`subscribed` 通常为 `null`。

```ts
type PlaylistSummary = {
  id: number;
  name?: string | null;
  coverImgUrl?: string | null;
  trackCount?: number | null;
  updateTime?: number | null;
  trackUpdateTime?: number | null;
  playCount?: number | null;
  privacy?: number | null;
  specialType?: number | null;
  status?: number | null;
  description?: string | null;
  tags?: Array<string> | null;
  subscribed?: boolean | null;
  creator?: PlaylistUser | null;
  adType?: number | null;
  backgroundCoverId?: number | null;
  cloudTrackCount?: number | null;
  coverImgId?: number | null;
  createTime?: number | null;
  subscribedCount?: number | null;
  titleImage?: number | null;
  trackNumberUpdateTime?: number | null;
  userId?: number | null;
  commentThreadId?: string | null;
  backgroundCoverUrl?: string | null;
  coverImgId_str?: string | null;
  englishTitle?: string | null;
  titleImageUrl?: string | null;
  updateFrequency?: string | null;
  copied?: boolean | null;
  highQuality?: boolean | null;
  mix?: boolean | null;
  newImported?: boolean | null;
  opRecommend?: boolean | null;
  ordered?: boolean | null;
  subscribers?: Array<PlaylistUser> | null;
  ToplistType?: string | null;
  algTags?: Array<string> | null;
  anonimous?: boolean | null;
  bizExtInfo?: Record<string, UnknownJson> | null;
  commentCount?: number | null;
  containsTracks?: boolean | null;
  coverStatus?: number | null;
  detailPageTitle?: string | null;
  displayUserInfoAsTagOnly?: boolean | null;
  gradeStatus?: string | null;
  mixPodcastPlaylist?: boolean | null;
  officialPlaylistType?: string | null;
  playlistType?: string | null;
  podcastTrackCount?: number | null;
  recommendInfo?: Record<string, UnknownJson> | null;
  relateResType?: string | null;
  shareCount?: number | null;
  top?: boolean | null;
  totalDuration?: number | null;
  tracks?: Array<LooseSong> | null;
  trialMode?: number | null;
  uiPlaylistType?: string | null;
};
```

| 字段                       | 类型                                                    | 必填 | 说明                                                  |
| -------------------------- | ------------------------------------------------------- | ---- | ----------------------------------------------------- |
| `id`                       | `number`                                                | 是   | 资源 ID                                               |
| `name`                     | `string`                                                | 否   | 名称或标题                                            |
| `coverImgUrl`              | `string`                                                | 否   | 歌单封面图片 URL                                      |
| `trackCount`               | `number`                                                | 否   | 曲目数量                                              |
| `updateTime`               | `number`                                                | 否   | 更新时间戳（毫秒）                                    |
| `trackUpdateTime`          | `number`                                                | 否   | 时间戳                                                |
| `playCount`                | `number`                                                | 否   | 播放次数                                              |
| `privacy`                  | `number`                                                | 否   | -                                                     |
| `specialType`              | `number`                                                | 否   | -                                                     |
| `status`                   | `number`                                                | 否   | 当前状态码                                            |
| `description`              | `string`                                                | 否   | 简介说明                                              |
| `tags`                     | `Array<string>`                                         | 否   | 标签列表                                              |
| `subscribed`               | `boolean`                                               | 否   | 当前账号是否已收藏（未登录或凭据失效时可能为 `null`） |
| `creator`                  | [PlaylistUser](/api/shared-types#playlistuser)          | 否   | 歌单创建者信息                                        |
| `adType`                   | `number`                                                | 否   | -                                                     |
| `backgroundCoverId`        | `number`                                                | 否   | backgroundCover ID                                    |
| `cloudTrackCount`          | `number`                                                | 否   | -                                                     |
| `coverImgId`               | `number`                                                | 否   | coverImg ID                                           |
| `createTime`               | `number`                                                | 否   | 创建时间戳（毫秒）                                    |
| `subscribedCount`          | `number`                                                | 否   | 收藏人数                                              |
| `titleImage`               | `number`                                                | 否   | -                                                     |
| `trackNumberUpdateTime`    | `number`                                                | 否   | 时间戳                                                |
| `userId`                   | `number`                                                | 否   | 用户 ID                                               |
| `commentThreadId`          | `string`                                                | 否   | 评论线程 ID                                           |
| `backgroundCoverUrl`       | `string`                                                | 否   | 资源访问链接                                          |
| `coverImgId_str`           | `string`                                                | 否   | -                                                     |
| `englishTitle`             | `string`                                                | 否   | -                                                     |
| `titleImageUrl`            | `string`                                                | 否   | 资源访问链接                                          |
| `updateFrequency`          | `string`                                                | 否   | -                                                     |
| `copied`                   | `boolean`                                               | 否   | -                                                     |
| `highQuality`              | `boolean`                                               | 否   | -                                                     |
| `mix`                      | `boolean`                                               | 否   | -                                                     |
| `newImported`              | `boolean`                                               | 否   | -                                                     |
| `opRecommend`              | `boolean`                                               | 否   | -                                                     |
| `ordered`                  | `boolean`                                               | 否   | -                                                     |
| `subscribers`              | Array\<[PlaylistUser](/api/shared-types#playlistuser)\> | 否   | 订阅者列表                                            |
| `ToplistType`              | `string`                                                | 否   | -                                                     |
| `algTags`                  | `Array<string>`                                         | 否   | -                                                     |
| `anonimous`                | `boolean`                                               | 否   | -                                                     |
| `bizExtInfo`               | `Record<string, UnknownJson>`                           | 否   | -                                                     |
| `commentCount`             | `number`                                                | 否   | 评论数                                                |
| `containsTracks`           | `boolean`                                               | 否   | -                                                     |
| `coverStatus`              | `number`                                                | 否   | -                                                     |
| `detailPageTitle`          | `string`                                                | 否   | -                                                     |
| `displayUserInfoAsTagOnly` | `boolean`                                               | 否   | -                                                     |
| `gradeStatus`              | `string`                                                | 否   | -                                                     |
| `mixPodcastPlaylist`       | `boolean`                                               | 否   | -                                                     |
| `officialPlaylistType`     | `string`                                                | 否   | -                                                     |
| `playlistType`             | `string`                                                | 否   | -                                                     |
| `podcastTrackCount`        | `number`                                                | 否   | -                                                     |
| `recommendInfo`            | `Record<string, UnknownJson>`                           | 否   | -                                                     |
| `relateResType`            | `string`                                                | 否   | -                                                     |
| `shareCount`               | `number`                                                | 否   | 分享数                                                |
| `top`                      | `boolean`                                               | 否   | -                                                     |
| `totalDuration`            | `number`                                                | 否   | -                                                     |
| `tracks`                   | Array\<[LooseSong](/api/shared-types#loosesong)\>       | 否   | 歌单曲目列表（部分接口仅返回部分曲目）                |
| `trialMode`                | `number`                                                | 否   | -                                                     |
| `uiPlaylistType`           | `string`                                                | 否   | -                                                     |

### PlaylistUser

歌单创建者、收藏者或关联用户资料，从根入口 `hana-music-api` 可直接导入其 TypeScript 类型。

```ts
type PlaylistUser = {
  userId?: number | null;
  nickname?: string | null;
  accountStatus?: number | null;
  authStatus?: number | null;
  authenticationTypes?: number | null;
  authority?: number | null;
  avatarImgId?: number | null;
  backgroundImgId?: number | null;
  birthday?: number | null;
  city?: number | null;
  djStatus?: number | null;
  gender?: number | null;
  province?: number | null;
  userType?: number | null;
  vipType?: number | null;
  avatarImgIdStr?: string | null;
  avatarImgId_str?: string | null;
  avatarUrl?: string | null;
  description?: string | null;
  detailDescription?: string | null;
  signature?: string | null;
  backgroundImgIdStr?: string | null;
  backgroundUrl?: string | null;
  anchor?: boolean | null;
  defaultAvatar?: boolean | null;
  followed?: boolean | null;
  mutual?: boolean | null;
  expertTags?: Array<string> | null;
  avatarDetail?: AvatarDetail | null;
  experts?: Record<string, string> | null;
};
```

| 字段                  | 类型                                           | 必填 | 说明                             |
| --------------------- | ---------------------------------------------- | ---- | -------------------------------- |
| `userId`              | `number`                                       | 否   | 用户 ID                          |
| `nickname`            | `string`                                       | 否   | 用户昵称                         |
| `accountStatus`       | `number`                                       | 否   | -                                |
| `authStatus`          | `number`                                       | 否   | -                                |
| `authenticationTypes` | `number`                                       | 否   | -                                |
| `authority`           | `number`                                       | 否   | -                                |
| `avatarImgId`         | `number`                                       | 否   | avatarImg ID                     |
| `backgroundImgId`     | `number`                                       | 否   | backgroundImg ID                 |
| `birthday`            | `number`                                       | 否   | -                                |
| `city`                | `number`                                       | 否   | -                                |
| `djStatus`            | `number`                                       | 否   | -                                |
| `gender`              | `number`                                       | 否   | 性别（`0` 保密、`1` 男、`2` 女） |
| `province`            | `number`                                       | 否   | -                                |
| `userType`            | `number`                                       | 否   | -                                |
| `vipType`             | `number`                                       | 否   | 会员类型（`0` 表示非会员）       |
| `avatarImgIdStr`      | `string`                                       | 否   | -                                |
| `avatarImgId_str`     | `string`                                       | 否   | -                                |
| `avatarUrl`           | `string`                                       | 否   | 头像图片 URL                     |
| `description`         | `string`                                       | 否   | 简介说明                         |
| `detailDescription`   | `string`                                       | 否   | -                                |
| `signature`           | `string`                                       | 否   | 个人签名                         |
| `backgroundImgIdStr`  | `string`                                       | 否   | -                                |
| `backgroundUrl`       | `string`                                       | 否   | 资源访问链接                     |
| `anchor`              | `boolean`                                      | 否   | -                                |
| `defaultAvatar`       | `boolean`                                      | 否   | -                                |
| `followed`            | `boolean`                                      | 否   | 当前账号是否已关注               |
| `mutual`              | `boolean`                                      | 否   | 是否互相关注                     |
| `expertTags`          | `Array<string>`                                | 否   | -                                |
| `avatarDetail`        | [AvatarDetail](/api/shared-types#avatardetail) | 否   | AvatarDetail 实体                |
| `experts`             | `Record<string, string>`                       | 否   | -                                |

### Account

账号核心状态对象，`anonimousUser` 为 `true` 表示当前处于匿名游客身份。

```ts
type Account = {
  id: number;
  anonimousUser?: boolean | null;
  ban?: number | null;
  baoyueVersion?: number | null;
  createTime?: number | null;
  donateVersion?: number | null;
  paidFee?: boolean | null;
  salt?: string | null;
  status?: number | null;
  tokenVersion?: number | null;
  type?: number | null;
  uninitialized?: boolean | null;
  userName?: string | null;
  vipType?: number | null;
  viptypeVersion?: number | null;
  whitelistAuthority?: number | null;
};
```

| 字段                 | 类型      | 必填 | 说明                       |
| -------------------- | --------- | ---- | -------------------------- |
| `id`                 | `number`  | 是   | 资源 ID                    |
| `anonimousUser`      | `boolean` | 否   | 是否为匿名游客账号         |
| `ban`                | `number`  | 否   | -                          |
| `baoyueVersion`      | `number`  | 否   | -                          |
| `createTime`         | `number`  | 否   | 创建时间戳（毫秒）         |
| `donateVersion`      | `number`  | 否   | -                          |
| `paidFee`            | `boolean` | 否   | -                          |
| `salt`               | `string`  | 否   | -                          |
| `status`             | `number`  | 否   | 当前状态码                 |
| `tokenVersion`       | `number`  | 否   | -                          |
| `type`               | `number`  | 否   | -                          |
| `uninitialized`      | `boolean` | 否   | -                          |
| `userName`           | `string`  | 否   | 内部用户名                 |
| `vipType`            | `number`  | 否   | 会员类型（`0` 表示非会员） |
| `viptypeVersion`     | `number`  | 否   | -                          |
| `whitelistAuthority` | `number`  | 否   | -                          |

### UserProfile

完整用户资料对象，包含昵称、头像、关注数、粉丝数、VIP 类型与认证信息。

```ts
type UserProfile = {
  userId: number;
  accountStatus?: number | null;
  accountType?: number | null;
  allAuthTypes?: Array<{
    desc?: string | null;
    tags?: Array<string> | null;
    type?: number | null;
  }> | null;
  allSubscribedCount?: number | null;
  anchor?: boolean | null;
  artistId?: number | null;
  artistIdentity?: Array<number> | null;
  artistName?: string | null;
  authStatus?: number | null;
  authenticated?: boolean | null;
  authenticationTypes?: number | null;
  authority?: number | null;
  avatarDetail?: AvatarDetail | null;
  avatarImgId?: number | null;
  avatarImgIdStr?: string | null;
  avatarImgId_str?: string | null;
  avatarUrl?: string | null;
  backgroundImgId?: number | null;
  backgroundImgIdStr?: string | null;
  backgroundUrl?: string | null;
  birthday?: number | null;
  blacklist?: boolean | null;
  cCount?: number | null;
  city?: number | null;
  createTime?: number | null;
  defaultAvatar?: boolean | null;
  description?: string | null;
  detailDescription?: string | null;
  djStatus?: number | null;
  eventCount?: number | null;
  experts?: Record<string, string> | null;
  followMe?: boolean | null;
  followed?: boolean | null;
  followeds?: number | null;
  follows?: number | null;
  gender?: number | null;
  inBlacklist?: boolean | null;
  lastLoginIP?: string | null;
  lastLoginTime?: number | null;
  locationStatus?: number | null;
  mainAuthType?: {
    desc?: string | null;
    tags?: Array<string> | null;
    type?: number | null;
  } | null;
  mutual?: boolean | null;
  newFollows?: number | null;
  nickname?: string | null;
  playlistBeSubscribedCount?: number | null;
  playlistCount?: number | null;
  privacyItemUnlimit?: {
    age?: boolean | null;
    area?: boolean | null;
    college?: boolean | null;
    gender?: boolean | null;
    villageAge?: boolean | null;
  } | null;
  province?: number | null;
  sCount?: number | null;
  sDJPCount?: number | null;
  shortUserName?: string | null;
  signature?: string | null;
  userName?: string | null;
  userType?: number | null;
  vipType?: number | null;
  viptypeVersion?: number | null;
};
```

| 字段                        | 类型                                           | 必填 | 说明                             |
| --------------------------- | ---------------------------------------------- | ---- | -------------------------------- |
| `userId`                    | `number`                                       | 是   | 用户 ID                          |
| `accountStatus`             | `number`                                       | 否   | -                                |
| `accountType`               | `number`                                       | 否   | -                                |
| `allAuthTypes`              | `Array<object>`                                | 否   | -                                |
| `allSubscribedCount`        | `number`                                       | 否   | -                                |
| `anchor`                    | `boolean`                                      | 否   | -                                |
| `artistId`                  | `number`                                       | 否   | 歌手 ID                          |
| `artistIdentity`            | `Array<number>`                                | 否   | -                                |
| `artistName`                | `string`                                       | 否   | 歌手名称                         |
| `authStatus`                | `number`                                       | 否   | -                                |
| `authenticated`             | `boolean`                                      | 否   | -                                |
| `authenticationTypes`       | `number`                                       | 否   | -                                |
| `authority`                 | `number`                                       | 否   | -                                |
| `avatarDetail`              | [AvatarDetail](/api/shared-types#avatardetail) | 否   | AvatarDetail 实体                |
| `avatarImgId`               | `number`                                       | 否   | avatarImg ID                     |
| `avatarImgIdStr`            | `string`                                       | 否   | -                                |
| `avatarImgId_str`           | `string`                                       | 否   | -                                |
| `avatarUrl`                 | `string`                                       | 否   | 头像图片 URL                     |
| `backgroundImgId`           | `number`                                       | 否   | backgroundImg ID                 |
| `backgroundImgIdStr`        | `string`                                       | 否   | -                                |
| `backgroundUrl`             | `string`                                       | 否   | 资源访问链接                     |
| `birthday`                  | `number`                                       | 否   | -                                |
| `blacklist`                 | `boolean`                                      | 否   | -                                |
| `cCount`                    | `number`                                       | 否   | -                                |
| `city`                      | `number`                                       | 否   | -                                |
| `createTime`                | `number`                                       | 否   | 创建时间戳（毫秒）               |
| `defaultAvatar`             | `boolean`                                      | 否   | -                                |
| `description`               | `string`                                       | 否   | 简介说明                         |
| `detailDescription`         | `string`                                       | 否   | -                                |
| `djStatus`                  | `number`                                       | 否   | -                                |
| `eventCount`                | `number`                                       | 否   | -                                |
| `experts`                   | `Record<string, string>`                       | 否   | -                                |
| `followMe`                  | `boolean`                                      | 否   | -                                |
| `followed`                  | `boolean`                                      | 否   | 当前账号是否已关注               |
| `followeds`                 | `number`                                       | 否   | -                                |
| `follows`                   | `number`                                       | 否   | -                                |
| `gender`                    | `number`                                       | 否   | 性别（`0` 保密、`1` 男、`2` 女） |
| `inBlacklist`               | `boolean`                                      | 否   | -                                |
| `lastLoginIP`               | `string`                                       | 否   | -                                |
| `lastLoginTime`             | `number`                                       | 否   | 时间戳                           |
| `locationStatus`            | `number`                                       | 否   | -                                |
| `mainAuthType`              | `object`                                       | 否   | -                                |
| `mutual`                    | `boolean`                                      | 否   | 是否互相关注                     |
| `newFollows`                | `number`                                       | 否   | -                                |
| `nickname`                  | `string`                                       | 否   | 用户昵称                         |
| `playlistBeSubscribedCount` | `number`                                       | 否   | -                                |
| `playlistCount`             | `number`                                       | 否   | -                                |
| `privacyItemUnlimit`        | `object`                                       | 否   | -                                |
| `province`                  | `number`                                       | 否   | -                                |
| `sCount`                    | `number`                                       | 否   | -                                |
| `sDJPCount`                 | `number`                                       | 否   | -                                |
| `shortUserName`             | `string`                                       | 否   | -                                |
| `signature`                 | `string`                                       | 否   | 个人签名                         |
| `userName`                  | `string`                                       | 否   | 内部用户名                       |
| `userType`                  | `number`                                       | 否   | -                                |
| `vipType`                   | `number`                                       | 否   | 会员类型（`0` 表示非会员）       |
| `viptypeVersion`            | `number`                                       | 否   | -                                |

### AvatarDetail

用户头像角标与认证等级信息。

```ts
type AvatarDetail = {
  identityIconUrl?: string | null;
  identityLevel?: number | null;
  userType?: number | null;
};
```

| 字段              | 类型     | 必填 | 说明         |
| ----------------- | -------- | ---- | ------------ |
| `identityIconUrl` | `string` | 否   | 资源访问链接 |
| `identityLevel`   | `number` | 否   | -            |
| `userType`        | `number` | 否   | -            |

### VipRights

用户 VIP 权益详情（黑胶 VIP、音乐包、红心权益及等级计数）。

```ts
type VipRights = {
  associator?: {
    iconUrl?: string | null;
    rights?: boolean | null;
    vipCode?: number | null;
  } | null;
  musicPackage?: {
    iconUrl?: string | null;
    rights?: boolean | null;
    vipCode?: number | null;
  } | null;
  redplus?: {
    iconUrl?: string | null;
    rights?: boolean | null;
    vipCode?: number | null;
  } | null;
  extInfo?: {
    logo?: {
      logoDto?: {
        actionUrl?: string | null;
        height?: number | null;
        interestId?: number | null;
        logoType?: number | null;
        url?: string | null;
        width?: number | null;
      } | null;
      vipType?: number | null;
    } | null;
  } | null;
  redVipAnnualCount?: number | null;
  redVipLevel?: number | null;
  relationType?: number | null;
};
```

| 字段                | 类型     | 必填 | 说明 |
| ------------------- | -------- | ---- | ---- |
| `associator`        | `object` | 否   | -    |
| `musicPackage`      | `object` | 否   | -    |
| `redplus`           | `object` | 否   | -    |
| `extInfo`           | `object` | 否   | -    |
| `redVipAnnualCount` | `number` | 否   | -    |
| `redVipLevel`       | `number` | 否   | -    |
| `relationType`      | `number` | 否   | -    |

## 评论与动态

### CommentRecord

评论列表中的单条评论记录，`commentId` 为必填字段。

```ts
type CommentRecord = {
  beReplied?: Array<CommentReply> | null;
  commentId: number;
  commentLocationType?: number | null;
  content?: string | null;
  decoration?: {
    repliedByAuthorCount?: number | null;
  } | null;
  favorited?: boolean | null;
  ipLocation?: {
    location?: string | null;
    userId?: number | null;
  } | null;
  liked?: boolean | null;
  likedCount?: number | null;
  needDisplayTime?: boolean | null;
  owner?: boolean | null;
  parentCommentId?: number | null;
  pendantData?: {
    id?: number | null;
    imageUrl?: string | null;
  } | null;
  richContent?: string | null;
  status?: number | null;
  time?: number | null;
  timeStr?: string | null;
  user?: CommentUser | null;
};
```

| 字段                  | 类型                                                    | 必填 | 说明               |
| --------------------- | ------------------------------------------------------- | ---- | ------------------ |
| `beReplied`           | Array\<[CommentReply](/api/shared-types#commentreply)\> | 否   | 被回复的原评论列表 |
| `commentId`           | `number`                                                | 是   | 评论 ID            |
| `commentLocationType` | `number`                                                | 否   | -                  |
| `content`             | `string`                                                | 否   | 正文内容           |
| `decoration`          | `object`                                                | 否   | -                  |
| `favorited`           | `boolean`                                               | 否   | -                  |
| `ipLocation`          | `object`                                                | 否   | -                  |
| `liked`               | `boolean`                                               | 否   | 当前账号是否已点赞 |
| `likedCount`          | `number`                                                | 否   | 点赞数             |
| `needDisplayTime`     | `boolean`                                               | 否   | 时间戳             |
| `owner`               | `boolean`                                               | 否   | -                  |
| `parentCommentId`     | `number`                                                | 否   | parentComment ID   |
| `pendantData`         | `object`                                                | 否   | -                  |
| `richContent`         | `string`                                                | 否   | -                  |
| `status`              | `number`                                                | 否   | 当前状态码         |
| `time`                | `number`                                                | 否   | 时间戳（毫秒）     |
| `timeStr`             | `string`                                                | 否   | 格式化时间文本     |
| `user`                | [CommentUser](/api/shared-types#commentuser)            | 否   | 关联用户信息       |

### CommentReply

评论中的被回复子评论结构。

```ts
type CommentReply = {
  beRepliedCommentId?: number | null;
  content?: string | null;
  ipLocation?: {
    location?: string | null;
    userId?: number | null;
  } | null;
  richContent?: string | null;
  status?: number | null;
  user?: CommentUser | null;
};
```

| 字段                 | 类型                                         | 必填 | 说明                |
| -------------------- | -------------------------------------------- | ---- | ------------------- |
| `beRepliedCommentId` | `number`                                     | 否   | beRepliedComment ID |
| `content`            | `string`                                     | 否   | 正文内容            |
| `ipLocation`         | `object`                                     | 否   | -                   |
| `richContent`        | `string`                                     | 否   | -                   |
| `status`             | `number`                                     | 否   | 当前状态码          |
| `user`               | [CommentUser](/api/shared-types#commentuser) | 否   | 关联用户信息        |

### CommentUser

评论或回复条目的作者信息，含头像、昵称与 VIP 角标。

```ts
type CommentUser = {
  anonym?: number | null;
  authStatus?: number | null;
  avatarDetail?: AvatarDetail | null;
  avatarUrl?: string | null;
  followed?: boolean | null;
  highlight?: boolean | null;
  mutual?: boolean | null;
  nickname?: string | null;
  userId?: number | null;
  userType?: number | null;
  vipRights?: {
    associator?: {
      iconUrl?: string | null;
      rights?: boolean | null;
      vipCode?: number | null;
    } | null;
    musicPackage?: {
      iconUrl?: string | null;
      rights?: boolean | null;
      vipCode?: number | null;
    } | null;
    redplus?: {
      iconUrl?: string | null;
      rights?: boolean | null;
      vipCode?: number | null;
    } | null;
    redVipAnnualCount?: number | null;
    redVipLevel?: number | null;
    relationType?: number | null;
  } | null;
  vipType?: number | null;
};
```

| 字段           | 类型                                           | 必填 | 说明                       |
| -------------- | ---------------------------------------------- | ---- | -------------------------- |
| `anonym`       | `number`                                       | 否   | -                          |
| `authStatus`   | `number`                                       | 否   | -                          |
| `avatarDetail` | [AvatarDetail](/api/shared-types#avatardetail) | 否   | AvatarDetail 实体          |
| `avatarUrl`    | `string`                                       | 否   | 头像图片 URL               |
| `followed`     | `boolean`                                      | 否   | 当前账号是否已关注         |
| `highlight`    | `boolean`                                      | 否   | -                          |
| `mutual`       | `boolean`                                      | 否   | 是否互相关注               |
| `nickname`     | `string`                                       | 否   | 用户昵称                   |
| `userId`       | `number`                                       | 否   | 用户 ID                    |
| `userType`     | `number`                                       | 否   | -                          |
| `vipRights`    | `object`                                       | 否   | -                          |
| `vipType`      | `number`                                       | 否   | 会员类型（`0` 表示非会员） |

### EventInfo

动态关联的评论线程、点赞数、转发数与资源引用信息。

```ts
type EventInfo = {
  commentThread?: {
    id?: string | null;
    resourceId?: number | null;
    resourceInfo?: {
      id?: number | null;
      userId?: number | null;
      name?: string | null;
      resourceType?: number | null;
      eventType?: number | null;
      artistId?: number | null;
      artistAreaCode?: number | null;
    } | null;
    resourceOwnerId?: number | null;
    resourceTitle?: string | null;
    resourceType?: number | null;
    commentCount?: number | null;
    floorCommentCount?: number | null;
    likedCount?: number | null;
    latestLikedUsers?: Array<{
      s?: number | null;
      t?: number | null;
    }> | null;
    shareCount?: number | null;
    hotCount?: number | null;
  } | null;
  commentCount?: number | null;
  likedCount?: number | null;
  shareCount?: number | null;
  liked?: boolean | null;
  resourceId?: number | null;
  resourceType?: number | null;
  threadId?: string | null;
};
```

| 字段            | 类型      | 必填 | 说明               |
| --------------- | --------- | ---- | ------------------ |
| `commentThread` | `object`  | 否   | -                  |
| `commentCount`  | `number`  | 否   | 评论数             |
| `likedCount`    | `number`  | 否   | 点赞数             |
| `shareCount`    | `number`  | 否   | 分享数             |
| `liked`         | `boolean` | 否   | 当前账号是否已点赞 |
| `resourceId`    | `number`  | 否   | 关联资源 ID        |
| `resourceType`  | `number`  | 否   | 关联资源类型       |
| `threadId`      | `string`  | 否   | 评论线程 ID        |

### EventUser

动态中的发布者资料，继承自 [UserProfile](#userprofile) 并将 `userId` 设为可选，另含 `urlAnalyze` 与 `vipRights`。

```ts
type EventUser = Omit<UserProfile, 'userId' | 'urlAnalyze' | 'vipRights'> & {
  userId?: number | null;
  urlAnalyze?: boolean | null;
  vipRights?: VipRights | null;
};
```

| 字段         | 类型                                     | 必填 | 说明                                         |
| ------------ | ---------------------------------------- | ---- | -------------------------------------------- |
| _(继承字段)_ | [UserProfile](#userprofile)              | -    | 继承自 `UserProfile`，同名字段以下方声明为准 |
| `userId`     | `number`                                 | 否   | 用户 ID                                      |
| `urlAnalyze` | `boolean`                                | 否   | -                                            |
| `vipRights`  | [VipRights](/api/shared-types#viprights) | 否   | VipRights 实体                               |

### EventPic

动态附带的图片与动图尺寸、多规格 URL 信息。

```ts
type EventPic = {
  format?: string | null;
  height?: number | null;
  width?: number | null;
  mute?: boolean | null;
  originUrl?: string | null;
  originIdStr?: string | null;
  originJpgIdStr?: string | null;
  pcRectangleIdStr?: string | null;
  pcRectangleUrl?: string | null;
  pcSquareIdStr?: string | null;
  pcSquareUrl?: string | null;
  rectangleIdStr?: string | null;
  rectangleUrl?: string | null;
  squareIdStr?: string | null;
  squareUrl?: string | null;
  videoDurationMs?: number | null;
};
```

| 字段               | 类型      | 必填 | 说明         |
| ------------------ | --------- | ---- | ------------ |
| `format`           | `string`  | 否   | -            |
| `height`           | `number`  | 否   | 高度（像素） |
| `width`            | `number`  | 否   | 宽度（像素） |
| `mute`             | `boolean` | 否   | -            |
| `originUrl`        | `string`  | 否   | 资源访问链接 |
| `originIdStr`      | `string`  | 否   | -            |
| `originJpgIdStr`   | `string`  | 否   | -            |
| `pcRectangleIdStr` | `string`  | 否   | -            |
| `pcRectangleUrl`   | `string`  | 否   | 资源访问链接 |
| `pcSquareIdStr`    | `string`  | 否   | -            |
| `pcSquareUrl`      | `string`  | 否   | 资源访问链接 |
| `rectangleIdStr`   | `string`  | 否   | -            |
| `rectangleUrl`     | `string`  | 否   | 资源访问链接 |
| `squareIdStr`      | `string`  | 否   | -            |
| `squareUrl`        | `string`  | 否   | 资源访问链接 |
| `videoDurationMs`  | `number`  | 否   | -            |

### EventIpLocation

动态或评论附带的 IP 属地信息。

```ts
type EventIpLocation = {
  location?: string | null;
};
```

| 字段       | 类型     | 必填 | 说明        |
| ---------- | -------- | ---- | ----------- |
| `location` | `string` | 否   | IP 属地名称 |

## 视频与 MV

### MvSummary

MV 列表条目，含封面、时长、播放量与歌手列表。

```ts
type MvSummary = {
  id: number;
  alias?: Array<string> | null;
  artistId?: number | null;
  artistName?: string | null;
  artists?: Array<Artist> | null;
  briefDesc?: string | null;
  cover?: string | null;
  duration?: number | null;
  mark?: number | null;
  name?: string | null;
  playCount?: number | null;
  subed?: boolean | null;
  transNames?: Array<string> | null;
};
```

| 字段         | 类型                                        | 必填 | 说明                                                                                      |
| ------------ | ------------------------------------------- | ---- | ----------------------------------------------------------------------------------------- |
| `id`         | `number`                                    | 是   | 资源 ID                                                                                   |
| `alias`      | `Array<string>`                             | 否   | 别名列表                                                                                  |
| `artistId`   | `number`                                    | 否   | 歌手 ID                                                                                   |
| `artistName` | `string`                                    | 否   | 歌手名称                                                                                  |
| `artists`    | Array\<[Artist](/api/shared-types#artist)\> | 否   | 歌手列表                                                                                  |
| `briefDesc`  | `string`                                    | 否   | 简短介绍                                                                                  |
| `cover`      | `string`                                    | 否   | 封面图片 URL                                                                              |
| `duration`   | `number`                                    | 否   | 时长（毫秒）                                                                              |
| `mark`       | `number`                                    | 否   | 歌曲属性位掩码（如 `131072` 纯音乐、`1048576` 脏标、`262144` 杜比、`17179869184` Hi-Res） |
| `name`       | `string`                                    | 否   | 名称或标题                                                                                |
| `playCount`  | `number`                                    | 否   | 播放次数                                                                                  |
| `subed`      | `boolean`                                   | 否   | 是否已收藏/订阅                                                                           |
| `transNames` | `Array<string>`                             | 否   | 译名列表                                                                                  |

### VideoResolutionEntry

视频支持的分辨率与对应文件大小条目。

```ts
type VideoResolutionEntry = {
  resolution?: number | null;
  size?: number | null;
};
```

| 字段         | 类型     | 必填 | 说明                                  |
| ------------ | -------- | ---- | ------------------------------------- |
| `resolution` | `number` | 否   | 视频清晰度（如 `480`、`720`、`1080`） |
| `size`       | `number` | 否   | 文件大小（字节）或数量                |

### VideoGroupRef

视频关联的分类或标签引用。

```ts
type VideoGroupRef = {
  id?: number | null;
  name?: string | null;
};
```

| 字段   | 类型     | 必填 | 说明       |
| ------ | -------- | ---- | ---------- |
| `id`   | `number` | 否   | 资源 ID    |
| `name` | `string` | 否   | 名称或标题 |

## 电台与播客

### DjProgram

电台节目详情记录，`id` 为必填字段，内含主播、所属电台与 `mainSong`。

```ts
type DjProgram = {
  id: number;
  aiGenerated?: boolean | null;
  alg?: string | null;
  auditStatus?: number | null;
  auditDisPlayStatus?: number | null;
  bdAuditStatus?: number | null;
  blurCoverUrl?: string | null;
  buyed?: boolean | null;
  buyedNew?: boolean | null;
  canReward?: boolean | null;
  categoryId?: number | null;
  categoryName?: string | null;
  channels?: Array<string> | null;
  code?: number | null;
  commentCount?: number | null;
  commentThreadId?: string | null;
  coverId?: number | null;
  coverUrl?: string | null;
  createEventId?: number | null;
  createTime?: number | null;
  description?: string | null;
  dj?: ProgramDj | null;
  duration?: number | null;
  existLyric?: boolean | null;
  feeScope?: number | null;
  isPublish?: boolean | null;
  likedCount?: number | null;
  listenerCount?: number | null;
  mainSong?: ProgramMainSong | null;
  mainTrackId?: number | null;
  name?: string | null;
  participateAnchors?: Array<{
    anchorInfo?: PlaylistUser | null;
    type?: number | null;
    userId?: number | null;
  }> | null;
  privacy?: boolean | null;
  programDesc?: Array<ProgramDescPic> | null;
  programFeeType?: number | null;
  pubStatus?: number | null;
  radio?: {
    buyed?: boolean | null;
    category?: string | null;
    categoryId?: number | null;
    createTime?: number | null;
    desc?: string | null;
    descPicList?: Array<ProgramDescPic> | null;
    dynamic?: boolean | null;
    feeScope?: number | null;
    finished?: boolean | null;
    id?: number | null;
    intervenePicId?: number | null;
    intervenePicUrl?: string | null;
    lastProgramCreateTime?: number | null;
    lastProgramId?: number | null;
    name?: string | null;
    operateUidList?: Array<number> | null;
    originalPrice?: number | null;
    participateUidList?: Array<number> | null;
    picId?: number | null;
    picUrl?: string | null;
    playCount?: number | null;
    price?: number | null;
    privacy?: boolean | null;
    programCount?: number | null;
    purchaseCount?: number | null;
    radioFeeType?: number | null;
    replaceRadioId?: number | null;
    secondCategory?: string | null;
    subCount?: number | null;
    subed?: boolean | null;
    taskId?: number | null;
    underShelf?: boolean | null;
  } | null;
  reason?: string | null;
  recommended?: boolean | null;
  replaceVoiceId?: number | null;
  reward?: boolean | null;
  scheduledPublishTime?: number | null;
  score?: number | null;
  secondCategoryId?: number | null;
  secondCategoryName?: string | null;
  serialNum?: number | null;
  shareCount?: number | null;
  smallLanguageAuditStatus?: number | null;
  specialTags?: Array<string> | null;
  specialType?: number | null;
  subscribed?: boolean | null;
  subscribedCount?: number | null;
  trackCount?: number | null;
};
```

| 字段                       | 类型                                                        | 必填 | 说明                                                  |
| -------------------------- | ----------------------------------------------------------- | ---- | ----------------------------------------------------- |
| `id`                       | `number`                                                    | 是   | 资源 ID                                               |
| `aiGenerated`              | `boolean`                                                   | 否   | -                                                     |
| `alg`                      | `string`                                                    | 否   | 推荐算法标识                                          |
| `auditStatus`              | `number`                                                    | 否   | -                                                     |
| `auditDisPlayStatus`       | `number`                                                    | 否   | -                                                     |
| `bdAuditStatus`            | `number`                                                    | 否   | -                                                     |
| `blurCoverUrl`             | `string`                                                    | 否   | 资源访问链接                                          |
| `buyed`                    | `boolean`                                                   | 否   | -                                                     |
| `buyedNew`                 | `boolean`                                                   | 否   | -                                                     |
| `canReward`                | `boolean`                                                   | 否   | -                                                     |
| `categoryId`               | `number`                                                    | 否   | category ID                                           |
| `categoryName`             | `string`                                                    | 否   | -                                                     |
| `channels`                 | `Array<string>`                                             | 否   | -                                                     |
| `code`                     | `number`                                                    | 否   | 状态码或业务码                                        |
| `commentCount`             | `number`                                                    | 否   | 评论数                                                |
| `commentThreadId`          | `string`                                                    | 否   | 评论线程 ID                                           |
| `coverId`                  | `number`                                                    | 否   | cover ID                                              |
| `coverUrl`                 | `string`                                                    | 否   | 封面图片 URL                                          |
| `createEventId`            | `number`                                                    | 否   | createEvent ID                                        |
| `createTime`               | `number`                                                    | 否   | 创建时间戳（毫秒）                                    |
| `description`              | `string`                                                    | 否   | 简介说明                                              |
| `dj`                       | [ProgramDj](/api/shared-types#programdj)                    | 否   | 主播资料                                              |
| `duration`                 | `number`                                                    | 否   | 时长（毫秒）                                          |
| `existLyric`               | `boolean`                                                   | 否   | -                                                     |
| `feeScope`                 | `number`                                                    | 否   | -                                                     |
| `isPublish`                | `boolean`                                                   | 否   | -                                                     |
| `likedCount`               | `number`                                                    | 否   | 点赞数                                                |
| `listenerCount`            | `number`                                                    | 否   | -                                                     |
| `mainSong`                 | [ProgramMainSong](/api/shared-types#programmainsong)        | 否   | 节目关联主音频信息                                    |
| `mainTrackId`              | `number`                                                    | 否   | mainTrack ID                                          |
| `name`                     | `string`                                                    | 否   | 名称或标题                                            |
| `participateAnchors`       | `Array<object>`                                             | 否   | -                                                     |
| `privacy`                  | `boolean`                                                   | 否   | -                                                     |
| `programDesc`              | Array\<[ProgramDescPic](/api/shared-types#programdescpic)\> | 否   | ProgramDescPic 列表                                   |
| `programFeeType`           | `number`                                                    | 否   | -                                                     |
| `pubStatus`                | `number`                                                    | 否   | -                                                     |
| `radio`                    | `object`                                                    | 否   | 所属电台摘要                                          |
| `reason`                   | `string`                                                    | 否   | -                                                     |
| `recommended`              | `boolean`                                                   | 否   | -                                                     |
| `replaceVoiceId`           | `number`                                                    | 否   | replaceVoice ID                                       |
| `reward`                   | `boolean`                                                   | 否   | -                                                     |
| `scheduledPublishTime`     | `number`                                                    | 否   | 时间戳                                                |
| `score`                    | `number`                                                    | 否   | 热度或评分                                            |
| `secondCategoryId`         | `number`                                                    | 否   | secondCategory ID                                     |
| `secondCategoryName`       | `string`                                                    | 否   | -                                                     |
| `serialNum`                | `number`                                                    | 否   | -                                                     |
| `shareCount`               | `number`                                                    | 否   | 分享数                                                |
| `smallLanguageAuditStatus` | `number`                                                    | 否   | -                                                     |
| `specialTags`              | `Array<string>`                                             | 否   | -                                                     |
| `specialType`              | `number`                                                    | 否   | -                                                     |
| `subscribed`               | `boolean`                                                   | 否   | 当前账号是否已收藏（未登录或凭据失效时可能为 `null`） |
| `subscribedCount`          | `number`                                                    | 否   | 收藏人数                                              |
| `trackCount`               | `number`                                                    | 否   | 曲目数量                                              |

### ProgramDj

电台主播信息，继承自 [PlaylistUser](#playlistuser) 并额外包含电台品牌名 `brand`。

```ts
type ProgramDj = Omit<PlaylistUser, 'brand'> & {
  brand?: string | null;
};
```

| 字段         | 类型                          | 必填 | 说明                                          |
| ------------ | ----------------------------- | ---- | --------------------------------------------- |
| _(继承字段)_ | [PlaylistUser](#playlistuser) | -    | 继承自 `PlaylistUser`，同名字段以下方声明为准 |
| `brand`      | `string`                      | 否   | -                                             |

### ProgramDescPic

电台或节目的图文介绍片段。

```ts
type ProgramDescPic = {
  content?: string | null;
  height?: number | null;
  id?: number | null;
  nestedData?: {
    textList?: Array<{
      attributes?: {
        bold?: boolean | null;
      } | null;
      text?: string | null;
    }> | null;
  } | null;
  type?: number | null;
  width?: number | null;
};
```

| 字段         | 类型     | 必填 | 说明         |
| ------------ | -------- | ---- | ------------ |
| `content`    | `string` | 否   | 正文内容     |
| `height`     | `number` | 否   | 高度（像素） |
| `id`         | `number` | 否   | 资源 ID      |
| `nestedData` | `object` | 否   | -            |
| `type`       | `number` | 否   | -            |
| `width`      | `number` | 否   | 宽度（像素） |

### DjAnchorRank

主播排行榜单条目，`id` 为必填字段，包含排名、热度分数与直播状态。

```ts
type DjAnchorRank = {
  id: number;
  avatarDetail?: AvatarDetail | null;
  avatarUrl?: string | null;
  lastRank?: number | null;
  liveId?: number | null;
  liveStatus?: number | null;
  liveType?: number | null;
  mainAuthDesc?: string | null;
  nickName?: string | null;
  rank?: number | null;
  roomNo?: number | null;
  score?: number | null;
  userFollowedCount?: number | null;
  userType?: number | null;
};
```

| 字段                | 类型                                           | 必填 | 说明              |
| ------------------- | ---------------------------------------------- | ---- | ----------------- |
| `id`                | `number`                                       | 是   | 资源 ID           |
| `avatarDetail`      | [AvatarDetail](/api/shared-types#avatardetail) | 否   | AvatarDetail 实体 |
| `avatarUrl`         | `string`                                       | 否   | 头像图片 URL      |
| `lastRank`          | `number`                                       | 否   | 上期排名          |
| `liveId`            | `number`                                       | 否   | live ID           |
| `liveStatus`        | `number`                                       | 否   | -                 |
| `liveType`          | `number`                                       | 否   | -                 |
| `mainAuthDesc`      | `string`                                       | 否   | -                 |
| `nickName`          | `string`                                       | 否   | 主播昵称          |
| `rank`              | `number`                                       | 否   | 当前排名          |
| `roomNo`            | `number`                                       | 否   | -                 |
| `score`             | `number`                                       | 否   | 热度或评分        |
| `userFollowedCount` | `number`                                       | 否   | -                 |
| `userType`          | `number`                                       | 否   | -                 |

## 其他通用实体

### MultiTerminalInfo

最近播放记录中展示的播放终端设备图标与系统名称。

```ts
type MultiTerminalInfo = {
  icon?: string | null;
  os?: string | null;
  osText?: string | null;
};
```

| 字段     | 类型     | 必填 | 说明                 |
| -------- | -------- | ---- | -------------------- |
| `icon`   | `string` | 否   | 图标地址             |
| `os`     | `string` | 否   | 终端操作系统标识     |
| `osText` | `string` | 否   | 终端操作系统展示名称 |

### StylePage

曲风接口通用的游标分页元信息。

```ts
type StylePage = {
  cursor?: number | null;
  more?: boolean | null;
  size?: number | null;
  total?: number | null;
};
```

| 字段     | 类型      | 必填 | 说明                   |
| -------- | --------- | ---- | ---------------------- |
| `cursor` | `number`  | 否   | 分页游标               |
| `more`   | `boolean` | 否   | 是否还有下一页         |
| `size`   | `number`  | 否   | 文件大小（字节）或数量 |
| `total`  | `number`  | 否   | 总数量                 |

### UgcArtistRef

音乐百科与用户贡献接口中的关联歌手引用（ID 与名称）。

```ts
type UgcArtistRef = {
  artistId?: number | null;
  artistName?: string | null;
};
```

| 字段         | 类型     | 必填 | 说明     |
| ------------ | -------- | ---- | -------- |
| `artistId`   | `number` | 否   | 歌手 ID  |
| `artistName` | `string` | 否   | 歌手名称 |
