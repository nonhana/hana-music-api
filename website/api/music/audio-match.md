---
title: '听歌识曲'
description: '使用此接口，上传音频文件或者麦克风采集声音可识别对应歌曲信息，具体调用例子参考 `/audio_match_demo/index.html` (项目文件: `public/audio_match_demo/index.html`)'
---

# 听歌识曲

使用此接口，上传音频文件或者麦克风采集声音可识别对应歌曲信息，具体调用例子参考 `/audio_match_demo/index.html` (项目文件: `public/audio_match_demo/index.html`)

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/audio/match`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 否                                               |
| 对应模块   | `audio_match`                                    |
| SDK 函数   | `audioMatch`（`hana-music-api/api/audio_match`） |
| 返回体类型 | `AudioMatchBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { audioMatch } from 'hana-music-api';

const result = await audioMatch({
  audioFP: 'your-audio-fingerprint',
  duration: 120,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/audio/match' \
  --data-urlencode 'audioFP=your-audio-fingerprint' \
  --data-urlencode 'duration=120'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型     | 必填 | 默认值 | 说明                           |
| ---------- | -------- | ---- | ------ | ------------------------------ |
| `audioFP`  | `string` | 是   | -      | 音频指纹，参考项目调用例子获取 |
| `duration` | `number` | 是   | -      | 音频时长，单位秒               |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`AudioMatchBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/audio_match`、`hana-music-api/schemas/audio_match` 导入运行时校验器）。

```ts
type Match = {
  song: Song;
  startTime?: number | null;
};

type MatchData = {
  result?: Array<Match> | null;
  moduleList?: Array<string> | null;
  noMatchReason?: number | null;
  queryId?: string | null;
  type?: number | null;
};

type AudioMatchBody = {
  code: 200;
  data: MatchData;
  message?: string | null;
};
```

- **公共类型**：[Song](/api/shared-types#song)

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                      | 类型                           | 必填 | 说明                         |
| ------------------------- | ------------------------------ | ---- | ---------------------------- |
| `code`                    | `200`                          | 是   | 业务状态码（`200` 表示成功） |
| `data`                    | `MatchData`                    | 是   | 接口返回的数据主体           |
| `data.result`             | `Array<Match>`                 | 可空 | 接口返回的结果主体           |
| `data.result[].song`      | [Song](/api/shared-types#song) | 是   | Song 实体                    |
| `data.result[].startTime` | `number`                       | 否   | 时间戳                       |
| `data.moduleList`         | `Array<string>`                | 否   | -                            |
| `data.noMatchReason`      | `number`                       | 否   | -                            |
| `data.queryId`            | `string`                       | 否   | query ID                     |
| `data.type`               | `number`                       | 否   | -                            |
| `message`                 | `string`                       | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
