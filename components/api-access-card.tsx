"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy } from "lucide-react";

const endpoints = [
  {
    name: "Chat Completion",
    endpoint: "/v1/chat/completions",
    method: "POST",
  },
  {
    name: "Image Generation",
    endpoint: "/v1/images/generations",
    method: "POST",
  },
  {
    name: "Embedding",
    endpoint: "/v1/embeddings",
    method: "POST",
  },
];

export function ApiAccessCard() {
  const apiKey = "sk-...";
  const exampleCode = `curl https://api.atoma.network/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $YOUR_API_KEY" \\
  -d '{
    "stream": true,
    "model": "$MODEL_NAME",
    "messages": [{
      "role": "user",
      "content": "What is the capital of France?"
    }],
    "max_tokens": 128
  }'`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#DD6C4A]">API Access</CardTitle>
        <CardDescription>Integrate our AI models into your applications using our RESTful API</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm font-medium">API Key</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-2 py-1">{apiKey}</code>
            <Button variant="outline" size="icon">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Available Endpoints</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead className="text-right">Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endpoints.map((endpoint) => (
                <TableRow key={endpoint.endpoint}>
                  <TableCell>{endpoint.name}</TableCell>
                  <TableCell>
                    <code className="text-sm">{endpoint.endpoint}</code>
                  </TableCell>
                  <TableCell className="text-right text-[#DD6C4A]">{endpoint.method}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Example Usage</div>
          <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
            <code className="text-sm">{exampleCode}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
