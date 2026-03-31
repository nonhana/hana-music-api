# Phase 7 本地 Demo UI 重建方案（Hono + Bun + TypeScript）

> 最后校准日期：2026-03-31  
> 本文档用于为后续 LLM 或开发者提供一份“读完即可直接开工”的执行说明。  
> 它不再讨论是否保留旧 `public/` 目录，而是基于已经确认的决策，直接说明：
>
> 1. 旧 `public/` 为什么要被完整移除
> 2. 新的本地 Demo UI 应该如何落在当前仓库里
> 3. 为什么本期选择 `Hono + Bun + TypeScript` 原生方案，而不是再引入一套独立前端栈
> 4. 后续接手时应该先改哪些文件、按什么顺序推进、如何验证

## 一、已确认决策

本节内容视为已冻结结论，后续实现默认不再重新讨论。

### 1.1 目录层面的冻结决策

1. 旧 `public/` 目录将被**完整、彻底移除**。
2. 不再保留“旧 HTML 页面 + 静态目录兜底”的兼容模式。
3. 本地调试 UI 将由新的 `/demo/*` 路由体系承接，而不是继续依赖静态文件托管。
4. 文档站与本地 Demo UI 明确分离：
   - `docs/` 继续承担可部署文档职责
   - `/demo/*` 仅服务于本地调试与开发验证

### 1.2 技术选型层面的冻结决策

1. 新 Demo UI 本期**不引入 React / Vue / Vite 独立前端工程**。
2. 新 Demo UI 统一采用当前仓库主技术栈的延伸实现：
   - `Bun`
   - `Hono`
   - `TypeScript`
   - `hono/jsx-renderer`
   - `hono/jsx`
   - 必要时局部使用 `hono/jsx/dom`
3. UI 风格以“**贴近 VitePress 原生简洁风**”为目标：
   - 轻量
   - 留白充分
   - 卡片式入口
   - 低视觉噪音
   - 不做后台管理系统风格
   - 不做重交互 SPA 风格

### 1.3 运行方式层面的冻结决策

1. 继续保持 `bun dev` 为**单命令、单进程**本地开发入口。
2. 启动后应同时具备：
   - 原有 API 服务能力
   - `/demo/*` 本地 UI 访问能力
3. 不新增第二个本地前端 dev server，也不要求并行启动额外进程。

## 二、当前仓库真实状态

### 2.1 当前服务层现状

截至当前版本：

1. `src/app/cli.ts` 已负责 Bun 服务启动。
2. `src/server/create-server.ts` 已负责创建 Hono 实例、注册基础路由、模块路由和静态路由。
3. `src/server/static.ts` 当前仍承担旧 `public/` 的静态托管能力。
4. `CreateServerOptions` 仍保留 `publicDirectory` 配置项，服务层仍可将静态目录暴露出去。
5. `tests/server.test.ts` 中仍存在静态资源托管相关测试。

### 2.2 当前文档现状

当前文档基线已经具备较强的可交接性，但仍默认把 `public/` 视为历史兼容层：

- `README.md` 仍提到旧静态资源由根目录 `public/` 提供
- `docs/architecture.md` 仍把 `public` 和 `src/server/static.ts` 记为现有架构组成部分
- `docs/migration-notes.md` 仍把旧静态资源页面视为“已迁入但未逐页回归”的历史资产
- `PLAN.md` 仍包含更早期的迁移描述，可作为历史参考，但不应继续作为新一轮 Demo UI 重建的行动依据

### 2.3 旧 `public/` 页面复杂度现状

旧 Demo 页面并不处于同一复杂度层级，应区别处理：

| 类别                | 代表页面                                                  | 当前判断                                    |
| ------------------- | --------------------------------------------------------- | ------------------------------------------- |
| 纯入口/导航类       | `index.html`                                              | 直接重建为新 `/demo` 首页                   |
| 简单表单/简单请求类 | `api.html`、`home.html`                                   | 适合首轮以 Hono JSX 重建                    |
| 登录轮询类          | `qrlogin.html`、`qrlogin-nocookie.html`                   | 适合用局部客户端组件重建                    |
| 上传类              | `avatar_update.html`、`playlist_cover_update.html`        | 适合用 SSR 页面 + `FormData` 客户端增强重建 |
| 中高复杂度表单类    | `playlist_import.html`、`cloud.html`、`voice_upload.html` | 进入第二阶段                                |
| 重浏览器能力类      | `audio_match_demo/`                                       | 单独列为实验性页面，最后处理                |
| 实时协作类          | `listen_together_host.html`                               | 单独列为高复杂度页面，后置                  |

