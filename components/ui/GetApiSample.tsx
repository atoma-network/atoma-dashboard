"use client";

import { ModelModality } from "../../lib/atoma";
import Image from "next/image";
import { useState } from "react";

const curlVariable = (variable: string) => <b className="text-purple-700">{`$${variable}`}</b>;

const getApiSampleInner = (modality: ModelModality, modelName?: string) => {
  if (modality === ModelModality.ChatCompletions) {
    return (
      <>
        {`curl https://api.atomacloud.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer `}
        {curlVariable("YOUR_API_KEY")}
        {`" \\
  -d '{
    "stream": true,
    "model": "`}
        {modelName ? modelName : curlVariable("MODEL_NAME")}
        {`",
    "messages": [{
            "role": "user",
            "content": "What is the capital of France?"
    }],
    "max_tokens": 128
  }'`}
      </>
    );
  }
  if (modality === ModelModality.ImagesGenerations) {
    return (
      <>
        {`curl https://api.atomacloud.com/v1/images/generations \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer `}
        {curlVariable("YOUR_API_KEY")}
        {`" \\
  -d '{
    "model": "`}
        {modelName ? modelName : curlVariable("MODEL_NAME")}
        {`",
    "prompt": "Kitten playing with a ball of yarn",
    "n": 1,
    "size": "1024x1024"
  }'`}
      </>
    );
  }
  if (modality === ModelModality.Embeddings) {
    return (
      <>
        {`curl https://api.atomacloud.com/v1/embeddings \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer `}
        {curlVariable("YOUR_API_KEY")}
        {`" \\
  -d '{
    "model": "`}
        {modelName ? modelName : curlVariable("MODEL_NAME")}
        {`",
    "input": "What is the capital of France?"
  }'`}
      </>
    );
  }
};

interface ApiSampleProps {
  modality: ModelModality;
  modelName?: string;
}

export function GetApiSample({ modality, modelName }: ApiSampleProps) {
  const [isCopied, setIsCopied] = useState(false);
  const openDocs = (modality: ModelModality) => {
    if (modality === ModelModality.ChatCompletions) {
      window.open("https://docs.atoma.network/cloud-api-reference/chat/create-chat-completion", "_blank");
    }
    if (modality === ModelModality.ImagesGenerations) {
      window.open("https://docs.atoma.network/cloud-api-reference/images/create-image", "_blank");
    }
    if (modality === ModelModality.Embeddings) {
      window.open("https://docs.atoma.network/cloud-api-reference/embeddings/create-embeddings", "_blank");
    }
  };
  return (
    <div className="group code-container relative w-full overflow-hidden m-0 p-0">
      <div className="inside-code overflow-auto m-0 p-4">
        <code className="text-sm" id="code-content">
          {getApiSampleInner(modality, modelName)}
        </code>
      </div>
      <div className="copy bg-gray-100 dark:bg-gray-800 flex gap-2 absolute right-2 top-2 m-0 opacity-1 group-hover:opacity-100 transition-opacity duration-200">
        <div className="p-1 cursor-pointer border-2 rounded-lg border-black dark:border-white" onClick={() => openDocs(modality)}>
          docs
        </div>
        <Image
          src={isCopied ? "/copy-done.svg" : "/copy.svg"}
          className="cursor-pointer dark:invert"
          alt="copy"
          title="Copy to clipboard"
          width={24}
          height={24}
          onClick={() => {
            const codeContent = document.getElementById("code-content")?.textContent;
            if (codeContent) {
              navigator.clipboard
                .writeText(codeContent)
                .then(() => {
                  console.log("Copied to clipboard");
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                })
                .catch((err) => {
                  console.error("Failed to copy: ", err);
                });
            }
          }}
        />
      </div>
    </div>
  );
}
