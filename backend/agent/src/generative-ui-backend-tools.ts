/**
 * A simple agentic chat flow using LangGraph instead of CrewAI.
 */

import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { Annotation, MessagesAnnotation, StateGraph, Command, START, END } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const AgentStateAnnotation = Annotation.Root({
  tools: Annotation<any[]>({
    reducer: (x, y) => y ?? x,
    default: () => []
  }),
  ...MessagesAnnotation.spec,
});

type AgentState = typeof AgentStateAnnotation.State;

const get_weather = tool( //定义和前端命名一致的工具
  (args) => {
    return `The weather for ${args.location} is 70 degrees.`;
  },
  {
    name: "get_weather",
    description: "Get the weather for a given location.",
    schema: z.object({
      location: z.string().describe("The location to get weather for"),
    }),
  }
);

async function chatNode(state: AgentState, config?: RunnableConfig) {
  /**
   * Standard chat node based on the ReAct design pattern. It handles:
   * - The model to use (and binds in CopilotKit actions and the tools defined above)
   * - The system prompt
   * - Getting a response from the model
   * - Handling tool calls
   *
   * For more about the ReAct design pattern, see: 
   * https://www.perplexity.ai/search/react-agents-NcXLQhreS0WDzpVaS4m9Cg
   */
  
  // 1. Define the model
  const baseURL = process.env.DEEPSEEK_BASE_URL;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  const model = new ChatOpenAI({
    configuration: {
      baseURL: baseURL,
      apiKey: apiKey,
    },
    model: "deepseek-chat",
    temperature: 0,
    presencePenalty: 0.5,
    frequencyPenalty: 0.5,
  })
  
  // Define config for the model
  if (!config) {
    config = { recursionLimit: 25 };
  }

  // 2. Bind the tools to the model
  const modelWithTools = model.bindTools(
    [
      ...state.tools,
      // your_tool_here
      get_weather,//绑定工具
    ],
    {
      // 2.1 Disable parallel tool calls to avoid race conditions,
      //     enable this for faster performance if you want to manage
      //     the complexity of running tool calls in parallel.
      parallel_tool_calls: false,
    }
  );

  // 3. Define the system message by which the chat model will be run
  const systemMessage = new SystemMessage({
    content: "You are a helpful assistant."
  });

  // 4. Run the model to generate a response
  const response = await modelWithTools.invoke([
    systemMessage,
    ...state.messages,
  ], config);

  // 6. We've handled all tool calls, so we can end the graph.
  return new Command({
    goto: END,
    update: {
      messages: [response]
    }
  })
}

// Define a new graph  
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chatNode)
  .addEdge(START, "chat_node");

// Compile the graph
export const agenticChatGraph = workflow.compile();