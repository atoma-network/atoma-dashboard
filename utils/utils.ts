import { ModelCategories } from "@/app/playground/page";
import { AxiosResponse } from "axios";
import { getTasks } from "@/lib/api";
import { Task, ModelModality } from "@/lib/atoma";

export type TaskResponse = [Task, ModelModality[]][];

export async function fetchAvailableModels(): Promise<TaskResponse> {
  try {
    const response = await getTasks();
    return response.data;
  } catch (error) {
    console.error("Error fetching models:", error);
    throw error;
  }
}

export function processModelsForCategory(
  models: TaskResponse,
  category: ModelCategories
): { modelName: string; model: string }[] {
  return models
    .filter(([model, capabilities]) => {
      switch (category) {
        case "chat":
          return capabilities.includes(ModelModality.ChatCompletions);
        case "embeddings":
          return capabilities.includes(ModelModality.Embeddings);
        case "images":
          return capabilities.includes(ModelModality.ImagesGenerations);
        default:
          return false;
      }
    })
    .map(([model]) => ({
      modelName: model.model_name?.split("/").pop() || model.model_name || "",
      model: model.model_name || "",
    }));
}

export function RenderRequestBodyBasedOnEndPoint(endpoint: ModelCategories, selectedModel: string, message: string) {
  switch (endpoint) {
    case "chat":
      return {
        messages: [{ role: "user", content: message }],
        model: selectedModel,
      };
    case "embeddings":
      return {
        model: selectedModel,
        input: message,
      };
    case "images":
      return {
        model: selectedModel,
        prompt: message,
      };
  }
}

export function parseOutputBasedOnEndpoint(endpoint: ModelCategories, response: AxiosResponse) {
  switch (endpoint) {
    case "chat":
      return response.data.choices[0].message.content;
    case "embeddings":
      return `${response.data?.data[0]?.embedding}`;
    case "images":

    default:
      break;
  }
}
