"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Copy, Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

interface ApiKey {
  name: string
  key: string
  created: string
  lastUsed: string
  projectAccess: string
  createdBy: string
  permissions: string
}

export function ApiKeyCard() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      name: "CrewAItest4",
      key: "sk-...hXoA",
      created: "Dec 10, 2024",
      lastUsed: "Dec 10, 2024",
      projectAccess: "Default project",
      createdBy: "Marcus Mazzocato",
      permissions: "All",
    },
    {
      name: "CrewAITest3",
      key: "sk-...5h8A",
      created: "Dec 10, 2024",
      lastUsed: "Never",
      projectAccess: "Default project",
      createdBy: "Marcus Mazzocato",
      permissions: "All",
    },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSaveKeyDialogOpen, setIsSaveKeyDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newGeneratedKey, setNewGeneratedKey] = useState("")
  const [copied, setCopied] = useState(false)

  const handleCreateKey = () => {
    if (!newKeyName) return

    const generatedKey = "sk-proj-cQcyInuLoX2jJxY7ZTeQyDAnwKzV" // In real app, this would come from API
    setNewGeneratedKey(generatedKey)
    setIsCreateDialogOpen(false)
    setIsSaveKeyDialogOpen(true)

    // Add new key to list
    const newKey: ApiKey = {
      name: newKeyName,
      key: `sk-...${generatedKey.slice(-4)}`,
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      lastUsed: "Never",
      projectAccess: "Default project",
      createdBy: "Marcus Mazzocato",
      permissions: "All",
    }

    setApiKeys([newKey, ...apiKeys])
    setNewKeyName("")
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newGeneratedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-6">
          <h2 className="text-lg font-semibold text-purple-600">API keys</h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create new secret key
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NAME</TableHead>
                  <TableHead>SECRET KEY</TableHead>
                  <TableHead>CREATED</TableHead>
                  <TableHead>LAST USED</TableHead>
                  <TableHead>PROJECT ACCESS</TableHead>
                  <TableHead>CREATED BY</TableHead>
                  <TableHead>PERMISSIONS</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys
                  .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
                  .map((key) => (
                    <TableRow key={key.name}>
                      <TableCell>{key.name}</TableCell>
                      <TableCell className="font-mono">{key.key}</TableCell>
                      <TableCell>{key.created}</TableCell>
                      <TableCell>{key.lastUsed}</TableCell>
                      <TableCell>{key.projectAccess}</TableCell>
                      <TableCell>{key.createdBy}</TableCell>
                      <TableCell>{key.permissions}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new secret key</DialogTitle>
            <DialogDescription>
              Give your key a name to remember it by. This is only for your reference—it won't affect how the key works.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My API key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKey} disabled={!newKeyName}>
              Create secret key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Key Dialog */}
      <Dialog open={isSaveKeyDialogOpen} onOpenChange={setIsSaveKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save your key</DialogTitle>
            <DialogDescription className="space-y-4">
              <p>
                Please save your secret key in a safe place since{" "}
                <span className="font-semibold">you won't be able to view it again</span>. Keep it secure, as anyone
                with your API key can make requests on your behalf. If you do lose it, you'll need to generate a new
                one.
              </p>
              <Link href="#" className="text-primary hover:underline inline-flex items-center">
                Learn more about API key best practices
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <path d="M7 7h10v10" />
                  <path d="M7 17 17 7" />
                </svg>
              </Link>
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <div className="rounded-md border bg-muted p-3 font-mono text-sm">{newGeneratedKey}</div>
            <Button size="sm" onClick={copyToClipboard} className="absolute right-2 top-1/2 -translate-y-1/2">
              {copied ? (
                "Copied"
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

