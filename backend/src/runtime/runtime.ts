import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  LangGraphAgent,
  copilotRuntimeNodeExpressEndpoint,
} from "@copilotkit/runtime";
import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

const serviceAdapter = new ExperimentalEmptyAdapter();

// 从 langgraph.json 读取所有定义的 graphs
function getAvailableGraphs(): string[] {
  try {
    const langgraphConfigPath = path.join(
      __dirname,
      "../../agent/langgraph.json"
    );
    const config = JSON.parse(fs.readFileSync(langgraphConfigPath, "utf-8"));
    return Object.keys(config.graphs || {});
  } catch (error) {
    console.error("Error reading langgraph.json:", error);
    // 返回默认的 graphs
    return [];
  }
}

// 动态创建所有 agents
function createAgents(): Record<string, LangGraphAgent> {
  const graphs = getAvailableGraphs();
  const agents: Record<string, LangGraphAgent> = {};

  graphs.forEach((graphId) => {
    console.log('graphId----',graphId)
    agents[graphId] = new LangGraphAgent({
      deploymentUrl:
        process.env.LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8123",
      graphId: graphId,
      langsmithApiKey: process.env.LANGSMITH_API_KEY || "",
    });
  });

  return agents;
}

// 创建 runtime，包含所有 agents
const runtime = new CopilotRuntime({
  agents: createAgents(),
});

// 创建 endpoints 映射
const endpoints: Record<string, any> = {};

// 为每个 agent 创建对应的 endpoint
function createEndpoints() {
  const graphs = getAvailableGraphs();
  
  graphs.forEach((graphId) => {
    const endpointPath = `/api/copilotkit/${graphId}`;
    endpoints[graphId] = copilotRuntimeNodeExpressEndpoint({
      runtime,
      serviceAdapter,
      endpoint: endpointPath,
    });
  });
}

createEndpoints();

// 根据 agent 名称获取对应的 endpoint
export function getEndpoint(agentName: string) {
  return endpoints[agentName];
}

// 获取所有可用的 agents
export function getAvailableAgents(): string[] {
  return Object.keys(endpoints);
}

// 默认导出：创建一个中间件函数，根据路径动态选择 endpoint
export default function copilotkitEndpointMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 从路径中提取 agent 名称
  // 路径格式: /api/copilotkit/:agentName
  const pathParts = req.path.split("/");
  const agentName = pathParts[pathParts.length - 1];

  const endpoint = getEndpoint(agentName);

  if (!endpoint) {
    return res.status(404).json({
      error: `Agent "${agentName}" not found`,
      availableAgents: getAvailableAgents(),
    });
  }

  // 调用对应的 endpoint
  return endpoint(req, res, next);
}
