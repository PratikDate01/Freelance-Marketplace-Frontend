import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Eye, Calendar, DollarSign, FileText, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';
import PageHeader from '../components/PageHeader';
import axios from '../config/axios';
import { toast } from 'react-toastify';

const Billing = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      // Fetch payment methods
      try {
        const paymentMethodsResponse = await axios.get('/api/payments/methods', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setPaymentMethods(Array.isArray(paymentMethodsResponse.data) ? paymentMethodsResponse.data : []);
      } catch (error) {
        console.warn('Payment methods not available:', error.message);
        setPaymentMethods([]);
      }

      // Fetch transactions
      try {
        const transactionsResponse = await axios.get('/api/payments/transactions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTransactions(Array.isArray(transactionsResponse.data) ? transactionsResponse.data : []);
      } catch (error) {
        console.warn('Transactions not available:', error.message);
        setTransactions([]);
      }

      // Fetch invoices
      try {
        const invoicesResponse = await axios.get('/api/payments/invoices', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setInvoices(Array.isArray(invoicesResponse.data) ? invoicesResponse.data : []);
      } catch (error) {
        console.warn('Invoices not available:', error.message);
        setInvoices([]);
      }

    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to load billing data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    // Ensure amount is a valid number
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  const calculateTotals = (transactionsList) => {
    if (!Array.isArray(transactionsList)) return { totalSpent: 0, totalEarned: 0, thisMonth: 0 };
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactionsList.reduce((acc, transaction) => {
      const amount = parseFloat(transaction.amount) || 0;
      const transactionDate = new Date(transaction.createdAt);
      const isThisMonth = transactionDate.getMonth() === currentMonth && 
                         transactionDate.getFullYear() === currentYear;
      
      if (transaction.type === 'payment' && transaction.status === 'completed') {
        acc.totalSpent += amount;
        if (isThisMonth) acc.thisMonth += amount;
      } else if (transaction.type === 'earning' && transaction.status === 'released') {
        acc.totalEarned += amount;
        if (isThisMonth) acc.thisMonth += amount;
      }
      
      return acc;
    }, { totalSpent: 0, totalEarned: 0, thisMonth: 0 });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-500" />;
      case 'refund':
        return <DollarSign className="w-5 h-5 text-red-500" />;
      case 'withdrawal':
        return <DollarSign className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'transactions', name: 'Transactions' },
    { id: 'payment-methods', name: 'Payment Methods' },
    { id: 'invoices', name: 'Invoices' }
  ];

  // Calculate real stats from transactions
  const calculatedStats = calculateTotals(transactions);
  const mockStats = {
    totalSpent: user?.role === 'client' ? calculatedStats.totalSpent : 0,
    totalEarned: user?.role === 'freelancer' ? calculatedStats.totalEarned : 0,
    pendingPayments: transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
    thisMonth: calculatedStats.thisMonth
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Billing & Payments"
        subtitle="Manage your payment methods, transactions, and invoices"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                  {user?.role === 'client' && (
                    <div className="bg-blue-50 rounded-lg p-4 lg:p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                        </div>
                        <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                          <p className="text-xs lg:text-sm font-medium text-blue-600 mb-1">Total Spent</p>
                          <p className="text-lg lg:text-2xl font-bold text-blue-900 truncate" title={formatCurrency(mockStats.totalSpent || 0)}>
                            {formatCurrency(mockStats.totalSpent || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {user?.role === 'freelancer' && (
                    <div className="bg-green-50 rounded-lg p-4 lg:p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                          <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
                        </div>
                        <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                          <p className="text-xs lg:text-sm font-medium text-green-600 mb-1">Total Earned</p>
                          <p className="text-lg lg:text-2xl font-bold text-green-900 truncate" title={formatCurrency(mockStats.totalEarned || 0)}>
                            {formatCurrency(mockStats.totalEarned || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-yellow-50 rounded-lg p-4 lg:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                        <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600" />
                      </div>
                      <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                        <p className="text-xs lg:text-sm font-medium text-yellow-600 mb-1">This Month</p>
                        <p className="text-lg lg:text-2xl font-bold text-yellow-900 truncate" title={formatCurrency(mockStats.thisMonth || 0)}>
                          {formatCurrency(mockStats.thisMonth || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 lg:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                        <FileText className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
                      </div>
                      <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                        <p className="text-xs lg:text-sm font-medium text-purple-600 mb-1">Pending</p>
                        <p className="text-lg lg:text-2xl font-bold text-purple-900 truncate" title={formatCurrency(mockStats.pendingPayments || 0)}>
                          {formatCurrency(mockStats.pendingPayments || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                        <Plus className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Add Payment Method</p>
                        <p className="text-sm text-gray-600">Add a new card or bank account</p>
                      </div>
                    </button>

                    <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200">
                        <Download className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Download Statements</p>
                        <p className="text-sm text-gray-600">Get your transaction history</p>
                      </div>
                    </button>

                    <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">View Invoices</p>
                        <p className="text-sm text-gray-600">Access all your invoices</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-600">Your transaction history will appear here once you start using the platform.</p>
                  </div>
                ) : (
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Transaction
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions
                            .filter(transaction => 
                              transaction.status === 'completed' || 
                              transaction.status === 'released' ||
                              (user?.role === 'freelancer' && transaction.status === 'pending')
                            )
                            .map((transaction) => (
                            <tr key={transaction.id || transaction._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getTransactionIcon(transaction.type)}
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {transaction.description || `${transaction.type} transaction`}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {transaction.id || transaction._id}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(transaction.date || transaction.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(transaction.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  transaction.status === 'completed' || transaction.status === 'released'
                                    ? 'bg-green-100 text-green-800'
                                    : transaction.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {transaction.status === 'released' ? 'completed' : transaction.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {(transaction.status === 'completed' || transaction.status === 'released') && (
                                  <button className="text-blue-600 hover:text-blue-900">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payment-methods' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                  <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Payment Method
                  </button>
                </div>

                {paymentMethods.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                    <p className="text-gray-600 mb-6">Add a payment method to start making transactions.</p>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mx-auto">
                      <Plus className="w-5 h-5" />
                      Add Your First Payment Method
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="bg-white border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-8 h-8 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                •••• •••• •••• {method.last4}
                              </p>
                              <p className="text-sm text-gray-500">
                                {method.brand} • Expires {method.expiry}
                              </p>
                            </div>
                          </div>
                          <button className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {method.isDefault && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                    <Download className="w-4 h-4" />
                    Download All
                  </button>
                </div>

                {invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                    <p className="text-gray-600">Your invoices will appear here once you complete transactions.</p>
                  </div>
                ) : (
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Invoice
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {invoices.map((invoice) => (
                            <tr key={invoice.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  #{invoice.number}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {invoice.description}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(invoice.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(invoice.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  invoice.status === 'paid' 
                                    ? 'bg-green-100 text-green-800'
                                    : invoice.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {invoice.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <button className="text-blue-600 hover:text-blue-900">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button className="text-blue-600 hover:text-blue-900">
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;