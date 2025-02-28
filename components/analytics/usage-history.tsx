import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const usageData = [
  {
    date: "January 6, 2025",
    model: "Unknown",
    tokens: "2,560,000",
    cost: "$7.68",
  },
  {
    date: "January 7, 2025",
    model: "meta-llama/Llama-3.3-70B-Instruct",
    tokens: "2,560,000",
    cost: "$0.10",
  },
  {
    date: "February 16, 2025",
    model: "Unknown",
    tokens: "3,365",
    cost: "$0.00",
  },
  {
    date: "January 11, 2025",
    model: "meta-llama/Llama-3.3-70B-Instruct",
    tokens: "2,559,964",
    cost: "$1.54",
  },
  {
    date: "January 11, 2025",
    model: "meta-llama/Llama-3.3-70B-Instruct",
    tokens: "2,559,989",
    cost: "$1.54",
  },
  {
    date: "January 27, 2025",
    model: "intfloat/multilingual-e5-large-instruct",
    tokens: "28",
    cost: "$0.00",
  },
  {
    date: "January 11, 2025",
    model: "meta-llama/Llama-3.3-70B-Instruct",
    tokens: "2,559,931",
    cost: "$1.54",
  },
  {
    date: "February 4, 2025",
    model: "black-forest-labs/FLUX.1-schnell",
    tokens: "0",
    cost: "$0.00",
  },
]

export function UsageHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Usage History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Model</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usageData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.date}</TableCell>
                <TableCell className="font-mono text-sm">{row.model}</TableCell>
                <TableCell className="text-right">{row.tokens}</TableCell>
                <TableCell className="text-right">{row.cost}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

