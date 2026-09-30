import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { getMe, login, logout, register } from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async ({ email, password }) => {
    setLoading(true);

    try {
      const data = await login({ email, password });

      setUser(data.user);
      setLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const data = await register({ username, email, password });

      setUser(data.user);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();

      setUser(null);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const data = await getMe();

        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [setLoading, setUser]);

  return {
    user,
    loading,
    handleLogin,
    handleRegister,
    handleLogout,
  };
};
