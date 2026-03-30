# Phase 5+ 技术债消化指南

## 一、文档目的

本文档面向后续接手的 LLM 或开发者。它对 Phase 5 完成后仍存在的技术债进行了逐项盘点，并给出优先级、操作方式和验收标准，确保接手者可以**按条目直接上手**，而不需要再做一轮全仓库摸底。

> 本文档基于 2026-03-30 对仓库实际源码的逐文件审计结果编写。
> 2026-03-30 晚间更新：`D-01`、`D-02`、`D-03`、`D-04`、`D-05`、`D-07`、`D-12` 已完成主清理。当前仓库已经达到 `src/` 内 `0` 个 `@ts-nocheck`、运行时移除 `axios` / `crypto-js` / `md5`、`tsc --noEmit` 可全量通过的新基线。
> 2026-03-30 深夜增量更新：`D-06` 的高优先级代码质量清理已完成，`D-08` 已覆盖高频模块（`search`、`song_url`、`playlist_detail`、`batch`、登录相关模块），`D-12` 已补服务层 multipart 兼容回归。当前主线剩余事项应视为：长尾模块类型继续精细化、`xml2js` 是否保留、PAC 代理是否按需支持。

---

## 二、当前基线状态速览

| 维度                      | 状态                                                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/core/` (7 文件)      | 已完成类型化，无 `@ts-nocheck`，已用 `node:crypto` 替代旧加密库                                           |
| `src/server/` (6 文件)    | 已完成类型化，无 `@ts-nocheck`                                                                            |
| `src/app/` (3 文件)       | 已完成类型化，无 `@ts-nocheck`                                                                            |
| `src/types/index.ts`      | 已作为共享类型边界，覆盖主要公共接口                                                                      |
| `src/modules/` (367 文件) | 已完成显式函数签名类型化，`@ts-nocheck` 已清零；高频模块已补更具体 query 类型，剩余模块采用兼容型边界类型 |
| `src/plugins/` (2 文件)   | 已完成类型化，并切换到原生 `fetch`                                                                        |
| `tests/` (6 文件)         | 已覆盖加密、请求、服务层、CLI、程序化 API 和 Phase 5 回归                                                 |
| `index.ts`                | 公共入口，导出稳定                                                                                        |

---

## 三、技术债条目

### D-01：移除模块层 `@ts-nocheck` 并补齐参数类型

**影响范围**：`src/modules/` 下 366 个文件

**现状**：

- 已完成：`src/modules/` 内 `@ts-nocheck` 已清零
- 已完成：迁移模块边界已补齐显式函数签名
- 剩余工作：长尾模块仍以 `LegacyModuleQuery` / `ModuleQuery` 兼容边界为主，尚未全部细化到具体字段级类型

**目标**：

- 保持 `@ts-nocheck` 为 0
- 继续守住 `query` / `request` 的显式类型边界
- 对剩余长尾模块，按收益继续收窄 `query` 的具体字段类型

**操作方式**：

此债务适合**批量+人工混合**推进：

1. **机械批量阶段**：写脚本为所有模块统一添加参数类型标注并移除 `@ts-nocheck`，然后运行 `tsc --noEmit` 收集剩余类型错误
2. **人工修复阶段**：逐个处理 `tsc` 报出的真实类型错误（通常是旧 JS 写法导致的隐式 `any` 传播、属性访问不安全等）

**建议优先批次**：

| 批次 | 范围                                                                                                                            | 原因                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| P0   | 登录相关：`login.ts`、`login_cellphone.ts`、`login_email.ts`、`login_qr_*.ts`、`register_anonimous.ts`、`register_cellphone.ts` | 涉及加密库替换（D-02），需要一并改                                       |
| P1   | 高频基础：`search.ts`、`song_url.ts`、`song_url_v1.ts`、`playlist_detail.ts`、`user_account.ts`、`batch.ts`                     | Phase 5 回归已覆盖行为，类型化后可立即做编译级守护                       |
| P2   | 文件上传类：`cloud.ts`、`voice_upload.ts`、`audio_match.ts`、`related_playlist.ts`                                              | 涉及 `axios`/`md5`/`xml2js` 替换（D-03），需要与依赖替换一并改           |
| P3   | 其余 ~350 个模块                                                                                                                | 大多数模块结构简单（仅构造 data + 调用 request），批量脚本可覆盖绝大部分 |

**验收标准**：

- 目标文件不再包含 `@ts-nocheck`
- `tsc --noEmit` 在移除 `@ts-nocheck` 后仍可通过
- 已有测试不被破坏

---

### D-02：替换 `crypto-js` → `node:crypto`

**影响范围**：5 个模块文件

| 文件                                   | 用法                                      |
| -------------------------------------- | ----------------------------------------- |
| `src/modules/login.ts`                 | `CryptoJS.MD5(query.password).toString()` |
| `src/modules/login_cellphone.ts`       | `CryptoJS.MD5(query.password).toString()` |
| `src/modules/register_anonimous.ts`    | `CryptoJS.MD5(...)`                       |
| `src/modules/register_cellphone.ts`    | `CryptoJS.MD5(...)`                       |
| `src/modules/user_bindingcellphone.ts` | `CryptoJS.MD5(...)`                       |

**替换方式**：

```typescript
// 旧写法
import * as CryptoJS from 'crypto-js'
CryptoJS.MD5(query.password).toString()

