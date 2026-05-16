import { createContext, useContext, useState } from "react";
import api from "../api/axiosInstance.js";
import { saveToken, loadToken, clearToken, saveUser, loadUser } from "../utils/tokenStorage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser());
  const [token, setTokenState] = useState(loadToken());

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    saveToken(data.data.token);
    saveUser(data.data.user);
    setTokenState(data.data.token);
    setUser(data.data.user);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/api/auth/register", { name, email, password });
    saveToken(data.data.token);
    saveUser(data.data.user);
    setTokenState(data.data.token);
    setUser(data.data.user);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
