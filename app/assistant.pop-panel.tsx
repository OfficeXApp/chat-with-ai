// app/assistant.pop-panel.tsx

"use client";

import {
  AssistantRuntimeProvider,
  ChatModelAdapter,
  ThreadMessage,
  useLocalRuntime,
  useThread,
} from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
} from "@assistant-ui/react";
import { useEffect } from "react";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { serializeMessages } from "@/helpers/history";

export const AssistantPopPanel = ({
  convoID,
  apiKey,
  initialHistory,
}: {
  convoID: string;
  apiKey: string;
  initialHistory: ThreadMessage[];
}) => {
  const modelAdapter: ChatModelAdapter = {
    async run({ messages, abortSignal }) {
      // Create Google AI instance with API key
      const google = createGoogleGenerativeAI({
        apiKey: apiKey,
      });

      // Convert ThreadMessage[] to CoreMessage[] format
      const coreMessages = messages.map((message) => ({
        role: message.role,
        content: message.content.map((part) => {
          if (part.type === "text") {
            return { type: "text" as const, text: part.text };
          }
          if (part.type === "image") {
            return {
              type: "image" as const,
              image: part.image, // URL or base64
            };
          }
          if (part.type === "file") {
            // Convert file attachments to text for now
            return {
              type: "text" as const,
              // @ts-ignore
              text: `[File: ${part.file?.name}]`,
            };
          }
          // Handle other content types if needed
          return part;
        }),
      }));

      const result = await generateText({
        model: google("gemini-2.5-flash"),
        // @ts-ignore
        messages: coreMessages,
        abortSignal,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: result.text,
          },
        ],
      };
    },
  };

  const runtime = useLocalRuntime(modelAdapter, {
    initialMessages: initialHistory || [],
    adapters: {
      attachments: new CompositeAttachmentAdapter([
        new SimpleImageAttachmentAdapter(),
        new SimpleTextAttachmentAdapter(),
      ]),
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AssistantThreadContent convoID={convoID} />
        </SidebarInset>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};

const AssistantThreadContent = ({ convoID }: { convoID: string }) => {
  const { messages } = useThread();

  useEffect(() => {
    if (messages.length > 0) {
      // Serialize messages
      const serialized = serializeMessages(messages as ThreadMessage[]);
      // Convert to JSON string
      const jsonString = JSON.stringify(serialized, null, 2);

      // @ts-ignore
      window.penpalParent?.saveHistory(convoID, jsonString);
    }
  }, [messages]);

  return <Thread />;
};
