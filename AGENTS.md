<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

# 工程规范 · Moonlight Memories

本文件是**本仓库**的工程约定。上面 Lovable 部分由平台维护，不要删除或改写。

## 1. 项目边界

- 本仓库独立：只服务 Moonlight Memories 一个产品，数据库、身份、部署都不与其他 Moonlight 项目共享。
- 唯一正式代码集成者：DeepSeek Harness（DSH）。其他 AI 平台产出的代码按第 8 节流程进入，不直接推送 `main`。
- 不要从其他项目复制业务代码、数据库结构或环境变量。

## 2. 技术栈约束（未经批准不要更换）

React 19 · TypeScript · TanStack Start + TanStack Router · Vite · Tailwind CSS 4 · Vitest。
Server 端能力统一走 **TanStack Start server functions**（`createServerFn`），不引入第二套后端框架，
不引入 ORM 之外的第二套数据访问层。保持 Lovable 的同步能力：构建入口、路由约定、`src/routes` 结构不要重写。

## 3. 提交前必跑

```sh
bun run verify        # lint → typecheck → test → build
```

四条全绿才允许开 PR。CI（`.github/workflows/ci.yml`）执行同一组检查，本地失败不要指望 CI 通过。

- lint 允许 warning（当前 7 条来自 `src/components/ui` 的 fast-refresh 提示），但**不允许 error**。
- 格式（Prettier）在 lint 中只作 warning：不要因空白差异阻塞合并，改完跑 `bun run format` 即可。

- 依赖：只用 `bun.lock` + `bun install --frozen-lockfile`；不要提交 `package-lock.json` / `yarn.lock`。
- 不要随手升级大版本依赖；确需升级单独开 PR 说明理由。
- 代码风格由 Prettier 决定（`.prettierrc`，printWidth 100）。改完代码跑 `bun run format`，不要手工对齐。

## 4. 代码约定

- TypeScript 严格模式 + `exactOptionalPropertyTypes` + `noUncheckedIndexedAccess`：索引访问要处理 `undefined`，可选字段不要赋 `undefined`（用 `delete` 或省略）。
- 路径别名 `@/*` → `src/*`。
- UI 与数据解耦：组件只依赖 `MemoriesRepository` 接口（`src/lib/memories/repository.ts`）。不要在组件里直接碰 `localStorage` / `fetch`，也不要在组件里复制领域校验逻辑。
- 领域规则写在 `src/lib/memories/*`，服务端可复用的校验不要依赖 `window`。
- `src/components/ui` 是生成的基础组件库，**保持原样**；新增页面不要为“以后可能用”而引入组件。
- 中文文案直接用中文标点；面向顾客的措辞避免承诺（例如“永久保存”“匿名不可追溯”）除非后端已保证。

## 5. 安全底线

- 不提交任何密钥、令牌、连接串、私钥：`.env*` 已在 `.gitignore` 中，示例只放 `.env.example`（空值或占位值）。
- 客户端代码里不得出现 `DATABASE_URL`、`SESSION_SECRET` 等服务端变量；TanStack Start 中只有 `createServerFn` / server-only 模块可读取。
- 后台（`/studio/*`）与个人页（`/account/*`）**不是**公开页面：新增这类路由同时加 `noindex`，但注意 `robots.txt` 与 meta `noindex` 只是提示，**不是访问控制**——真正的鉴权由 MEM-004 提供。
- 顾客提交的内容在展示前必须经过审核状态流转（`pending → approved`），前端过滤不等于安全边界。
- 任何 PII（联系方式、住址、证件号）都不得写入公开数据表。

## 6. 测试

- 新的领域规则或状态流转，先加 Vitest 用例（`src/test/*.test.ts(x)`）。
- 用例不依赖真实数据库和网络；当前用 `MockMemoriesRepository` + 清空 `localStorage` 隔离。
- 尚未实现的行为用 `it.todo(...)` 记录意图，**不要**为了让用例变绿而伪造功能或放宽断言。
- 测试环境缺失的浏览器 API 在 `src/test/setup.ts` 补齐（例如 `crypto.randomUUID`）。

## 7. Git 规则

- 从 `main` 拉分支，命名 `feat/…`、`fix/…`、`chore/…`、`docs/…`；一个 PR 只做一件事。
- 提交信息用祈使句、说明“为什么”（例：`fix(repository): drop stale rejectReason when approving`）。
- 禁止对已推送的 `main` 做 force push / rebase / amend / squash（会破坏 Lovable 侧历史）。
- 合并前必须：CI 绿、review 完成、`bun run verify` 本地通过。

## 8. 多平台代码交付

| 平台     | 交付内容                       | 进入本仓库的方式                                                        |
| -------- | ------------------------------ | ----------------------------------------------------------------------- |
| Lovable  | 主应用页面、顾客 H5、Studio UI | 直接同步到 `main`；合并前必须过 CI                                      |
| v0       | 视觉/组件/动效片段             | 以 patch 或 PR 提交，由 DSH 适配到 `src/components/memories` 与设计令牌 |
| Bolt.new | 独立玩法实验                   | 单独分支 + 独立 PR，禁止新建第二个后端或身份系统                        |
| Replit   | 后端/实时协作技术验证          | 只输出结论与可移植代码，不接管生产部署                                  |

统一要求：不新增第二套后端、不新增第二套身份系统、不引入与现有设计令牌冲突的颜色或字体。

## 9. 已知待办（进入 MEM-002 前）

- 数据仍在浏览器 `localStorage`：无后端、无数据库、无会话（MEM-002 / MEM-004）。
- `/studio/*` 无任何认证与授权。
- 审核与隐私过滤目前只在前端执行。
- 未知门店不抛 404，静默渲染空态。