// 新写法
import { createHash } from 'node:crypto'
createHash('md5').update(query.password).digest('hex')
```

`src/core/crypto.ts` 已完整使用 `node:crypto`，可参照其风格。

**验收标准**：

- 5 个文件不再 `import` 任何 `crypto-js` 内容
- `package.json` 移除 `crypto-js` 依赖
- 登录相关回归测试（`phase-5-regression.test.ts` 中 `login_cellphone` 用例）继续通过

---

### D-03：替换 `axios` → 原生 `fetch`

**影响范围**：5 个文件

| 文件                              | axios 用途                          |
| --------------------------------- | ----------------------------------- |
| `src/plugins/upload.ts`           | 向 NOS 上传图片                     |
| `src/plugins/song-upload.ts`      | 向 NOS 上传音频（含 LBS 查询）      |
| `src/modules/voice_upload.ts`     | 向 NOS 上传音频（含分块 multipart） |
| `src/modules/related_playlist.ts` | 直接调用外部接口获取关联歌单        |
| `src/modules/audio_match.ts`      | 调用音频匹配服务                    |

**替换难度分级**：

- **简单**：`related_playlist.ts`、`audio_match.ts` — 只用了 `axios.get`/`axios.post`，直接替换即可
- **中等**：`upload.ts`、`song-upload.ts` — 涉及自定义 Header 与 binary body，需要测试文件上传行为
- **复杂**：`voice_upload.ts` — 涉及分块上传（multipart initiate / part upload / complete）、XML 解析、自定义 Header，替换时需逐步验证

**注意事项**：

- `voice_upload.ts` 中同时依赖 `xml2js` 解析 NOS 返回的 XML；替换 axios 时可一并考虑是否用更轻量的 XML 解析方案（如手动正则或 DOMParser）
- `song-upload.ts` 使用了 `maxContentLength: Infinity`、`maxBodyLength: Infinity`，原生 `fetch` 没有这些选项，但 Bun 的 `fetch` 默认无此限制

**验收标准**：

- 5 个文件不再 `import` 任何 `axios` 内容
- `package.json` 移除 `axios` 依赖
- 文件上传链路（如果条件允许）可手工验证

---

### D-04：替换 `md5` 包 → `node:crypto`

**影响范围**：1 个文件

| 文件                   | 用法                                            |
| ---------------------- | ----------------------------------------------- |
| `src/modules/cloud.ts` | `md5(query.songFile.data)` 对文件 buffer 取 MD5 |

**替换方式**：

```typescript
// 旧写法
import md5 from 'md5'
query.songFile.md5 = md5(query.songFile.data)

