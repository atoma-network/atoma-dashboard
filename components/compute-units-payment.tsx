import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight, X } from 'lucide-react'
import { ConnectModal, useCurrentAccount, useCurrentWallet, useSignAndExecuteTransaction, useSignPersonalMessage, useSuiClient } from "@mysten/dapp-kit"
import {  getSuiAddress, ModelModality, payUSDC, proofRequest, usdcPayment } from "@/lib/atoma"
import { useGlobalState } from "@/app/GlobalStateContext"
import { GetApiSample } from "@/components/ui/GetApiSample"
import { LOCAL_STORAGE_ACCESS_TOKEN } from "@/lib/local_storage_consts"

interface ComputeUnitsPaymentProps {
  modelName: string
  features: ModelModality[]
  pricePer1MUnits: number
  onClose: () => void
}

export function ComputeUnitsPayment({ modelName, features, pricePer1MUnits, onClose }: ComputeUnitsPaymentProps) {
  const [step, setStep] = useState<'units' | 'payment' | 'api' | 'result'>('api')
  const [computeUnits, setComputeUnits] = useState<number>(1000)
  const suiClient = useSuiClient();
  const { connectionStatus } = useCurrentWallet();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const [walletConfirmed, setWalletConfirmed] = useState<boolean>(false);
  const { setError } = useGlobalState();
  const account = useCurrentAccount();
  const handleNextStep = () => {
    if (step === 'units') {
      setStep('payment')
    } else if (step === 'payment') {
      setStep('result')
    } else if (step === 'result') {
      setStep('api')
    } 
  }

  useEffect(() => {
    getSuiAddress().then((suiAddress) => {
      setWalletConfirmed(suiAddress != null && suiAddress == account?.address)
    });
  }, [account]);

  const handleConfirmWallet = async () => {
    if (account == null) {
      return;
    }
    const access_token = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN);
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
      account,
      message: new TextEncoder().encode(
        `Sign this message to prove you are the owner of this wallet. User ID: ${user_id}`
      ),
    }).then((res) => {
      proofRequest(res.signature, account.address)
        .catch((error:Response) => {
        setError(`${error.status} : ${error.statusText}`);
          console.error(error);
        });
    });
  }

  const handleUSDCPayment = async () => {
    if (account == null) {
      return;
    }

    try {
      const suiAddress = await getSuiAddress();
      if (suiAddress == null || suiAddress != account?.address) {
        // We haven't proven the SUI address yet
        throw new Error("SUI address not found or not matching");
      }
      payUSDC((computeUnits / 1000000) * pricePer1MUnits , suiClient, signAndExecuteTransaction, account).then((res: unknown) => {
        const txDigest = (res as { digest: string }).digest;
        setTimeout(() => {
          usdcPayment(txDigest).then((res) => {
            handleNextStep();
          }).catch((error:Response) => {
            setError(`${error.status} : ${error.statusText}`);
            console.error(error)
          });
        }, 1000);
      }).catch((error) => {
        setError(`${error}`);
        console.error(error)
      });
    } catch {
      handleConfirmWallet();
    }
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
          {step === 'units' && 'Select Tokens'}
          {step === 'payment' && 'Choose Payment Method'}
          {step === 'api' && 'Connect to Your Model'}
          {step === 'result' && 'Payment Successful'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'units' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="computeUnits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tokens
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
              <Button onClick={() => walletConfirmed?handleUSDCPayment():handleConfirmWallet()} className="w-full justify-start bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                {walletConfirmed?"Pay with USDC":"Confirm Account"}
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
            <pre className="bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto p-0">
              <GetApiSample modality={features[0]} modelName={modelName}/>
            </pre>
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember to replace &apos;YOUR_API_KEY&apos; with the actual API key provided in your account settings.
              </p>
            </div>
          </div>
        )}
        {step === 'result' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payment Successful</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your account has been topped up with ${((computeUnits / 1000000) * (pricePer1MUnits / 1000000)).toFixed(2)}.
            </p>
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
      {step === "result" && (
          <CardFooter>
            <Button
              onClick={handleNextStep}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
          </CardFooter>
        )
      }
    </Card>
  )
}

