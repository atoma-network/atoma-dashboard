import { useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import ZkLogin from "@/lib/zklogin";
import { useSettings } from "@/contexts/settings-context";
import { loginUser, registerUser } from "@/lib/api";

interface AuthFormProps {
  type: "login" | "register";
  onClose: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toastRef = useRef<Toast>(null);
  const { settings, updateSettings, updateZkLoginSettings } = useSettings();

  const [loginType, setLoginType] = useState<"login" | "register">(type);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      let response;
      if (loginType === "login") {
        response = await loginUser(email, password);
      } else {
        response = await registerUser({ email, name }, password);
      }

      // Save access token and refresh token to session storage
      updateSettings({ accessToken: response.data.access_token, loggedIn: true });

      toastRef.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Login successful!",
        life: 3000,
      });
      //onClose();
      window.location.reload();
    } catch (error: any) {
      console.error("Error during authentication:", error);
      if (error.response && error.response.status === 401) {
        toastRef.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Bad request. Please check your credentials.",
          life: 3000,
        });
      }
      if (error.response && error.response.status === 409) {
        toastRef.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Account already exists",
          life: 3000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleOauth = () => {
    const zkLogin = new ZkLogin(settings, updateSettings, updateZkLoginSettings);
    zkLogin
      .getURL(settings.zkLogin, updateZkLoginSettings)
      .then((url) => {
        window.location.href = url;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="p-8  w-full max-w-md mx-auto dark:bg-darkMode">
      <Toast ref={toastRef} />

      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-50">
        {loginType === "login" ? "Enter your credentials to access your account." : "Create Account"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <InputText
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-inputtext-lg w-full border  border-gray-600 p-3 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-inherit"
          />
        </div>
        {loginType === "register" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <InputText
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="p-inputtext-lg w-full border  border-gray-600 p-3 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-inherit"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <InputText
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-inputtext-lg w-full border border-gray-600 p-3 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-inherit"
          />
        </div>

        {loginType === "login" && (
          <div className="flex justify-end">
            <a href="#" className="text-sm text-primary hover:text-primary">
              Forgot password?
            </a>
          </div>
        )}

        <Button
          type="submit"
          label={isLoading ? "please wait ..." : loginType === "login" ? "Sign In" : "Create Account"}
          className="p-button-lg p-4 bg-primary hover:bg-primary text-white font-medium rounded-md transition-colors duration-200"
        />

        {process.env.NEXT_PUBLIC_ENABLE_ZK_LOGIN_GOOGLE === "true" && (
          <Button
            className="p-button p-4 font-medium rounded-md transition-colors duration-200 bg-white dark:bg-black hover:bg-gray-200 dark:hover:bg-gray-800 text-black dark:text-white border border-gray-400 dark:border-gray-600"
            onClick={handleGoogleOauth}
          >
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

        <div className="text-center text-sm text-gray-600 mt-4">
          {loginType === "login" ? (
            <p>
              Don't have an account?{" "}
              <a href="#" className="text-primary hover:underline" onClick={() => setLoginType("register")}>
                Sign up
              </a>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <a href="#" className="text-primary hover:underline" onClick={() => setLoginType("login")}>
                Sign in
              </a>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
