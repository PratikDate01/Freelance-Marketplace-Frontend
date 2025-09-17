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

        // Require token from backend redirect; if missing, send user to sign-in
        if (!token) {
          console.error('OAuth Redirect Error: missing token in URL');
          navigate('/signin');
          return;
        }

        // Fetch user with Bearer token (no cookie session)
        const me = await axios.get(`${config.API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = me.data;

        // Save token and user
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthData({ user, token });

        // Redirect based on role
        if (user.role === 'freelancer') {
          navigate('/freelancer/dashboard');
        } else {
          navigate('/client/profile');
        }
      } catch (err) {
        console.error('OAuth Redirect Error:', err);
        navigate('/signin');
      }
    };

    fetchOAuthUser();
  }, [navigate, setAuthData]);

  return <p className="text-center mt-10 text-lg">Logging you in with Google...</p>;
};

export default OAuthRedirect;