这意味着：

- 旧 `public/` 必须删，但**不应以“逐页 1:1 静态复刻”作为实现目标**。
- 新 Demo UI 应该先建立统一的信息架构，再按复杂度分层迁移功能。

## 三、Phase 7 的目标形态

### 3.1 总目标

在 `hana-music-api` 仓库内部建立一个**现代化、本地专用、由 Hono 原生驱动的 Demo UI 子系统**，替代旧 `public/` 目录的全部调试页承载职责。

### 3.2 目标体验

启动 `bun dev` 后，开发者应能获得如下体验：

1. 通过 `/demo` 进入统一入口页。
2. 在统一导航下进入：
   - 请求调试
   - 登录调试
   - 上传调试
   - 实验性页面
3. 所有页面都具备一致的 UI 风格与信息布局。
4. 复杂交互仅在必要局部使用客户端组件，不把整个 Demo UI 演变为另一套前端工程。
5. API 路由仍由现有模块系统继续提供，Demo UI 只是更现代的本地调试壳层。

### 3.3 非目标

以下事项明确不属于本期目标：

1. 不把 Demo UI 做成独立部署站点。
2. 不把 Demo UI 与 `docs/` 合并。
3. 不把 Demo UI 做成完整 SPA。
4. 不追求首轮覆盖全部旧页面的完整交互能力。
5. 不为了 Demo UI 重建而引入第二套构建链与 dev server。

## 四、推荐实现形态

### 4.1 目录建议

推荐在 `src/` 下新增独立的 Demo 子系统，而不是新建仓外项目，也不是把页面散落到 `src/server/` 中。

建议目标结构如下：

- `src/demo/`
  - `components/`：通用展示组件
  - `layouts/`：Demo 统一布局、导航、页面壳
  - `pages/`：各页面的服务端 JSX 组件
  - `client/`：局部客户端组件与 hydration 入口
  - `styles/`：主题变量、极简样式、布局样式
  - `registry.ts`：Demo 页面注册表与分组配置
- `src/server/demo-routes.ts`
  - 负责 `/demo/*` 路由注册
  - 把请求映射到 `src/demo/pages/*`

### 4.2 路由建议

新路由统一使用 `/demo/*` 前缀，避免与模块 API 路径混杂。

建议最小路由集合：

- `/demo`
- `/demo/api-debug`
- `/demo/search`
- `/demo/qr-login`
- `/demo/upload/playlist-cover`
- `/demo/experiments/audio-match`（后置）

原则：

1. Demo UI 使用明确的路径命名，而不是继续复刻旧 HTML 文件名。
2. 不再保留 `/qrlogin.html`、`/voice_upload.html` 这类历史路径。
3. 如果文档站仍需引用 Demo，应引用新 `/demo/*` 路径，而不是旧页面名。

### 4.3 技术实现建议

#### 服务端层

1. 使用 `hono/jsx-renderer` 作为 Demo Layout 中间件。
2. 使用 `hono/jsx` 渲染服务端页面。
3. 通过 Demo 页面注册表统一管理页面标题、分组、说明与路由元信息。
4. 页面尽可能直接复用现有模块 API，而不是在 Demo 层复制业务逻辑。

#### 客户端层

1. 仅在以下场景使用 `hono/jsx/dom`：
   - 轮询
   - 局部表单状态切换
   - 上传状态显示
   - JSON 结果格式化与交互增强
2. 不做全站 hydration。
3. 不引入全局客户端状态管理。
4. 单个页面如出现大量浏览器能力依赖，应单独隔离为实验页，而不是拖重整体基线。

#### 样式层

1. 使用轻量 CSS 方案实现 VitePress 风格：
   - 简洁的排版节奏
   - 明确的标题层级
   - 柔和分割线和卡片边框
   - 中性色为主、少量主题色点缀
2. 不使用大型 UI 组件库。
3. 样式应服务于“本地调试工具”，而不是营销型 landing page。

## 五、推荐页面迁移分期

