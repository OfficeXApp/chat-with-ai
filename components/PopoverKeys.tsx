import { Button, Input, Popover } from "antd";
import { useState } from "react";

const PopoverApiKeys = ({ children }: { children: React.ReactNode }) => {
  const [apiKey, setApiKey] = useState("");

  const updateApiKey = (apiKey: string) => {
    localStorage.setItem("API_KEY_GEMINI_LOCAL_STORAGE", apiKey);
    setApiKey(apiKey);
  };

  return (
    <Popover
      title={<span>Bring Your Own API Keys</span>}
      content={
        <div>
          <span>
            Get your free API Key from Google Gemini -{" "}
            <a href="https://aistudio.google.com/app/apikey" target="_blank">
              Learn more
            </a>
          </span>
          <Input
            type="password"
            placeholder="Enter your Gemini API key"
            value={apiKey}
            onChange={(e) => updateApiKey(e.target.value)}
            addonAfter={
              // save icon
              <Button
                type="link"
                size="small"
                onClick={() => {
                  // reload page
                  window.location.reload();
                }}
              >
                Save
              </Button>
            }
            style={{ marginTop: 8 }}
          />
        </div>
      }
      trigger="click"
    >
      {children}
    </Popover>
  );
};

export default PopoverApiKeys;
