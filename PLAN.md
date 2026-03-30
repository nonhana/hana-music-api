# `hana-music-api` 迁移重写 Plan

> 历史说明：本文档主要记录仓库早期的迁移规划与阶段性判断。随着 `Phase 5` 完成，部分“项目尚处于骨架初始化阶段”的描述已经过时；当前接手者应优先以 `docs/remaining-debt.md`、`README.md` 与 `src/` 实际实现作为真实基线。

## 一、文档目的

本文档不再描述“在 `netease-music-api` 原地重写”的方案，而是描述如下真实目标：

- `hana-music-api`：新的目标仓库，后续所有 Bun + TypeScript 重写工作都应落在这里
- `netease-music-api`：旧项目/参考仓库，用于提供现有 JS 实现、接口行为、加密逻辑与静态资源

这份 Plan 的用途，是为后续接手的 LLM 提供一份**与当前工作区真实状态一致**的迁移说明，避免继续基于过时前提推进实现。

---

## 二、当前工作区真实状态

### 2.1 仓库角色

| 仓库 | 角色 | 当前状态 |
| ---- | ---- | -------- |
| `hana-music-api` | 目标仓库 | 已完成最小 Bun + TS 骨架初始化，但尚未落地业务实现 |
| `netease-music-api` | 参考仓库 | 保留完整的旧版 JS 实现，可作为迁移来源与行为对照 |

### 2.2 `hana-music-api` 当前基线

当前新项目不是空目录，而是已经存在一套应被继承的初始基线：

| 维度 | 当前状态 |
| ---- | -------- |
| 运行时 | Bun，ESM |
| 入口 | 根目录 `index.ts` |
| 包配置 | `package.json` 已存在，`module` 指向 `index.ts` |
| TS 配置 | 已存在 `tsconfig.json`，开启 `strict`，`module: "Preserve"` |
| 代码质量 | 使用 `oxlint` + `oxfmt`，并已配置 `.oxlintrc.json`、`.oxfmtrc.json` |
| 依赖状态 | 当前几乎没有运行时依赖，尚未引入 Web 框架 |
| 文档结构 | 已存在 `README.md`、`AGENT.md`、`docs/` 目录，但 `README.md` 仍偏初始化模板，`docs/` 也可能尚未形成有效交接文档 |

补充说明：

- 根目录 `index.ts` 当前虽然已经存在，但仍属于临时占位状态，**不能将其视为已经设计完成的正式公共 API**
- `README.md` 当前更接近 Bun 初始化说明，而不是迁移后的项目说明，后续 AI 不应把它当成完整架构文档
- `docs/` 目录即使存在，也可能尚未包含足够的迁移记录；这不应阻止 Phase 0 开始推进

### 2.3 `netease-music-api` 当前基线

旧项目中可以被当作“真实实现来源”的，仍然是以下内容：

- 根目录 JS 入口：`app.js`、`server.js`、`main.js`、`generateConfig.js`
- 旧工具层：`util/`
- 旧端点目录：`module/`
- 插件与静态资源：`plugins/`、`public/`、`data/`

需要特别注意：

- `module/` 目录当前共有 **366** 个 `.js` 文件
- 旧项目虽然存在一个面向 Bun/TS 的 `package.json`
- 但 `src/` 目录当前并没有与该配置对应的完整实现落地
- 因此，**后续迁移时不能把旧仓库里的 Bun/TS 配置视为既成事实**

结论：

- **行为真相**以旧 JS 实现为准
- **迁移落点**以新仓库 `hana-music-api` 为准
- **工具链基线**以新仓库现有配置为准

---

## 三、迁移目标

### 3.1 总目标

将 `netease-music-api` 的全部可用能力迁移到 `hana-music-api`，并完成一次面向 Bun + TypeScript 的系统性重写。

### 3.2 迁移完成后的目标形态