// 新写法
import { createHash } from 'node:crypto'
query.songFile.md5 = createHash('md5').update(query.songFile.data).digest('hex')
```

**验收标准**：

- `cloud.ts` 不再 `import md5`
- `package.json` 移除 `md5` 依赖

---

### D-05：Plugin 文件类型化

**影响范围**：`src/plugins/upload.ts`、`src/plugins/song-upload.ts`

**现状**：已完成。插件文件已去掉 `@ts-nocheck`，已切换到原生 `fetch`，并具备显式类型边界。

**操作**：

1. 移除 `@ts-nocheck`
2. 为参数补齐类型
3. 将 axios 替换为 fetch（与 D-03 合并推进）
4. 给导出函数一个具名，提升可调试性

**验收标准**：

- 无 `@ts-nocheck`
- `tsc --noEmit` 通过
- 依赖 `upload.ts` 的模块（如 `cloud.ts`）行为不受影响

---

### D-06：模块代码质量清理

**影响范围**：`src/modules/` 中的少量文件

**当前状态**：本轮已完成高优先级清理。运行时源码中的松散等值比较、活跃 `console.log`、`Promise.reject(...)` 旧式错误抛出和明显的旧式字符串判断已完成主收敛。

以下表格保留为审计记录，便于追踪历史问题来源：

| 问题                             | 涉及文件数            | 示例                                                                   |
| -------------------------------- | --------------------- | ---------------------------------------------------------------------- |
| `var` 声明                       | 1 (`voice_upload.ts`) | `var s = []`、`var parser = ...`                                       |
| 残留 `console.log`               | 4 (共 12 处)          | `cloud.ts` 有 9 处                                                     |
| `Promise.reject({status, body})` | 4                     | `cloud.ts`、`check_music.ts`、`related_playlist.ts`、`voice_upload.ts` |
| 已废弃 `.substr()`               | 1 (`voice_upload.ts`) | 应替换为 `.substring()` 或 `.slice()`                                  |
| `.indexOf()` 代替 `.includes()`  | 4                     | `song_url.ts`、`cloud.ts` 等                                           |
| 松散等值比较 `==`                | ~30 个文件            | 应替换为 `===`                                                         |

**操作建议**：

- `var` → `let` / `const`
- `console.log` → 删除或替换为结构化日志（对生产模块而言，调试日志不应保留）
- `Promise.reject({...})` → `throw` 已收敛的错误对象（`_migration.ts` 的 normalize 层可兜底，但模块内部仍建议规范化）
- `==` → `===`（注意 `== null` 这种有意 coerce 的情况需要区分处理）

---

### D-07：`package.json` 一致性清理

**现状问题**：

1. 已完成：当前 `package.json` 不再保留过时 `peerDependencies` 约束
2. 已完成：`test:phase5`、`lint:full` 等脚本已存在
3. 已完成：`crypto-js`、`axios`、`md5` 已从 `dependencies` 中移除

**操作**：

1. 对齐 `peerDependencies`：
   - 如果确认以 TS 6 为基线，则把 `peerDependencies` 改为 `"^6"`
   - 如果需要兼容 TS 5 调用方，则保留 `"^5"`，但 `devDependencies` 应降回 `"^5"`
   - 建议：当前项目定位为 HTTP API 应用而非 npm 库，`peerDependencies` 可直接删除或对齐为 `"^6"`
2. 补齐缺失脚本或修正 README：

   ```json
   "test:phase5": "bun test tests/phase-5-regression.test.ts",
   "lint:full": "oxlint src/"
   ```

3. 待旧依赖清除后更新 `dependencies`

---

### D-08：`ModuleQuery` 精细化

**现状**：

- `ModuleQuery` 仍然是全局宽泛边界
- `src/types/modules.ts` 已为高频模块补齐更具体的 query 类型，例如 `SearchQuery`、`SongUrlQuery`、`PlaylistDetailQuery`、`BatchQuery`、`LoginQuery`、`LoginCellphoneQuery`、`LoginQrCreateQuery`
- 剩余未完成部分，主要是长尾模块尚未继续深挖字段级约束

**目标**：为高频模块定义具体的 query 接口，把运行时隐式约定提升为编译期约束。

**示例**：

```typescript
interface SearchQuery extends ModuleQuery {
  keywords: string
  type?: string | number
  limit?: number
  offset?: number
}

