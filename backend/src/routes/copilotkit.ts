import express, { Router } from "express";
import { getEndpoint, getAvailableAgents } from "../runtime/runtime";

const router: Router = Router();

router.use(express.json({ limit: "10mb" }));

// 动态注册所有 agents 的路由
const availableAgents = getAvailableAgents();
availableAgents.forEach((agentName) => {
    console.log('agentName----------------------', agentName);
  const endpoint = getEndpoint(agentName);
  if (endpoint) {
    router.use(`/${agentName}`, endpoint);
  } else {
    console.warn(`Endpoint not found for agent: ${agentName}`);
  }
});

export default router;
