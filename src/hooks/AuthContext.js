import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "../config/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // loading = true initially
  
  // Session timeout (24 hours in milliseconds)
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        const loginTime = localStorage.getItem("loginTime");

        // Check if session has expired
        if (loginTime && Date.now() - parseInt(loginTime) > SESSION_TIMEOUT) {
          console.log("🔴 Session expired, logging out...");
          logout();
          return;
        }

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          console.log("✅ Loaded user from localStorage:", parsedUser);
          
          // Update login time to extend session
          localStorage.setItem("loginTime", Date.now().toString());
        }

        // If user is missing but token exists, re-fetch user from backend
        if (storedToken && !storedUser) {
          const res = await axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          if (res.data && res.data.role) {
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
            localStorage.setItem("loginTime", Date.now().toString());
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
  }, [SESSION_TIMEOUT]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback((userData, jwtToken) => {
    if (!userData || !jwtToken) return;
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("loginTime", Date.now().toString());
    setUser(userData);
    setToken(jwtToken);
  }, []);

  const logout = useCallback(() => {
    // Clear all auth data
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("authData");
    setUser(null);
    setToken(null);
    
    // Force redirect to home page
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
      localStorage.setItem("loginTime", Date.now().toString());
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