interface LoginCellphoneQuery extends ModuleQuery {
  phone: string
  password?: string
  md5_password?: string
  captcha?: string
  countrycode?: string
}
```

**建议**：

- 不必一次性为 366 个模块都定义——先覆盖 P0/P1 批次
- 新增类型可放在 `src/types/modules.ts` 或直接放在模块文件内
- 与 D-01 同步推进

---

### D-09：`qrcode` 和 `music-metadata` 依赖评估

**现状**：

- `qrcode`：被 `login_qr_create.ts`、`verify_getQr.ts` 使用，用于本地生成二维码图片
- `music-metadata`：被 `cloud.ts` 使用，用于解析上传音频文件的元数据（标题/艺术家/专辑）

**结论**：这两个依赖是**业务必需**的，不属于需要替换的旧遗留依赖。但需注意：

- `music-metadata` 引入了较大的依赖树，后续如果有轻量替代可考虑切换
- `qrcode` 体积小，保留即可

**操作**：无需立即处理，仅记录在案。

---

### D-10：`xml2js` 依赖评估

**影响范围**：仅 `src/modules/voice_upload.ts` 使用

**现状**：用于解析 NOS 分块上传返回的 XML 响应。

**建议**：

- 如果 D-03 替换 axios 时同步处理 `voice_upload.ts`，可考虑用正则或 Bun 内置能力替换 `xml2js`
- 但 XML 解析本身风险较低，如果时间紧可保留
- 优先级低于 D-02 / D-03

---

### D-11：PAC 代理支持

**现状**：`src/core/request.ts` 第 276 行显式 `throw` 了 PAC 代理不支持的错误。

**原因**：Bun 的 `fetch` API 尚不原生支持 PAC 代理协议。

**建议**：

- 短期内保持现状，PAC 使用场景极少
- 如后续有真实需求，可考虑在 fetch 之前手动解析 PAC 脚本，或引入第三方 PAC 解析库
- 优先级最低

---

### D-12：`multipart/form-data` 边角行为对齐

**现状**：

- 已完成：`src/server/parse-body.ts` 已把 Hono 的 `File` 对象适配为旧项目兼容的 `{ name, data, size, mimetype }` 结构
- 已完成：服务层已补针对 multipart 上传对象的回归测试
- 当前剩余差异：`md5` 仍采用模块侧按需补算，而不是在解析阶段预先生成；真实上传链路的边角行为仍建议手工验证

**遗留差异**：旧项目使用 `express-fileupload`，其行为包括：

- 自动将上传文件挂载为带 `name` / `data` / `size` / `mimetype` / `md5` 属性的对象
- 支持 `query.songFile.md5` 等直接属性访问

Hono 的 `parseBody` 原生返回标准 `File` 对象，但当前服务层已经补了兼容适配层。

**影响**：主要影响 `cloud.ts`、`voice_upload.ts`、`upload.ts`、`song-upload.ts` 这几个文件上传模块。

**建议**：

- 当前策略已经落地为“服务层做基础兼容、模块侧按需补算 `md5`”
- 后续只需在真实上传场景下继续补边角验证，而不是重做主适配层

---

## 四、推荐执行路径

```text
D-07（package.json 清理）    ← 基线对齐，先做
    │
    ▼
D-02（crypto-js 替换）       ← 独立、安全、可立即验证
D-04（md5 替换）             ← 同理，改动极小
    │
    ▼
D-01 P0 批次                 ← 登录模块类型化（与 D-02 合并推进）
D-01 P1 批次                 ← 高频基础模块类型化
    │
    ▼
D-03（axios 替换）           ← 涉及文件上传，需更多验证
D-05（插件类型化）           ← 与 D-03 合并推进
D-12（multipart 适配）       ← 与 D-03 合并推进
    │
    ▼
D-01 P2 批次                 ← 文件上传类模块类型化（依赖 D-03 完成）
D-06（代码质量清理）         ← 可与 D-01 各批次穿插进行
D-10（xml2js 评估）          ← 低优先级
    │
    ▼
D-01 P3 批次                 ← 剩余 ~350 个模块批量类型化
D-08（ModuleQuery 精细化）   ← 渐进式，与 D-01 同步
    │
    ▼
D-11（PAC 代理）             ← 最低优先级，按需推进
```

---

## 五、执行约束

1. **每完成一个条目，都应运行 `bun test` 和 `tsc --noEmit` 确认无回退**
2. **移除旧依赖后，必须同步更新 `package.json` 并重新 `bun install`**
3. **D-01 的批量脚本不应破坏 `_migration.ts` 的兼容层**——在全部模块完成类型化之前，`normalizeLegacyModuleResponse` / `normalizeLegacyModuleError` 仍是安全网
4. **优先保行为正确，再谈代码美观**——如果某个模块的旧写法虽然不优雅但行为正确且已有回归覆盖，不要为了追求风格一致而引入行为风险
5. **`src/core/` 和 `src/server/` 当前已经是干净基线，不要向其中引入 `@ts-nocheck` 或旧依赖**

---

## 六、最终目标形态

当上述技术债全部消化后，项目应达到以下状态：

| 维度          | 目标                                                                       |
| ------------- | -------------------------------------------------------------------------- |
| `@ts-nocheck` | 全仓库 0 个                                                                |
| 旧依赖        | `crypto-js`、`axios`、`md5` 从 `dependencies` 中移除                       |
| 运行时依赖    | 仅保留 `hono`、`qrcode`、`music-metadata`（业务必需），`xml2js` 视评估结果 |
| 类型覆盖      | 所有模块函数签名有明确类型标注，高频模块有具体 query 接口                  |
| 代码质量      | 无 `var`、无残留 `console.log`、无松散等值比较、无已废弃 API               |
| 工程校验      | `tsc --noEmit` + `bun test` + `oxlint src/` 全量通过                       |
| 文档          | `README.md` 与 `package.json` 脚本一致，`docs/` 保持最新                   |
