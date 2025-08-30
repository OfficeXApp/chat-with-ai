// app/assistant.tsx

"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import Locale from "../locales";
import { Button, Input, Popover } from "antd";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
} from "@assistant-ui/react";
import { useEffect, useState } from "react";

export const Assistant = () => {
  const [apiKey, setApiKey] = useState("");
  const [isPopPanelMode, setIsPopPanelMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const is_pop_panel_mode = params.get("pop_panel_mode");
    setIsPopPanelMode(!!is_pop_panel_mode);
  }, []);

  useEffect(() => {
    const API_KEY_GEMINI_LOCAL_STORAGE = localStorage.getItem(
      "API_KEY_GEMINI_LOCAL_STORAGE"
    );
    if (API_KEY_GEMINI_LOCAL_STORAGE) {
      setApiKey(API_KEY_GEMINI_LOCAL_STORAGE);
    }
  }, []);

  const updateApiKey = (apiKey: string) => {
    setApiKey(apiKey);
    localStorage.setItem("API_KEY_GEMINI_LOCAL_STORAGE", apiKey);
  };

  // alternatively we can run this completely locally clientside using
  // useLocalRuntime, ChatModelAdapter, createGoogleGenerativeAI, generateText
  const runtime = useChatRuntime({
    api: "/api/chat",
    headers: {
      "gemini-api-key": apiKey,
    },
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
          {!isPopPanelMode && (
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">OfficeX</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{Locale.TopBar.NewChat}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <Popover
                title={<span>Bring Your Own API Keys</span>}
                content={
                  <div>
                    <span>
                      Get your free API Key from Google Gemini -{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                      >
                        Learn more
                      </a>
                    </span>
                    <Input
                      type="password"
                      placeholder="Enter your Gemini API key"
                      value={apiKey}
                      onChange={(e) => updateApiKey(e.target.value)}
                      style={{ marginTop: 8 }}
                    />
                  </div>
                }
                trigger="click"
              >
                <Button
                  style={{
                    // align to right
                    marginLeft: "auto",
                  }}
                >
                  Settings
                </Button>
              </Popover>
            </header>
          )}
          <Thread />
        </SidebarInset>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
