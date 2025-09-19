import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Star, 
  TrendingUp, 
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { formatPrice } from '../../utils/currency';
import axios from '../../config/axios';

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    activeOrders: 0,
    completedOrders: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch seller stats (includes order stats and recent orders)
      const statsResponse = await axios.get('/api/orders/seller/stats');

      // Fetch earnings
      const earningsResponse = await axios.get('/api/payments/seller/earnings');

      // Fetch gig stats
      const gigsResponse = await axios.get('/api/gigs/mine');

      const gigs = Array.isArray(gigsResponse.data) ? gigsResponse.data : [];

      // Calculate average rating from all gigs
      const totalRatings = gigs.reduce((sum, gig) => sum + (gig.averageRating || 0), 0);
      const totalReviews = gigs.reduce((sum, gig) => sum + (gig.totalReviews || 0), 0);
      const averageRating = gigs.length > 0 ? totalRatings / gigs.length : 0;

      setStats({
        totalEarnings: parseFloat(earningsResponse.data?.totalEarnings || 0),
        monthlyEarnings: parseFloat(earningsResponse.data?.monthlyEarnings || 0),
        activeOrders: statsResponse.data?.activeOrders || 0,
        completedOrders: statsResponse.data?.completedOrders || 0,
        totalOrders: statsResponse.data?.totalOrders || 0,
        averageRating: averageRating.toFixed(1),
        totalReviews
      });

      // Set recent orders from stats response
      if (statsResponse.data?.recentOrders) {
        setRecentOrders(statsResponse.data.recentOrders.slice(0, 5));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status || 'Unknown');
      // Set default values on error
      setStats({
        totalEarnings: 0,
        monthlyEarnings: 0,
        activeOrders: 0,
        completedOrders: 0,
        totalOrders: 0,
        averageRating: '0.0',
        totalReviews: 0
      });
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'revision':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'active':
        return <Package className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      case 'revision':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={`Welcome back, ${user?.name}!`}
        subtitle="Manage your freelance business"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(stats.totalEarnings)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">This month: {formatPrice(stats.monthlyEarnings)}</span>
            </div>
          </div>

          {/* Active Orders */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to="/freelancer/orders" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all orders →
              </Link>
            </div>
          </div>

          {/* Completed Orders */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Success rate: {stats.completedOrders > 0 ? '100%' : '0%'}
            </div>
          </div>

          {/* Rating */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {stats.totalReviews} reviews
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <Link 
                    to="/freelancer/orders" 
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    View all
                  </Link>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {recentOrders.length === 0 ? (
                  <div className="p-6 text-center">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No orders yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Orders will appear here when clients purchase your gigs
                    </p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{order.gigTitle}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                              {getOrderStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Order #{order._id.slice(-6)}</span>
                            <span>{formatPrice(order.totalAmount)}</span>
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          {order.deliveryDate && (
                            <div className="mt-2 text-sm text-gray-500">
                              Due: {new Date(order.deliveryDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/freelancer/messages?orderId=${order._id}`}
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/freelancer/orders/${order._id}`}
                            className="px-3 py-1 text-sm text-green-600 hover:text-green-800 border border-green-200 rounded-md hover:bg-green-50"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/freelancer/create-gig"
                  className="block w-full px-4 py-2 text-center bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Create New Gig
                </Link>
                <Link
                  to="/freelancer/my-gigs"
                  className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Manage Gigs
                </Link>
                <Link
                  to="/freelancer/messages"
                  className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Messages
                </Link>
                <Link
                  to="/freelancer/earnings"
                  className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Earnings
                </Link>
              </div>
            </div>

            {/* Performance Tips */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Tips</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    Respond to messages within 1 hour to improve your response rate
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    Deliver orders on time to maintain a high completion rate
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    Add portfolio images to your gigs to increase conversions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;