### 5.1 第一阶段：建立新的 Demo 壳层（P0）

目标：先让 `/demo` 真正可用，并建立统一结构。

应交付：

1. Demo 首页
2. Demo 统一 Layout
3. 页面注册表
4. Demo 路由注册
5. 一套稳定的基础样式

验收标准：

- `bun dev` 启动后可访问 `/demo`
- 页面风格统一
- 已能从首页进入各占位页或首发页

### 5.2 第二阶段：首批高价值页面（P0）

首批建议只做最有价值、且不会把技术栈一下拖重的页面：

1. `api.html` → `/demo/api-debug`
2. `home.html` 或其核心能力 → `/demo/search` 或 `/demo/home-snapshot`
3. `qrlogin.html` / `qrlogin-nocookie.html` → `/demo/qr-login`
4. `playlist_cover_update.html` 或 `avatar_update.html` → 一个代表性上传页

验收标准：

- 首批页面能覆盖“调试入口、接口调试、登录轮询、上传”四类代表场景
- 页面实现全部基于 Hono + Bun + TypeScript
- 不再依赖旧静态 HTML 文件

### 5.3 第三阶段：中复杂度页面（P1）

进入第二批处理的页面：

1. `voice_upload.html`
2. `cloud.html`
3. `playlist_import.html`

策略：

- 继续使用当前 Demo 技术栈
- 若单页交互明显变重，可在页面内部增加更多客户端组件，但不升级整体架构

### 5.4 第四阶段：高复杂度实验页（P2）

最后处理：

1. `audio_match_demo/`
2. `listen_together_host.html`

判断规则：

- 如果该类页面只是低频实验能力，可单独收纳到 `/demo/experiments/*`
- 如果实现成本远高于价值，可以暂时不纳入首轮重建，但旧 `public/` 仍需移除，届时应在文档中明确“该实验页尚未回归”而不是继续保留旧资产

## 六、代码与文档改造清单

### 6.1 必改代码文件

1. `src/server/create-server.ts`
   - 移除旧静态资源注册
   - 插入新的 Demo 路由注册
2. `src/server/static.ts`
   - 整体删除
3. `src/types/server.ts`
   - 移除 `publicDirectory` 配置项
4. `tests/server.test.ts`
   - 删除静态资源托管测试
   - 新增 `/demo/*` 相关测试
5. `.oxlintrc.json`
   - 移除对 `public/` 的 ignore

### 6.2 新增代码文件

推荐新增：

1. `src/server/demo-routes.ts`
2. `src/demo/registry.ts`
3. `src/demo/layouts/demo-layout.tsx`
4. `src/demo/pages/demo-index.tsx`
5. `src/demo/pages/api-debug.tsx`
6. `src/demo/pages/qr-login.tsx`
7. `src/demo/pages/upload-playlist-cover.tsx`
8. `src/demo/client/*`
9. `src/demo/styles/*`

### 6.3 必改文档文件

1. `README.md`
   - 移除对 `public/` 静态目录的旧描述
   - 增加 `/demo` 的本地调试说明
2. `docs/architecture.md`
   - 删除 `public` 与 `src/server/static.ts` 的现行职责描述
   - 新增 Demo 子系统职责说明
3. `docs/migration-notes.md`
   - 把旧静态资源迁入说明更新为“已废弃并进入新 Demo UI 重建”
4. `docs/phase-6-finalization-plan.md`
   - 可在文末加入“后续本地 Demo UI 方向见新计划文档”式引导
5. `docs/` 中引用旧 HTML Demo 的页面
   - 后续统一改链到新的 `/demo/*` 页面，或改为示例代码

### 6.4 新增计划文档

建议新增目标文件：

- `docs/phase-7-demo-ui-modernization-plan.md`

该文件即为当前文档应当最终落盘的位置。

## 七、实施顺序

### Phase 7-A：先替换基础设施

1. 新建 Demo 路由与 Demo 目录骨架
2. 在服务层注册 `/demo/*`
3. 用新 Demo 首页替代旧 `public/index.html` 的入口职责
4. 删除 `src/server/static.ts` 与相关配置
5. 删除 `public/` 目录

此阶段完成标准：

- 旧 `public/` 已不再参与运行时
- `/demo` 已可访问
- API 服务不受影响

