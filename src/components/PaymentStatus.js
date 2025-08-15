import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, DollarSign, CreditCard } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';
import useSocket from '../hooks/useSocket';
import axios from 'axios';

const PaymentStatus = ({ orderId, onStatusChange }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    if (orderId) {
      fetchPaymentStatus();
    }
  }, [orderId]);

  useEffect(() => {
    if (!socket || !user) return;

    // Listen for payment status updates
    const handlePaymentConfirmed = (data) => {
      if (data.orderId === orderId) {
        setPaymentStatus(prev => ({
          ...prev,
          status: 'paid',
          paidAt: data.timestamp
        }));
        
        // Add to history
        setPaymentHistory(prev => [{
          status: 'paid',
          timestamp: data.timestamp,
          message: 'Payment confirmed and held in escrow'
        }, ...prev]);

        onStatusChange && onStatusChange('paid');
      }
    };

    const handlePaymentReleased = (data) => {
      if (data.orderId === orderId) {
        setPaymentStatus(prev => ({
          ...prev,
          status: 'released',
          releasedAt: data.timestamp
        }));
        
        // Add to history
        setPaymentHistory(prev => [{
          status: 'released',
          timestamp: data.timestamp,
          message: 'Payment released to freelancer'
        }, ...prev]);

        onStatusChange && onStatusChange('released');
      }
    };

    socket.on('payment_confirmed', handlePaymentConfirmed);
    socket.on('payment_released', handlePaymentReleased);

    return () => {
      socket.off('payment_confirmed', handlePaymentConfirmed);
      socket.off('payment_released', handlePaymentReleased);
    };
  }, [socket, user, orderId, onStatusChange]);

  const fetchPaymentStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const order = response.data;
      setPaymentStatus({
        status: order.paymentStatus,
        amount: order.totalAmount,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        releasedAt: order.releasedAt
      });

      // Build payment history from order status
      const history = [];
      if (order.paymentStatus === 'paid' || order.paymentStatus === 'released') {
        history.push({
          status: 'paid',
          timestamp: order.paidAt || order.updatedAt,
          message: 'Payment confirmed and held in escrow'
        });
      }
      if (order.paymentStatus === 'released') {
        history.push({
          status: 'released',
          timestamp: order.releasedAt || order.updatedAt,
          message: 'Payment released to freelancer'
        });
      }
      setPaymentHistory(history);

    } catch (error) {
      console.error('Error fetching payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'released':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'refunded':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Payment Pending';
      case 'processing':
        return 'Processing Payment';
      case 'paid':
        return 'Payment Confirmed (In Escrow)';
      case 'released':
        return 'Payment Released';
      case 'refunded':
        return 'Payment Refunded';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'pending':
        return 'Waiting for payment to be processed';
      case 'processing':
        return 'Your payment is being processed';
      case 'paid':
        return 'Payment confirmed and held securely until order completion';
      case 'released':
        return 'Payment has been released to the freelancer';
      case 'refunded':
        return 'Payment has been refunded to your account';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!paymentStatus) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <p className="text-gray-500">No payment information available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      {/* Current Status */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
          <div className="flex items-center gap-2">
            {getStatusIcon(paymentStatus.status)}
            <span className={`font-medium ${
              paymentStatus.status === 'paid' || paymentStatus.status === 'released' 
                ? 'text-green-600' 
                : paymentStatus.status === 'refunded' 
                ? 'text-red-600' 
                : 'text-yellow-600'
            }`}>
              {getStatusText(paymentStatus.status)}
            </span>
          </div>
        </div>

        <p className="text-gray-600 mb-4">
          {getStatusDescription(paymentStatus.status)}
        </p>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Payment Amount:</span>
            <span className="font-semibold text-lg">${paymentStatus.amount}</span>
          </div>
        </div>
      </div>

      {/* Payment Security Info */}
      <div className="p-6 border-b bg-blue-50">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Secure Escrow Payment</h4>
            <p className="text-sm text-blue-700">
              Your payment is held securely until the order is completed and approved. 
              The freelancer will only receive payment after successful delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <div className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Payment History</h4>
          <div className="space-y-3">
            {paymentHistory.map((event, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(event.status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {event.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="p-6 pt-0">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Order Created</span>
          <span>Payment Confirmed</span>
          <span>Order Delivered</span>
          <span>Payment Released</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              paymentStatus.status === 'released' 
                ? 'bg-green-500 w-full' 
                : paymentStatus.status === 'paid' 
                ? 'bg-blue-500 w-1/2' 
                : 'bg-yellow-500 w-1/4'
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;