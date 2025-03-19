import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

//Parameters interface
interface Parameters {
  apiKey?: string;
  systemPrompt: string;
  customSystemPrompt: string;
  autoSetLength: boolean;
  outputLength: number;
  temperature: number;
  topP: number;
  topK: number;
  repetitionPenalty: number;
}

interface ParametersSidebarProps {
  parameters: Parameters;
  onChange: (key: keyof Parameters, value: number | boolean | string) => void;
}

export function ParametersSidebar({ parameters, onChange }: ParametersSidebarProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Creates a copy of parameters without the API key
      const parametersToSave = { ...parameters };
      delete parametersToSave.apiKey;

      localStorage.setItem("playground-parameters", JSON.stringify(parametersToSave));
      toast.success("Parameters saved");
      console.log("Saved parameters (API key excluded):", parametersToSave);
    } catch (error) {
      toast.error("Failed to save parameters");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <h2 className="text-lg font-semibold">Parameters</h2>

          {/* API Key Section */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={parameters.apiKey}
              onChange={e => onChange("apiKey", e.target.value)}
              placeholder="Enter your API key"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Select value={parameters.systemPrompt} onValueChange={value => onChange("systemPrompt", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select system prompt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Default">Default</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {parameters.systemPrompt === "Custom" && (
                <div className="mt-2">
                  <Textarea
                    placeholder="Enter custom system prompt"
                    value={parameters.customSystemPrompt}
                    onChange={e => onChange("customSystemPrompt", e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-length"
                checked={parameters.autoSetLength}
                onCheckedChange={checked => onChange("autoSetLength", checked)}
              />
              <label
                htmlFor="auto-length"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Auto-set output length
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label>Output Length</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Maximum number of tokens to generate</TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  value={parameters.outputLength}
                  onChange={e => onChange("outputLength", Number(e.target.value))}
                  className="w-20"
                />
              </div>
              <Slider
                value={[parameters.outputLength]}
                onValueChange={([value]) => onChange("outputLength", value)}
                min={1}
                max={4096}
                step={1}
                disabled={parameters.autoSetLength}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label>Temperature</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Controls randomness: Lower values are more focused, higher values more creative
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  value={parameters.temperature}
                  onChange={e => onChange("temperature", Number(e.target.value))}
                  className="w-20"
                />
              </div>
              <Slider
                value={[parameters.temperature]}
                onValueChange={([value]) => onChange("temperature", value)}
                min={0}
                max={2}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label>Top-P</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are
                      considered
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  value={parameters.topP}
                  onChange={e => onChange("topP", Number(e.target.value))}
                  className="w-20"
                />
              </div>
              <Slider
                value={[parameters.topP]}
                onValueChange={([value]) => onChange("topP", value)}
                min={0}
                max={1}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label>Top-K</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Limits the cumulative probability mass of tokens to sample from</TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  value={parameters.topK}
                  onChange={e => onChange("topK", Number(e.target.value))}
                  className="w-20"
                />
              </div>
              <Slider
                value={[parameters.topK]}
                onValueChange={([value]) => onChange("topK", value)}
                min={0}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label>Repetition Penalty</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Penalizes repetition in generated text</TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  value={parameters.repetitionPenalty}
                  onChange={e => onChange("repetitionPenalty", Number(e.target.value))}
                  className="w-20"
                />
              </div>
              <Slider
                value={[parameters.repetitionPenalty]}
                onValueChange={([value]) => onChange("repetitionPenalty", value)}
                min={1}
                max={2}
                step={0.1}
              />
            </div>
          </div>
        </div>

        {/* Save Button Section */}
        <div className="p-6 border-t">
          <Button className="w-full" variant="default" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Parameters"}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
