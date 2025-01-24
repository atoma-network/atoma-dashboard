import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { loginUser, registerUser } from "@/lib/atoma";
import { useGlobalState } from "@/app/GlobalStateContext";
import { LOCAL_STORAGE_ACCESS_TOKEN } from "@/lib/local_storage_consts";

interface LoginRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginRegisterModal({ isOpen, onClose }: LoginRegisterModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setLogState, zkLogin } = useGlobalState();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin();
    } else {
      onRegister();
    }
  };

  const toggleMode = () => setIsLogin(!isLogin);

  const onLogin = () => {
    loginUser(email, password)
      .then(({ access_token, refresh_token }) => {
        localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN, access_token);
        document.cookie = `refresh_token=${refresh_token}; path=/; secure; HttpOnly; SameSite=Strict`;
        setLogState('loggedIn');
        onClose();
      })
      .catch((error: Response) => {
        if (error.status === 401) {
          setError("Invalid username or password");
        } else {
          setError(`${error.status} : ${error.statusText}`);
        }
      });
  };

  const onRegister = () => {
    registerUser(email, password)
      .then(({ access_token, refresh_token }) => {
        localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN, access_token);
        document.cookie = `refresh_token=${refresh_token}; path=/; secure; HttpOnly; SameSite=Strict`;
        setLogState('loggedIn');
        onClose();
      })
      .catch((error: Response) => {
        if (error.status === 409) {
          setError("User already exists");
        } else {
          setError(`Server returned an error ${error.status} : ${error.statusText}`);
        }
      });
  };

  const handleGoogleOauth = () => {
    zkLogin.getURL().then((url) => {
      window.location.href = url;
    }).catch((error) => {
      console.error(error);
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] text-center">
        <DialogHeader className="space-y-2 text-center">
          <DialogTitle className="text-2xl font-bold text-purple-700 dark:text-purple-300 text-center">
            {isLogin ? "Log In" : "Register"}
          </DialogTitle>
          <DialogDescription className="text-purple-600 dark:text-purple-400 mx-auto">
            {isLogin ? "Enter your credentials to access your account." : "Create a new account to get started."}
          </DialogDescription>
        </DialogHeader>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 text-left">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-left">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                className="col-span-3 border-purple-200 dark:border-gray-700"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-left">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                className="col-span-3 border-purple-200 dark:border-gray-700"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              {isLogin ? "Log In" : "Register"}
            </Button>
          </div>
        </form>
        {process.env.NEXT_PUBLIC_ENABLE_ZK_LOGIN_GOOGLE==='true' && (
          <Button type="submit" className="w-full bg-white dark:bg-black hover:bg-gray-200 dark:hover:bg-gray-800 text-black dark:text-white border border-gray-400 dark:border-gray-600" onClick={handleGoogleOauth}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="size-6 mr-3">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <span>Continue with Google</span>
          </Button>
        )}
        <Button variant="link" onClick={toggleMode} className="text-purple-600 hover:text-purple-700">
          {isLogin ? "Don't have an account? Register" : "Already have an account? Log In"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
