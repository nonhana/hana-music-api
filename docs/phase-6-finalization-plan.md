# Phase 6 收尾执行基线

> 最后校准日期：2026-03-31  
> 本文档已按当前仓库真实实现、测试结果与文档基线重新整理。后续接手时，应优先把它当作 `Phase 6` 的直接开工说明，而不是历史讨论稿。
>
> 关于旧 `public/` 静态页退出主线、`/demo/*` 接管本地调试入口的后续工作，见 `docs/phase-7-demo-ui-modernization-plan.md`。

## 一、文档目的

本文档不再讨论“Phase 6 应该不要做”，而是明确三件事：

1. 当前仓库已经完成了哪些 `Phase 6` 目标
2. 现在真正还剩哪些收尾工作
3. 后续 LLM 或开发者接手时，第一步应该改哪里、验收到什么程度

目标是让接手者可以：

- 不必再先做一轮全仓摸底
- 不必再重复判断 `xml2js`、PAC、类型拆分这些事项是否已完成
- 直接从剩余尾项开始推进

---

## 二、当前仓库真实状态

截至 2026-03-31，以下事项已经通过源码、依赖、测试或文档核对确认：

### 2.1 已完成的 Phase 6 主体工作

1. **类型目录已拆分**
   当前 `src/types/` 已拆分为：
   - `runtime.ts`
   - `request.ts`
   - `server.ts`
   - `modules.ts`
   - `module-contracts.ts`
   - `upstream.ts`
   - `index.ts`

2. **上游边界已集中**
   `src/types/upstream.ts` 已承担上游动态响应边界，仓库 `src/` 内已不存在四处分散的显式 `any`。

3. **程序化 API 已具备基础类型映射**
   当前已存在：
   - `ModuleContractMap`
   - `ModuleIdentifier`
   - `ModuleQueryOf`
   - `ModuleResponseOf`
   - `ProgrammaticApi`

   `invokeModule()`、`createModuleApi()`、`loadProgrammaticApi()` 也已经接入这些类型。

4. **`xml2js` 已移除**
   `voice_upload.ts` 不再依赖 `xml2js`，而是改为内部 XML helper。

5. **PAC 边界已定稿**
   当前版本明确不支持 PAC 代理；`src/core/request.ts` 中保留显式报错，README 与架构文档也已基本统一到这一结论。

6. **主线工程校验已可通过**
   当前基线为：
   - `bun test` 通过
   - `bun run typecheck` 通过
   - `bun run lint:full` 无 error 且无 warning

### 2.2 当前剩余工作的真实范围

`Phase 6` 现在已经不是“大规模实现阶段”，而是以下四类尾项：

1. **长尾模块 query 类型继续收窄**
2. **继续扩展 `ModuleContractMap` 覆盖范围**
3. **保留上传链路手工验证结果并在后续改动时复验**
4. **清理少量文档尾差**

换句话说：

- `Phase 6` 主体已完成
- 现在缺的不是主链路能力，而是收口质量

---

## 三、当前判断与取舍

### 3.1 `any` 的最终判断

当前结论已经从“是否允许少量 `any`”变成：

**仓库主线已达到“无分散显式 `any`、动态边界集中处理”的目标，后续不应重新引入散落式 `any`。**

后续规则：

1. 新增输入边界不得写显式 `any`
2. 模块 query 类型优先用真实字段约束
3. 上游不稳定响应仍保持保守，不追求伪精确 schema
4. 如果确实需要新的不安全边界，必须继续集中在 `src/types/upstream.ts` 附近，而不是扩散到模块、服务层或公共 API

### 3.2 `query` 类型的最终判断

当前最重要的未完成事项，是把更多模块从兼容型 `LegacyModuleQuery` 收敛到真实 query 类型。

现状：

- 高频模块、登录模块、上传相关模块与少量聚合模块，已经有显式 query 类型
- 但大量长尾模块仍以 `LegacyModuleQuery` 为主

结论：

**后续 phase 6 的第一优先级，不是继续改响应类型，而是继续改输入边界。**

执行原则：

1. 以模块内部真实读取的 `query.xxx` 为准补类型
2. 先补必填字段、可选字段和基础 number-like / boolean-like
3. 不为未读取的字段预先建模
4. 不要求一次性覆盖全部模块，但要持续缩小 `LegacyModuleQuery` 使用面

### 3.3 程序化 API 的最终判断

程序化 API 的“从纯动态 Record 到受约束类型映射”的第一步已经完成，但覆盖面仍不足。

现状：

- 类型框架已建立
- 运行时入口已接入
- 仍只有一部分模块被纳入 `ModuleContractMap`

结论：

**后续工作不需要重写程序化 API 机制本身，而是继续把已完成 query 收敛的模块纳入契约映射。**

优先纳入原则：

1. 先纳入已经拥有显式 query 类型的模块
2. 先纳入高频、登录、上传、聚合类模块
3. 响应类型允许继续保守，不要求立即精细化

### 3.4 上传链路的最终判断

上传链路现代化已经完成主要代码替换，当前基线验收已经闭合。

已完成：

1. `xml2js` 已移除
2. `voice_upload.ts` 已切到内部 XML helper
3. 已补 helper 与离线 multipart 组装测试
4. 服务层 multipart 兼容适配已存在
5. 已新增 `docs/upload-manual-checklist.md`
6. 已完成一轮真实环境手工验证

结论：

**上传链路当前不缺主实现；后续如修改上传链路，应按既有清单重新做人工复验。**

### 3.5 PAC 代理的最终判断

