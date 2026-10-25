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

录制来源（SDK 仓库的 `tests/fixtures/netease/` 是唯一证据源）：

- SDK 仓库：`tests/fixtures/netease/<领域>/`，审计时用 `--recordings tests/fixtures/netease`。
- Campanula：`${CAMPANULA_FIXTURES:-../campanula-svelte-main/tests/fixtures/netease}/index.json`，只取 `outcome: ok`；只用来发现线索，不代替 SDK 录制。
- 两边都没有：用补录 CLI 生成，不猜字段。先用 `--out /tmp/<名字>` 探测 Cookie 和参数，确认后再用 `--dir <领域>` 写进仓库：

  ```bash
  bun run fixtures:record <module> --dir <领域> [--label <label>] \
    [--query k=v]... [--anonymous | --cookie-file <本机未跟踪文件>] \
    [--region local] [--viewer <text>] [--outcome <text>] \
    [--note "补录原因"] [--force]
  ```

  - `--label` 默认 `default`，不能以 `.数字` 结尾（会与编号录制撞名）。没有录制先报告缺口；用真实账号补录（`--cookie-file`）需要用户明确许可（本票已获许可）。Cookie 只从本机未跟踪文件读取；禁止写进仓库、日志、输出和提交信息。Cookie key 大小写不敏感地规范成 `MUSIC_U`/`MUSIC_A`，文件必须含其一（非空），否则只能当匿名录制。
  - 真实账号录制写模块（`rebind`、`user_replacephone`、`playlist_delete`、`scrobble`、签到/领取/购买等）本身就是一次真实变更：先匿名探测参数和路径，确认后再带 Cookie；涉及一次性奖励或真实支付的不要录，只报告缺口。
  - query 与响应体写盘前统一 redaction：敏感 key（子串、大小写不敏感）`music_u`/`music_a`/`cookie`/`token`/`csrf`/`password`/`passwd`/`secret`/`captcha`/`phone`/`email` 命中时，非空字符串、数字和非空对象/数组整体替换成 `<redacted>`；`null`、空串、布尔、空数组/空对象原样保留（类型和 null 证据仍有意义）。`tokenVersion` 精确匹配时豁免（数字版本号，不是凭据）。任何字符串值含 `MUSIC_U=`/`MUSIC_A=`/`__csrf=` 也整体替换。路径记在 `context.redacted`（`query.*` / `body.*`，数组下标 `[n]`）。写盘前对最终对象做结构化自检（敏感 key 只能是 `<redacted>`、字符串不能含上述凭据片段），失败时不写新文件也不删旧录制。录制除 `context.redacted` 记录的字段外是网易云原文。
  - `--viewer` 默认：Cookie 含 `MUSIC_U` → `authenticated`，只有 `MUSIC_A`（匿名注册令牌）→ `anonymous`；需要区分 `vip`/`invalid-cookie` 等视角时显式传。
  - `--outcome <text>` 写入 `context.outcome`；审计优先按它分类（`ok` 才算成功），没有再退回 `response.status` 与顶层数字 `code`（`data.code` 是业务状态，不参与）。803 这类成功态显式写 `--outcome ok`。
  - `--query` 只把无前导零的整数推断成数字；小数和前导零号码（如 `0138...`）保持字符串，也可用 JSON 字符串显式指定。解析错误只报 flag/键名/位置，不回显值。敏感 key 的非空字符串和数字会整体 redact，`null`/空串/布尔/空容器保留。
  - 录制落在 `tests/fixtures/netease/<领域>/<module>.<label>.json`；单请求不写额外元数据。一次调用按尝试顺序读多次上游时写成 `<module>.<label>.<n>.json`（`n` 从 1 开始，包含失败尝试的序号），每份写 `context.part = { index, of, final, gaps? }`：`of` 是尝试次数（含失败），正常多请求的最后一份 `final: true`、其余 `false`；中间尝试无响应时保留空洞并写 `gaps: [n]`，最后一份仍可 final；最后一次尝试无响应或非正常返回（`--outcome ok` 显式声明成功时除外）时所有份 `final: false`，stdout 告警“证据不完整，没有标记 final”并 exit 1。
  - 多请求模块的 `ModuleBody` 描述 SDK 最终返回体；契约测试按顺序回放全部 `.n`；审计只校验 `final: true`（无 `context.part` 的老录制视为单请求 final），`final: false` 计入 `multi-part: N (excluded)`；index 模式也从录制文件推导，不只看 index 条目。`recordings` headline 写成 `N ok entries (X eligible, Y multi-part excluded)`，`--list` 的 `without auditable recordings` 只统计至少有 final 证据的模块。
  - 列表类接口要补一份空结果录制，否则无法决定数组之外的路径。
  - 从大录制截取时保留来源标签，并在 `context.truncated` 用 `{ path, length }` 写明截断的数组和长度。`.json.gz` 是历史手工压缩，审计扫描会读；`--force` 会清理同 base 的 `.json` 和 `.json.gz`。
  - 补录后立刻运行 `bun run schema:audit module <module> --recordings tests/fixtures/netease` 看字段矩阵。
  - 退出码：`0` 正常返回；`1` 调用失败，或保存了非正常返回（`status ≠ 200` / 顶层 `code ≠ 200`）。没有顶层 `code` 的响应（如插件上传阶段）会告警并 exit 1，但审计仍按 ok 处理，用于提示人工确认。

录制字段约定：

- `context.redacted`：被替换的凭据路径，相对录制文件；根为 `query` / `body`，嵌套用 `.`，数组下标用 `[n]`（如 `body.list[0].token`），与 `context.truncated` 的写法一致。
- `context.part`：只有多请求录制才有，形如 `{ index, of, final, gaps? }`；`index` 从 1 开始按尝试序号编号，`of` 是尝试次数（含失败），`gaps` 是中间没有响应的尝试序号，`final` 仅在最后一份正常返回（或显式 `--outcome ok`）时为 `true`。单请求不写这个字段。

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

1. 复制/截取真实录制到 `tests/fixtures/netease/<领域>/`；`context` 写来源、`region`、补录原因；截取时写 `truncated`。多请求录制保留全部 `.n` 和 `context.part`，契约测试按顺序回放；只有 `final: true` 的录制参与逐字段审计。
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
- 没有录制的模块先报告缺口，不用“常见字段”或别的接口猜结构；真实账号补录需要用户明确许可（本票已获许可）。
  - 匿名可访问的接口用 `--anonymous`；需要账号数据的接口用 `--cookie-file` 指向本机未跟踪文件，禁止把 Cookie 写进仓库或输出。
  - 列表类接口补一份正常录制和一份空结果录制；一次调用读多次上游的模块保留全部 `<module>.<label>.<n>.json`。
  - 补录后先运行 `bun run schema:audit module <module> --recordings tests/fixtures/netease` 看矩阵，再决定字段松紧。
- 每批选 5–10 个结构相近的模块；每个模块按切片走完再进入下一个。一个模块测试失败时不要继续堆新模块。
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
