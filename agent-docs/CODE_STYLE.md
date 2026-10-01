# 编码约定

在编辑 TypeScript、Effect、生成文件、测试 kit 或格式配置前阅读本文件。

## 通用规则

- 改动范围限于当前需求；不要顺手重排、重命名，或为范围外的情况增加防御性 fallback。
- 单一调用者不抽取 helper、class 或 interface；只有至少三个调用者需要同一抽象时才抽取。
- 优先使用已有的框架能力、已安装依赖、领域工具和现有模块，不为同一能力新增一层实现。
- 新增工具函数前先搜索现有实现；被多个文件复用的工具应归入所属领域模块或共享工具目录。
- TypeScript 类型可以由代码可靠推断时，不重复声明；真正的公开边界和跨模块合同仍保留显式类型。
- 除非确有必要，函数定义优先使用箭头函数。
- 代码是唯一事实来源；注释只说明代码无法表达的时序合同、跨模块政策、不变量、陷阱或 fixture 意图，不重复描述名称和参数。注释保持为一句完整的话，只有业务意图无法压缩时才使用多行说明。

## TypeScript 与工具

- `tsconfig.json` 开启严格模式、`noUncheckedIndexedAccess`、`noImplicitOverride`、未使用检查和 ESNext；保持显式类型边界，不用未经说明的 `any`。
- 格式化使用 Oxfmt，检查使用 Oxlint；不要引入 ESLint 或 Prettier 的配置和命令。
- 使用单引号、两格缩进、分号、尾随逗号和 80 列宽；导入顺序由 `oxfmt.config.ts` 管理，类型导入遵循 Oxlint 规则。
- 不使用单字母变量名；保持局部数据流清楚，优先纯函数和不可变值。

## Effect 与请求代码

模块构造 Effect 工作，不在构造阶段发送请求；所有网络能力来自 `RequestCapability`。除公共运行时边界、服务准入和测试 kit 外，不直接调用 `Effect.runPromise`。

## 生成与安全

- 模块表面、SDK registry、client 和具名 API 文件由 `bun run types:modules:generate` 生成；修改模块合同后先生成，再运行 `bun run types:modules:check`。
- 不手工修改 `.codegraph/`、`.omx/`、`node_modules/` 或 `dist/` 中的生成产物；不要把令牌、Cookie 或真实上游凭据写入仓库。
- 不提交、推送或发布，除非用户明确授权；提交时使用项目既有的 Conventional Commits 约定。

相关配置：`tsconfig.json`、`oxlint.config.ts`、`oxfmt.config.ts`、`scripts/gen-module-types.mts`。
