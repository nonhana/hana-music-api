---
title: '获取逐字歌词'
description: '此接口的 `yrc` 字段即为逐字歌词 (可能有歌曲不包含逐字歌词)'
---

# 获取逐字歌词

此接口的 `yrc` 字段即为逐字歌词 (可能有歌曲不包含逐字歌词)

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                           |
| ---------- | -------------------------------------------- |
| 接口地址   | `/lyric/new`                                 |
| 请求方式   | `GET` / `POST`                               |
| 需要登录   | 否                                           |
| 对应模块   | `lyric_new`                                  |
| SDK 函数   | `lyricNew`（`hana-music-api/api/lyric_new`） |
| 返回体类型 | `LyricNewBody`（已建模返回体）               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { lyricNew } from 'hana-music-api';

const result = await lyricNew({
  id: '1824020871',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/lyric/new' \
  --data-urlencode 'id=1824020871'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 音乐 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`LyricNewBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/lyric_new`、`hana-music-api/schemas/lyric_new` 导入运行时校验器）。

```ts
type Lyric = {
  lyric?: string | null;
  version?: number | null;
};

type LyricNewBody = {
  code: 200;
  lrc: {
    lyric: string;
  };
  tlyric?: Lyric | null;
  romalrc?: Lyric | null;
  yrc?: Lyric | null;
  ytlrc?: Lyric | null;
  yromalrc?: Lyric | null;
  klyric?: Lyric | null;
  lyricUser?: LyricUser | null;
  transUser?: LyricUser | null;
  pureMusic?: boolean | null;
  needDesc?: boolean | null;
  qfy?: boolean | null;
  sfy?: boolean | null;
  sgc?: boolean | null;
  uncollected?: boolean | null;
};
```

- **公共类型**：[LyricUser](/api/shared-types#lyricuser)

| 字段               | 类型                                     | 必填 | 说明                         |
| ------------------ | ---------------------------------------- | ---- | ---------------------------- |
| `code`             | `200`                                    | 是   | 业务状态码（`200` 表示成功） |
| `lrc`              | `object`                                 | 是   | 逐行歌词对象                 |
| `lrc.lyric`        | `string`                                 | 是   | -                            |
| `tlyric`           | `Lyric`                                  | 否   | 歌词翻译对象                 |
| `tlyric.lyric`     | `string`                                 | 否   | -                            |
| `tlyric.version`   | `number`                                 | 否   | 当前服务版本号               |
| `romalrc`          | `Lyric`                                  | 否   | 歌词音译对象                 |
| `romalrc.lyric`    | `string`                                 | 否   | -                            |
| `romalrc.version`  | `number`                                 | 否   | 当前服务版本号               |
| `yrc`              | `Lyric`                                  | 否   | 逐字歌词对象                 |
| `yrc.lyric`        | `string`                                 | 否   | -                            |
| `yrc.version`      | `number`                                 | 否   | 当前服务版本号               |
| `ytlrc`            | `Lyric`                                  | 否   | 逐字歌词翻译对象             |
| `ytlrc.lyric`      | `string`                                 | 否   | -                            |
| `ytlrc.version`    | `number`                                 | 否   | 当前服务版本号               |
| `yromalrc`         | `Lyric`                                  | 否   | 逐字歌词音译对象             |
| `yromalrc.lyric`   | `string`                                 | 否   | -                            |
| `yromalrc.version` | `number`                                 | 否   | 当前服务版本号               |
| `klyric`           | `Lyric`                                  | 否   | 卡拉 OK 歌词对象             |
| `klyric.lyric`     | `string`                                 | 否   | -                            |
| `klyric.version`   | `number`                                 | 否   | 当前服务版本号               |
| `lyricUser`        | [LyricUser](/api/shared-types#lyricuser) | 否   | 歌词贡献者信息               |
| `transUser`        | [LyricUser](/api/shared-types#lyricuser) | 否   | 翻译贡献者信息               |
| `pureMusic`        | `boolean`                                | 否   | 是否为纯音乐                 |
| `needDesc`         | `boolean`                                | 否   | -                            |
| `qfy`              | `boolean`                                | 否   | -                            |
| `sfy`              | `boolean`                                | 否   | -                            |
| `sgc`              | `boolean`                                | 否   | -                            |
| `uncollected`      | `boolean`                                | 否   | -                            |

<!-- api-doc:response:end -->

## 注意事项

- **歌词类型**：`lrc` 为逐行歌词，`tlyric`/`romalrc` 为翻译与音译；`yrc` 为逐字歌词，`ytlrc`/`yromalrc` 为逐字对齐翻译与音译。无歌词或无对应版本时字段可能缺失或 `lyric` 为空串。
- **逐字歌词格式**：`yrc.lyric` 中可能包含按行组织的 JSON 歌曲元数据（含 `t`、`c`/`tx`、`li`、`or`），以及 `[行起始毫秒,行时长毫秒](字起始毫秒,字时长厘秒,0)文字` 格式的逐字时间戳。
