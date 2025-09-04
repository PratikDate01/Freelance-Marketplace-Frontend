// client/src/pages/OAuthRedirect.js
import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import config from "../config/environment";

const OAuthRedirect = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  useEffect(() => {
    const fetchOAuthUser = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        // If backend uses cookie session, try fetching without token first
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const me = await axios.get(`${config.API_URL}/api/auth/me`, {
          headers,
          withCredentials: true,
        });
        const user = me.data;

        // Save token if present
        if (token) localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setAuthData({ user, token: token || localStorage.getItem('token') });

        // Redirect based on role
        if (user.role === "freelancer") {
          navigate("/freelancer/dashboard");
        } else {
          navigate("/client/profile");
        }
      } catch (err) {
        console.error("OAuth Redirect Error:", err);
        navigate("/signin");
      }
    };

    fetchOAuthUser();
  }, [navigate, setAuthData]);

  return <p className="text-center mt-10 text-lg">Logging you in with Google...</p>;
};

export default OAuthRedirect;
