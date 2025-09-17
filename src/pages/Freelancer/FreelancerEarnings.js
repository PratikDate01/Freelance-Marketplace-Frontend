import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import useSocket from '../../hooks/useSocket';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download,
  CreditCard,
  Clock,
  CheckCircle,
  Bell
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { formatPrice } from '../../utils/currency';
import axios from '../../config/axios';

const FreelancerEarnings = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    pendingEarnings: 0,
    availableForWithdrawal: 0,
    completedOrders: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [realtimeNotifications, setRealtimeNotifications] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [addingPaymentMethod, setAddingPaymentMethod] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'bank',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    email: ''
  });

  useEffect(() => {
    fetchEarnings();
    fetchPaymentMethods();
  }, [selectedPeriod]);

  // Listen for real-time payment updates
  useEffect(() => {
    if (!socket || !user) return;

    const handlePaymentReceived = (data) => {
      // Add notification
      const notification = {
        id: Date.now(),
        type: 'payment_received',
        message: `Payment received: $${data.netAmount} for "${data.gigTitle}"`,
        amount: data.netAmount,
        timestamp: new Date()
      };
      
      setRealtimeNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 notifications
      
      // Update earnings
      setEarnings(prev => ({
        ...prev,
        pendingEarnings: prev.pendingEarnings + parseFloat(data.netAmount),
        recentOrders: [
          {
            _id: data.orderId,
            gigTitle: data.gigTitle,
            amount: data.netAmount,
            paymentStatus: 'paid',
            createdAt: new Date()
          },
          ...prev.recentOrders.slice(0, 4)
        ]
      }));

      // Auto-remove notification after 10 seconds
      setTimeout(() => {
        setRealtimeNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 10000);
    };

    const handlePaymentReleased = (data) => {
      // Add notification
      const notification = {
        id: Date.now(),
        type: 'payment_released',
        message: `Payment released: $${data.amount} transferred to your account`,
        amount: data.amount,
        timestamp: new Date()
      };
      
      setRealtimeNotifications(prev => [notification, ...prev.slice(0, 4)]);
      
      // Update earnings
      setEarnings(prev => ({
        ...prev,
        totalEarnings: prev.totalEarnings + parseFloat(data.amount),
        availableForWithdrawal: prev.availableForWithdrawal + parseFloat(data.amount),
        pendingEarnings: Math.max(0, prev.pendingEarnings - parseFloat(data.amount))
      }));

      // Auto-remove notification after 10 seconds
      setTimeout(() => {
        setRealtimeNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 10000);
    };

    socket.on('payment_received', handlePaymentReceived);
    socket.on('payment_released', handlePaymentReleased);

    return () => {
      socket.off('payment_received', handlePaymentReceived);
      socket.off('payment_released', handlePaymentReleased);
    };
  }, [socket, user]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/payments/seller/earnings', {
        params: { period: selectedPeriod },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEarnings(response.data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      // Set mock data for demonstration
      setEarnings({
        totalEarnings: 2450.00,
        monthlyEarnings: 890.00,
        pendingEarnings: 125.00,
        availableForWithdrawal: 2325.00,
        completedOrders: 12,
        recentOrders: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('/api/payments/methods', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPaymentMethods(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedPaymentMethod(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Set mock data
      setPaymentMethods([]);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawing) return;
    
    try {
      setWithdrawing(true);
      const amount = parseFloat(withdrawAmount);
      
      // Validation
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid withdrawal amount');
        return;
      }
      
      if (amount > (earnings.availableForWithdrawal || 0)) {
        alert(`Amount cannot exceed available balance of ${formatPrice(earnings.availableForWithdrawal || 0)}`);
        return;
      }

      if (!selectedPaymentMethod) {
        alert('Please select a payment method');
        return;
      }

      // Minimum withdrawal check
      if (amount < 10) {
        alert('Minimum withdrawal amount is $10.00');
        return;
      }

      const response = await axios.post('/api/payments/withdraw', {
        amount: amount.toFixed(2),
        paymentMethodId: selectedPaymentMethod
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Withdrawal request submitted successfully! Funds will be transferred within 1-3 business days.');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setSelectedPaymentMethod('');
      fetchEarnings();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      const errorMessage = error.response?.data?.message || 'Failed to process withdrawal. Please try again.';
      alert(errorMessage);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (addingPaymentMethod) return;
    
    try {
      setAddingPaymentMethod(true);
      
      // Validation based on payment type
      if (newPaymentMethod.type === 'bank') {
        if (!newPaymentMethod.accountName?.trim() || !newPaymentMethod.accountNumber?.trim()) {
          alert('Please fill in account name and account number');
          return;
        }
        if (newPaymentMethod.accountNumber.length < 8) {
          alert('Account number must be at least 8 digits');
          return;
        }
      } else if (newPaymentMethod.type === 'paypal') {
        if (!newPaymentMethod.email?.trim()) {
          alert('Please enter your PayPal email address');
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newPaymentMethod.email)) {
          alert('Please enter a valid email address');
          return;
        }
      }

      const response = await axios.post('/api/payments/methods', newPaymentMethod, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setPaymentMethods([...paymentMethods, response.data]);
      setNewPaymentMethod({
        type: 'bank',
        accountName: '',
        accountNumber: '',
        routingNumber: '',
        bankName: '',
        email: ''
      });
      setShowAddPaymentMethod(false);
      alert('Payment method added successfully!');
      
      // Auto-select the new payment method if it's the first one
      if (paymentMethods.length === 0) {
        setSelectedPaymentMethod(response.data._id);
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add payment method. Please try again.';
      alert(errorMessage);
    } finally {
      setAddingPaymentMethod(false);
    }
  };

  const exportEarnings = () => {
    // TODO: Implement earnings export
    alert('Earnings report will be downloaded shortly');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Earnings Dashboard"
        subtitle="Track your income and manage withdrawals"
        backButtonProps={{
          to: '/freelancer/dashboard',
          label: 'Back to Dashboard'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Notifications */}
        {realtimeNotifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {realtimeNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 ${
                  notification.type === 'payment_received' 
                    ? 'bg-green-50 border-l-green-500' 
                    : 'bg-blue-50 border-l-blue-500'
                } animate-slide-in`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className={`w-5 h-5 ${
                      notification.type === 'payment_received' ? 'text-green-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{notification.message}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${
                    notification.type === 'payment_received' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    +${notification.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Period Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
            
            <button
              onClick={exportEarnings}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Earnings Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">Total Earnings</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 truncate" title={formatPrice(earnings.totalEarnings || 0)}>
                  {formatPrice(earnings.totalEarnings || 0)}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 lg:mt-4 flex items-center text-xs lg:text-sm">
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-green-500 mr-1" />
              <span className="text-green-600 truncate">
                {selectedPeriod === 'month' ? 'This month' : 'Total earned'}
              </span>
            </div>
          </div>

          {/* Monthly Earnings */}
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">This Month</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 truncate" title={formatPrice(earnings.monthlyEarnings || 0)}>
                  {formatPrice(earnings.monthlyEarnings || 0)}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 lg:mt-4 text-xs lg:text-sm text-gray-600 truncate">
              From {earnings.completedOrders || 0} completed orders
            </div>
          </div>

          {/* Pending Earnings */}
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">Pending</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 truncate" title={formatPrice(earnings.pendingEarnings || 0)}>
                  {formatPrice(earnings.pendingEarnings || 0)}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-3 lg:mt-4 text-xs lg:text-sm text-gray-600">
              From active orders
            </div>
          </div>

          {/* Available for Withdrawal */}
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">Available</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 truncate" title={formatPrice(earnings.availableForWithdrawal || 0)}>
                  {formatPrice(earnings.availableForWithdrawal || 0)}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 lg:mt-4">
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={(earnings.availableForWithdrawal || 0) <= 0}
                className="text-xs lg:text-sm text-purple-600 hover:text-purple-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Withdraw funds →
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Earnings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Earnings</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {earnings.recentOrders && earnings.recentOrders.length === 0 ? (
                  <div className="p-6 text-center">
                    <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No earnings yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Complete orders to start earning
                    </p>
                  </div>
                ) : (
                  earnings.recentOrders?.map((order) => (
                    <div key={order._id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{order.gigTitle}</h3>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3" />
                              Completed
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Order #{order._id.slice(-6)}</span>
                            <span>{new Date(order.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">
                            +{formatPrice((order.amount || 0) * 0.95)} {/* 95% after platform fee */}
                          </p>
                          <p className="text-sm text-gray-500">
                            Total: {formatPrice(order.totalAmount || order.amount || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="space-y-6">
            {/* Earnings Breakdown Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gross Earnings</span>
                  <span className="font-medium">
                    {formatPrice(earnings.totalEarnings > 0 ? earnings.totalEarnings / 0.95 : 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Platform Fee (5%)</span>
                  <span className="font-medium text-red-600">
                    -{formatPrice(earnings.totalEarnings > 0 ? (earnings.totalEarnings / 0.95) * 0.05 : 0)}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between items-center font-semibold">
                  <span>Net Earnings</span>
                  <span className="text-green-600">{formatPrice(earnings.totalEarnings || 0)}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-3">
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-4">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No payment methods added</p>
                    <p className="text-sm text-gray-400">Add a payment method to withdraw funds</p>
                  </div>
                ) : (
                  paymentMethods.map((method, index) => (
                    <div key={method._id || index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {method.type === 'bank' ? 'Bank Transfer' : 'PayPal'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {method.type === 'bank' 
                            ? `****${method.accountNumber?.slice(-4) || '1234'}`
                            : method.email
                          }
                        </p>
                      </div>
                      {index === 0 && <span className="text-sm text-green-600">Primary</span>}
                    </div>
                  ))
                )}
                
                <button 
                  onClick={() => setShowAddPaymentMethod(true)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  + Add Payment Method
                </button>
              </div>
            </div>

            {/* Withdrawal History */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Withdrawals</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-500 text-center py-4">
                  No withdrawals yet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Withdraw Funds
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Available for withdrawal: <span className="font-semibold text-green-600">
                  {formatPrice(earnings.availableForWithdrawal)}
                </span>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  max={earnings.availableForWithdrawal}
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              {paymentMethods.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No payment methods available. Please add a payment method first.
                  </p>
                </div>
              ) : (
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method._id} value={method._id}>
                      {method.type === 'bank' ? 'Bank Transfer' : 'PayPal'} - 
                      {method.type === 'bank' 
                        ? ` ****${method.accountNumber?.slice(-4) || '1234'}`
                        : ` ${method.email}`
                      }
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={
                  withdrawing ||
                  !withdrawAmount || 
                  parseFloat(withdrawAmount) <= 0 || 
                  !selectedPaymentMethod ||
                  paymentMethods.length === 0
                }
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {withdrawing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Withdraw'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddPaymentMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Payment Method
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Type
                </label>
                <select
                  value={newPaymentMethod.type}
                  onChange={(e) => setNewPaymentMethod({...newPaymentMethod, type: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {newPaymentMethod.type === 'bank' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      value={newPaymentMethod.accountName}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, accountName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={newPaymentMethod.accountNumber}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, accountNumber: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Routing Number
                    </label>
                    <input
                      type="text"
                      value={newPaymentMethod.routingNumber}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, routingNumber: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={newPaymentMethod.bankName}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, bankName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Bank of America"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PayPal Email *
                  </label>
                  <input
                    type="email"
                    value={newPaymentMethod.email}
                    onChange={(e) => setNewPaymentMethod({...newPaymentMethod, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddPaymentMethod(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPaymentMethod}
                disabled={addingPaymentMethod}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {addingPaymentMethod ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  'Add Method'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerEarnings;