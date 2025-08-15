import React, { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/AuthContext";
import { useNavigate } from "react-router-dom";

const Register = ({ onSwitchToSignIn, onClose }) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("client");

  const { login } = useAuth();
  const navigate = useNavigate();

  const isMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isFormValid =
    email && name && isMinLength && hasUpperCase && hasLowerCase && hasNumber;

  const handleGoogleLogin = () => {
    window.open("http://localhost:5000/api/auth/google", "_self");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await response.json();

      if (response.ok) {
        const { user, token } = data;
        login(user, token); // ✅ populate context and localStorage
        toast.success("Registration successful!");

        if (onClose) onClose();

        if (user.role === "freelancer") {
          navigate("/freelancer/dashboard");
        } else {
          navigate("/client/profile");
        }
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Something went wrong during registration.");
    }
  };

  return (
    <AuthLayout
      title="Join Fiverr today"
      points={[
        "Post your services and start selling",
        "Work with global clients",
        "Grow your freelance business",
      ]}
    >
      <h2 className="text-2xl font-bold mb-4">Create your account</h2>
      <p className="mb-6 text-sm text-gray-600">
        Already have an account?{" "}
        <button
          onClick={onSwitchToSignIn}
          className="text-blue-500 hover:underline"
        >
          Sign in here
        </button>
      </p>

      {!showEmailForm ? (
        <div className="space-y-3">
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
            Continue with email
          </button>

          <div className="flex items-center my-2">
            <hr className="flex-grow border-gray-300" />
            
            <hr className="flex-grow border-gray-300" />
          </div>

          
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border px-4 py-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border px-4 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border px-4 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <select
            className="w-full border px-4 py-2 rounded text-gray-700"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="client">I’m a Client (Hire freelancers)</option>
            <option value="freelancer">I’m a Freelancer (Offer services)</option>
          </select>

          <ul className="text-sm text-gray-600 space-y-1">
            <li className={isMinLength ? "text-green-600" : ""}>
              ✔ At least 8 characters
            </li>
            <li className={hasUpperCase ? "text-green-600" : ""}>
              ✔ At least 1 uppercase letter
            </li>
            <li className={hasLowerCase ? "text-green-600" : ""}>
              ✔ At least 1 lowercase letter
            </li>
            <li className={hasNumber ? "text-green-600" : ""}>
              ✔ At least 1 number
            </li>
          </ul>

          <button
            type="submit"
            className={`w-full py-2 rounded text-white ${
              isFormValid
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            disabled={!isFormValid}
          >
            Continue
          </button>

          <p className="text-xs text-gray-500 mt-2">
            By joining, you agree to the Fiverr{" "}
            <a href="#" className="text-green-600 underline">
              Terms of Service
            </a>{" "}
            and to occasionally receive emails from us. Please read our{" "}
            <a href="#" className="text-green-600 underline">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default Register;
