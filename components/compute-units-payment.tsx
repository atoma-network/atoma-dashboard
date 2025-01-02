import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight, X } from 'lucide-react'
import { ConnectModal, useCurrentWallet, useSignAndExecuteTransaction, useSignPersonalMessage, useSuiClient } from "@mysten/dapp-kit"
import {  getSuiAddress, payUSDC, proofRequest, usdcPayment } from "@/lib/atoma"

interface ComputeUnitsPaymentProps {
  modelName: string
  pricePer1MUnits: number
  onClose: () => void
}

export function ComputeUnitsPayment({ modelName, pricePer1MUnits, onClose }: ComputeUnitsPaymentProps) {
  const [step, setStep] = useState<'units' | 'payment' | 'api'>('units')
  const [computeUnits, setComputeUnits] = useState<number>(1000)
  const suiClient = useSuiClient();
  const { currentWallet, connectionStatus } = useCurrentWallet();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const handleNextStep = () => {
    if (step === 'units') {
      setStep('payment')
    } else if (step === 'payment') {
      setStep('api')
    }
  }

  const handleUSDCPayment = async () => {
    if (currentWallet == null) {
      return;
    }

    try {
      const suiAddress = await getSuiAddress();
      if (suiAddress == null) {
        // We haven't proven the SUI address yet
        throw new Error("SUI address not found");
      }
      payUSDC((computeUnits / 1000000) * pricePer1MUnits , suiClient, signAndExecuteTransaction, currentWallet).then((res: unknown) => {
        const txDigest = (res as { digest: string }).digest;
        setTimeout(() => {
          usdcPayment(txDigest).then((res) => {
            console.log('res', res)
          }).catch((error) => {
            console.log('error', error)
          });
        }, 1000);
      }).catch((error) => {
        console.log('error',error)
      });
    } catch {
      const access_token = localStorage.getItem("access_token");
      let user_id;
      if (access_token) {
        const base64Url = access_token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const token_json = JSON.parse(jsonPayload);
        user_id = token_json.user_id;
      }

      signPersonalMessage({
        message: new TextEncoder().encode(
          `Sign this message to prove you are the owner of this wallet. User ID: ${user_id}`
        ),
      }).then((res) => {
        proofRequest(res.signature, currentWallet.accounts[0].address)
          .then((res) => {
            console.log("res", res);
          })
          .catch((error) => {
            console.log("error", error);
          });
      });
    }

 
  }

  const getApiSample = () => {
    return `
curl https://api.atoma.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "${modelName}",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is the capital of France?"}
    ]
  }'
    `
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-800/30 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-purple-700 dark:text-purple-300">
          {step === 'units' && 'Select Compute Units'}
          {step === 'payment' && 'Choose Payment Method'}
          {step === 'api' && 'Connect to Your Model'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'units' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="computeUnits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Compute Units
              </label>
              <Input
                id="computeUnits"
                type="number"
                min="1000"
                step="1000"
                value={computeUnits}
                onChange={(e) => setComputeUnits(Number(e.target.value))}
                className="border-purple-200 dark:border-purple-800/30"
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Price: ${((computeUnits / 1000000) * (pricePer1MUnits / 1000000)).toFixed(2)}
              </p>
            </div>
          </div>
        )}
        {step === 'payment' && (
          <div className="space-y-4">
            {connectionStatus == "connected" ? (
              <Button onClick={() => handleUSDCPayment()} className="w-full justify-start bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                Pay with USDC
              </Button>
            ) : (
              <ConnectModal
                trigger={
                  <Button className="w-full justify-start bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                    Connect sui wallet
                  </Button>
                }
              />
            )}
            {/* <Button
              onClick={() => handlePaymentSelection('stripe')}
              className="w-full justify-start bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <Stripe className="mr-2 h-5 w-5" />
              Pay with Stripe
            </Button>
            <Button
              onClick={() => handlePaymentSelection('credit')}
              className="w-full justify-start bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Pay with Credit Card
            </Button>
            <Button
              onClick={() => handlePaymentSelection('paypal')}
              className="w-full justify-start bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <Paypal className="mr-2 h-5 w-5" />
              Pay with PayPal
            </Button> */}
          </div>
        )}
        {step === 'api' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">API Integration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use the following API call to start using the {modelName} model:
            </p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
              <code className="text-sm text-gray-800 dark:text-gray-200">
                {getApiSample()}
              </code>
            </pre>
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember to replace &apos;YOUR_API_KEY&apos; with the actual API key provided in your account settings.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      {step === 'units' && (
        <CardFooter>
          <Button
            onClick={handleNextStep}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

