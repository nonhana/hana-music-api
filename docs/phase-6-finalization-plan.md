# Phase 6 收尾方案

## 一、文档目的

本文档用于承接 `Phase 5` 之后的收尾工作。它不再讨论“是否继续迁移旧能力”，而是明确以下问题的最终取舍：

1. `any` 在当前项目中的允许边界
2. 模块 `query` 类型的收敛方案
3. 程序化 API 的类型映射方案
4. `xml2js` 的替换方向
5. PAC 代理支持的最终决策

本文档的目标不是追求“纸面上绝对零 `any`”，而是把仓库从“迁移已可用”进一步收敛为“边界清楚、文档一致、可长期维护”的现代 Bun + TypeScript + Hono API 服务。

---

## 二、收尾阶段的总体判断

当前仓库已经满足以下前提：

- Bun 服务可正常启动
- 主链路 `crypto -> request -> server -> modules` 已可实际运行
- `src/modules/` 的迁移结果已能够被 HTTP 服务层和程序化入口装载
- `typecheck` 与离线回归基线已经建立

因此，接下来的工作重点不再是“继续批量迁模块”，而是三类收敛：

1. **类型边界收敛**：把输入、公共导出和模块契约从“兼容优先”收紧到“可推导、可约束、可维护”
2. **兼容层收敛**：减少散落在模块内部的历史写法，让遗留兼容逻辑集中在少数明确边界
3. **边角能力定稿**：对上传链路、PAC 代理这类剩余事项给出明确决策，不再长期悬而未决

---

## 三、决策摘要

### 3.1 `any` 的最终取舍

结论：**允许保留少量、集中、带注释的 `any`，但仅限“上游响应未知边界”与极少数动态解析边界。**

原因：

- 网易云上游接口的返回值结构并不稳定，也缺少可信的官方 schema
- 如果为了追求“绝对零 `any`”而把所有上游响应都写成伪精确类型，反而会制造大量虚假的类型安全
- 当前项目首先是 HTTP API 后端应用，不是以发布完整 SDK 类型声明为第一目标

允许保留 `any` 的位置：

1. 上游原始响应体边界
2. 真实结构未知、且必须动态访问的 JSON 解析结果
3. 少量第三方返回结构无法稳定建模的过渡点

不允许保留 `any` 的位置：

1. 公共输入边界，例如 `query`、配置对象、启动参数
2. 程序化 API 的模块标识和调用签名
3. 服务层内部适配逻辑
4. 可以用 `unknown` + 类型守卫表达的场景

执行原则：

- 不再允许“散落式 `Record<string, any>`”
- 所有确有必要的 `any`，都应集中到少数类型别名中，并附带注释说明原因
- 收尾目标应调整为：**清零无解释的 `any` warning**，而不是机械追求“仓库一个 `any` 都没有”

建议做法：

1. 新增专门的上游边界类型文件，例如 `src/types/upstream.ts`
2. 在其中集中定义少数过渡类型，例如：
   - `UpstreamBody`
   - `DynamicJsonRecord`
3. 对这些集中保留的 `any` 使用局部 lint 关闭，并写清楚原因
4. 仓库其余位置不得继续新增新的显式 `any`

---

### 3.2 `query` 类型的最终取舍

结论：**模块 `query` 类型应继续收紧，而且收紧依据应来自“当前模块的实际调用输入”，而不是上游响应结构。**

原因：

- `query` 是当前项目自己定义和消费的输入边界，可控、稳定、收益高
- 与响应体不同，入参结构完全可以从模块实现、HTTP 调用方式和程序化 API 用法中提取
- 即便上游响应体仍保持宽泛边界，输入边界的严格化也能显著提升可维护性

实施原则：

1. 以模块实际读取的字段为准定义 `query` 类型
2. 先保证“字段存在性和基本类型”准确，再考虑更细的枚举和值域
3. 优先为高频、登录、上传和聚合类模块定义明确 query 类型
4. 长尾模块允许采用“最小但真实”的 query 类型，而不是一次性补完整业务语义

推荐分层：

- **A 类模块**：高频基础模块、登录模块、上传模块、聚合模块  
  要求具备显式 query 类型，字段级约束尽量明确
- **B 类模块**：普通读操作模块  
  至少补齐必填字段、可选字段和基础字面量/数字字符串类型
- **C 类模块**：长尾兼容模块  
  可先保留宽松边界，但要逐步从 `LegacyModuleQuery` 收敛到更小的局部类型

注意：

