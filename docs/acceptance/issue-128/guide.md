# #128 批次迁移指南

这是给实现批次的内部约定。先读 `agent-docs/API_CONVENTIONS.md`、`CODE_STYLE.md`、`TESTING.md` 和本文件，再改代码。

## 目标

把每个公开模块的输入从 `LegacyModuleInput` / 宽泛类型改为具体结构：模块本地 `ModuleInput`、严格运行时 decoder、SDK 内部完成上游编码。不保留旧逗号串、JSON 串、分号串、数字/布尔强转等协议输入。

## 唯一输入模式

```ts
import {
  decodeModuleInput as decodeInput,
  NumberId,
  NumberIdList,
} from '../core/module-input.ts';

export type ModuleInput = {
  id: NumberId;
  ids: NumberIdList;
  note?: string;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  ids: NumberIdList,
  note: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);
```

- `decodeInput` 已经做普通对象校验，并用 `onExcessProperty: 'error'` 拒绝未声明字段；不要再手写 `typeof query.x` 检查。
- 不要在模块底部保留 `export { decodeLegacyModuleInput as decodeModuleInput }` 或 `export type ModuleInput = LegacyModuleInput`。
- 输入字段名优先沿用模块当前读取的 `query.x` / `input.x`，不要为了“更业务化”重命名既有字段；只有当前字段名本身就是协议编码（如 `c`、`trackIds` 字符串）时才改成业务名（`ids`、`tracks`）。

## 字段类型规则

- 编号（歌曲、歌单、用户、评论、专辑、歌手、MV、电台等资源 id）：`NumberId`。接受正安全整数或纯十进制正数字符串，拒绝 0、负数、小数、`"1,2"`、`"01"`、布尔、对象、null。
- 编号集合：`NumberIdList`（非空）用于“缺了就等于没调用成功”的集合，例如 `song_detail.ids`、`playlist_tracks.tracks`、排序 `ids`、`playlist_track_add.ids`。可为空的列表（如一起听播放列表）用 `Schema.Array(NumberId)`。
- 页码/数量/时间戳/版本：用 `NaturalValue`（非负整数）、`IntegerValue`（整数）或 `NumberValue`（有限数）；它们接受 HTTP query 的数字字符串并在解码后变成 number。不要直接用 `Schema.Natural`/`Schema.Int`/`Schema.Finite`，否则 `?limit=5` 会被拒绝。文档或代码把 `-1` 当哨兵（如歌词 `lv/tv/rv/kv`）时用 `IntegerValue`。
- 布尔：用 `BooleanValue`（接受 `true/false/0/1/'0'/'1'/'true'/'false'`，解码为 boolean）。不要直接用 `Schema.Boolean`。
- 枚举：模块内已经按字面量分支的字段用 `NumberLiterals([...])`（数字）或 `Schema.Literals([...])`（字符串）；文档只给出示例、未穷举的字符串（如 `commandType: 'REPLACE' | 'PLAYMODE_CHANGE'`）保留 `Schema.String`，不要猜完整枚举。
- 不透明 key、token、cookie 串、md5、房间号、threadId、文本：`Schema.String`。
- 对象/数组载荷：`Schema.Struct` / `Schema.Array` 逐字段声明；不要保留 `string` 形式的 JSON。嵌套 struct 的未声明字段同样会被拒绝。
- 文件/二进制：沿用 `UploadedFile`，不要 JSON 化，不要改成 base64 字符串。
- 无参数模块：`export type ModuleInput = NoInput`，`const inputSchema = EmptyInput`，decoder 末尾 `.pipe(Effect.as({}))`。不要用 `{}`、`Record<never, never>` 或 `Schema.Struct({})`。
- 唯一允许的开放字典是 `batch`；其他模块需要开放字典时先报给主代理，不要自行放行。

## 必填、可选和默认值

