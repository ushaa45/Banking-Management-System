import { createContext, useContext, useState } from "react";
import { AuthApi } from "../api/api";
import { decodeJwt } from "../utils/jwt";

const AuthContext = createContext(null);

function parseUser(token) {
  const claims = decodeJwt(token);
  if (!claims) return null;

  // Check JWT expiration. 
  // // JWT exp is stored in seconds, while Date.now() is milliseconds. 
  if (claims.exp && claims.exp * 1000 <= Date.now()) {
    return null;

  }
  return {
    username: claims.sub,
    // JWT roles come back as "ROLE_TELLER" etc; strip the prefix for UI checks
    roles: (claims.roles || []).map((r) =>
      r.replace(/^ROLE_/, "")),
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => { 
    const storedToken = localStorage.getItem("bank_jwt");

  if (!storedToken) return null; 
  
  const user = parseUser(storedToken); 

  // Token is expired or invalid. 
   if (!user) { 
    localStorage.removeItem("bank_jwt"); 
    return null;
   } 

   return storedToken; 
  });

  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem("bank_jwt");

   if (!storedToken) return null;

  const parsedUser = parseUser(storedToken); 

   // Remove expired/invalid token immediately. 
   if (!parsedUser) { 
    localStorage.removeItem("bank_jwt"); 
    return null; 
  } 
   
    return parsedUser; 
  });

  async function login(username, password) {
    const res = await AuthApi.login({ 
      username, 
      password 
    });

    const newToken = res.data.token;

   const parsedUser = parseUser(newToken); 
   if (!parsedUser) { 
    throw new Error("Login succeeded but the server returned an invalid or expired JWT.");
   } 
   localStorage.setItem("bank_jwt", newToken);
    setToken(newToken); 
    setUser(parsedUser);
  
    return res.data;
  }

  function logout() {
    localStorage.removeItem("bank_jwt");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider 
    value={
      { token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}