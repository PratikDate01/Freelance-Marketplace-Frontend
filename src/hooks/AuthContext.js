import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // loading = true initially

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          console.log("✅ Loaded user from localStorage:", parsedUser);
        }

        // If user is missing but token exists, re-fetch user from backend
        if (storedToken && !storedUser) {
          const res = await axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          if (res.data && res.data.role) {
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
          }
        }
      } catch (error) {
        console.error("🔴 Auth initialization failed:", error);
        logout();
      } finally {
        setLoading(false); // authentication check completed
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback((userData, jwtToken) => {
    if (!userData || !jwtToken) return;
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
    setUser(userData);
    setToken(jwtToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    window.location.href = "/";
  }, []);

  const authFetch = useCallback(
    async (url, options = {}) => {
      try {
        const res = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized. Logging out...");
        }

        return res;
      } catch (err) {
        console.error("authFetch error:", err.message);
        logout();
        throw err;
      }
    },
    [token, logout]
  );

  const setAuthData = ({ user, token }) => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      setUser(user);
      setToken(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, authFetch, setAuthData, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