- 这里的“类型完全”首先应理解为**输入边界完全**，而不是“把 366 个接口的响应都做成伪精确 schema”

---

### 3.3 程序化 API 的最终取舍

结论：**程序化 API 应优先建立“模块标识 -> query/response”类型映射；响应类型允许保守，但调用签名不能继续是纯动态 `Record<string, ...>`。**

当前问题：

- `createModuleApi()` 返回动态 `Proxy`
- `invokeModule()` 以任意字符串作为模块标识
- `ProgrammaticApi` 当前只是 `Record<string, ProgrammaticModuleInvoker>`

这意味着：

- 运行时可用
- 但编译期无法约束模块标识是否合法
- 也无法根据模块标识推导 query 类型

最终方案：

1. 引入统一的模块契约映射，例如 `ModuleContractMap`
2. 让每个已收紧的模块在类型层声明：
   - `query`
   - `response`
3. 生成以下公共类型：
   - `ModuleIdentifier`
   - `ModuleQueryOf<TIdentifier>`
   - `ModuleResponseOf<TIdentifier>`
4. 重写程序化 API 的公开签名：
   - `invokeModule<K extends ModuleIdentifier>(identifier: K, query: ModuleQueryOf<K>)`
   - `ProgrammaticApi = { [K in ModuleIdentifier]: (query: ModuleQueryOf<K>) => Promise<ModuleResponseOf<K>> }`

响应类型取舍：

- 对无法稳定建模的模块，`response` 允许退回 `NcmApiResponse<UpstreamBody>`
- 对已知高频模块，可逐步补更具体的返回结构
- 当前阶段不要求一次性给全部模块补齐精确响应 schema

目标：

- 让程序化 API 至少做到“标识可校验、入参可推导、响应边界有保底类型”

---

### 3.4 `xml2js` 的最终取舍

结论：**移除 `xml2js`，改为更轻量、更现代、只覆盖当前真实需求的 XML 解析方案。**

当前现状：

- `xml2js` 仅在 `voice_upload.ts` 中用于解析 NOS 分块上传返回的 XML
- 当前实际需求只依赖少量字段，例如 `UploadId`

因此，不需要保留完整对象映射型 XML 库。

推荐方案：

1. 优先使用 Bun 可直接消费的 Web API 方案，例如 `DOMParser`
2. 把解析逻辑封装为小型辅助函数，例如：
   - `parseXmlText(xml, tagName)`
   - `parseMultipartUploadId(xml)`
3. 仅解析当前链路真正需要的 XML 节点，不引入新的重量级 XML 依赖

验收标准：

- `package.json` 移除 `xml2js`
- `voice_upload.ts` 不再依赖第三方 XML 解析库
- 补一组上传链路的最小单测或回归测试，至少覆盖：
  - upload init XML 解析
  - 缺文件报错
  - multipart 完成请求组装

补充说明：

- CI 中不要求接入真实 NOS 上传
- 但应补一份手工验证步骤，供后续在真实环境做上传链路检查

---

### 3.5 PAC 代理的最终取舍

结论：**明确不支持 PAC 代理，并将其从“未完成债务”调整为“有意边界”。**

原因：

- Bun 当前 `fetch` 适配器不原生支持 PAC
- 当前项目的主目标是承接网易云 API 能力，而不是实现完整代理能力矩阵
- PAC 使用场景属于低频边缘需求，不应长期阻塞主线收尾

落实方式：

1. 保留当前显式报错行为
2. 在 README、架构文档和技术债文档中统一改写表述：
   - 不再写“PAC 代理仍未恢复”
   - 改为“当前版本明确不支持 PAC 代理”
3. 若未来出现真实业务需求，再以独立专题实现，而不是继续挂在主线债务列表中

---

### 3.6 类型系统落地设计

本节用于回答一个更具体的问题：

- 在当前项目中，究竟哪些地方要强类型
- 哪些地方应该保守
- 文件应该怎么拆
- `request()`、模块层和程序化 API 应该分别承担什么类型责任

核心原则只有一句话：

**对自己定义的契约严格，对上游未知事实保守。**

#### 3.6.1 类型系统的三层模型

建议把当前项目的类型系统拆成三层，而不是混在一个 `index.ts` 里：

1. **输入契约层**
   负责描述当前项目自己接收和消费的输入。
   例如：
   - HTTP query / body 进入模块时的参数
   - `createServer()` / `startServer()` 配置
   - `createRequest()` 选项
   - 程序化 API 的模块调用参数
