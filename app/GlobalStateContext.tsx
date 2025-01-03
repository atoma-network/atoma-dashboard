import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import ModalError from "./ModalError";

interface GlobalState {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  error?: string;
  setError: (error: string) => void;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <GlobalStateContext.Provider value={{ isLoggedIn, setIsLoggedIn, error, setError }}>
      {children}
      {error && <ModalError message={error} onClose={() => setError(undefined)}/>}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};
