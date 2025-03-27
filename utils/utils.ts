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

export function readableModelName(modelName: string) {
  switch (modelName) {
    case "Qwen/QwQ-32B":
      return "QWQ 32B";
    case "neuralmagic/DeepSeek-R1-Distill-Llama-70B-FP8-dynamic":
      return "DeepSeek: R1 Distill Llama 70B";
    case "neuralmagic/Qwen2-72B-Instruct-FP8":
      return "Qwen2 72B";
    case "meta-llama/Llama-3.1-8B-Instruct":
      return "Llama3.1 8B";
    case "Infermatic/Llama-3.3-70B-Instruct-FP8-Dynamic":
      return "Llama3.3 70B";
    default:
      const match = modelName?.match(/\/([^\/]*\d+B)/);
      if (match) {
        return match[1].replace(/-/g, " ");
      }
      return modelName;
  }
}

export function processModelsForCategory(
  models: TaskResponse,
  category: ModelCategories
): { modelName: string; model: string }[] {
  // Create a Map to store unique models
  const uniqueModels = new Map<string, { modelName: string; model: string }>();

  models
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
    .forEach(([model]) => {
      const modelName = model.model_name || "";
      if (modelName && !uniqueModels.has(modelName)) {
        uniqueModels.set(modelName, {
          modelName: readableModelName(modelName),
          model: modelName,
        });
      }
    });

  // Convert Map values to array
  return Array.from(uniqueModels.values());
}

export function RenderRequestBodyBasedOnEndPoint(
  endpoint: ModelCategories,
  selectedModel: string,
  message: string,
  parameters: {
    systemPrompt: string;
    customSystemPrompt: string;
    outputLength: number;
    temperature: number;
    topP: number;
    topK: number;
    repetitionPenalty: number;
  }
) {
  switch (endpoint) {
    case "chat":
      return {
        messages: [
          {
            role: "system",
            content:
              parameters.systemPrompt === "Custom" ? parameters.customSystemPrompt : "You are a helpful assistant.",
          },
          { role: "user", content: message },
        ],
        model: selectedModel,
        max_tokens: parameters.outputLength,
        temperature: parameters.temperature,
        top_p: parameters.topP,
        top_k: parameters.topK,
        repetition_penalty: parameters.repetitionPenalty,
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
