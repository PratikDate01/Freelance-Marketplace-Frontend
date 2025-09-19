import React, { useState, useEffect } from "react";
import BrowseGigs from "./BrowseGigs";
import Orders from "./Orders";
import TrackOrders from "./TrackOrders";
import GigDetails from "./GigDetails";
import ProtectedRoute from "../../components/ProtectedRoute";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../hooks/AuthContext";
import {
  Search,
  Package,
  BarChart3,
  LogOut,
  User,
  ShoppingCart,
  Clock,
  Settings,
  MessageCircle,
  Heart,
  CreditCard,
  TrendingUp,
  Calendar,
  DollarSign,
  Activity,
  Bell,
  Edit3,
  MapPin,
  Phone,
  Mail,
  Globe
} from "lucide-react";
import axios from "../../config/axios";
import { toast } from "react-toastify";
import MessagesPage from "../Messages";
import { formatPrice } from "../../utils/currency";

const ClientProfile = () => {
  const [page, setPage] = useState("profile");
  const [selectedGig, setSelectedGig] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    savedGigs: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    phone: '',
    website: '',
    avatar: '',
    joinedDate: ''
  });

  // Messages page state
  const [selectedConversation, setSelectedConversation] = useState(null);

  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phone || '',
        website: user.website || '',
        avatar: user.avatar || '',
        joinedDate: user.createdAt || ''
      });
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch orders statistics (includes recent orders)
      const ordersResponse = await axios.get('/api/orders/buyer/stats');

      // Update stats
      if (ordersResponse.data) {
        setStats({
          totalOrders: ordersResponse.data.totalOrders || 0,
          activeOrders: ordersResponse.data.activeOrders || 0,
          completedOrders: ordersResponse.data.completedOrders || 0,
          totalSpent: ordersResponse.data.totalSpent || 0,
          savedGigs: ordersResponse.data.savedGigs || 0
        });

        // Update recent orders from the same response
        if (ordersResponse.data.recentOrders) {
          setRecentOrders(ordersResponse.data.recentOrders.slice(0, 3));
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setStats({
        totalOrders: 0,
        activeOrders: 0,
        completedOrders: 0,
        totalSpent: 0,
        savedGigs: 0
      });
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-800',
      delivered: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put('/api/users/profile', profileData);

      // Update local state and auth context
      setProfileData(prev => ({ ...prev, ...response.data.user }));

      toast.success('Profile updated successfully!');
      setPage("profile");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {page === "profile" && (
        <>
          <PageHeader
            title="Client Dashboard"
            subtitle="Manage your projects and find talented freelancers"
            showBackButton={false}
          />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=10b981&color=fff&size=80`}
                      alt={profileData.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profileData.name || 'Client'}</h1>
                    <p className="text-gray-600 mb-2">{profileData.email}</p>
                    {profileData.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profileData.location}</span>
                      </div>
                    )}
                    {profileData.joinedDate && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>Member since {formatDate(profileData.joinedDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage("settings")}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
              {profileData.bio && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-gray-700">{profileData.bio}</p>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalSpent)}</p>
                  </div>
                </div>
              </div>



              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Saved Gigs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.savedGigs}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setPage("browse")}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                        <Search className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Browse Services</p>
                        <p className="text-sm text-gray-600">Find talented freelancers</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setPage("orders")}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                    >
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200">
                        <Package className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">My Orders</p>
                        <p className="text-sm text-gray-600">View and manage orders</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setPage("track")}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200 group"
                    >
                      <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200">
                        <BarChart3 className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Track Orders</p>
                        <p className="text-sm text-gray-600">Monitor order progress</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setPage("messages")}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                    >
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                        <MessageCircle className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Messages</p>
                        <p className="text-sm text-gray-600">Chat with freelancers</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                    <button
                      onClick={() => setPage("orders")}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All
                    </button>
                  </div>
                  
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-4">📦</div>
                      <p className="text-gray-600">No orders yet</p>
                      <p className="text-sm text-gray-500 mt-1">Start by browsing services!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order._id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <img
                            src={order.gigId?.image || 'https://placehold.co/60'}
                            alt={order.gigTitle}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-grow">
                            <h3 className="font-medium text-gray-900">{order.gigTitle}</h3>
                            <p className="text-sm text-gray-600">{order.sellerId?.name}</p>
                            <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(order.totalAmount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Account Info */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                  <div className="space-y-3">
                    {profileData.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{profileData.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{profileData.email}</span>
                    </div>
                    {profileData.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                          {profileData.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-gray-400 text-3xl mb-2">📊</div>
                      <p className="text-sm text-gray-600">No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-90">Success Rate</span>
                      <span className="font-bold">
                        {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-90">Avg. Order Value</span>
                      <span className="font-bold">
                        {stats.totalOrders > 0 ? formatPrice(stats.totalSpent / stats.totalOrders) : formatPrice(0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-90">Member Level</span>
                      <span className="font-bold">
                        {stats.totalOrders >= 10 ? 'Premium' : stats.totalOrders >= 5 ? 'Regular' : 'New'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <ProtectedRoute>
        {page === "browse" && (
          <BrowseGigs
            goBack={() => setPage("profile")}
            onGigSelect={(gig) => {
              setSelectedGig(gig);
              setPage("gigDetails");
            }}
          />
        )}

        {page === "gigDetails" && (
          <GigDetails
            gig={selectedGig}
            goBack={() => setPage("browse")}
          />
        )}

        {page === "orders" && (
          <Orders goBack={() => setPage("profile")} />
        )}

        {page === "track" && (
          <TrackOrders goBack={() => setPage("profile")} />
        )}

        {page === "settings" && (
          <div className="min-h-screen bg-gray-50">
            <PageHeader
              title="Profile Settings"
              subtitle="Update your profile information and preferences"
              showBackButton={true}
              backButtonProps={{
                onClick: () => setPage("profile"),
                label: "Back to Dashboard"
              }}
            />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="City, Country"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setPage("profile")}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {page === "messages" && (
          <div className="min-h-screen bg-gray-50">
            <MessagesPage />
          </div>
        )}
      </ProtectedRoute>
    </div>
  );
};

export default ClientProfile;
