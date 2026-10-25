---
name: hana-schema-completion
description: 'Use when adding or repairing hana-music-api return-body schemas (ModuleBody): scope and semver, recording evidence, strict/loose/Optional field decisions, contract tests, generated types, docs, changesets, and batch coverage.'
---

# hana-music-api Schema 完善

用于给 `src/modules/` 的接口补 `ModuleBody`，或修改共用返回体结构。开始前按需读：

- `agent-docs/API_CONVENTIONS.md` 的[收紧与宽松](../../../agent-docs/API_CONVENTIONS.md#收紧与宽松)：字段语义和录制规则的唯一权威。
- `agent-docs/TESTING.md`：测试分层、测试 kit、录制回放。
- `agent-docs/CODE_STYLE.md`：单调用者不抽 helper、注释和生成文件规则。
- `agent-docs/PUBLIC_API.md`：公开导出和兼容性。
- `tests/_kit/assertions.ts`：`Recording`、`Validator`、`validateSync`、`expectUpstreamShapeRejection`。

本 skill 使用的审计 CLI 在仓库 `scripts/schema-audit.mts`，通过仓库脚本调用：

```bash
bun run schema:audit status
bun run schema:audit module <module>
bun run schema:audit recordings
bun run schema:audit check
```

## 0. 预检：范围、版本、覆盖面

1. 列出本批要补的模块和明确不做的模块。
2. 运行 `bun run schema:audit status`，记录总数、已有 Body 数、`raw`/`batch`/`upload` 分类；不要凭记忆或旧 PR 的数字。
3. 先判断版本并写 changeset：
   - **patch**：只放宽已有类型、修行为。
   - **minor**：新增公开 `*Body` 导出，或模块开始做运行时校验（畸形返回从原样放行变成 502）。
   - **major**：删除/重命名公开结构，或原本正常的成功返回被拒绝。
4. 范围中途变大（例如从修 bug 变成补模块结构），重新判断并改 changeset。

**完成标准**：模块清单、版本判断、changeset 文件三样都有；新增公开 Body 时 changeset 已是 minor。

## 1. 建立证据矩阵

用 CLI 看录制的字段证据：

```bash
bun run schema:audit module <module>
# 默认读 ../campanula-svelte-main/tests/fixtures/netease
# 其他位置：bun run schema:audit module <module> --recordings <root>
```

录制来源：

- SDK 仓库：`tests/fixtures/netease/<领域>/`。
- Campanula：`${CAMPANULA_FIXTURES:-../campanula-svelte-main/tests/fixtures/netease}/index.json`，只取 `outcome: ok`。
- 两边都没有：报告缺口，不要猜字段；只有用户允许后才用真实账号补录，再把录制复制进 SDK 仓库。

矩阵必须覆盖顶层和嵌套：字段路径、来源、出现过的类型、非 `null` 样例、数组元素样例、正常是否可能缺失/`null`。数组要看元素；空数组只说明它是数组，不说明元素类型。

逐字段决定：

- **收紧**：只限四类——返回码；通到返回物的路径；记录自己的编号；接口就是为了拿它的那一项。
- **可以没有（`Optional`）**：正常情况下会整个缺失或为 `null` 的路径；出现时仍按里面的记录收紧。列表类路径要有空结果录制。
- **宽松（`Loose`）**：其余已声明字段。可能缺失/`null`，类型不对当缺失。
- **不声明**：只见过 `null` 的字段；只见过空数组、元素类型猜不出的字段；没有任何非 `null` 证据的字段。它们由 `UpstreamObject` 原样保留。

额外规则：

- 别处（Campanula、线上抓包）见到的值，先补录到 SDK 的 `tests/fixtures/netease/`，再声明。
- 共享结构只收 **至少三个模块都用到且字段完全相同** 的结构；两个模块的 `Binding` 这类留在各自模块里。
- 宽松容器里不要有收紧字段；嵌套记录的编号用 `Loose`。
- 不声明 `Schema.MutableJson` 字段。
- 每个 `ModuleBody` 正上方写一句注释，写明通到返回物的路径和“接口就是为了拿它的那一项”。

**完成标准**：矩阵里每个路径都有 `strict` / `Optional` / `Loose` / `undeclared` 决定，没有未决定的 `unknown`；不存在“只见过 null/空数组却声明”的字段。

## 2. 按模块切片实现

一次只做一个模块，避免大 diff 和上下文压力。

1. 在模块文件里定义局部结构；满足三模块规则才放 `src/core/upstream-schemas.ts`。
2. 用 `UpstreamObject`、`Loose`、`Optional`；`Optional` 不加 `catchDecoding`。
3. 导出 `ModuleBody` 和同名类型；默认导出改成 `ModuleEffect<ModuleInput, ModuleBody>`。
4. 用 `decodeUpstreamBody('<module>', ModuleBody, response)` 校验，保留 `toModuleResponse` 的 cookie/status。
5. 注释紧贴 `ModuleBody`，不要贴到局部结构或 `Binding` 上。
6. 每完成一个模块跑一次 `bun run typecheck` 和该模块的定向测试。

**完成标准**：该模块编译、导出、校验接线和注释齐全；没有把两个模块共用的结构放进 core。

## 3. 录制与契约测试

1. 复制/截取真实录制到 `tests/fixtures/netease/<领域>/`；`context` 写来源、`region`、补录原因；截取时写 `truncated`。
2. 每个新 Body 至少覆盖：
   - 回放成功录制，返回 body 与录制逐字段一致；
   - 收紧字段缺失/类型不对时报 `UnexpectedUpstreamShape`，路径和 actual 正确；
   - 宽松字段缺失、`null`、类型不对时只丢这一项；
   - `Optional` 路径缺失/`null` 正常，出现坏记录仍报 502；
   - 未声明字段原样保留。
3. 测试类型一律用 `tests/_kit/assertions.ts` 的 `Recording`、`Validator`、`validateSync`、`expectUpstreamShapeRejection`。不要手写 `{ '~standard': ... }`，不要在 `validateSync` 后重复断言 Promise。
4. 能回放真实录制就不要手写 body；手写只用于构造边界。

**完成标准**：每个新 Body 至少一份真实录制回放；每类行为都有测试；测试文件没有自造的同步校验 helper。

## 4. 生成、文档、changeset

1. 模块合同改完运行 `bun run types:modules:generate`，不手改生成文件。
2. 更新 `website/guide/response-bodies.md` 的模块表和模块页的“返回内容”；写清收紧字段、`Optional` 路径和宽松范围。
3. changeset 正文写：新增哪些 `*Body` 导出；哪些模块开始运行时校验；调用方需要处理的新 502/类型变化；迁移建议。
4. 共享标准变了才改 `agent-docs/API_CONVENTIONS.md`，不要在每个模块页面重复一遍标准。

**完成标准**：生成的 `bodies.generated.ts` / `module-surface.generated.ts` 已更新；文档构建通过；changeset 与代码的版本级别一致。

## 5. 覆盖门槛和自审

按顺序跑：

```bash
bun run schema:audit check
bun run schema:audit recordings
bun run types:modules:check
bun test tests/contract
bun run typecheck
bun run verify
```

动到发布表面时再跑 `bun run verify:sdk`。需要真实上游验证时使用用户提供的凭据，不把 Cookie 写进仓库。

覆盖审计至少对本次模块执行：

- `schema:audit check` 通过：没有 `Schema.MutableJson` 字段，`ModuleBody` 正上方有注释。
- `schema:audit recordings` 通过：所有可映射录制校验后与原始返回逐字段相等；跳过项必须只是没有 Body 的模块。
- 逐项自审：
  - [ ] 没有字段声明成 `Schema.MutableJson`
  - [ ] 没有只见过 null/空数组的字段被声明
  - [ ] 没有宽松容器里的收紧字段
  - [ ] `Optional` 路径的缺失/null/坏记录都有测试
  - [ ] `ModuleBody` 注释在正上方，包含路径和接口目的
  - [ ] 共享结构满足三模块规则
  - [ ] changeset 是正确级别并写明新导出/新校验
  - [ ] 模块页和指南表已更新
  - [ ] 生成文件已重新生成
  - [ ] 测试使用 kit 的 `Validator`/`validateSync`
- PR 正文写：范围、semver、覆盖统计、实际运行的命令和结果、录制来源。

**完成标准**：`verify` 通过；`schema:audit check` 和 `schema:audit recordings` 没有失败；自审清单全部为真；PR 正文的数字来自审计输出。

## 6. 批量补 200+ 接口

- 先运行 `bun run schema:audit status`，按领域分组；不一次打开 200 个文件。
- 每批选 5–10 个有录制、结构相近的模块；每个模块按切片走完再进入下一个。一个模块测试失败时不要继续堆新模块。
- 没有录制的模块先跳过并列出缺口；不用“常见字段”或别的接口猜结构。
- 上传工作流和 `batch` 单独设计：`batch` 返回动态路由映射，上传返回插件拼装结果，不硬套普通 `*Body`。
- 每个 PR 更新一次覆盖数字，方便下一批复用。

## 常见返工点

- **把“只见过 null”当成宽松声明**：不声明，原样保留。
- **把空数组当成元素类型证据**：不声明；除非录制里出现过非空元素。
- **把宽松列表里的记录编号收紧**：宽松容器里的编号也宽松，否则坏一条会让整列消失或整次 502。
- **`Optional` 用成 `Loose`**：`Optional` 出现时必须校验；`Loose` 失败时当缺失。
- **两个模块共用结构就抽 core**：core 门槛是三模块且字段完全相同。
- **给新增 Body 仍写 patch**：新增公开导出或运行时校验是 minor；范围变大要重判。
- **测试手写同步校验/类型**：用 kit；`validateSync` 已经断言同步并收窄类型。
- **只测正常录制**：必须测缺失、`null`、类型错误、未知字段保留和 502。
- **注释贴在局部结构上**：注释必须紧贴 `ModuleBody`，说明路径和接口目的。
