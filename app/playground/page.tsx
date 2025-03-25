"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { BackgroundGrid } from "@/components/background-grid";
import { ApiUsageDialog } from "@/components/api-usage-dialog";
import { ParametersSidebar } from "@/components/parameters-sidebar";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import {
  processModelsForCategory,
  RenderRequestBodyBasedOnEndPoint,
  parseOutputBasedOnEndpoint,
  fetchAvailableModels,
  TaskResponse,
  readableModelName,
} from "../../utils/utils";
import config from "@/config/config";
import LoadingCircle from "../../components/LoadingCircle";
import { useSettings } from "../../contexts/settings-context";

export type ModelCategories = "chat" | "embeddings" | "images";

interface Parameters {
  apiKey: string;
  systemPrompt: string;
  customSystemPrompt: string;
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
  outputLength: 2048,
  temperature: 0.7,
  topP: 0.7,
  topK: 50,
  repetitionPenalty: 1,
};

export default function PlaygroundPage() {
  const { settings, updatePlaygroundSettings } = useSettings();
  const [selectedModel, setSelectedModel] = useState("");
  const [availableModels, setAvailableModels] = useState<TaskResponse>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{
    response: string;
    error: boolean;
  }>({ response: "", error: false });

  const [parameters, setParameters] = useState<Parameters>({
    ...defaultParameters,
    ...(settings.playground || {}),
  });

  useEffect(() => {
    setParameters(prev => ({
      ...prev,
      ...settings.playground,
      apiKey: prev.apiKey,
    }));
  }, [settings.playground]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoadingModels(true);
        setModelError(null);
        const models = await fetchAvailableModels();
        setAvailableModels(models);

        // Set initial selected model
        const processedModels = processModelsForCategory(models, "chat");
        if (processedModels.length > 0) {
          setSelectedModel(processedModels[0].model);
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
        setModelError("Failed to load available models. Please try again later.");
      } finally {
        setIsLoadingModels(false);
      }
    };

    loadModels();
  }, []);

  const endpoints = {
    chat: "chat/completions",
    embeddings: "embeddings",
    images: "images/generations",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      setIsLoading(true);

      const response = await axios.post(
        `${config.ATOMA_API_URL}${endpoints.chat}`,
        RenderRequestBodyBasedOnEndPoint("chat", selectedModel, message, parameters),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${parameters.apiKey}`,
          },
        }
      );
      console.log(response);

      setResponse({
        response: parseOutputBasedOnEndpoint("chat", response),
        error: false,
      });
    } catch (error: unknown) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        error.status === 401
          ? setResponse({
              response: "There was a problem with your api key",
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
    // Only update local state, don't save to global settings yet
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const currentModels = processModelsForCategory(availableModels, "chat");
  if (isLoadingModels)
    return (
      <div className="w-full h-[80dvh] flex justify-center items-center">
        <LoadingCircle size="md" isSpinning={true} />{" "}
      </div>
    );
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <BackgroundGrid />
      <div className="relative z-10 h-[calc(100vh-6rem)] overflow-hidden">
        <div className="h-full p-4 grid grid-cols-[1fr,400px] gap-4">
          <Card className="flex flex-col overflow-hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Header Section */}
            <div className="p-4">
              <div className="flex w-full items-center justify-between p-2">
                {/* Model Selection */}
                <div className="flex items-center gap-2 flex-1">
                  {modelError ? (
                    <div className="text-red-500">{modelError}</div>
                  ) : (
                    currentModels.map(model => (
                      <Button
                        key={model.model}
                        variant="ghost"
                        className={`px-1 text-xs rounded-lg border ${
                          selectedModel === model.model
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 border-transparent"
                        }`}
                        onClick={() => setSelectedModel(model.model)}
                      >
                        {readableModelName(model.model)}
                      </Button>
                    ))
                  )}
                </div>

                <div>
                  <Button variant="outline" onClick={() => setIsApiDialogOpen(true)}>
                    API
                  </Button>
                </div>
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Chat Section */}
            <div className="flex-1 flex flex-col overflow-auto">
              <div className="flex-1 p-4">
                {(!response.response && !isLoading) || isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <LoadingCircle isSpinning={isLoading} />
                  </div>
                ) : response.error ? (
                  <div className="w-full max-w-md p-4 border border-red-200 bg-red-50 text-red-400 rounded-md">
                    <p className="font-semibold uppercase">Error</p>
                    <p>{response.response}</p>
                  </div>
                ) : (
                  <p className="break-words w-[90%]">{response.response}</p>
                )}
              </div>
              <div className="border-t p-4 bg-background/50 backdrop-blur-md shadow-md rounded-b-lg">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <Input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 rounded-lg bg-background/80 border border-primary focus:ring-2 focus:ring-primary transition"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-primary hover:bg-primary transition-all duration-200 rounded-lg shadow-md"
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
