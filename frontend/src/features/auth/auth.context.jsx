import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  const auth = {
    user,
    setUser,
    loading,
    setLoading,
  };

    return (<AuthContext.Provider value={auth}>{children}</AuthContext.Provider>);
}