### Phase 7-B：完成首批页面

1. 落地最小统一样式
2. 完成首批 3~4 个页面
3. 建立客户端局部增强模式
4. 为每页补最小验证

此阶段完成标准：

- 开发者已有可用的新本地调试入口
- 旧静态页已彻底退出主线

### Phase 7-C：完成文档切换

1. 更新 README
2. 更新 architecture
3. 更新 migration-notes
4. 更新 docs 中的旧 Demo 引用
5. 增加变更说明与迁移提示

此阶段完成标准：

- 仓库文档不再把 `public/` 视为现行方案
- 新接手者不会再被旧文档误导

### Phase 7-D：处理长尾与实验页

1. 评估并实现 `voice_upload` / `cloud` / `playlist_import`
2. 单独处理 `audio_match_demo`
3. 评估 `listen_together_host` 是否继续保留为本地实验页

此阶段完成标准：

- Demo 子系统覆盖高价值调试场景
- 剩余实验页状态在文档中可追踪

## 八、风险与取舍

### 8.1 当前推荐方案的优势

1. 技术栈统一，不引入第二套前端体系。
2. 与现有 Bun + Hono 服务壳天然一致。
3. 保持 `bun dev` 的单命令体验。
4. 代码、样式、路由、测试都可纳入同一仓库主线。
5. 更符合“本地调试工具”而不是“独立前端产品”的定位。

### 8.2 当前推荐方案的代价

1. Demo 页面不能直接套用成熟前端生态组件库。
2. 中高复杂度页面的客户端交互需要自己控制复杂度。
3. `audio_match_demo` 这类重浏览器页面实现难度仍然较高。

### 8.3 为什么本期仍不推荐独立前端栈

原因不是“独立前端栈做不到”，而是“当前阶段收益不够高”：

1. 它会打破单进程单命令目标。
2. 会引入新的构建链、代理、脚本与依赖管理成本。
3. 首发页面其实并没有复杂到必须使用完整 SPA。
4. 当前更需要的是“统一入口 + 更现代的调试体验”，而不是“做第二个产品前端”。

## 九、验证口径

### 9.1 工程验证

后续每一轮实现都至少应运行：

1. `bun test`
2. `bun run typecheck`
3. `bun run lint:full`

### 9.2 路由验证

至少验证：

1. `/demo`
2. `/demo/api-debug`
3. `/demo/qr-login`
4. `/health`
5. `/search`

目标是证明：

- Demo 路由正常工作
- 现有 API 路由没有被覆盖
- 彻底删除 `public/` 后服务仍正常启动

### 9.3 体验验证

至少做一轮手工验证：

1. Demo 首页导航
2. 一个基础 API 调试页
3. 一个二维码登录页
4. 一个上传页

目标是证明：

- 新 UI 已经足以替代旧 HTML 调试页的“入口价值”
- 首发调试体验已经明显优于旧静态页集合

## 十、后续接手时的第一轮动作

如果你是下一位接手的 LLM 或开发者，建议严格按下面顺序开工：

1. 阅读本文档。
2. 阅读：
   - `src/server/create-server.ts`
   - `src/server/static.ts`
   - `src/types/server.ts`
   - `tests/server.test.ts`
   - `docs/architecture.md`
   - `README.md`
3. 新建 `src/server/demo-routes.ts` 和 `src/demo/` 目录骨架。
4. 先接入 `/demo` 首页，不要一开始就做复杂页面。
5. 删除静态资源注册链路与 `publicDirectory` 类型配置。
6. 删除旧 `public/` 目录。
7. 先补 `/demo` 相关测试，再做首批页面。
8. 最后统一更新文档。

## 十一、收尾判断标准

当本计划完成到“可交接状态”时，仓库应满足：

1. 旧 `public/` 已彻底移除。
2. `src/server/static.ts` 已删除。
3. `CreateServerOptions` 不再暴露 `publicDirectory`。
4. `/demo/*` 已成为唯一的本地调试 UI 入口。
5. README、architecture、migration-notes 已完成切换。
6. 首批高价值页面已可用。
7. 工程校验继续通过。

简化后的判断语句是：

- **旧静态页退出主线**
- **新 Demo UI 进入主线**
- **技术栈统一到 Hono + Bun + TypeScript**
- **文档与实现不再互相打架**
