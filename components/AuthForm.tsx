import { useState, useRef } from "react";
import api from "@/lib/api";
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

interface AuthFormProps {
  type: "login" | "register"; 
  onClose: () => void; 
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const toastRef = useRef<Toast>(null);

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault();
    const endpoint = type === "login" ? "/login" : "/register";
    
    try {
      const response = await api.post(endpoint, { username, password });
      console.log(response.data);
      
      // Save access token and refresh token to session storage
      sessionStorage.setItem('atoma_access_token', response.data.access_token);
      sessionStorage.setItem('atoma_refresh_token', response.data.refresh_token);
      
      toastRef.current?.show({ severity: 'success', summary: 'Success', detail: 'Login successful!', life: 3000 });
      //onClose(); 
      window.location.reload()

    } catch (error: any) {
      console.error("Error during authentication:", error);
      if (error.response && error.response.status === 401) {
        toastRef.current?.show({ severity: 'error', summary: 'Error', detail: 'Bad request. Please check your credentials.', life: 3000 });
      }
    }
  };

  return (
    <div className="p-6 border-round shadow-2 w-full max-w-md mx-auto">
      <Toast ref={toastRef} />
      <h2 className="text-xl font-bold mb-6 text-center">{type === "login" ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
         <InputText
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="p-inputtext-lg border border-gray-900 p-3 rounded"
          style={{ width: '100%' }}
        />
        <InputText
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-inputtext-lg border border-gray-900 p-3 rounded"
          style={{ width: '100%' }}
        />
        <Button type="submit" label={type === "login" ? "Login" : "Register"} className="p-button-lg p-3 bg-purple-800 text-white" style={{ width: '100%' }} />
      </form>
    </div>
  );
  
};

export default AuthForm; 