2. **运行时边界层**
   负责描述本项目内部流动的数据形状。
   例如：
   - `NcmApiResponse`
   - `ModuleDefinition`
   - `ModuleRequest`
   - `LegacyUploadedFile`
3. **上游原始响应层**
   负责承接网易云返回体和动态解析结果。
   这里允许保守类型，必要时允许集中保留 `any`。

这三层不要混写，否则很容易出现一个问题：

- 为了迁就上游响应的不确定性，把整个项目都拖回宽泛类型

#### 3.6.2 推荐的 `src/types/` 拆分方式

推荐将类型目录整理为以下结构：

```text
src/types/
├── index.ts          # 公共导出门面
├── runtime.ts        # 运行时公共结构：NcmApiResponse、ModuleDefinition、ModuleRequest
├── request.ts        # createRequest() 相关输入类型
├── modules.ts        # 各模块 query 类型、上传文件类型、LegacyModuleQuery 过渡类型
├── module-contracts.ts # ModuleContractMap、ModuleIdentifier、ModuleQueryOf、ModuleResponseOf
├── upstream.ts       # UpstreamBody、DynamicJsonRecord、少量集中保留的 any
└── vendor.d.ts       # 第三方声明补丁
```

拆分目的：

- `index.ts` 只做门面导出，不再承载所有类型定义
- `modules.ts` 专注于模块输入
- `module-contracts.ts` 专注于程序化 API 的类型映射
- `upstream.ts` 作为唯一允许保守边界集中的地方

#### 3.6.3 `unknown`、`any`、`Record<string, unknown>` 的使用规则

建议固定采用以下判定规则：

1. **能先不信任，就先用 `unknown`**
   适用场景：
   - `JSON.parse()`
   - 外部响应体
   - 动态配置源
2. **需要表达“对象，但字段未知”时，用 `Record<string, unknown>`**
   适用场景：
   - query 合并后的中间对象
   - 只做浅层属性转发的 data 对象
3. **只有在“必须允许任意属性访问且短期无法建模”时，才允许集中式 `any`**
   适用场景：
   - 上游响应原始边界
   - 第三方回包结构极不稳定、且当前项目仅做透传

不建议继续使用的写法：

```ts
Record<string, any>
```

替代策略：

```ts
export type UpstreamBody = Record<string, unknown>

// 仅用于上游原始返回体边界，禁止向输入边界和公共 API 扩散。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnsafeUpstreamBody = Record<string, any>
```

执行约束：

- `UnsafeUpstreamBody` 只能定义在 `src/types/upstream.ts`
- 其他文件不得直接写新的 `Record<string, any>`
- 如果某处必须使用 `UnsafeUpstreamBody`，应优先在变量命名上体现其“不安全”性质

#### 3.6.4 `request()` 的类型责任

`createRequest()` 的职责不是告诉调用者“网易云一定返回什么”，而是提供一个**稳定、诚实的上游请求边界**。

因此，建议将其签名收敛为：

```ts
export type UpstreamBody = Record<string, unknown>

export interface NcmApiResponse<TBody = UpstreamBody> {
  body: TBody
  cookie: string[]
  status: number
}

export type ModuleRequest = <TBody = UpstreamBody>(
  uri: string,
  data: Record<string, unknown>,
  options?: CreateRequestOptions,
) => Promise<NcmApiResponse<TBody>>
```

这样做的含义是：

- 默认情况下，`request()` 返回保守的 `UpstreamBody`
- 模块如果确实知道某一段局部结构，可以在局部显式声明 `TBody`
- 不要求 `request()` 预设全局精确响应 schema

这个泛型应该谨慎使用：

- 只有当模块确实消费了某些字段，且这些字段在当前链路里稳定时，才传具体 `TBody`
- 否则应保持默认保守边界

#### 3.6.5 模块层的类型责任

模块层最重要的类型责任是**定义输入，不是承诺完整输出**。

每个模块最终应尽量接近如下结构：

```ts
import type { ModuleRequest, NcmApiResponse } from '../types/runtime.ts'
import type { SearchQuery } from '../types/modules.ts'
import type { UpstreamBody } from '../types/upstream.ts'

export default async function search(
  query: SearchQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse<UpstreamBody>> {
  // ...
}
```

如果某模块确实依赖某个返回片段，可以局部定义最小响应片段类型：

```ts
interface SongUrlItem {
  id: number | string
  url?: string
}

interface SongUrlBody {
  code?: number
  data?: SongUrlItem[]
}
```

然后：

```ts
const res = await request<SongUrlBody>(...)
```

注意：

