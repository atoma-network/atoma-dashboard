import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export function TicketsView() {
  const handleCreateTicket = () => {
    window.open("https://forms.gle/rwtHDvocvMBLhx1S6", "_blank")
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Create A New Ticket</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Submit a new support ticket for any issues or inquiries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCreateTicket} className="bg-purple-600 hover:bg-purple-700 text-white">
            Create Ticket
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

