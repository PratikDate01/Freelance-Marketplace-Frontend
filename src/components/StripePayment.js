import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';
import { detectAdBlocker, showAdBlockerWarning } from '../utils/adBlockDetector';

// Load Stripe with error handling
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RtunUJ94Yh4jzkmoULZnXNZCxClEZ7CJBoZTDoWQOzuUktMd9jZFyJUaZGVCb7npH3meaHRCNoGTfYsg1Wol7P700WINXK4Cb')
  .catch(error => {
    console.error('Failed to load Stripe:', error);
    return null;
  });

const CheckoutForm = ({ orderId, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [stripeError, setStripeError] = useState(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Check if Stripe is blocked
    const checkStripeAvailability = async () => {
      try {
        const isBlocked = await detectAdBlocker();
        
        if (isBlocked) {
          const warning = showAdBlockerWarning();
          setStripeError(warning.message);
          setShowFallback(true);
          return;
        }
        
        // If we get here, Stripe is likely available
        if (orderId && !stripeError) {
          createPaymentIntent();
        }
      } catch (error) {
        console.warn('Error checking Stripe availability:', error);
        setStripeError('Payment service may be blocked. Please disable ad blocker or use alternative payment.');
        setShowFallback(true);
      }
    };

    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await axios.post('/api/payments/create-payment-intent', {
          orderId: orderId
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        if (error.message.includes('blocked') || error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
          setStripeError('Payment service blocked by ad blocker. Please disable it and refresh.');
          setShowFallback(true);
        } else {
          onError('Failed to initialize payment. Please try again.');
        }
      }
    };

    checkStripeAvailability();
  }, [orderId, onError, stripeError]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer Name', // You can get this from user context
          },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        if (error.message.includes('blocked') || error.code === 'network_error') {
          setStripeError('Payment blocked by ad blocker. Please disable it and try again.');
          setShowFallback(true);
        } else {
          onError(error.message);
        }
        setIsProcessing(false);
      } else if (paymentIntent.status === 'requires_capture') {
        // Payment successful, now confirm with backend
        try {
          await axios.post('/api/payments/confirm-payment', {
            paymentIntentId: paymentIntent.id
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });

          onSuccess('Payment successful! Your order is now active.');
        } catch (confirmError) {
          console.error('Error confirming payment:', confirmError);
          onError('Payment processed but confirmation failed. Please contact support.');
        }
        setIsProcessing(false);
      }
    } catch (networkError) {
      console.error('Network error during payment:', networkError);
      setStripeError('Payment service unavailable. This may be due to an ad blocker.');
      setShowFallback(true);
      setIsProcessing(false);
    }
  };

  const handleFallbackPayment = async () => {
    try {
      setIsProcessing(true);
      // Use the legacy payment processing endpoint
      const response = await axios.post(`/api/orders/${orderId}/payment`, {
        paymentMethod: 'demo'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      onSuccess('Payment processed successfully! Your order is now active.');
    } catch (error) {
      console.error('Fallback payment failed:', error);
      onError('Payment failed. Please try again or contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '12px',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  // Show error message and fallback if Stripe is blocked
  if (stripeError || showFallback) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Payment Issue Detected</h3>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Payment Service Blocked</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  It looks like an ad blocker or browser extension is preventing the payment form from loading.
                </p>
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-2">To fix this:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Disable your ad blocker for this site</li>
                    <li>Refresh the page</li>
                    <li>Or use the alternative payment method below</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Alternative Payment Method</h4>
            <p className="text-sm text-blue-700 mb-4">
              You can proceed with a demo payment for testing purposes. In production, this would integrate with alternative payment providers.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h5 className="font-medium text-gray-900 mb-2">Payment Breakdown</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Service Amount:</span>
                  <span>${(amount * 0.95).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee (5%):</span>
                  <span>${(amount * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t pt-1 flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleFallbackPayment}
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing Payment...
                </div>
              ) : (
                `Pay $${amount.toFixed(2)} (Demo Mode)`
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Refresh page after disabling ad blocker
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-lg p-3">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-medium">Secure Escrow Payment</span>
          </div>
          <p className="text-sm text-blue-600">
            Your payment is held securely until the order is delivered and approved. 
            The seller will receive payment only after successful completion.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Payment Breakdown</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Service Amount:</span>
              <span>${(amount * 0.95).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Fee (5%):</span>
              <span>${(amount * 0.05).toFixed(2)}</span>
            </div>
            <div className="border-t pt-1 flex justify-between font-medium">
              <span>Total:</span>
              <span>${amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing || !clientSecret}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            isProcessing || !stripe || !clientSecret
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing Payment...
            </div>
          ) : (
            `Pay $${amount.toFixed(2)} Securely`
          )}
        </button>

        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Powered by Stripe</span>
          </div>
        </div>
      </div>
    </form>
  );
};

const StripePayment = ({ orderId, amount, onSuccess, onError }) => {
  const [stripeLoadError, setStripeLoadError] = useState(false);

  useEffect(() => {
    // Check if Stripe loaded successfully
    stripePromise.then(stripe => {
      if (!stripe) {
        setStripeLoadError(true);
      }
    }).catch(() => {
      setStripeLoadError(true);
    });
  }, []);

  // If Stripe failed to load, show fallback immediately
  if (stripeLoadError) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Payment Service Unavailable</h3>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-red-800 mb-1">Stripe Payment Blocked</h4>
                <p className="text-sm text-red-700 mb-3">
                  The payment service is being blocked by your browser or an extension. Please disable ad blockers and try again.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Demo Payment Available</h4>
            <p className="text-sm text-blue-700 mb-4">
              For testing purposes, you can proceed with a demo payment.
            </p>
            
            <button
              onClick={async () => {
                try {
                  const response = await axios.post(`/api/orders/${orderId}/payment`, {
                    paymentMethod: 'demo'
                  }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                  });
                  onSuccess('Demo payment successful! Your order is now active.');
                } catch (error) {
                  onError('Payment failed. Please try again.');
                }
              }}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              Proceed with Demo Payment (${amount.toFixed(2)})
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        orderId={orderId}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default StripePayment;