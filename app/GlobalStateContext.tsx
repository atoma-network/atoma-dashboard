import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import ModalError from "./ModalError";
import ZkLogin from "@/lib/zklogin";


export type LoginState = 'loggedIn' | 'loggedOut' | 'loggingIn';

interface GlobalState {
  logState: LoginState;
  setLogState: (logState: LoginState) => void;
  error?: string;
  setError: (error: string) => void;
  zkLogin: ZkLogin;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [logState, setLogState] = useState<LoginState>('loggingIn');
  const [error, setError] = useState<string | undefined>(undefined);
  const [zkLogin] = useState(new ZkLogin(setLogState));

  useEffect(() => {
    if (!localStorage.getItem("id_token")) {
      if (localStorage.getItem("access_token")) {
        // This is when the user is logged in but not via zklogin. Zklogin will check the state of the user and set the state accordingly.
        setLogState('loggedIn');
      } else {
        setLogState('loggedOut');
      }
    }
  }, []);

  return (
    <GlobalStateContext.Provider value={{ logState: logState, setLogState: setLogState, error, setError, zkLogin }}>
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
