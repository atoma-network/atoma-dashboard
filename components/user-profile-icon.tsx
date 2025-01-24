import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGlobalState } from "@/app/GlobalStateContext";
import { useEffect, useState } from "react";
import { getUserProfile } from "@/lib/atoma";
import {
  ConnectModal,
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
  useSwitchAccount,
} from "@mysten/dapp-kit";
import { LOCAL_STORAGE_ACCESS_TOKEN } from "@/lib/local_storage_consts";
import Image from "next/image";

export function UserProfileIcon() {
  const { setLogState } = useGlobalState();
  const [username, setUsername] = useState<string | null>(null);
  const account = useCurrentAccount();
  const [address, setAddress] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { isConnected } = useCurrentWallet();
  const { currentWallet } = useCurrentWallet();
  const { mutateAsync: switchAccount } = useSwitchAccount();
  const { mutateAsync: walletDisconnect } = useDisconnectWallet();
  const { zkLogin } = useGlobalState();

  useEffect(() => {
    getUserProfile().then((profile) => {
      setUsername(profile.username);
    });
  }, []);

  const handleLogOut = () => {
    setLogState("loggedOut");
    window.localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN);
    zkLogin?.disconnect();
    setAddress(null);
  };

  const handleWalletDisconnect = () => {
    if (zkLogin?.zkLoginUserAddressValue) {
      zkLogin.disconnect();
      if (isConnected) {
        walletDisconnect().catch((error) => {
          console.error("Error disconnecting wallet", error);
        });
      }
    } else {
      walletDisconnect().catch((error) => {
        console.error("Error disconnecting wallet", error);
      });
    }
    setAddress(null);
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}..${address.slice(-4)}`;
  };

  useEffect(() => {
    if (zkLogin?.zkLoginUserAddressValue) {
      setAddress(zkLogin?.zkLoginUserAddressValue);
    } else if (account?.address) {
      setAddress(account?.address);
    } else {
      setAddress(null);
    }
  }, [account, zkLogin?.zkLoginUserAddressValue]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
        >
          <User className="h-5 w-5 text-purple-600 dark:text-purple-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg animate-in fade-in-0 zoom-in-95"
        align="end"
        sideOffset={8}
        forceMount
      >
        {/* Email Section */}
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{username}</p>
        </div>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800 my-2" />

        {/* Wallet Section */}
        {address && (
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 dark:text-white">SuiAccount</p>
              <DropdownMenu>
                <div className="flex flex-row gap-2">
                  <DropdownMenuTrigger asChild>
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-mono cursor-pointer">
                      {truncateAddress(address)}
                    </p>
                  </DropdownMenuTrigger>
                  <Image
                    src={isCopied ? "/copy-done.svg" : "/copy.svg"}
                    className="cursor-pointer dark:invert"
                    alt="copy"
                    title="Copy to clipboard"
                    width={14}
                    height={14}
                    onClick={() => {
                      navigator.clipboard.writeText(address);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 1000);
                    }}
                  />
                </div>
                <DropdownMenuContent>
                  {currentWallet?.accounts.map((acc) => (
                    <DropdownMenuItem
                      key={acc.address}
                      onClick={() => switchAccount({ account: acc })}
                      className="w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors rounded-md"
                      title={acc.address}
                    >
                      {acc.label || truncateAddress(acc.address)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {/* Actions Section */}
        {address ? (
          <DropdownMenuItem
            className="w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors rounded-md"
            onClick={handleWalletDisconnect}
          >
            Disconnect Wallet
          </DropdownMenuItem>
        ) : (
          <ConnectModal
            trigger={
              <span className="relative flex select-none items-center gap-2 outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors rounded-md">
                Connect sui wallet
              </span>
            }
          />
        )}
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800 my-2" />
        <DropdownMenuItem
          className="w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors rounded-md"
          onClick={handleLogOut}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
