// client/src/pages/OAuthRedirect.js
import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

const OAuthRedirect = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth(); // From context

  useEffect(() => {
    const fetchOAuthUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/success", {
          withCredentials: true,
        });

        const { user, token } = res.data;
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
        navigate("/signin"); // fallback if error
      }
    };

    fetchOAuthUser();
  }, [navigate, setAuthData]);

  return <p className="text-center mt-10 text-lg">Logging you in with Google...</p>;
};

export default OAuthRedirect;
