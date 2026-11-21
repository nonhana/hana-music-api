---
title: '音乐百科 - 简要信息'
description: '调用此接口可以获取歌曲的音乐百科简要信息'
---

# 音乐百科 - 简要信息

调用此接口可以获取歌曲的音乐百科简要信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                          |
| ---------- | ----------------------------------------------------------- |
| 接口地址   | `/song/wiki/summary`                                        |
| 请求方式   | `GET` / `POST`                                              |
| 需要登录   | 否                                                          |
| 对应模块   | `song_wiki_summary`                                         |
| SDK 函数   | `songWikiSummary`（`hana-music-api/api/song_wiki_summary`） |
| 返回体类型 | `SongWikiSummaryBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songWikiSummary } from 'hana-music-api';

const result = await songWikiSummary({
  id: '1958384591',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/song/wiki/summary' \
  --data-urlencode 'id=1958384591'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 歌曲 ID |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongWikiSummaryBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_wiki_summary`、`hana-music-api/schemas/song_wiki_summary` 导入运行时校验器）。

```ts
type ClickAction = {
  clickAction?: {
    action?: number | null;
    targetUrl?: string | null;
  } | null;
};

type ResourceExt = {
  musicMemoryTextType?: number | null;
  playCount?: number | null;
  specialType?: number | null;
};

type UiButton = {
  action?: ClickAction | null;
  tag?: string | null;
  text?: string | null;
};

type UiDescription = {
  description?: string | null;
};

type UiImage = {
  height?: number | null;
  imageId?: number | null;
  imageUrl?: string | null;
  title?: string | null;
  width?: number | null;
};

type UiMainTitle = {
  action?: ClickAction | null;
  title?: string | null;
};

type UiSubTitle = {
  action?: ClickAction | null;
  title?: string | null;
};

type UiTextLink = {
  text?: string | null;
  url?: string | null;
};

type UiElement = {
  buttons?: Array<UiButton> | null;
  descriptions?: Array<UiDescription> | null;
  images?: Array<UiImage> | null;
  mainTitle?: UiMainTitle | null;
  subTitles?: Array<UiSubTitle> | null;
  textLinks?: Array<UiTextLink> | null;
  type?: string | null;
};

type Resource = {
  action?: ClickAction | null;
  alg?: string | null;
  resourceExt?: ResourceExt | null;
  resourceId?: string | null;
  resourceType?: string | null;
  uiElement?: UiElement | null;
  valid?: boolean | null;
};

type Creative = {
  creativeType?: string | null;
  position?: string | null;
  resources?: Array<Resource> | null;
  uiElement?: UiElement | null;
};

type Block = {
  alg?: string | null;
  canRefresh?: boolean | null;
  channel?: string | null;
  code?: string | null;
  creatives?: Array<Creative> | null;
  hasMore?: boolean | null;
  hideTitle?: boolean | null;
  id: string;
  opRcmd?: number | null;
  position?: string | null;
  scm?: string | null;
  showType?: string | null;
  uiElement?: UiElement | null;
};

type SongWikiSummaryBody = {
  code: 200;
  data: {
    blocks: Array<Block>;
    cursor?: string | null;
    hasMore?: boolean | null;
  };
  message?: string | null;
};
```

| 字段           | 类型           | 必填 | 说明                         |
| -------------- | -------------- | ---- | ---------------------------- |
| `code`         | `200`          | 是   | 业务状态码（`200` 表示成功） |
| `data`         | `object`       | 是   | 接口返回的数据主体           |
| `data.blocks`  | `Array<Block>` | 是   | 首页发现模块列表             |
| `data.cursor`  | `string`       | 否   | 下一页分页游标               |
| `data.hasMore` | `boolean`      | 否   | 是否还有更多数据             |
| `message`      | `string`       | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
