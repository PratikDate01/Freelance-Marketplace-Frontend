import React, { useState } from "react";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Navbar from "./components/Navbar";
import Modal from "./components/Modal";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Auth Hook
import { useAuth } from "./hooks/AuthContext";

// Public Pages
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import OAuthRedirect from "./pages/OAuthRedirect";
import PublicLayout from "./Layouts/PublicLayout"; // ⬅️ should include <Outlet />

// Client Pages
import ClientProfile from "./pages/Client/ClientProfile";
import BrowseGigs from "./pages/Client/BrowseGigs";
import Orders from "./pages/Client/Orders";
import ClientOrderDetails from "./pages/Client/OrderDetails";
import TrackOrders from "./pages/Client/TrackOrders";
import GigDetails from "./pages/Client/GigDetails";
import PlaceOrder from "./pages/Client/PlaceOrder";
import OrderSuccess from "./pages/Client/OrderSuccess";

// Freelancer Pages
import FreelancerDashboard from "./pages/Freelancer/FreelancerDashboard";
import FreelancerOrders from "./pages/Freelancer/FreelancerOrders";
import FreelancerOrderDetails from "./pages/Freelancer/FreelancerOrderDetails";
import FreelancerEarnings from "./pages/Freelancer/FreelancerEarnings";
import CreateGig from "./pages/CreateGig";
import MyGigs from "./pages/MyGigs";
import EditGig from "./pages/EditGig";

// Shared Pages
import Messages from "./pages/Messages";
import SharedOrderDetails from "./pages/OrderDetails";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Favorites from "./pages/Favorites";
import Billing from "./pages/Billing";
import Referrals from "./pages/Referrals";

// Test Pages - Removed TestPayment

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Loading...</p>
    </div>
  </div>
);

// Auto Redirect Component
const AutoRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === "freelancer") {
    return <Navigate to="/freelancer/dashboard" replace />;
  } else if (user?.role === "client") {
    return <Navigate to="/client/profile" replace />;
  }
  
  return <Navigate to="/" replace />;
};

const LayoutWrapper = ({ authMode, setAuthMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const isPublicRoute = 
    location.pathname === "/" ||
    location.pathname === "/oauth-callback" ||
    location.pathname === "/oauth-redirect";

  const handleAuthSuccess = () => {
    setAuthMode(null);
    if (user?.role === "freelancer") {
      navigate("/freelancer/dashboard");
    } else if (user?.role === "client") {
      navigate("/client/profile");
    } else {
      navigate("/");
    }
  };

  // Show loading screen while authentication is being checked
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* Show default navbar only for public routes when user is not authenticated */}
      {!user && isPublicRoute && (
        <Navbar
          onSignInClick={() => setAuthMode("signin")}
          onRegisterClick={() => setAuthMode("register")}
        />
      )}

      <Routes>
        {/* Public Routes - Only accessible when not authenticated */}
        <Route 
          path="/" 
          element={
            user ? <AutoRedirect /> : <Home />
          } 
        />

        <Route path="/oauth-redirect" element={<OAuthRedirect />} />
        
        {/* Test Routes - Removed for production */}
        
        {/* Legacy route for edit-gig - redirect to proper dashboard */}
        <Route 
          path="/edit-gig/:id" 
          element={
            <ProtectedRoute allowedRoles={["freelancer"]}>
              <EditGig />
            </ProtectedRoute>
          } 
        />

        {/* Client Dashboard Routes */}
        <Route
          path="/client"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <PublicLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="browse-gigs" element={<BrowseGigs />} />
          <Route path="gig/:id" element={<GigDetails />} />
          <Route path="place-order/:id" element={<PlaceOrder />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<ClientOrderDetails />} />
          <Route path="track-orders" element={<TrackOrders />} />
          <Route path="messages" element={<Messages />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="settings" element={<Settings />} />
          <Route path="billing" element={<Billing />} />
          <Route path="referrals" element={<Referrals />} />
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
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<FreelancerDashboard />} />
          <Route path="orders" element={<FreelancerOrders />} />
          <Route path="orders/:id" element={<FreelancerOrderDetails />} />
          <Route path="earnings" element={<FreelancerEarnings />} />
          <Route path="create-gig" element={<CreateGig />} />
          <Route path="my-gigs" element={<MyGigs />} />
          <Route path="edit-gig/:gigId" element={<EditGig />} />
          <Route path="messages" element={<Messages />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="settings" element={<Settings />} />
          <Route path="billing" element={<Billing />} />
          <Route path="referrals" element={<Referrals />} />
        </Route>

        {/* Shared Routes - Accessible by both roles */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["client", "freelancer"]}>
              <Notifications />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/order/:id"
          element={
            <ProtectedRoute allowedRoles={["client", "freelancer"]}>
              <SharedOrderDetails />
            </ProtectedRoute>
          }
        />

        {/* Catch all route - redirect based on authentication */}
        <Route 
          path="*" 
          element={
            user ? <AutoRedirect /> : <Navigate to="/" replace />
          } 
        />
      </Routes>

      {/* Auth Modal - Only show when user is not authenticated */}
      {!user && (
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
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

function App() {
  const [authMode, setAuthMode] = useState(null);
  return (
    <ErrorBoundary>
      <LayoutWrapper authMode={authMode} setAuthMode={setAuthMode} />
    </ErrorBoundary>
  );
}

export default App;
