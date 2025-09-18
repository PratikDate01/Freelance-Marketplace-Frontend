import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, Share2, Flag, Shield, Award, Clock, RefreshCw, CheckCircle, Star, MessageCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import BackButton from "../../components/BackButton";
import { formatPrice, convertINRToUSD } from "../../utils/currency";
import axios from "../../config/axios";

const GigDetails = ({ gig, goBack }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get gig ID from URL params
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ comment: "", rating: 5 });
  const [avgRating, setAvgRating] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [fetchedGig, setFetchedGig] = useState(null); // For route-based usage
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);


  const currentGig = gig || fetchedGig;

  // Fetch gig data when accessed via route (when id exists but no gig prop)
  useEffect(() => {
    if (id && !gig) {
      setLoading(true);
      axios.get(`/api/gigs/${id}`)
        .then((res) => {
          setFetchedGig(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching gig:", err);
          setLoading(false);
          navigate("/client/browse-gigs");
        });
    }
  }, [id, gig, navigate]);

  // Fetch saved status when gig is available
  useEffect(() => {
    const fetchSavedStatus = async () => {
      if (currentGig?._id) {
        try {
          const res = await axios.get(`/api/gigs/${currentGig._id}/saved`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setIsFavorite(res.data.isSaved);
        } catch (error) {
          console.error("Failed to fetch saved status", error);
        }
      }
    };
    fetchSavedStatus();
  }, [currentGig]);

  // Fetch reviews when gig is available
  useEffect(() => {
    if (currentGig?._id) {
      axios.get(`/api/gigs/${currentGig._id}/reviews`).then((res) => {
        setReviews(res.data);
        if (res.data.length > 0) {
          const total = res.data.reduce((sum, r) => sum + r.rating, 0);
          setAvgRating((total / res.data.length).toFixed(1));
        }
      });
    }
  }, [currentGig]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/gigs/${currentGig._id}/reviews`, newReview, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNewReview({ comment: "", rating: 5 });

      const { data } = await axios.get(`/api/gigs/${currentGig._id}/reviews`);
      setReviews(data);
      const total = data.reduce((sum, r) => sum + r.rating, 0);
      setAvgRating((total / data.length).toFixed(1));
    } catch (error) {
      alert("Failed to submit review");
    }
  };

  const handleOrder = () => {
    if (!currentGig || !currentGig._id) {
      console.warn("Gig not loaded yet");
      return;
    }

    navigate(`/client/place-order/${currentGig._id}`);
  };

  const formatGigPrice = (inrPrice) => {
    const usdPrice = convertINRToUSD(inrPrice);
    return formatPrice(usdPrice);
  };

  const toggleFavorite = async () => {
    if (!currentGig || !currentGig._id) return;

    try {
      if (isFavorite) {
        // Unsave gig
        await axios.delete(`/api/gigs/${currentGig._id}/save`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setIsFavorite(false);
      } else {
        // Save gig
        await axios.post(`/api/gigs/${currentGig._id}/save`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Failed to update favorite status", error);
      alert("Failed to update favorite status");
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  // Handle back navigation for both route and prop usage
  const handleGoBack = () => {
    if (goBack) {
      goBack(); // Use prop function if available
    } else {
      navigate("/client/browse-gigs"); // Default navigation for route usage
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl text-gray-300 mb-4">⏳</div>
          <p className="text-xl text-gray-500 font-medium">Loading gig details...</p>
        </div>
      </div>
    );
  }

  // No gig state
  if (!currentGig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl text-gray-300 mb-4">📋</div>
          <p className="text-xl text-gray-500 font-medium">No gig selected</p>
          <p className="text-gray-400 mt-2">Please select a gig to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <PageHeader
        title="Service Details"
        subtitle="Review the service and place your order"
        backButtonProps={{
          onClick: handleGoBack,
          label: goBack ? "Back" : "Back to Browse"
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2">
            {/* Gig Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                    {currentGig.category}
                  </span>
                  {currentGig.sellerId?.level === 'top' && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded flex items-center gap-1">
                      <Award size={12} />
                      PRO
                    </span>
                  )}
                  {currentGig.deliveryTime <= 1 && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                      Express 24H
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFavorite}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    <Share2 size={18} />
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white transition-colors">
                    <Flag size={18} />
                  </button>
                </div>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {currentGig.title}
              </h1>
              
              {/* Seller Info Bar */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <img
                    src={currentGig.sellerId?.avatar || currentGig.sellerId?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentGig.sellerId?.name || 'User')}&background=10b981&color=fff`}
                    alt={currentGig.sellerId?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium text-gray-900">
                    {currentGig.sellerId?.name}
                  </span>
                </div>
                {avgRating > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-sm font-medium text-yellow-600">{avgRating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({reviews.length})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Gig Image */}
            <div className="mb-8">
              <img
                src={currentGig.image || (currentGig.images && currentGig.images[0]) || "https://placehold.co/800x450"}
                alt={currentGig.title}
                className="w-full h-64 lg:h-96 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = "https://placehold.co/800x450";
                }}
              />
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'description'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('seller')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'seller'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  About The Seller
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'reviews'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Reviews ({reviews.length})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Description Tab */}
              {activeTab === 'description' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About this gig</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {currentGig.description}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-6 mt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">What you get</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Source code included</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">1 revision included</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{currentGig.deliveryTime} day delivery</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Seller Tab */}
              {activeTab === 'seller' && currentGig.sellerId && (
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <img
                      src={currentGig.sellerId.avatar || currentGig.sellerId.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentGig.sellerId.name || 'User')}&background=10b981&color=fff`}
                      alt={currentGig.sellerId.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {currentGig.sellerId.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-2">{currentGig.sellerId.email}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {currentGig.sellerId.location && (
                          <span>📍 {currentGig.sellerId.location}</span>
                        )}
                        {currentGig.sellerId.memberSince && (
                          <span>
                            Member since {new Date(currentGig.sellerId.memberSince).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-6">
                    <p className="text-gray-700 leading-relaxed">
                      {currentGig.sellerId.bio || "Experienced seller ready to help you with your project."}
                    </p>
                  </div>

                  {currentGig.sellerId.avgResponseTime && (
                    <div className="border-t border-gray-100 pt-6 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Avg. response time</p>
                          <p className="font-semibold text-gray-900">
                            {currentGig.sellerId.avgResponseTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  {reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl text-gray-300 mb-4">💬</div>
                      <p className="text-gray-500">No reviews yet</p>
                      <p className="text-gray-400 text-sm mt-1">Be the first to leave a review!</p>
                    </div>
                  ) : (
                    <div className="space-y-6 mb-8">
                      {reviews.map((r, index) => (
                        <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {(r.user?.name || "A").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  {r.user?.name || "Anonymous User"}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <svg
                                        key={i}
                                        className={`w-4 h-4 ${i < r.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(r.createdAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{r.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Review Form */}
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Add a review</h4>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <select
                          value={newReview.rating}
                          onChange={(e) =>
                            setNewReview({
                              ...newReview,
                              rating: parseInt(e.target.value),
                            })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>
                              {n} Star{n !== 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your review</label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) =>
                            setNewReview({ ...newReview, comment: e.target.value })
                          }
                          placeholder="Share your experience..."
                          className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        ></textarea>
                      </div>
                      
                      <button
                        type="submit"
                        className="bg-green-500 text-white px-4 py-2 rounded-md font-medium hover:bg-green-600 transition-colors duration-200"
                      >
                        Submit Review
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Pricing Package */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Package Header */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">Basic Package</h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{formatGigPrice(currentGig.price)}</div>
                      <div className="text-xs text-gray-500">Starting price</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Essential features for getting started</p>
                  
                  {/* Delivery Time */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{currentGig.deliveryTime} day delivery</span>
                  </div>
                </div>

                {/* Package Features */}
                <div className="p-6 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">What's included</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Source code included</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <RefreshCw className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">1 revision included</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Commercial license</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{currentGig.deliveryTime} day delivery</span>
                    </li>
                  </ul>
                  
                  {/* Trust Badges */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-green-600">
                        <Shield size={12} />
                        <span>Money-back guarantee</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <MessageCircle size={12} />
                        <span>24/7 support</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <div className="p-6">
                  <button
                    onClick={handleOrder}
                    disabled={!currentGig?._id || loading}
                    className={`w-full py-3 rounded-md font-semibold transition-colors duration-200 mb-3 ${(!currentGig?._id || loading) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                  >
                    {loading || !currentGig?._id ? 'Loading...' : `Continue (${formatGigPrice(currentGig.price)})`}
                  </button>
                  
                  <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors duration-200">
                    Contact Seller
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share this gig</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">f</div>
                <span>Share on Facebook</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white text-sm">t</div>
                <span>Share on Twitter</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">in</div>
                <span>Share on LinkedIn</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm">🔗</div>
                <span>Copy link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GigDetails;