| 维度 | 旧项目现状 | 新项目目标 |
| ---- | ---------- | ---------- |
| 运行时 | Node.js / CommonJS | Bun / ESM |
| 语言 | JavaScript + JSDoc | TypeScript 严格模式 |
| 代码质量工具 | 历史配置混杂 | 继承 `hana-music-api` 现有 `oxlint` + `oxfmt` |
| 入口组织 | 多个根目录 JS 文件 | 保留根目录 `index.ts` 作为公共入口，内部实现迁入 `src/` |
| 服务实现 | Express 中间件栈 | 使用 Hono 作为 HTTP 请求层 |
| HTTP 客户端 | axios | 原生 `fetch` |
| 加密实现 | `crypto-js` + `node-forge` | `node:crypto` |
| 测试 | 旧测试体系不再沿用 | `bun test` |

---

## 四、当前约束与关键决策

### 4.1 目标仓库固定为 `hana-music-api`

后续所有新增代码、目录调整、测试、文档与脚本，原则上都应发生在 `hana-music-api` 中。

`netease-music-api` 在迁移期内仅承担三种角色：

- 行为参考
- 数据/静态资源来源
- 回归对照样本

### 4.2 工具链继承 `hana-music-api` 现状，不回退到旧 Plan 的 Biome 方案

旧版 Plan 中将代码质量工具设定为 Biome，但这与新仓库当前真实基线不一致。现阶段应遵循：

- 继续使用 `oxlint`
- 继续使用 `oxfmt`
- 继续沿用现有 `tsconfig.json` 的严格模式与 Bun 类型配置

除非后续有明确决定，否则**不要在迁移初期切换到另一套 lint/format 工具链**，避免把“业务迁移”与“工具迁移”耦合到一起。

### 4.3 服务层明确采用 Hono

本次调整后，HTTP 请求层的技术选型已经明确：**采用 Hono**。

采用 Hono 的原因：

- 与旧项目的 Express 中间件思维更接近，迁移阻力更小
- 在 Bun 环境下足够轻量，同时保留成熟的路由与中间件抽象
- 便于承载 CORS、Cookie、Body 解析、静态资源、错误处理等服务层能力
- 可以把精力集中在业务迁移与加密对齐，而不是重复造 HTTP 层基础设施

约束：

- Hono 只作为 HTTP 请求层
- 其余技术栈保持不变，继续沿用 Bun + TypeScript + `oxlint` + `oxfmt`
- 不因为引入 Hono 而顺带切换其他工具链或重写整体分层设计

优先级说明：

- 如果本 Plan 的迁移决策与 `hana-music-api/AGENT.md` 中的通用建议存在冲突，以**本 Plan 的迁移决策**为准
- 具体到 HTTP 层，`AGENT.md` 中“默认避免框架依赖”的原则，在本迁移任务中以“**仅在服务壳层使用 Hono**”的方式落地
- 这不意味着放弃公共 API 设计，相反，应继续保持 `index.ts` 作为框架无关的对外门面，只把 Hono 限定在服务适配层内部

### 4.4 TypeScript 版本先服从新仓库现状

旧版 Plan 直接写死 `TypeScript 6.0`，但新仓库当前 `peerDependencies` 为 `typescript: ^5`。因此在迁移初期：

- 以当前 `hana-music-api` 的 TS 基线为准
- 先确保严格模式、模块系统、Bun 运行时协同正常
- 如果后续确有必要升级 TS 主版本，应作为**独立任务**处理，而不是默认前提

### 4.5 根目录 `index.ts` 是公共入口，不应被绕开

新仓库当前已经以根目录 `index.ts` 作为模块入口，因此建议迁移后的结构遵循：

- `src/`：内部实现
- `index.ts`：公共导出入口

不要直接把旧项目的 `main.js` 思路原样平移为唯一入口，而应让 `index.ts` 成为对外 API 门面。

补充约束：

- 当前 `index.ts` 仍是占位文件，后续迁移应把它视为 **Phase 0 需要收敛的目标文件**，而不是稳定实现
- 在 Phase 0 内，优先把 `index.ts` 调整为“清晰、可类型化、可扩展”的公共导出入口，即便其中暂时只导出占位能力
- 不要把业务实现直接堆在根目录 `index.ts`，业务逻辑仍应进入 `src/` 内部模块

---

## 五、建议目标结构（落在 `hana-music-api`）

