## 项目简介

该仓库同时包含 React 前端、Node.js/Express 后端以及 LangGraph Agent 服务，演示如何把多代理（frontend/backend tools、agent state、human-in-the-loop 等）通过 CopilotKit 集成到可视化界面中。前端负责渲染不同 agent 组件并与 CopilotKit 前端 SDK 交互，后端负责统一路由、环境配置、与 LangGraph 运行时对接，agent 子项目则托管具体的 LangGraph 流程。

## 目录结构

```
.
├─frontend/             # Vite + React + shadcn UI 前端
├─backend/              # Express API + CopilotKit Runtime
│  └─agent/             # LangGraph CLI 项目，定义多代理工作流
└─README.md
```

## 依赖要求

- Node.js 18+（前后端及 LangGraph CLI 均已在 LTS 版本验证）
- pnpm 9+（推荐，亦可使用 npm，但脚本示例默认 pnpm）
- 可选：本地安装 LangGraph CLI（若不走 `npm run dev:agent`）

## 环境变量

在 `backend/.env` 创建配置文件，常用键如下：

| 变量 | 作用 |
| --- | --- |
| `PORT` | 后端服务端口，默认 `3001` |
| `FRONTEND_URL` | 允许的前端来源，默认 `http://localhost:5173` |
| `TENCENT_SECRET_ID` / `TENCENT_SECRET_KEY` | 腾讯混元调用凭据。缺省时自动进入 mock 模式 |
| `MOCK_MODE` | `true/false`，覆盖自动 mock 判断 |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Supabase 相关集成可选 |
| `LOG_LEVEL`、`CORS_ENABLED` | 运行日志与 CORS 控制 |

配置加载逻辑位于 `backend/src/config/index.ts`，启动时会校验必填项并打印当前状态。

## 快速开始

1. **安装依赖**

分别进入 `frontend`、`backend`、`backend/agent` 执行 `pnpm install`。

2. **启动 LangGraph Agent（可选但推荐）**
   ```bash
   cd backend
   npm run dev:agent    # 实际执行 @langchain/langgraph-cli dev --port 8123
   ```

3. **启动后端**
   ```bash
   cd backend
   pnpm dev             # nodemon 监控 src/index.ts
   ```

4. **启动前端**
   ```bash
   cd frontend
   pnpm dev             # 默认在 http://localhost:5173
   ```

前端会根据访问路径（如 `/copilotkit/generative_ui_backend_tools`）渲染对应的 agent 组件，并通过 CopilotKit 与后端建立会话。

## 常用脚本速查

| 位置 | 命令 | 描述 |
| --- | --- | --- |
| `/frontend` | `pnpm dev` / `pnpm build` / `pnpm preview` | Vite 开发、构建与本地预览 |
| `/frontend` | `pnpm lint` | 运行 ESLint（含 React Hooks/Refresh 规则） |
| `/backend` | `pnpm dev` / `pnpm start` | 开发与生产启动 |
| `/backend` | `pnpm build` | TypeScript 编译到 `dist/` |
| `/backend` | `pnpm dev:agent` | 启动 LangGraph CLI 服务 |

## 功能亮点

- **多 Agent 面板**：`frontend/src/pages/Index` 动态映射路由到 `generative_ui_frontend_tools`、`generative_ui_backend_tools`、`agent_state`、`human_in_the_loop` 等组件，可用于展示不同能力或人机协作流程。
- **CopilotKit 全链路**：前端集成 `@copilotkit/react-core` / `react-ui`，后端搭配 `@copilotkit/backend` + `@copilotkit/runtime`，便于扩展工具调用、上下文记忆等能力。
- **配置即服务**：`backend/src/config` 通过函数式封装统一处理环境变量、mock 模式与第三方服务状态，启动即校验，降低部署踩坑。
- **LangGraph 扩展性**：`backend/agent/src` 内可自定义复杂的 LangGraph 流程，通过后端 `runtime` 自动挂载到 `/copilotkit/:agentName` 路径。

## 技术栈

- 前端：Vite、React 18、TypeScript、shadcn/ui、Tailwind CSS、Radix UI
- 后端：Node.js、Express 5、TypeScript、CopilotKit Runtime、LangChain/LangGraph
- 其他：Supabase（可选）、腾讯混元/多模型、pnpm 工作区

## FAQ

- **能否只启动前端？** 可以，界面会加载但与后端交互会失败；建议至少同时开启后端。
- **LangGraph 服务一定要单独跑吗？** 默认脚本独立运行，方便热重载。若部署可将其托管在同一进程或远程服务，只需调整后端连接。
- **为什么推荐 pnpm？** 当前仓库为多 package 结构，pnpm 可复用依赖目录并显著加速安装；若使用 npm/yarn，需要分别进入三个目录安装依赖。