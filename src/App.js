import React, { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Navbar from "./components/Navbar";
import Modal from "./components/Modal";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Hook
import { useAuth } from "./hooks/AuthContext";

// Public Pages
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import OAuthCallback from "./pages/OAuthCallback";
import OAuthRedirect from "./pages/OAuthRedirect";
import PublicLayout from "./Layouts/PublicLayout"; // ⬅️ should include <Outlet />

// Client Pages
import ClientProfile from "./pages/Client/ClientProfile";
import BrowseGigs from "./pages/Client/BrowseGigs";
import Orders from "./pages/Client/Orders";
import TrackOrders from "./pages/Client/TrackOrders";
import GigDetails from "./pages/Client/GigDetails";
import PlaceOrder from "./pages/Client/PlaceOrder";
import OrderSuccess from "./pages/Client/OrderSuccess";

// Freelancer Pages
import FreelancerProfile from "./pages/FreelancerProfile";
import CreateGig from "./pages/CreateGig";
import MyGigs from "./pages/MyGigs";
import EditGig from "./pages/EditGig";

const LayoutWrapper = ({ authMode, setAuthMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isDashboardRoute =
    location.pathname.startsWith("/client") ||
    location.pathname.startsWith("/freelancer");

  const handleAuthSuccess = () => {
    setAuthMode(null);
    if (user?.role === "freelancer") {
      navigate("/freelancer/profile");
    } else if (user?.role === "client") {
      navigate("/client/profile");
    } else {
      navigate("/");
    }
  };

  return (
    <>
      {!isDashboardRoute && (
        <Navbar
          onSignInClick={() => setAuthMode("signin")}
          onRegisterClick={() => setAuthMode("register")}
        />
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/oauth-redirect" element={<OAuthRedirect />} />
        <Route path="/edit-gig/:id" element={<EditGig />} />

        {/* Client Dashboard Routes */}
        <Route
          path="/client"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <PublicLayout />
            </ProtectedRoute>
          }
        >
          <Route path="profile" element={<ClientProfile />} />
          <Route path="browse-gigs" element={<BrowseGigs />} />
          <Route path="gig/:id" element={<GigDetails />} />
          <Route path="place-order/:id" element={<PlaceOrder />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="orders" element={<Orders />} />
          <Route path="track-orders" element={<TrackOrders />} />
        </Route>

        {/* Freelancer Dashboard Routes */}
        <Route
          path="/freelancer"
          element={
            <ProtectedRoute allowedRoles={["freelancer"]}>
              <PublicLayout />
            </ProtectedRoute>
          }
        >
          <Route path="profile" element={<FreelancerProfile />} />
          <Route path="create-gig" element={<CreateGig />} />
          <Route path="my-gigs" element={<MyGigs />} />
        </Route>
      </Routes>

      {/* Auth Modal */}
      <Modal isOpen={!!authMode} onClose={() => setAuthMode(null)}>
        {authMode === "signin" && (
          <SignIn
            onSwitchToRegister={() => setAuthMode("register")}
            onSuccess={handleAuthSuccess}
          />
        )}
        {authMode === "register" && (
          <Register
            onSwitchToSignIn={() => setAuthMode("signin")}
            onClose={() => setAuthMode(null)}
          />
        )}
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

function App() {
  const [authMode, setAuthMode] = useState(null);
  return <LayoutWrapper authMode={authMode} setAuthMode={setAuthMode} />;
}

export default App;
