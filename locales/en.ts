// if you are adding a new translation, please use PartialLocaleType instead of LocaleType

const en = {
  TopBar: {
    NewChat: "New Chat", // Locale.TopBar.NewChat
  },
  SideBar: {
    Conversations: "Conversations", // Locale.SideBar.Conversations
    NewThread: "New Thread", // Locale.SideBar.NewThread
  },
  MainChat: {
    WelcomeMessage: "How can I help you today?", // Locale.MainChat.WelcomeMessage
    InputPlaceholder: "Write a message...", // Locale.MainChat.InputPlaceholder
    ToolTips: {
      AddAttachment: "Add Attachment", // Locale.MainChat.ToolTips.AddAttachment
      Copy: "Copy", // Locale.MainChat.ToolTips.Copy
      Refresh: "Refresh", // Locale.MainChat.ToolTips.Refresh
      Edit: "Edit", // Locale.MainChat.ToolTips.Edit
      Cancel: "Cancel", // Locale.MainChat.ToolTips.Cancel
      Send: "Send", // Locale.MainChat.ToolTips.Send
    },
  },
};

export default en;

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type LocaleType = typeof en;
export type PartialLocaleType = DeepPartial<typeof en>;