- 模块代码里 `query.x || 默认值`、`query.x ?? 默认值` 或 `if (query.x === undefined)` 的字段是可选：用 `Schema.optional`，默认值保持原样。
- 上游和文档都要求、模块没有兜底的字段是必填。
- 不要接受 `null`，除非现有代码明确把 `null` 当“清空”语义；在清单 `notes` 里写明。
- 删除 decoder 之后已经不可能出现的 `undefined`/`null`/类型分支，但不要改默认值、请求次数、动作选择或响应处理。

## 编码规则

- id 列表编码统一用 `String(id)` 保留十进制文本：CSV 用 `ids.map(String).join(',')`，JSON 数组用 `JSON.stringify(ids.map(String))`。
- 旧协议对象（如 `{type:3,id}`、`{id}`）在模块内用 `ids.map((id) => ({ ... }))` 构造，不抽通用框架。
- 不修改调用者数组或对象：需要重复列表时用 `[...ids, ...ids]`。
- 编码发生在业务请求前；非法输入由 decoder 在任何 token/匿名/网络动作前拒绝。
- 不改请求 `data` 的键名、默认值或固定字段；只把原来的协议字符串换成由业务值编码出的字符串。

## 每个模块的交付物

1. `src/modules/<module>.ts`：具体 `ModuleInput`、`inputSchema`、`decodeModuleInput`、模块内编码；删除 legacy 导出和手写类型检查。
2. `tests/behavior/modules/input-contracts/<domain>.ts`：该模块的 `valid` 至少一条、`invalid` 至少一条。
   - `valid` 要覆盖数字和字符串编号的混合形式（如果有）。
   - `invalid` 覆盖未声明字段（聚合测试会自动加一条 `__unexpected`，不需要重复）、旧分隔符串、错误类型、空编号数组（如果该字段要求非空）。
   - `batch` 用 `open: true`，不要加 `__unexpected` 断言。
3. `tests/behavior/modules/input-encoding/<domain>.ts`：为该批中**发生集合/对象/布尔/默认值转换**的模块增加用例；字段只做原样透传的模块不需要重复编码用例。每条用例是 `EncodingCase`：
   - `module`、`input`（新业务输入）；
   - `check(wires)`：用 `readEapiBody` / `readWebBody` 解码实际请求体并断言 `data`；
   - 多阶段/上传模块可用 `respond(wire, index)` 返回不同响应，并在 `check` 中断言每个阶段。
     不要新建测试文件；聚合测试 `tests/behavior/modules/input-encoding.test.ts` 会自动运行这些用例。
4. 更新该领域已有测试里仍在传旧形式的调用；不要删除有效断言，不要用 `as never` 掩盖类型错误（除非测试本身就是负向类型用例）。
5. 更新 `docs/acceptance/issue-128/inputs/<domain>.json` 中属于你的记录：`current`、`businessInput`、`upstreamEncoding`、`legacyEncoding`（迁移后应为空数组）、`evidence`、`status`、必要的 `notes`。

## 测试与命令

只运行你负责领域的窄测试，例如：

```bash
bun test tests/behavior/modules/playlist tests/replay/playlist
bun test tests/behavior/modules/input-contracts.test.ts -t "<你的模块名>"
bun scripts/check-module-inputs.mts
```

不要运行 `bun run typecheck`、`bun run lint`、`bun run types:modules:generate`、`bun run verify`；这些由主代理串行执行。

## 文件所有权

只改：

- `src/modules/` 中分配给你的模块文件。
- `tests/behavior/modules/input-contracts/<domain>.ts` 和 `tests/behavior/modules/input-encoding/<domain>.ts`。
- 你领域已有的测试文件（只更新旧输入调用，不新建测试文件）。
- `docs/acceptance/issue-128/inputs/<domain>.json`。

不要改：

- `src/core/`、`src/types/`、`scripts/`、生成文件、`tests/suites.ts`、其他领域文件、docs 其他部分、changeset。

需要新增共享原语或 helper 时，在报告里说明，不要自己加。

## 完成报告

按模块列出：新 `ModuleInput` 摘要、必填/默认值决定、编码方式、有意收紧项、修改的测试、实际运行的命令与结果、未解决问题。
