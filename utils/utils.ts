import { ModelCategories } from "@/app/playground/page";
import { AxiosResponse } from "axios";
export function renderModelListBasedOnTabs(
  tab: "chat" | "embeddings" | "images"
): { modelName: string; model: string }[] {
  switch (tab) {
    case "chat":
      return [
        {
          modelName: "Llama 3.3 70B",
          model: "meta-llama/Llama-3.3-70B-Instruct",
        },
        {
          modelName: "DeepSeek R1",
          model: "deepseek-ai/DeepSeek-R1",
        },
      ];
    case "embeddings":
      return [
        {
          modelName: "MultiLingual E5 large",
          model: "intfloat/multilingual-e5-large-instruct",
        },
      ];
    case "images":
      return [
        {
          modelName: "Flux.1 schnell",
          model: "black-forest-labs/FLUX.1-schnell",
        },
      ];
    default:
      return [];
  }
}

export function RenderRequestBodyBasedOnEndPoint(
  endpoint: ModelCategories,
  selectedModel: string,
  message: string
) {
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

export function parseOutputBasedOnEndpoint(
  endpoint: ModelCategories,
  response: AxiosResponse
) {
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