- 这里定义的是“当前模块真实消费到的最小片段”，不是上游完整 schema
- 不要为了追求完美而把整份返回体全部写全

#### 3.6.6 `query` 类型的设计方法

每个模块的 `query` 类型应从以下四个来源提取：

1. 模块内部实际读取的字段
2. 服务层允许透传的 HTTP 参数
3. 程序化 API 的调用方式
4. 旧项目的真实接口调用习惯

建议按以下顺序收敛：

1. 先列出模块访问了哪些 `query.xxx`
2. 标出必填和可选
3. 把数字字符串保留成 `number | \`\${number}\``
4. 把有限枚举值收敛成字面量联合
5. 对上传文件、cookie、代理等公共字段复用共享类型

推荐的公共积木类型：

```ts
export type QueryNumberLike = number | `${number}`
export type QueryBooleanLike = boolean | 0 | 1 | '0' | '1' | 'true' | 'false'
export type QueryIdentifier = string | number
```

模块类型示例：

```ts
export interface SearchQuery extends OptionCompatibleQuery {
  keywords: string
  limit?: QueryNumberLike
  offset?: QueryNumberLike
  type?: QueryNumberLike
}

export interface LoginCellphoneQuery extends OptionCompatibleQuery {
  phone: string
  countrycode?: QueryNumberLike
  password?: string
  md5_password?: string
  captcha?: string
}
```

不建议的做法：

- 把所有模块都继续挂在 `LegacyModuleQuery`
- 把根本没读过的字段也先写进类型里“以防以后要用”
- 为了消除错误把所有字段都做成可选

#### 3.6.7 程序化 API 的类型设计

程序化 API 的目标不是消灭运行时动态装载，而是在公共类型层给出**可校验的调用契约**。

推荐设计如下：

```ts
export interface ModuleContractMap {
  search: {
    query: SearchQuery
    response: NcmApiResponse<UpstreamBody>
  }
  song_url: {
    query: SongUrlQuery
    response: NcmApiResponse<SongUrlBody>
  }
  user_account: {
    query: UserAccountQuery
    response: NcmApiResponse<UpstreamBody>
  }
}

export type ModuleIdentifier = keyof ModuleContractMap

export type ModuleQueryOf<K extends ModuleIdentifier> = ModuleContractMap[K]['query']

export type ModuleResponseOf<K extends ModuleIdentifier> = ModuleContractMap[K]['response']

export type ProgrammaticApi = {
  [K in ModuleIdentifier]: (query: ModuleQueryOf<K>) => Promise<ModuleResponseOf<K>>
}
```

公共函数签名建议改成：

```ts
export async function invokeModule<K extends ModuleIdentifier>(
  identifier: K,
  query: ModuleQueryOf<K>,
  options?: CreateModuleApiOptions,
): Promise<ModuleResponseOf<K>>
```

`createModuleApi()` 的运行时仍然可以返回 `Proxy`，但对外暴露的类型应是 `ProgrammaticApi`，而不是通用 `Record<string, ...>`。

这里的重点是：

- 模块标识在编译期受约束
- query 能被自动提示
- response 至少有保底边界

#### 3.6.8 模块响应类型的策略

本项目不适合把响应类型作为第一优先级全面精细化。

建议分三级：

1. **Level 1：保底响应**
   使用 `NcmApiResponse<UpstreamBody>`
   适用于绝大多数模块
2. **Level 2：最小消费片段**
   只为模块内部真实读取的字段定义局部片段类型
   适用于 `song_url`、`playlist_track_all`、`check_music` 这类会读上游字段的模块
3. **Level 3：公共高频响应**
   对 `search`、`playlist_detail`、`user_account` 等高频模块，若程序化调用确有价值，可逐步补更明确的返回体

这三层足以覆盖当前项目需要，没必要一步到位走向“全量 SDK schema 化”。

#### 3.6.9 兼容层的类型定位

`src/modules/_migration.ts` 不应被视为“类型失败后的兜底脏区”，而应明确定位为：

- **旧模块返回形态归一化边界**
- **旧式错误对象归一化边界**

因此，兼容层允许保守类型，但它的职责要写清楚：

- 负责把未知旧响应压成稳定 `NcmApiResponse`
- 不负责替代模块自己的输入类型设计
- 不负责提供精确业务语义

这意味着：

- 模块可以继续复用兼容层
- 但类型现代化工作的主战场仍是 `query`、`request()` 和程序化 API

#### 3.6.10 建议的迁移顺序

