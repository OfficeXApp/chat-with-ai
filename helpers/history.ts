import { ThreadMessage } from "@assistant-ui/react";

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