PAC 已经不是待恢复能力，而是当前版本的有意边界。

后续要求只有两条：

1. 不再把 PAC 写成“尚未恢复”
2. 如果未来真要支持 PAC，作为独立专题处理，不再挂在 `Phase 6` 主线中

---

## 四、剩余收尾工作的执行清单

本节是后续接手时应直接执行的工作单。

### 4.1 工作项 A：继续收窄长尾模块 query 类型

**优先级：P0**

**目标**：

- 继续减少 `LegacyModuleQuery` 的使用范围
- 让更多模块的输入边界进入“真实、可推导、可维护”状态

**建议优先批次**：

1. 已有行为回归、但仍未收窄 query 的高频模块
2. 上传相关长尾模块
3. 常用详情、列表、评论、用户相关模块

**操作步骤**：

1. 选一批模块
2. 列出模块内部实际读取的 `query.xxx`
3. 在 `src/types/modules.ts` 或模块本地补最小真实类型
4. 替换模块签名中的 `LegacyModuleQuery`
5. 运行 `bun test`、`bun run typecheck`、`bun run lint:full`

**完成标准**：

- 新增收窄模块不再依赖 `LegacyModuleQuery`
- 不引入新的类型断言噪音
- 既有回归保持通过

### 4.2 工作项 B：扩展 `ModuleContractMap`

**优先级：P1**

**目标**：

- 让程序化 API 的强类型覆盖更多真实模块

**执行方式**：

1. 以“已经具备显式 query 类型的模块”为起点
2. 在 `src/types/module-contracts.ts` 中补充映射
3. 确认 `invokeModule()` 和 `createModuleApi()` 调用时能够推导对应 query
4. 视需要补充 `tests/module-api.test.ts`

**完成标准**：

- 新增模块标识可被编译期校验
- query 可被正确推导
- 不要求响应类型立刻精细化

### 4.3 工作项 C：补上传链路手工验证说明

**优先级：P1**

**目标**：

- 让后续接手者知道真实上传场景如何复验，而不是只看到离线测试

**应新增的内容**：

当前已完成：

1. 已新增 `docs/upload-manual-checklist.md`
2. 已补前置条件、真实 cookie 准备方式与检查项
3. 已按清单完成一轮人工验证

**完成标准**：

- 仓库内持续保留明确的上传手工验证说明
- README 或相关文档保留链接入口
- 后续涉及上传链路的改动，按清单重新复验

### 4.4 工作项 D：清理文档与 lint 尾差

**优先级：P2**

**目标**：

- 让文档表述统一
- 让工程校验持续保持干净状态

**完成标准**：

- 文档不再与 README / architecture / request.ts 冲突
- `bun run lint:full` 持续无 warning

---

## 五、推荐执行顺序

后续接手时，建议严格按下面顺序推进：

1. **先做 A：长尾模块 query 收窄**
   这是当前 phase 6 最大剩余工作，也是收益最高的部分。
2. **再做 B：扩展 `ModuleContractMap`**
   当 query 类型补好后，顺手把对应模块纳入程序化 API 映射。
3. **再做 C：维护上传手工验证闭环**
   这一步主要确保清单和人工验证记录持续有效，不会大改运行时代码。
4. **最后做 D：统一文档和 lint 尾差**
   作为 phase 6 的收口动作。

这样安排的原因是：

- 先收输入契约，再扩公共类型映射
- 先做高收益代码收敛，再补文档闭环
- 最后统一处理低风险清理项，避免打断主线推进

---

## 六、后续接手时的第一轮动作

如果你是下一位接手的 LLM 或开发者，建议第一轮固定按下面动作执行：

1. 阅读本文件
2. 阅读：
   - `src/types/modules.ts`
   - `src/types/module-contracts.ts`
   - `src/app/module-api.ts`
   - `docs/remaining-debt.md`
3. 用检索确认当前仍在使用 `LegacyModuleQuery` 的模块批次
4. 先挑一小批模块收窄 query 类型
5. 同步把这批模块里适合公开消费的模块加入 `ModuleContractMap`
6. 运行：
   - `bun test`
   - `bun run typecheck`
   - `bun run lint:full`

不要再把以下事项当作未完成主线：

1. 不要再评估是否继续保留 `xml2js`
2. 不要再把 PAC 当成“待恢复能力”
3. 不要再重做 `src/types/` 的目录拆分
4. 不要再把 phase 6 理解成“大规模迁移模块阶段”

---

## 七、非目标

以下事项不属于当前 `Phase 6` 主线收尾：

1. 不为全部网易云响应建立精确 schema
2. 不恢复 PAC 代理支持
3. 不重写程序化 API 的运行时机制
4. 不重做上传主链路实现
5. 不把 phase 6 重新扩大为另一轮大规模架构重构

---

## 八、验收口径

当 `Phase 6` 真正收尾完成时，项目应满足以下条件：

1. 主线工程校验持续通过：
   - `bun test`
   - `bun run typecheck`
   - `bun run lint:full`
2. 长尾模块 `LegacyModuleQuery` 使用面继续明显下降
3. `ModuleContractMap` 覆盖更多真实高价值模块
4. 上传链路具备离线测试 + 手工验证说明，并已有至少一轮人工验证
5. PAC 边界在全部文档中表述一致
6. 仓库不再保留明显的 phase 6 文档冲突或低价值尾差

简化后的验收表述：

- **输入类型继续收窄**
- **程序化 API 继续扩图**
- **上传验证保持可复验**
- **文档与 lint 完成收口**
