# Moonlight Memories

夜里的记忆馆：顾客扫码留下一句话或一封信，经过门店审核后成为店里公开的记忆墙；门店在 Studio 里审核内容、策展故事、配置玩法。

> 当前状态：**前端原型 + 本地演示数据**。没有生产后端、数据库、认证和权限，
> 所有数据只存在浏览器 `localStorage`。正式数据层从 MEM-002 开始建设。

## 技术栈

| 层       | 选型                                                                     |
| -------- | ------------------------------------------------------------------------ |
| 框架     | React 19 + TypeScript 5.8                                                |
| 应用框架 | TanStack Start 1.168 / TanStack Router 1.170（文件路由，SSR 能力已就绪） |
| 构建     | Vite 8（Nitro 输出，当前构建产物为 Cloudflare Worker 形态）              |
| 样式     | Tailwind CSS 4（`src/styles.css` 内的设计令牌）                          |
| 测试     | Vitest 4 + Testing Library + jsdom                                       |
| 质量     | ESLint 9（含 Prettier 规则）+ Prettier 3 + `tsc --noEmit`                |

## 快速开始

需要 Node.js 24 与 [Bun](https://bun.sh)（锁文件为 `bun.lock`）。

```sh
git clone <this-repository-url>
cd pixel-perfect-picture-0038
bun install --frozen-lockfile
bun run dev          # http://localhost:3000
```

没有 Bun 时可用 npm 安装依赖做临时验证，但**不要提交 `package-lock.json`**：`bun.lock` 是唯一锁文件。

```sh
npm install --no-package-lock   # 仅本地验证用
```

## 常用命令

| 命令                          | 作用                                                 |
| ----------------------------- | ---------------------------------------------------- |
| `bun run dev`                 | 开发服务器                                           |
| `bun run build`               | 生产构建（Nitro 输出到 `.output/`）                  |
| `bun run preview`             | 预览构建产物                                         |
| `bun run lint`                | ESLint（含格式检查）                                 |
| `bun run typecheck`           | `tsc --noEmit`                                       |
| `bun run test` / `test:watch` | Vitest 单次 / 监听                                   |
| `bun run format`              | Prettier 全量格式化                                  |
| `bun run verify`              | lint → typecheck → test → build 全链路（提交前必跑） |

## 目录结构

```
src/
  routes/                 文件路由（顾客端 /m/*、商家端 /studio/*、/account/memories）
  components/memories/    Memories 业务组件（投稿表单、卡片、状态徽章等）
  components/ui/          shadcn 风格基础组件（当前业务代码尚未使用）
  lib/memories/
    types.ts              领域类型（Venue / Story / Submission / VenueSettings）
    repository.ts         MemoriesRepository 接口 + MockMemoriesRepository（localStorage）
    mock-data.ts          演示门店、故事与投稿
  styles.css              设计令牌与工具类
  test/                   Vitest 用例与 setup
public/                   favicon、robots.txt
```

### 数据访问约定

UI **只依赖** `src/lib/memories/repository.ts` 导出的 `MemoriesRepository` 接口：

- 现在：`MockMemoriesRepository`，数据写进 `localStorage`，用于原型演示。
- 之后：`RemoteMemoriesRepository`，通过 TanStack Start server functions 访问服务端，密钥与权限留在服务端。
- 新增页面或组件时不要在组件里直接读写 `localStorage`，也不要新增第二套数据源。

## 配置与环境变量

环境变量清单见 [`.env.example`](.env.example)。真实 `.env*` 已被 `.gitignore` 忽略，**不要提交任何密钥**。
目前代码不会读取这些变量，它们为 MEM-002 起的服务端能力预留。

## 测试

```sh
bun run test
```

- `src/test/app-routing.test.tsx`：路由表可匹配根路由。
- `src/test/memories-repository.test.ts`：投稿校验、状态流转、审核流程、撤回、空数据与未知门店、门店设置。

新增业务规则时先补测试再改实现；暂不支持的行为用 `it.todo` 记录，不要为了通过测试伪造功能。

## 与 Lovable 的协作

本仓库与 Lovable 编辑器同步：

- 推送 `main` 会同步回 Lovable，任何进入 `main` 的提交都必须能通过 `bun run verify`。
- **不要**改写已推送的历史（force push / rebase / amend / squash 已推送的提交）。
- 其他 AI 平台（v0 / Bolt / Replit）产出的代码以 PR 形式进入，由 DSH 复核后再合并。

## 文档

- 工程规范与协作规则：[`AGENTS.md`](AGENTS.md)
- 架构审计与后续计划：MEM-000 / MEM-001A 报告（由技术负责人维护）
