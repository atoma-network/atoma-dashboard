"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackgroundGrid } from "@/components/background-grid";
import { ApiUsageDialog } from "@/components/api-usage-dialog";
import Link from "next/link";

type ModelCategory = "chat" | "image" | "embedding";

interface ModelSection {
  type: ModelCategory;
  title: string;
  models: {
    name: string;
    price: string;
    type: ModelCategory;
  }[];
}

const modelSections: ModelSection[] = [
  {
    type: "chat",
    title: "Chat Completion",
    models: [
      { name: "Llama 3.3 70B", price: "$0.80", type: "chat" },
      { name: "DeepSeek R1", price: "$0.70", type: "chat" },
      { name: "Qwen 2.5 72B", price: "$0.90", type: "chat" },
    ],
  },
  {
    type: "image",
    title: "Image Generation",
    models: [{ name: "FLUX.1 schnell", price: "$1.20", type: "image" }],
  },
  {
    type: "embedding",
    title: "Embedding",
    models: [{ name: "Multilingual e5 large", price: "$0.30", type: "embedding" }],
  },
];

function ModelCard({ name, price, type }: { name: string; price: string; type: ModelCategory }) {
  const [showApiDialog, setShowApiDialog] = useState(false);

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-base font-medium">{name}</h3>
              <p className="text-sm text-muted-foreground">{price} per 1M tokens</p>
            </div>
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
              {type}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/playground" className="w-full">
              <Button variant="outline" className="w-full">
                Playground
              </Button>
            </Link>
            <Button variant="outline" className="w-full" onClick={() => setShowApiDialog(true)}>
              API
            </Button>
          </div>
        </CardContent>
      </Card>
      <ApiUsageDialog isOpen={showApiDialog} onClose={() => setShowApiDialog(false)} modelName={name} />
    </>
  );
}

export default function ModelsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory>("chat");

  // Reorder sections based on selected category
  const orderedSections = [
    // Selected category first
    ...modelSections.filter((section) => section.type === selectedCategory),
    // Other categories after
    ...modelSections.filter((section) => section.type !== selectedCategory),
  ];

  return (
    <div className="relative min-h-screen w-full">
      <BackgroundGrid />
      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-primary">Models</h1>
            <Select
              defaultValue="chat"
              value={selectedCategory}
              onValueChange={(value: ModelCategory) => setSelectedCategory(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select completion type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chat">Chat Completion</SelectItem>
                <SelectItem value="image">Image Generation</SelectItem>
                <SelectItem value="embedding">Embedding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {orderedSections.map((section) => (
            <div key={section.type} className="space-y-6">
              <h2 className="text-lg font-medium text-primary">{section.title}</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {section.models.map((model) => (
                  <ModelCard key={model.name} name={model.name} price={model.price} type={model.type} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
