// app/page.tsx

"use client";

import { useEffect, useState } from "react";
import { Assistant } from "./assistant";
import { AssistantPopPanel } from "./assistant.pop-panel";
import { connect, Methods, RemoteProxy, WindowMessenger } from "penpal";
import { ThreadMessage } from "@assistant-ui/react";
import { useSearchParams } from "next/navigation";

export const serializeMessages = (messages: ThreadMessage[]) => {
  return messages.map((message) => {
    // Clone the message to avoid mutation
    const serializedMessage = { ...message };
    // Convert Date object to an ISO string
    // @ts-ignore
    serializedMessage.createdAt = message.createdAt.toISOString();
    return serializedMessage;
  });
};

export const deserializeMessages = (messages: any[]): ThreadMessage[] => {
  return messages.map((message) => ({
    ...message,
    createdAt: new Date(message.createdAt),
  }));
};

export default function Home() {
  const [isPopPanelMode, setIsPopPanelMode] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [initiatedHistory, setInitiatedHistory] = useState<ThreadMessage[]>([]);

  const searchParams = useSearchParams();
  const convoID = searchParams.get("convo_id");

  useEffect(() => {
    const API_KEY_GEMINI_LOCAL_STORAGE = localStorage.getItem(
      "API_KEY_GEMINI_LOCAL_STORAGE"
    );
    if (API_KEY_GEMINI_LOCAL_STORAGE) {
      setApiKey(API_KEY_GEMINI_LOCAL_STORAGE);
    }

    const is_pop_panel_mode = searchParams.get("pop_panel_mode");
    setIsPopPanelMode(!!is_pop_panel_mode);

    if (is_pop_panel_mode) {
      // 1. Declare the connection variable here so the cleanup function can access it.
      let connection: any;

      const connectPenpal = async () => {
        console.log("✅ Child: Connecting to Penpal...", convoID);
        try {
          const messenger = new WindowMessenger({
            remoteWindow: window.parent,
            allowedOrigins: [
              "http://localhost:7777",
              "https://officex.app",
              "*",
            ], // Make sure this is your parent's real origin!
          });

          // 2. Assign the created connection to the variable.
          connection = connect({
            messenger,
            // log: debug('Child Penpal'),
            methods: {},
          });

          const remote = await connection.promise;
          window.penpalParent = remote;
          console.log("✅ Child: Penpal connection established!");

          if (convoID) {
            console.log("✅ Child: Loading history from parent...", convoID);
            const cacheHistory = await remote.loadHistory(convoID);
            console.log(
              "✅ Child: Successfully received loadHistory from parent:",
              cacheHistory
            );
            if (cacheHistory) {
              const deserialized = deserializeMessages(
                JSON.parse(cacheHistory)
              );
              console.log(`convo as deserialized`, deserialized);

              setInitiatedHistory(deserialized);
            }
          }

          setIsReady(true);
        } catch (e) {
          console.error("Child: Failed to connect or call method.", e);
        }
      };

      connectPenpal();

      // 3. This cleanup function is crucial. It runs when the component re-mounts or unmounts.
      return () => {
        // console.log('🧹 Child: Cleaning up previous Penpal connection.');
        connection?.destroy();
      };
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ color: "gray" }}
      >
        Loading...
      </div>
    );
  }

  if (isPopPanelMode && apiKey && convoID) {
    return (
      <AssistantPopPanel
        apiKey={apiKey}
        convoID={convoID}
        initialHistory={initiatedHistory}
      />
    );
  }

  return <Assistant hideHeader={isPopPanelMode} />;
}

declare global {
  // eslint-disable-next-line ts/naming-convention
  interface Window {
    penpalParent?: RemoteProxy<Methods>;
  }
}
