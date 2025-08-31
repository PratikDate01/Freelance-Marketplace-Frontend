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
        if (!token) throw new Error('Missing token from OAuth redirect');

        // Fetch current user using the token
        const me = await axios.get(`${config.API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = me.data;

        // Save to localStorage and context
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setAuthData({ user, token });

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