为了让 LLM 接手时能直接开工，建议按下面顺序实施：

1. 新增 `src/types/upstream.ts`
   先把保守边界集中起来
2. 拆分 `src/types/index.ts`
   把 `runtime`、`request`、`module-contracts` 拆出去
3. 改造 `ModuleRequest` 为带默认泛型的函数类型
4. 清理 `src/core/request.ts`、`src/modules/api.ts` 中散落的 `Record<string, any>`
5. 扩展 `src/types/modules.ts`
   继续补高频、登录、上传、聚合模块 query 类型
6. 引入 `ModuleContractMap`
   先覆盖已经完成 query 收敛的模块
7. 再改造 `invokeModule()`、`createModuleApi()`、`NeteaseCloudMusicApi`

这样推进的原因是：

- 先集中不安全边界，后收缩输入契约
- 先把基础类型地基打稳，再给程序化 API 加编译期约束
- 避免一上来就改 `ProgrammaticApi`，导致大范围类型连锁错误

---

## 四、Phase 6 的实施方案

### 4.1 第一阶段：收敛类型边界

目标：先把“宽泛类型散落”的问题集中治理。

任务：

1. 新增上游边界类型文件，集中管理允许保留的 `any`
2. 替换 `src/core/request.ts`、`src/types/index.ts`、`src/modules/api.ts` 等位置散落的 `Record<string, any>`
3. 约定：
   - 输入边界优先 `unknown` / 明确类型
   - 上游响应边界允许集中保留少量 `any`

完成标准：

- 不再出现无解释的显式 `any`
- `lint:full` 中与 `any` 相关的 warning 收敛到预期白名单范围

### 4.2 第二阶段：收缩模块 query 类型

目标：把模块输入边界从“全局兼容”收敛到“局部真实”。

任务：

1. 继续扩展 `src/types/modules.ts`
2. 先完成以下批次：
   - 高频基础模块
   - 登录模块
   - 上传模块
   - 聚合模块
3. 为剩余长尾模块建立“最小 query 类型”模板，避免继续直接复用 `LegacyModuleQuery`

完成标准：

- 高频与关键模块不再依赖 `LegacyModuleQuery`
- 长尾模块的 `LegacyModuleQuery` 使用范围持续下降

### 4.3 第三阶段：重建程序化 API 类型映射

目标：让程序化调用接口具备真正可消费的 TypeScript 体验。

任务：

1. 定义 `ModuleContractMap`
2. 改造 `ProgrammaticApi`、`invokeModule()`、`createModuleApi()` 的类型签名
3. 保持运行时动态装载不变，但在公共导出层提供编译期约束

完成标准：

- `invokeModule('search', ...)` 能推导 `search` 的 query 类型
- 非法模块标识在编译期报错
- 高频模块的程序化调用具有清晰提示

### 4.4 第四阶段：替换 `xml2js` 并收尾上传链路

目标：完成上传链路现代化。

任务：

1. 用轻量 XML 解析 helper 替换 `xml2js`
2. 更新上传链路测试
3. 写一份真实上传手工验证清单

完成标准：

- `xml2js` 已从依赖中移除
- 上传链路具备最小可信回归和手工验证说明

### 4.5 第五阶段：正式定稿 PAC 边界

目标：清理文档表述，结束 PAC 相关悬而未决状态。

任务：

1. 更新 README
2. 更新 `docs/remaining-debt.md`
3. 更新 `docs/architecture.md`

完成标准：

- PAC 不再被描述为“待恢复能力”
- 仓库对 PAC 的边界表述一致

---

## 五、非目标

以下事项不属于本轮收尾目标：

1. 不以“一次性为全部网易云响应建立精确 schema”为目标
2. 不把 PAC 代理能力重新拉回主线开发
3. 不为了追求极致类型美观而破坏当前已验证的旧行为兼容性
4. 不重写模块装载机制，只在类型层和边界层做收敛

---

## 六、验收口径

当 `Phase 6` 收尾完成后，项目应满足以下标准：

1. 服务可正常启动，主链路可实际调用网易云上游
2. `query` 输入边界达到“可类型化、可推导、可维护”
3. 程序化 API 具备模块标识和入参的编译期约束
4. `xml2js` 已移除
5. PAC 代理被明确记录为当前版本有意不支持
6. 仓库中不存在无解释、无约束、四处分散的 `any`

简化表述：

- **响应类型允许保守**
- **输入类型必须真实**
- **兼容层可以存在，但边界必须清楚**
- **低频边缘能力要做决策，不再长期挂账**
