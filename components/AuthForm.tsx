import { useState, useRef } from "react";
import api from "@/lib/api";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { LOCAL_STORAGE_ACCESS_TOKEN } from "@/lib/local_storage_consts";

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

  const [loginType, setLoginType] = useState<"login" | "register">(type);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      let response;
      if (loginType === "login") {
        response = await api.post("/login", { email: email, password });
      } else {
        response = await api.post("/register", { user_profile: { email, name }, password });
      }
      console.log(response.status, response.data);

      // Save access token and refresh token to session storage
      localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN, response.data.access_token);

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