```text
hana-music-api/
├── index.ts                 # 公共入口，导出服务启动能力与模块调用能力
├── src/
│   ├── app/
│   │   └── cli.ts           # CLI 启动入口
│   ├── server/
│   │   ├── create-server.ts # Hono 应用构建、路由注册、请求分发
│   │   ├── parse-body.ts    # 请求体解析
│   │   ├── cookies.ts       # Cookie 解析与注入
│   │   └── routes.ts        # 模块路由映射与特殊路由规则
│   ├── core/
│   │   ├── crypto.ts        # weapi / linuxapi / eapi
│   │   ├── request.ts       # 发往网易服务端的统一请求入口
│   │   ├── options.ts       # createOption 等选项构建
│   │   ├── config.ts        # 读取/包装静态配置
│   │   ├── cache.ts         # 轻量缓存实现
│   │   └── utils.ts         # Cookie / IP / deviceId 等工具
│   ├── modules/             # 从旧项目 module/*.js 迁移而来
│   ├── plugins/             # 上传等插件迁移
│   └── types/
│       └── index.ts         # 共享类型定义
├── tests/
│   ├── crypto.test.ts
│   ├── request.test.ts
│   ├── server.test.ts
│   └── modules/
├── scripts/
│   └── migrate-modules.ts   # 机械迁移辅助脚本
├── docs/
│   ├── migration-notes.md   # 迁移记录
│   └── architecture.md      # 新架构说明
├── public/                  # 从旧项目迁移
├── data/                    # 从旧项目迁移
├── package.json
├── tsconfig.json
├── .oxlintrc.json
├── .oxfmtrc.json
└── README.md
```

说明：

- `public/` 与 `data/` 可以在适当阶段整体迁移
- `util/config.json` 这类静态配置，建议迁移后放入 `src/core/config.ts` 的配套数据目录，或保留为只读 JSON 资源再做类型化包装
- 旧项目中的 camelCase 文件名在迁移时可按新仓库规范逐步调整为 kebab-case，但需要同步处理导入关系

---

## 六、源目录到目标目录的映射关系

| 旧项目 | 新项目 | 说明 |
| ------ | ------ | ---- |
| `app.js` | `src/app/cli.ts` | CLI 启动逻辑 |
| `server.js` | `src/server/create-server.ts` | 服务构建、路由分发 |
| `main.js` | `index.ts` + 局部内部模块 | 对外导出能力 |
| `generateConfig.js` | `src/app/generate-config.ts` 或 `src/core/generate-config.ts` | 匿名 token 初始化 |
| `util/crypto.js` | `src/core/crypto.ts` | 高风险核心模块 |
| `util/request.js` | `src/core/request.ts` | 请求网关核心 |
| `util/index.js` | `src/core/utils.ts` | 通用工具函数 |
| `util/option.js` | `src/core/options.ts` | 请求选项构建 |
| `util/apicache.js` + `util/memory-cache.js` | `src/core/cache.ts` | 优先简化重写 |
| `module/*.js` | `src/modules/*.ts` | 366 个端点模块 |
| `plugins/*.js` | `src/plugins/*.ts` | 上传相关逻辑 |
| `public/` | `public/` | 资源整体迁移 |
| `data/` | `data/` | 资源整体迁移 |

---

## 七、实施阶段

### Phase 0：对齐新仓库基线

目标：先把 `hana-music-api` 从“Bun 初始化项目”提升到“可承载迁移”的最小骨架。

任务：

1. 审核并补充 `package.json` 的脚本与依赖：
   - `hono`
   - `dev`
   - `start`
   - `test`
   - `typecheck`
2. 在新仓库中创建实际迁移目录：
   - `src/app`
   - `src/server`
   - `src/core`
   - `src/modules`
   - `src/plugins`
   - `src/types`
   - `tests`
   - `scripts`
3. 明确 `index.ts` 的公共导出边界
4. 在 `docs/` 中记录迁移约束与已知风险

完成标准：

- `hana-music-api` 目录结构成型
- Bun 可以正常执行入口文件
- `tsc --noEmit` 或等价类型检查可运行
- `oxlint` / `oxfmt` 可以作用于新建源码目录

### Phase 1：先迁移核心能力，再迁移业务模块

