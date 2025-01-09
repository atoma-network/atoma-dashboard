import { User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useGlobalState } from '@/app/GlobalStateContext';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/atoma';

export function UserProfileIcon() {
  const { setIsLoggedIn } = useGlobalState();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    getUserProfile().then((profile) => {
      setUsername(profile.username);
    });
  },[])

  const handleLogOut = () => {
    setIsLoggedIn(false);
    window.localStorage.removeItem("access_token");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900"
        >
          <User className="h-5 w-5 text-purple-600 dark:text-purple-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white" 
        align="end" 
        forceMount
      >
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">{username}</p>
        </div>
        <div className="py-2">
          <DropdownMenuItem className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={handleLogOut}>
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

