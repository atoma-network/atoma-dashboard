"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ModelModality } from "./atoma";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const curlVariable = (variable: string) => <b className="text-purple-700">{`$${variable}`}</b>;

export const getApiSample = (modality: ModelModality, modelName?: string) => {
  if (modality === ModelModality.ChatCompletions) {
    return (<>
        {`curl https://api.atomacloud.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer `}
      {curlVariable("YOUR_API_KEY")}
      {`" \\
  -d '{ \\
    "stream": true, \\
    "model": "`}
    {modelName?modelName:curlVariable("MODEL_NAME")}
    {`", \\
    "messages": [ \\
            "role": "user", \\
            "content": "What's the capital of France?" \\
    ], \\
    "max_tokens": 128 \\
  }'`}
  </>);
  }
  if (modality === ModelModality.ImagesGenerations) {
    return (
      <>
        {`curl https://api.atomacloud.com/v1/images/generations \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer `}
        {curlVariable("YOUR_API_KEY")}
        {`" \\
  -d '{ \\
    "model": "`}
        {modelName?modelName:curlVariable("MODEL_NAME")}
        {`", \\ 
    "prompt": "Kitten playing with a ball of yarn", \\
    "n": 1, \\
    "size": "1024x1024" \\
  }'`}
      </>
    );
  }
  if (modality === ModelModality.Embeddings)
  return (
    <>
      {`curl https://api.atomacloud.com/v1/embeddings \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer `}
      {curlVariable("YOUR_API_KEY")}
      {`" \\
  -d '{ \\
    "model": "`}
        {modelName?modelName:curlVariable("MODEL_NAME")}
        {`", \\
    "input": "What's the capital of France?" \\
  }'`}
    </>
  );
};
