import React, { useState } from "react";
import "@copilotkit/react-ui/styles.css";
import "./style.css";

import {
  CopilotKit,
  useFrontendTool,
} from "@copilotkit/react-core";

import { CopilotChat } from "@copilotkit/react-ui";

const AgenticChat = () => {
  console.log('AgenticChat');
  return (
    <CopilotKit
      runtimeUrl={`/api/copilotkit/generative_ui_frontend_tools`}
      showDevConsole={false}
      agent="generative_ui_frontend_tools"
    >
      <Chat />
    </CopilotKit>
  );
};

const Chat = () => {
  const [background, setBackground] = useState<string>(
    ""
  );

  useFrontendTool({
    name: "change_background",
    description:
      "Change the background color of the chat. Can be anything that the CSS background attribute accepts.",
    parameters: [
      {
        name: "background",
        type: "string",
        description: "The background. Prefer gradients.",
      },
    ],
    handler: ({ background }) => {
      console.log('background', background);
      setBackground(background);
      return {
        status: "success",
        message: `Background changed to ${background}`,
      };
    },
  });

  return (
    <div style={{ height: '100vh' }}>
    <div
      className="flex justify-center items-center h-full w-full"
      data-testid="background-container"
      style={{ '--copilot-kit-background-color':background ? background : 'transparent' } as React.CSSProperties}
    >
      <div className="h-full w-full md:w-8/10 md:h-8/10 rounded-lg">
        <CopilotChat
          className="h-full rounded-2xl max-w-6xl mx-auto"
          labels={{ initial: "Hi, I'm an agent. Want to chat?" }}
          suggestions={[
            {
              title: "Change background",
              message: "Change the background to something new.",
            },
            {
              title: "Generate sonnet",
              message: "Write a short sonnet about AI.",
            },
          ]}
        />
      </div>
    </div>
    </div>
  );
};

export default AgenticChat;
