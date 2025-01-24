import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Info } from "lucide-react"

export function NodeRegistrationView() {
  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Node Registration</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Information for prospective node operators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            During the Devnet phase, nodes must be whitelisted before they can be assigned tasks. Therefore, prospective
            node operators should await team approval before registering a node.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            If you're interested in becoming a node operator during the Devnet phase, please fill out the following
            form:
          </p>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() =>
              window.open(
                "https://docs.google.com/forms/d/e/1FAIpQLSdWlF6C1iVUOcvxjqM6MtPzoSg90Bgokd5MP8hbztegumctlw/viewform",
                "_blank",
              )
            }
          >
            Node Operator Application Form <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Our team will review your application and contact you with further instructions for the Devnet phase.
          </p>
          <div className="bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-md p-4 mt-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Please note: This whitelisting process is only for the Devnet phase. On Mainnet, Atoma will be a
                permissionless network, allowing open participation for node operators.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

