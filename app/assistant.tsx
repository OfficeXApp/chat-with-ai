"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useLocalRuntime, type ChatModelAdapter } from "@assistant-ui/react";
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
  type AttachmentAdapter,
  type PendingAttachment,
  type CompleteAttachment,
} from "@assistant-ui/react";
import { useEffect, useState } from "react";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const Assistant = ({ hideHeader = false }: { hideHeader?: boolean }) => {
  const [apiKey, setApiKey] = useState("");
  const [isPopPanelMode, setIsPopPanelMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const is_pop_panel_mode = params.get("pop_panel_mode");
    // const hide_header = params.get("hideHeader");
    setIsPopPanelMode(!!is_pop_panel_mode);
    // You can use hide_header here if you want to override the prop with URL param
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const API_KEY_GEMINI_LOCAL_STORAGE = localStorage.getItem(
        "API_KEY_GEMINI_LOCAL_STORAGE"
      );
      if (API_KEY_GEMINI_LOCAL_STORAGE) {
        setApiKey(API_KEY_GEMINI_LOCAL_STORAGE);
      }
    }
  }, []);

  const updateApiKey = (apiKey: string) => {
    setApiKey(apiKey);
    if (typeof window !== 'undefined') {
      localStorage.setItem("API_KEY_GEMINI_LOCAL_STORAGE", apiKey);
    }
  };

  // Enhanced Image Adapter for vision capabilities
  class VisionImageAttachmentAdapter implements AttachmentAdapter {
    accept = "image/jpeg,image/png,image/webp,image/gif,image/*";

    async add({ file }: { file: File }): Promise<PendingAttachment> {
      console.log("VisionImageAdapter: Adding image:", file.name, file.type);
      
      const maxSize = 20 * 1024 * 1024; // 20MB limit
      if (file.size > maxSize) {
        throw new Error("Image size exceeds 20MB limit");
      }

      return {
        id: crypto.randomUUID(),
        type: "image", // Use "image" type for images
        name: file.name,
        contentType: file.type, // Add contentType property
        file,
        status: { type: "running", reason: "uploading", progress: 0 },
      };
    }

    async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
      console.log("VisionImageAdapter: Sending image attachment:", attachment);
      
      if (!attachment.file) {
        throw new Error("No file found in attachment");
      }

      try {
        // Convert image to base64 data URL
        const base64DataURL = await this.fileToBase64DataURL(attachment.file);
        console.log("VisionImageAdapter: Converted to base64, length:", base64DataURL.length);
        
        return {
          id: attachment.id,
          type: "image",
          name: attachment.name,
          contentType: attachment.file.type, // Add contentType property
          content: [
            {
              type: "image",
              image: base64DataURL,
            },
          ],
          status: { type: "complete" },
        };
      } catch (error) {
        console.error("VisionImageAdapter: Error processing image:", error);
        throw error;
      }
    }

    async remove(attachment: PendingAttachment): Promise<void> {
      console.log("VisionImageAdapter: Image attachment removed:", attachment.id);
    }

    private async fileToBase64DataURL(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  }

  // Text File Adapter - Use "file" type for text files
  class TextFileAttachmentAdapter implements AttachmentAdapter {
    accept = "text/plain,text/markdown,text/csv,text/json,application/json,.txt,.md,.csv,.json";

    async add({ file }: { file: File }): Promise<PendingAttachment> {
      console.log("TextFileAdapter: Adding text file:", file.name, file.type);
      
      const maxSize = 5 * 1024 * 1024; // 5MB limit for text files
      if (file.size > maxSize) {
        throw new Error("Text file size exceeds 5MB limit");
      }

      return {
        id: crypto.randomUUID(),
        type: "file", // Use "file" type for text files
        name: file.name,
        contentType: file.type, // Add contentType property
        file,
        status: { type: "running", reason: "uploading", progress: 0 },
      };
    }

    async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
      console.log("TextFileAdapter: Sending text attachment:", attachment);
      
      if (!attachment.file) {
        throw new Error("No file found in attachment");
      }

      try {
        const text = await this.fileToText(attachment.file);
        console.log("TextFileAdapter: Read text, length:", text.length);
        
        return {
          id: attachment.id,
          type: "file",
          name: attachment.name,
          contentType: attachment.file.type, // Add contentType property
          content: [
            {
              type: "text",
              text: `--- Content of ${attachment.file.name} ---\n${text}\n--- End of file ---`,
            },
          ],
          status: { type: "complete" },
        };
      } catch (error) {
        console.error("TextFileAdapter: Error processing text file:", error);
        throw error;
      }
    }

    async remove(attachment: PendingAttachment): Promise<void> {
      console.log("TextFileAdapter: Text attachment removed:", attachment.id);
    }

    private fileToText(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }
  }

  // PDF File Adapter - Send as proper file data to Gemini
  class PDFAttachmentAdapter implements AttachmentAdapter {
    accept = "application/pdf,.pdf";

    async add({ file }: { file: File }): Promise<PendingAttachment> {
      console.log("PDFAdapter: Adding PDF file:", file.name, file.type);
      
      const maxSize = 10 * 1024 * 1024; // 10MB limit
      if (file.size > maxSize) {
        throw new Error("PDF size exceeds 10MB limit");
      }

      return {
        id: crypto.randomUUID(),
        type: "document",
        name: file.name,
        contentType: file.type, // Add contentType property
        file,
        status: { type: "running", reason: "uploading", progress: 0 },
      };
    }

    async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
      console.log("PDFAdapter: Processing PDF attachment:", attachment);
      
      if (!attachment.file) {
        throw new Error("No file found in attachment");
      }

      try {
        // Convert to base64 for file data (not text)
        const base64Data = await this.fileToBase64(attachment.file);
        
        return {
          id: attachment.id,
          type: "document",
          name: attachment.name,
          contentType: attachment.file.type, // Add contentType property
          content: [
            {
              type: "file", // Send as file, not text
              data: base64Data, // Pure base64 without data URL prefix
              mimeType: "application/pdf",
              // Remove the name property as it is not part of FileMessagePart
            },
          ],
          status: { type: "complete" },
        };
      } catch (error) {
        console.error("PDFAdapter: Error processing PDF:", error);
        throw error;
      }
    }

    async remove(attachment: PendingAttachment): Promise<void> {
      console.log("PDFAdapter: PDF attachment removed:", attachment.id);
    }

    private async fileToBase64(file: File): Promise<string> {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      return btoa(binary); // Returns pure base64, not data URL
    }
  }

  // Composite adapter to handle multiple file types
  class CompositeAttachmentAdapter implements AttachmentAdapter {
    private adapters: AttachmentAdapter[];
    
    constructor(adapters: AttachmentAdapter[]) {
      this.adapters = adapters;
    }

    get accept(): string {
      return this.adapters.map(adapter => adapter.accept).join(',');
    }

    async add({ file }: { file: File }): Promise<PendingAttachment> {
      console.log("CompositeAdapter: Adding file", file.name, file.type);
      
      for (const adapter of this.adapters) {
        if (this.fileMatchesAccept(file, adapter.accept)) {
          console.log("CompositeAdapter: Found matching adapter for", file.name);
          const result = await adapter.add({ file });
          if (result instanceof Object && 'id' in result && 'type' in result) {
            return result as PendingAttachment;
          }
        }
      }
      
      throw new Error(`No adapter found for file type: ${file.type || 'unknown'} (${file.name})`);
    }

    async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
      console.log("CompositeAdapter: Sending attachment", attachment.name);
      
      if (!attachment.file) {
        throw new Error("No file found in attachment");
      }
      
      for (const adapter of this.adapters) {
        if (this.fileMatchesAccept(attachment.file, adapter.accept)) {
          console.log("CompositeAdapter: Found matching adapter for sending", attachment.name);
          return adapter.send(attachment);
        }
      }
      
      throw new Error(`No adapter found for attachment: ${attachment.name}`);
    }

    async remove(attachment: PendingAttachment): Promise<void> {
      console.log("CompositeAdapter: Removing attachment", attachment.id, attachment.name);
      
      if (attachment.file) {
        for (const adapter of this.adapters) {
          if (this.fileMatchesAccept(attachment.file, adapter.accept)) {
            console.log("CompositeAdapter: Found matching adapter for removal", attachment.name);
            return adapter.remove(attachment);
          }
        }
      }
      
      console.log("CompositeAdapter: No specific adapter found for removal, cleaning up generically");
    }

    private fileMatchesAccept(file: File, accept: string): boolean {
      if (!accept || accept === '*/*') return true;
      if (!file || (!file.type && !file.name)) return false;
      
      const acceptTypes = accept.split(',').map(type => type.trim());
      const fileName = file.name || '';
      const fileType = file.type || '';
      
      for (const acceptType of acceptTypes) {
        // Handle exact MIME type matches
        if (acceptType === fileType) return true;
        
        // Handle wildcard MIME types
        if (acceptType.endsWith('/*') && fileType) {
          const baseType = acceptType.slice(0, -2);
          if (fileType.startsWith(baseType + '/')) return true;
        }
        
        // Handle file extensions
        if (acceptType.startsWith('.') && fileName) {
          if (fileName.toLowerCase().endsWith(acceptType.toLowerCase())) return true;
        }
      }
      
      return false;
    }
  }

  // ChatModelAdapter using ai SDK
  const GeminiModelAdapter: ChatModelAdapter = {
    async run({ messages, abortSignal }) {
      if (!apiKey) {
        throw new Error("Please provide your Gemini API key in settings");
      }

      try {
        // Create Google AI instance with API key
        const google = createGoogleGenerativeAI({
          apiKey: apiKey,
        });
        
        console.log("Processing messages:", messages);

        // In your GeminiModelAdapter, update the message processing:
        const coreMessages = messages.map((message) => {
          const allContentParts = message.content.map((part) => {
            if (part.type === "text") {
              return { type: "text" as const, text: part.text };
            }
            if (part.type === "image") {
              return { type: "image" as const, image: part.image };
            }
            return { type: "text" as const, text: `[Unsupported: ${part.type}]` };
          });

          // Add attachments properly
          if ((message.attachments ?? []).length > 0) {
            (message.attachments ?? []).forEach((attachment) => {
              attachment.content?.forEach((attachmentPart) => {
                if (attachmentPart.type === "image" && attachmentPart.image) {
                  allContentParts.push({
                    type: "image" as const,
                    image: attachmentPart.image,
                  });
                } else if (attachmentPart.type === "text") {
                  allContentParts.push({
                    type: "text" as const,
                    text: attachmentPart.text,
                  });
                } else if (attachmentPart.type === "file") {
                  // Send PDF as proper file data to Gemini
                  allContentParts.push({
                    type: "text" as const,
                    text: `[FILE: ${attachmentPart.mimeType}] Base64 data: ${attachmentPart.data}`,
                  });
                }
              });
            });
          }

          return { role: message.role, content: allContentParts };
        });
        
        console.log("Processed core messages:", coreMessages);

        const result = await generateText({
          model: google("gemini-2.0-flash-exp"),
          messages: coreMessages as any, // Cast to 'any' to bypass type mismatch
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
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw error;
        }
        
        console.error("Error calling Gemini API:", error);
        
        let errorMessage = "Failed to generate response.";
        if (error.message?.includes("API_KEY_INVALID")) {
          errorMessage = "Invalid API key. Please check your Gemini API key.";
        } else if (error.message?.includes("QUOTA_EXCEEDED")) {
          errorMessage = "API quota exceeded. Please check your usage limits.";
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
        
        throw new Error(errorMessage);
      }
    },
  };

  // Create runtime with proper adapters
  const runtime = useLocalRuntime(GeminiModelAdapter, {
    adapters: {
      attachments: new CompositeAttachmentAdapter([
        new VisionImageAttachmentAdapter(),
        new TextFileAttachmentAdapter(),
        new PDFAttachmentAdapter(),
      ]),
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {!isPopPanelMode &&  !hideHeader && (
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
                        rel="noopener noreferrer"
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
                    {!apiKey && (
                      <div style={{ marginTop: 8, color: "#ff4d4f", fontSize: "12px" }}>
                        API key is required for local execution
                      </div>
                    )}
                    {apiKey && (
                      <div style={{ marginTop: 8, color: "#52c41a", fontSize: "12px" }}>
                        ✓ Running locally - no IP restrictions
                      </div>
                    )}
                  </div>
                }
                trigger="click"
              >
                <Button
                  style={{
                    marginLeft: "auto",
                    backgroundColor: apiKey ? "#f6ffed" : undefined,
                    borderColor: apiKey ? "#b7eb8f" : undefined,
                  }}
                >
                  Settings
                </Button>
              </Popover>
            </header>
          )}
          {apiKey ? (
            <Thread />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">API Key Required</h2>
                <p className="text-gray-600 mb-4">Please add your Gemini API key in Settings to start chatting.</p>
                <Button onClick={() => {
                  const popover = document.querySelector('[role="tooltip"]');
                  if (!popover) {
                    const settingsButton = document.querySelector('button') as HTMLButtonElement;
                    settingsButton?.click();
                  }
                }}>
                  Open Settings
                </Button>
              </div>
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};