/**
 * A simple agentic chat flow using LangGraph instead of CrewAI.
 */

import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { Annotation, MessagesAnnotation, StateGraph, Command, START, END } from "@langchain/langgraph";

const AgentStateAnnotation = Annotation.Root({
  tools: Annotation<any[]>({
    reducer: (x, y) => y ?? x,
    default: () => []
  }),
  ...MessagesAnnotation.spec,
});

type AgentState = typeof AgentStateAnnotation.State;

async function chatNode(state: AgentState, config?: RunnableConfig) {
  
  // 1. Define the model
  const baseURL = process.env.QWEN_BASE_URL;
  const apiKey = process.env.QWEN_API_KEY;
  
  const model = new ChatOpenAI({
    configuration: {
      baseURL: baseURL,
      apiKey: apiKey,
    },
    model: "qwen-plus-0428",
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
    ],
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
  console.log('state---------------',state)
  console.log('response----------------------', response);

  // 5. Handle tool calls - if tool_calls is empty but tool_call_chunks exists, build tool_calls from chunks
  let finalResponse: any = response;
  
  if ((!response.tool_calls || response.tool_calls.length === 0) && 
      response.tool_call_chunks && response.tool_call_chunks.length > 0) {
    // Build tool_calls from tool_call_chunks
    const toolCallsMap = new Map<string, any>();
    
    for (const chunk of response.tool_call_chunks) {
      const id = chunk.id || '';
      if (!toolCallsMap.has(id)) {
        toolCallsMap.set(id, {
          id: id,
          name: chunk.name || '',
          args: '',
          type: 'function'
        });
      }
      
      const toolCall = toolCallsMap.get(id)!;
      if (chunk.args) {
        toolCall.args = (toolCall.args || '') + chunk.args;
      }
      if (chunk.name && !toolCall.name) {
        toolCall.name = chunk.name;
      }
    }
    
    // Parse args JSON strings
    const toolCalls = Array.from(toolCallsMap.values()).map(tc => {
      try {
        return {
          ...tc,
          args: tc.args ? JSON.parse(tc.args) : {}
        };
      } catch (e) {
        console.error('Error parsing tool call args:', e, tc.args);
        return {
          ...tc,
          args: {}
        };
      }
    });
    
    // Convert chunk to AIMessage if needed, or create new AIMessage
    if ('toAIMessage' in response && typeof response.toAIMessage === 'function') {
      finalResponse = response.toAIMessage();
      finalResponse.tool_calls = toolCalls;
    } else {
      // Create a new AIMessage with the built tool_calls
      finalResponse = new AIMessage({
        content: response.content,
        tool_calls: toolCalls,
        additional_kwargs: response.additional_kwargs,
        response_metadata: response.response_metadata,
      });
    }
    
    console.log('Built tool_calls from chunks:', toolCalls);
  }
  
  // 6. Check if there are tool calls and create tool messages
  const hasToolCalls = finalResponse.tool_calls && finalResponse.tool_calls.length > 0;
  const messagesToAdd = [finalResponse];
  
  if (hasToolCalls) {
    console.log('Tool calls detected:', finalResponse.tool_calls);
    
    // Create tool messages for each tool call
    // For frontend tools, CopilotKit will handle execution on the frontend,
    // but we still need to return tool messages to satisfy the API requirements
    const toolMessages = finalResponse.tool_calls.map((toolCall: any) => {
      // tool_call_id must match the id from the tool_call
      const toolCallId = toolCall.id || toolCall.tool_call_id || `call_${toolCall.name}_${Date.now()}`;
      
      console.log(`Creating tool message for tool_call_id: ${toolCallId}, tool: ${toolCall.name}`);
      
      return new ToolMessage({
        content: JSON.stringify({ 
          status: "success", 
          message: `Tool ${toolCall.name} executed successfully on the frontend.` 
        }),
        tool_call_id: toolCallId,
      });
    });
    
    messagesToAdd.push(...toolMessages);
  }

  // 7. Return the response with tool messages if any
  return new Command({
    goto: END,
    update: {
      messages: messagesToAdd
    }
  })
}

// Define a new graph  
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chatNode)
  .addEdge(START, "chat_node");

// Compile the graph
export const agenticChatGraph = workflow.compile();