目标：优先建立“请求能发出去、响应能回来”的核心闭环。

优先级顺序：

1. `util/crypto.js` -> `src/core/crypto.ts`
2. `util/index.js` -> `src/core/utils.ts`
3. `util/option.js` -> `src/core/options.ts`
4. `util/request.js` -> `src/core/request.ts`
5. `generateConfig.js` -> 新仓库对应实现

说明：

- `crypto.ts` 是整个迁移的地基
- 若加密向量未对齐，不应推进模块批量迁移

完成标准：

- 已可在新仓库内独立调用 `createRequest()`
- 至少能通过若干真实接口完成请求闭环

### Phase 2：重建服务层

目标：在新仓库中基于 Hono 恢复旧项目的 HTTP 服务能力。

核心任务：

1. 设计 Hono 请求上下文到模块调用的适配层
2. 迁移 Cookie 解析逻辑
3. 迁移 query/body/files 合并逻辑
4. 恢复特殊路由映射：
   - `daily_signin`
   - `fm_trash`
   - `personal_fm`
5. 恢复 Set-Cookie 注入逻辑
6. 按需实现轻量缓存能力

完成标准：

- 新仓库内服务可启动
- 至少能正确响应若干核心 HTTP 端点
- 与旧服务的关键行为保持一致

### Phase 3：批量迁移 `module/*.js`

目标：将 366 个模块迁移为 TypeScript 文件，并逐步恢复可用性。

策略：

1. 先写迁移脚本处理机械替换
2. 再对高风险模块人工介入
3. 最后按批次回归验证

机械替换规则示例：

| 旧写法 | 新写法 |
| ------ | ------ |
| `require(...)` | `import ...` |
| `module.exports = fn` | `export default fn` |
| `../util/option.js` | `../core/options` |
| `CryptoJS.MD5(...)` | `createHash('md5')...` |

优先批次建议：

1. 高频基础端点：`search`、`song_url`、`playlist_detail`、`user_account`
2. 登录认证端点：`login_*`、`logout`、`register_anonimous`
3. 复杂聚合端点：`batch`
4. 其余模块批量推进

完成标准：

- `src/modules/` 完成基本迁移
- 模块能够被新服务层批量加载
- 高频接口通过回归验证

### Phase 4：迁移插件、静态资源与程序化 API

目标：补齐旧项目除主链路外的剩余能力。

任务：

1. 迁移 `plugins/`
2. 迁移 `public/`
3. 迁移 `data/`
4. 在 `index.ts` 中整理程序化调用 API
5. 视需要恢复 CLI 启动能力

完成标准：

- 插件在新仓库中可用
- 静态资源可访问
- 对外导出结构稳定

### Phase 5：验证与收尾

目标：建立可信的回归基线，确认迁移不是“能跑就算完成”。

验证维度：

1. 加密向量一致性
2. 关键端点行为一致性
3. Cookie 写入与透传
4. 特殊路由映射
5. 匿名 token 生成流程
6. 程序化调用入口

建议的最小回归集：

- `/search`
- `/song/url`
- `/playlist/detail`
- `/user/account`
- `/login/cellphone`
- `/login/qr/create`
- `/batch`
- `/daily_signin`
- `/personal/fm`

---

## 八、测试策略

### 8.1 必须先做的测试

- `crypto.test.ts`
- `request.test.ts`
- `server.test.ts`

### 8.2 加密层测试要求

`src/core/crypto.ts` 需要至少覆盖：

- weapi 加密结构
- linuxapi 加密结构
- eapi 签名与加密
- eapi 响应解密

如果可能，优先从旧项目运行结果中提取真实输入/输出对，建立向量测试。

### 8.3 模块层测试要求

不要求一开始给 366 个模块逐个写单测，但至少应保证：

- 高频模块有可执行验证
- 登录相关模块有专项验证
- `/batch` 有独立回归

---

## 九、风险矩阵

