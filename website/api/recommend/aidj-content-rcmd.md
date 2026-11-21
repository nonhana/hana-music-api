---
title: '私人 DJ'
description: '调用此接口可以获取私人 DJ 的推荐内容 (包括 DJ 声音和推荐歌曲)'
---

# 私人 DJ

调用此接口可以获取私人 DJ 的推荐内容 (包括 DJ 声音和推荐歌曲)

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                          |
| ---------- | ----------------------------------------------------------- |
| 接口地址   | `/aidj/content/rcmd`                                        |
| 请求方式   | `GET` / `POST`                                              |
| 需要登录   | 否                                                          |
| 对应模块   | `aidj_content_rcmd`                                         |
| SDK 函数   | `aidjContentRcmd`（`hana-music-api/api/aidj_content_rcmd`） |
| 返回体类型 | `AidjContentRcmdBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { aidjContentRcmd } from 'hana-music-api';

const result = await aidjContentRcmd({
  latitude: 1,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/aidj/content/rcmd' \
  --data-urlencode 'latitude=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数        | 类型     | 必填 | 默认值 | 说明                                          |
| ----------- | -------- | ---- | ------ | --------------------------------------------- |
| `latitude`  | `number` | 否   | -      | 当前位置纬度（可选，与 `longitude` 搭配使用） |
| `longitude` | `number` | 否   | -      | 当前位置经度（可选，与 `latitude` 搭配使用）  |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`AidjContentRcmdBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/aidj_content_rcmd`、`hana-music-api/schemas/aidj_content_rcmd` 导入运行时校验器）。

```ts
type AiDjAudio = {
  audioId?: string | null;
  audioUrl?: string | null;
  detailCategory?: string | null;
  duration?: number | null;
  fadeInOut?: boolean | null;
  gain?: number | null;
  includeVoice?: boolean | null;
  introductionRelatedSongIds?: Array<number> | null;
  nosKey?: string | null;
  peak?: number | null;
  poolCode?: string | null;
  size?: number | null;
  textType?: string | null;
  timbreKey?: string | null;
  validTime?: number | null;
};

type AiDjSong = Omit<ProgramMainSong, 'alias' | 'transName' | 'transNames'> & {
  alias?: Array<string> | null;
  transName?: string | null;
  transNames?: Array<string> | null;
};

type AiDjValue = {
  alg?: string | null;
  audioList?: Array<AiDjAudio> | null;
  includeVoice?: boolean | null;
  songData?: AiDjSong | null;
  songId?: string | null;
  songPrivilege?: LooseSongPrivilege | null;
};

type AiDjResource = {
  type?: string | null;
  value?: AiDjValue | null;
};

type AidjContentRcmdBody = {
  code: 200;
  data: {
    aiDjResources: Array<AiDjResource>;
    tagName?: string | null;
  };
  message?: string | null;
  trp?: {
    rules?: Array<string> | null;
  } | null;
};
```

- **公共类型**：[LooseSongPrivilege](/api/shared-types#loosesongprivilege)、[ProgramMainSong](/api/shared-types#programmainsong)

| 字段                         | 类型                  | 必填 | 说明                         |
| ---------------------------- | --------------------- | ---- | ---------------------------- |
| `code`                       | `200`                 | 是   | 业务状态码（`200` 表示成功） |
| `data`                       | `object`              | 是   | 接口返回的数据主体           |
| `data.aiDjResources`         | `Array<AiDjResource>` | 是   | -                            |
| `data.aiDjResources[].type`  | `string`              | 否   | -                            |
| `data.aiDjResources[].value` | `AiDjValue`           | 否   | -                            |
| `data.tagName`               | `string`              | 否   | -                            |
| `message`                    | `string`              | 否   | 返回说明信息                 |
| `trp`                        | `object`              | 否   | -                            |
| `trp.rules`                  | `Array<string>`       | 否   | -                            |

<!-- api-doc:response:end -->
