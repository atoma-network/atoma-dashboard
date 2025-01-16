import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from 'lucide-react'

export function GuideView() {
  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Atoma Devnet Guide</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            These instructions will get you set up and running on Atoma Cloud during our Devnet period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Prerequisites:</h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>Sui Wallet (Ensure it is set to Sui Testnet)</li>
              <li>Discord account</li>
              <li>Email</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Step 1:</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Click the Login or Register button in the top right and register your account using your email
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Step 2:</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Visit <a href="https://discord.gg/sui" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 inline-flex items-center">
                https://discord.gg/sui <ExternalLink className="ml-1 h-4 w-4" />
              </a> and enter the testnet-faucet channel and type in the command: !faucet insert_wallet_address
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Step 3:</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Visit <a href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 inline-flex items-center">
                https://faucet.circle.com/ <ExternalLink className="ml-1 h-4 w-4" />
              </a> to claim Sui Testnet USDC
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Step 4:</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Visit Developer Portal -&gt; Billing: Click Add Funds and proceed with prompted instructions to send your Testnet USDC to top up your account balance
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Step 5:</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Begin using Atoma! Simply plug into our API or SDK's (Visit Documentation for more information) and you are ready to go!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

