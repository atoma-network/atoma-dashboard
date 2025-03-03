"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { BackgroundGrid } from "@/components/background-grid";
import { ApiUsageDialog } from "@/components/api-usage-dialog";
import { ParametersSidebar } from "@/components/parameters-sidebar";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { Loader2 } from "lucide-react";
import {
  renderModelListBasedOnTabs,
  RenderRequestBodyBasedOnEndPoint,
  parseOutputBasedOnEndpoint,
} from "../../utils/utils";
import config from "@/config/config";
export type ModelCategories = "chat" | "embeddings" | "images";

interface Parameters {
  apiKey: string;
  systemPrompt: string;
  customSystemPrompt: string;
  autoSetLength: boolean;
  outputLength: number;
  temperature: number;
  topP: number;
  topK: number;
  repetitionPenalty: number;
}

const defaultParameters: Parameters = {
  apiKey: "",
  systemPrompt: "Default",
  customSystemPrompt: "",
  autoSetLength: true,
  outputLength: 2048,
  temperature: 0.7,
  topP: 0.7,
  topK: 50,
  repetitionPenalty: 1,
};

export default function PlaygroundPage() {
  const [selectedModel, setSelectedModel] = useState("meta-llama/Llama-3.3-70B-Instruct");
  const [selectedTab, setSelectedTab] = useState<ModelCategories>("chat");

  const [message, setMessage] = useState("");
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [response, setResponse] = useState<{
    response: string;
    error: boolean;
  }>({ response: "", error: false });
  // const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const [parameters, setParameters] = useState<Parameters>(defaultParameters);
  const endpoints = {
    chat: "chat/completions",
    embeddings: "embeddings",
    images: "images/generations",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    console.log(parameters);
    try {
      setIsLoading(true);

      const response = await axios.post(
        `${config.ATOMA_API_URL}${endpoints[selectedTab]}`,
        RenderRequestBodyBasedOnEndPoint(selectedTab, selectedModel, message),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${parameters.apiKey}`,
          },
        }
      );
      console.log(response);

      setResponse({
        response: parseOutputBasedOnEndpoint(selectedTab, response),
        error: false,
      });
    } catch (error: unknown) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        error.status === 401
          ? setResponse({
              response: "there was a problem with your api key",
              error: true,
            })
          : setResponse({
              response: error.response?.data?.error?.message ? error.response.data.error.message : "failed to query.",
              error: true,
            });
      } else {
        setResponse({ response: "An unexpected error occurred.", error: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleParameterChange = (key: keyof Parameters, value: number | boolean | string) => {
    setParameters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <BackgroundGrid />
      <div className="relative z-10 h-[calc(100vh-6rem)] overflow-hidden">
        <div className="h-full p-4 grid grid-cols-[1fr,400px] gap-4">
          <Card className="flex flex-col overflow-hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Header Section */}
            <div className="p-4 space-y-4">
              <div className="flex w-full justify-between p-2">
                {/* Tabs Section */}
                <div className="flex gap-x-4">
                  {["chat", "embeddings", "images"].map((tab) => (
                    <Button
                      key={tab}
                      variant="ghost"
                      className={`px-4 py-2 text-sm font-medium ${
                        selectedTab === tab ? "bg-purple-100 text-purple-700" : "text-gray-500"
                      }`}
                      onClick={() => {
                        setSelectedTab(tab as ModelCategories);
                        setSelectedModel(renderModelListBasedOnTabs(tab as ModelCategories)[0].model);
                      }}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Button>
                  ))}
                </div>

                <div>
                  <Button variant="outline" onClick={() => setIsApiDialogOpen(true)}>
                    API
                  </Button>
                </div>
              </div>

              {/* Model Selection */}
              <div className="flex items-center">
                {renderModelListBasedOnTabs(selectedTab).map((model) => (
                  <Button
                    key={model.modelName}
                    variant="ghost"
                    className={`mr-2 px-3 py-1 rounded-lg ${
                      selectedModel === model.model ? "bg-purple-100 text-purple-700" : "text-gray-700"
                    }`}
                    onClick={() => setSelectedModel(model.model.trim())}
                  >
                    {model.modelName}
                  </Button>
                ))}
              </div>
              <Separator />
            </div>

            {/* Chat Section */}
            <div className="flex-1 flex flex-col overflow-auto">
              <div
                className={`flex-1 p-4 flex ${isLoading ? "items-center justify-center" : "items-start justify-start"}`}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
                ) : response.error ? (
                  <div className="w-full max-w-md p-4 border border-red-200 bg-red-50 text-red-400 rounded-md">
                    <p className="font-semibold uppercase">Error</p>
                    <p>{response.response}</p>
                  </div>
                ) : (
                  <p className="   break-words self-start w-[90%] ">{response.response}</p>
                )}
              </div>
              <div className="border-t p-4 bg-background/50 backdrop-blur-md shadow-md rounded-b-lg">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 rounded-lg bg-background/80 border border-purple-500 focus:ring-2 focus:ring-purple-600 transition"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-purple-600 hover:bg-purple-700 transition-all duration-200 rounded-lg shadow-md"
                  >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </form>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <ParametersSidebar parameters={parameters} onChange={handleParameterChange} />
          </Card>
        </div>
      </div>
      <ApiUsageDialog isOpen={isApiDialogOpen} onClose={() => setIsApiDialogOpen(false)} modelName={selectedModel} />
    </div>
  );
}
