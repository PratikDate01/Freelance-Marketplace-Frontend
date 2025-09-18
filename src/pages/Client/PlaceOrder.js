import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthContext";
import { Shield, Clock, CheckCircle, CreditCard, Lock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import BackButton from "../../components/BackButton";
import StripePayment from "../../components/StripePayment";
import { formatPrice, convertINRToUSD, calculateServiceFee, calculateTotal } from "../../utils/currency";
import axios from "../../config/axios";

const PlaceOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [gig, setGig] = useState(null);
  const [requirements, setRequirements] = useState("");
  const [packageType, setPackageType] = useState("basic");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStep, setOrderStep] = useState("details"); // details, payment, processing
  const [createdOrderId, setCreatedOrderId] = useState(null);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await axios.get(`/api/gigs/${id}`);
        setGig(response.data);
      } catch (err) {
        console.error("Error fetching gig:", err);
        navigate("/client/browse-gigs");
      }
    };

    fetchGig();
  }, [id, navigate]);

  const calculatePricing = () => {
    if (!gig) return { amount: 0, serviceFee: 0, total: 0, usdAmount: 0, usdServiceFee: 0, usdTotal: 0 };
    
    const rate = 0.012; // INR -> USD
    const inrAmount = gig.price;
    const inrServiceFee = Math.round(inrAmount * 0.05);
    const inrTotal = inrAmount + inrServiceFee;

    // Convert to USD
    const amount = Math.round(inrAmount * rate);
    const serviceFee = Math.round(inrServiceFee * rate);
    const total = Math.round(inrTotal * rate);

    return { amount, serviceFee, total, usdAmount: amount, usdServiceFee: serviceFee, usdTotal: total };
  };

  const handleCreateOrder = async () => {
    if (!requirements.trim()) {
      alert("Please provide your requirements for this order.");
      return;
    }

    setIsProcessing(true);
    try {
      console.log("Creating order with data:", {
        gigId: id,
        requirements,
        packageType
      });

      const response = await axios.post("/api/orders", {
        gigId: id,
        requirements,
        packageType
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      console.log("Order creation response:", response.data);

      if (response.data.order) {
        setCreatedOrderId(response.data.order._id);
        setOrderStep("payment");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert(`Failed to create order: ${error.response?.data?.message || error.message}`);
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (message) => {
    setOrderStep("processing");
    setTimeout(() => {
      navigate(`/client/order-success?orderId=${createdOrderId}`);
    }, 2000);
  };

  const handlePaymentError = (error) => {
    alert(`Payment failed: ${error}`);
    setIsProcessing(false);
    setOrderStep("details");
  };

  if (loading || !gig || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const pricing = calculatePricing();

  if (orderStep === "payment") {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Secure Payment"
          subtitle="Complete your payment to start the order"
          backButtonProps={{
            to: `/client/gig/${id}`,
            label: "Back to Service"
          }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <StripePayment
                orderId={createdOrderId}
                amount={pricing.total}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="flex gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={gig.image || "https://placehold.co/80"}
                    alt={gig.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{gig.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{gig.category}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-semibold">
                        {gig.sellerId?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-xs text-gray-700">{gig.sellerId?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service price</span>
                    <span className="font-medium">{formatPrice(pricing.usdAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service fee (5%)</span>
                    <span className="font-medium">{formatPrice(pricing.usdServiceFee)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">{formatPrice(pricing.usdTotal)}</span>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-sm font-medium">Secure Escrow</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Payment held safely until delivery is approved
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderStep === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your order has been created and the seller has been notified.</p>
          <div className="animate-pulse text-gray-500">Redirecting to order confirmation...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title="Place Your Order"
        subtitle="Review the details and complete your purchase"
        backButtonProps={{
          to: `/client/gig/${id}`,
          label: "Back to Service"
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h1>
              
              {/* Gig Summary */}
              <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <img
                  src={gig.image || "https://placehold.co/100"}
                  alt={gig.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 mb-1">{gig.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{gig.category}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-semibold">
                      {gig.sellerId?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm text-gray-700">{gig.sellerId?.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{formatPrice(Math.round((gig.price || 0) * 0.012))}</p>
                  <p className="text-sm text-gray-500">{gig.deliveryTime} days delivery</p>
                </div>
              </div>

              {/* Package Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Package</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">Basic Package</h4>
                        <p className="text-sm text-gray-600">Standard delivery with 1 revision</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{formatPrice(Math.round((gig.price || 0) * 0.012))}</p>
                        <p className="text-sm text-gray-500">{gig.deliveryTime} days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Describe your requirements
                  <span className="text-red-500 ml-1">*</span>
                </h3>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Please provide detailed information about what you need. The more specific you are, the better the seller can deliver exactly what you want."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Be as specific as possible to avoid revisions and get exactly what you need.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service price</span>
                  <span className="font-medium">{formatPrice(pricing.usdAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service fee (5%)</span>
                  <span className="font-medium">{formatPrice(pricing.usdServiceFee)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">{formatPrice(pricing.usdTotal)}</span>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Delivery Time</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  {gig.deliveryTime} days from order confirmation
                </p>
              </div>

              <div className="mb-6 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">What's Included</span>
                </div>
                <ul className="text-sm text-green-600 mt-1 space-y-1">
                  <li>• Source code included</li>
                  <li>• 1 revision included</li>
                  <li>• Commercial license</li>
                </ul>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={isProcessing || !requirements.trim()}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${
                  isProcessing || !requirements.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  `Continue (${formatPrice(pricing.usdTotal)})`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                By continuing, you agree to our Terms of Service and acknowledge our Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;