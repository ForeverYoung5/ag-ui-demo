import React from "react";
import { useParams } from "react-router-dom";
import GenerativeUIFrontendTools from "./components/generative_ui_frontend_tools/generative_ui_frontend_tools";
import GenerativeUIBackendTools from "./components/generative_ui_backend_tools/index";
import AgentState from "./components/agent_state";
import HumanInTheLoop from "./components/human_in_the_loop";

const agentComponents: Record<string, React.ComponentType> = {
  generative_ui_frontend_tools: GenerativeUIFrontendTools,
  generative_ui_backend_tools: GenerativeUIBackendTools,
  agent_state:AgentState,
  human_in_the_loop:HumanInTheLoop
};

const Index = () => {
  const { agent } = useParams<{ agent?: string }>();
  
  const agentName = agent || "generative_ui_frontend_tools";
  
  const AgentComponent = agentComponents[agentName];
  
  if (!AgentComponent) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Agent not found</h1>
        <p>Agent "{agentName}" is not available.</p>
        <p>Available agents: {Object.keys(agentComponents).join(", ")}</p>
        <p style={{ marginTop: "1rem" }}>
          <a href="/">Go to home</a> or <a href="/copilotkit/generative_ui_frontend_tools">Try default agent</a>
        </p>
      </div>
    );
  }
  
  return <AgentComponent />;
};

export default Index;

