import React, { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/AuthContext";
import { useNavigate } from "react-router-dom";

const SignIn = ({ onSwitchToRegister, onSuccess }) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.open("http://localhost:5000/api/auth/google", "_self");
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { user, token } = data;
        login(user, token); // ✅ update context and localStorage
        toast.success("Login successful!");

        if (onSuccess) onSuccess();

        if (user.role === "freelancer") {
          navigate("/freelancer/profile");
        } else if (user.role === "client") {
          navigate("/client/profile");
        } else {
          navigate("/");
        }
      } else {
        toast.error(data.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong during login.");
    }
  };

  return (
    <AuthLayout
      title="Success starts here"
      points={[
        "Over 700 categories",
        "Quality work done faster",
        "Access to talent and businesses across the globe",
      ]}
    >
      <h2 className="text-2xl font-bold mb-4">Sign in to your account</h2>
      <p className="mb-6 text-sm text-gray-600">
        Don’t have an account?{" "}
        <button
          onClick={onSwitchToRegister}
          className="text-blue-500 hover:underline"
        >
          Join here
        </button>
      </p>

      <div className="space-y-3">
        {!showEmailForm ? (
          <>
            <button
              onClick={handleGoogleLogin}
              className="w-full py-2 border rounded flex items-center justify-center gap-2"
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                className="h-5 w-5"
                alt="Google logo"
              />
              Continue with Google
            </button>

            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full py-2 border rounded"
            >
              Continue with email/username
            </button>

            <div className="flex items-center my-2">
              <hr className="flex-grow border-gray-300" />
            
              <hr className="flex-grow border-gray-300" />
            </div>

            
          </>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              Continue
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default SignIn;