| 风险 | 概率 | 影响 | 缓解措施 |
| ---- | ---- | ---- | -------- |
| `node-forge` 到 `node:crypto` 的 RSA 行为不完全一致 | 高 | 高 | 先做向量验证，再做模块迁移 |
| `axios` 与 `fetch` 在 Cookie / Header 行为上存在细节差异 | 高 | 中 | 对关键请求做逐项比对 |
| 旧 Express 中间件语义无法直接平移到 Bun | 中 | 高 | 先抽象请求适配层，再恢复行为 |
| 批量迁移模块后类型错误数量过大 | 高 | 中 | 先脚本迁移，再按批修复 |
| 旧项目 Bun/TS 配置与实际源码不一致，误导迁移判断 | 高 | 中 | 以旧 JS 代码为唯一实现真相 |
| 新仓库工具链切换过多导致任务发散 | 中 | 中 | 保持 `oxlint` + `oxfmt` 不动 |

---

## 十、待决策事项

以下事项在真正开始大规模编码前，最好先确认：

1. **是否保留程序化调用 API**
   如果要保留，`index.ts` 的公共导出设计必须尽早确定。

2. **是否需要继续兼容旧包名/旧调用方式**
   这会影响 README、导出结构和迁移别名策略。

3. **是否要在迁移早期就处理文件命名规范**
   比如将 `songUpload.js` 统一迁移为 `song-upload.ts`。

4. **是否需要支持代理高级能力**
   尤其是 PAC 代理。如果要支持，需要单独评估 Bun 生态可行性。

---

## 十一、交接给后续 LLM 的执行约束

后续接手时，建议遵循以下顺序：

1. 先阅读本文件
2. 再阅读 `hana-music-api` 的 `package.json`、`tsconfig.json`、`AGENT.md`、`README.md`、`index.ts`
3. 明确认知：`README.md` 可能仍是初始化模板，`index.ts` 可能仍是占位文件，`docs/` 也可能暂未完善
4. 之后阅读 `netease-music-api` 的 `app.js`、`server.js`、`util/crypto.js`、`util/request.js`
5. 最后才开始编码

如果目标是“读完即可立即上手”，首轮执行建议固定为以下顺序：

1. 仅在 `hana-music-api` 中进行所有代码、目录、脚本和测试修改
2. 先补齐 `package.json` 的最小迁移基线：
   - 补充 `hono`
   - 补充 `typescript` 的实际开发依赖（如当前需要）
   - 补充 `dev`、`start`、`test`、`typecheck` 等脚本
3. 创建最小目录骨架：
   - `src/app`
   - `src/server`
   - `src/core`
   - `src/modules`
   - `src/plugins`
   - `src/types`
   - `tests`
   - `scripts`
4. 重写根目录 `index.ts`，把它收敛为“公共导出入口”，不要直接承载核心业务实现
5. 在 `docs/` 中至少补齐一份迁移记录或架构说明，哪怕只是 Phase 0 版本
6. 跑通最小校验：
   - `bun` 可执行入口
   - 类型检查可运行
   - `oxlint` / `oxfmt` 可作用于新建目录
7. 只有在上述骨架稳定后，才进入 `crypto.ts`、`request.ts` 等核心迁移

执行时必须遵守：

- 不要再按“原地重写旧仓库”的思路实施
- Hono 已经是本 Plan 明确确认的 HTTP 层方案
- 不要默认采用旧版 Plan 中的 Biome / TS 6.0 结论
- 不要相信旧项目里未落地完成的 `src/` 目录结构
- 不要把 `hana-music-api` 当前的 `README.md`、`index.ts`、`docs/` 误判为已经完备；它们更应被视为 Phase 0 的待收敛对象
- 一切接口行为以旧 JS 运行逻辑为准
- 一切新实现落在 `hana-music-api`
- 加密层未验证通过前，不要大规模推进模块迁移

---

## 十二、实施原则

1. **以新仓库为落点**：`hana-music-api` 是唯一目标仓库
2. **以旧 JS 为真相**：旧项目的实际 JS 实现比旧计划或半成品配置更可信
3. **先地基后批量**：先打通 `crypto -> request -> server`，再迁移 366 个模块
4. **保持工具链稳定**：优先继承新仓库现有 Bun + TS + Oxc 基线
5. **避免过早抽象**：先复现行为，再谈优化与重构
6. **验证驱动推进**：每一阶段都要有明确可验证产出
