---
'hana-music-api': major
---

按“收紧与宽松”重写全部返回体结构定义，发 3.0.0。

### 行为变化

- **只有四类字段收紧**：返回码、通到接口要返回的东西的路径、这条记录自己的编号、接口就是为了拿它的那一项。这些字段缺失或类型不对时仍以 `UnexpectedUpstreamShape`（`status: 502`）拒绝。
- **其余声明字段全部改为宽松字段**：可能缺失，也可能是 `null`；有值但类型不对时当成缺失，不再让整页 502。宽松字段整个值校验失败时都当成缺失，包括数组元素里的问题。
- 新增歌曲的 `no`、`cd`、`alia`、`tns`、`publishTime` 和专辑的 `company` 声明。
- 共用结构（`Song`、`Artist`、`PlaylistSummary`、`PlaylistUser`、`AlbumSummary`）、登录资料、专辑、搜索结果的记录结构，以及成功返回正文和嵌套对象补上了录制里出现过的字段；新字段都是宽松字段。
- 去掉 `cloudsearch` 对 `al.name` 的单独放宽：共用歌曲结构本来就是宽松字段。

### 迁移

声明过的内容字段（歌名、专辑名、歌单名、封面、播放次数、歌词、歌手和专辑的编号与名字等）的类型从 `T` 变成 `T | null | undefined`。升级后需要处理缺失和 `null`：

```ts
// 2.x
const title = body.playlist.name;

// 3.0
const title = body.playlist.name ?? '未知歌单';
```

- 以前靠 502 发现内容字段缺失的调用方，现在会正常拿到返回体；需要自己判断字段是否可用。
- 收紧字段的读取方式不变；`song_url_v1`、`song_download_url_v1` 的 `url` 仍可能是 `null`。
- 新增声明的字段可以直接读取，类型都是 `T | null | undefined`。
- 每个模块收紧哪些字段、其余字段为什么宽松，见公开指南的[返回体结构](/guide/response-bodies)和仓库的 [`agent-docs/API_CONVENTIONS.md`](https://github.com/nonhana/hana-music-api/blob/master/agent-docs/API_CONVENTIONS.md#收紧与宽松)。
