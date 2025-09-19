import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Filter, Star, Clock, MapPin, Grid, List, ChevronDown, Heart, Shield, Award, TrendingUp } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import BackButton from "../../components/BackButton";
import { formatPrice } from "../../utils/currency";
import axios from "../../config/axios";

const BrowseGigs = ({ goBack, onGigSelect }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [gigs, setGigs] = useState([]);
  const [filteredGigs, setFilteredGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [deliveryTime, setDeliveryTime] = useState('');
  const [sellerLevel, setSellerLevel] = useState('');

  const categories = [
    'All Categories',
    'Graphics & Design',
    'Digital Marketing', 
    'Writing & Translation',
    'Video & Animation',
    'Music & Audio',
    'Programming & Tech',
    'Business',
    'AI Services'
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Best Rating' },
    { value: 'bestseller', label: 'Best Selling' },
    { value: 'delivery', label: 'Fastest Delivery' }
  ];

  const deliveryOptions = [
    { value: '', label: 'Any Delivery Time' },
    { value: '1', label: 'Express 24H' },
    { value: '3', label: 'Up to 3 days' },
    { value: '7', label: 'Up to 1 week' },
    { value: '14', label: 'Up to 2 weeks' }
  ];

  const sellerLevelOptions = [
    { value: '', label: 'All Seller Levels' },
    { value: 'new', label: 'New Seller' },
    { value: 'level1', label: 'Level 1' },
    { value: 'level2', label: 'Level 2' },
    { value: 'top', label: 'Top Rated' }
  ];

  useEffect(() => {
    fetchGigs();
  }, []);

  useEffect(() => {
    filterGigs();
  }, [gigs, searchQuery, selectedCategory, sortBy, priceRange, deliveryTime, sellerLevel]);

  const fetchGigs = async () => {
    try {
      const response = await axios.get("/api/gigs");
      // Handle pagination response format
      if (response.data && response.data.gigs) {
        setGigs(response.data.gigs);
      } else if (Array.isArray(response.data)) {
        setGigs(response.data);
      } else {
        setGigs([]);
      }
    } catch (error) {
      console.error("Error fetching gigs:", error);
      setGigs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterGigs = () => {
    let filtered = Array.isArray(gigs) ? [...gigs] : [];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(gig => 
        gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(gig => gig.category === selectedCategory);
    }

    // Price range filter
    if (priceRange.min) {
      const minUsd = parseFloat(priceRange.min);
      filtered = filtered.filter(gig => (gig.price || 0) >= minUsd);
    }
    if (priceRange.max) {
      const maxUsd = parseFloat(priceRange.max);
      filtered = filtered.filter(gig => (gig.price || 0) <= maxUsd);
    }

    // Delivery time filter
    if (deliveryTime) {
      filtered = filtered.filter(gig => gig.deliveryTime <= parseInt(deliveryTime));
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 5) - (a.rating || 5));
        break;
      case 'bestseller':
        filtered.sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0));
        break;
      case 'delivery':
        filtered.sort((a, b) => a.deliveryTime - b.deliveryTime);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredGigs(filtered);
  };

  const handleSearch = () => {
    filterGigs();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    setDeliveryTime('');
    setSellerLevel('');
  };

  const toggleFavorite = (gigId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(gigId)) {
        newFavorites.delete(gigId);
      } else {
        newFavorites.add(gigId);
      }
      return newFavorites;
    });
  };

  const formatGigPrice = (price) => {
    return formatPrice(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title="Browse Services"
        subtitle={`${filteredGigs.length} services available${searchQuery ? ` for "${searchQuery}"` : ''}${selectedCategory && selectedCategory !== 'All Categories' ? ` in ${selectedCategory}` : ''}`}
        showBackButton={true}
        backButtonProps={{
          onClick: goBack || (() => navigate(-1)),
          label: "Back"
        }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List size={20} />
          </button>
        </div>
      </PageHeader>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category === 'All Categories' ? '' : category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range ($)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Delivery Time Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
                <select
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {deliveryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seller Level Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Seller Level</label>
                <select
                  value={sellerLevel}
                  onChange={(e) => setSellerLevel(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {sellerLevelOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  Showing {filteredGigs.length} results
                </span>
              </div>
            </div>

            {/* Results */}
            {filteredGigs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl text-gray-300 mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or browse all categories.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredGigs.map((gig) => (
                  <div
                    key={gig._id}
                    className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer relative ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                    onClick={() => navigate(`/client/gig/${gig._id}`)}
                  >
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(gig._id);
                      }}
                      className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 ${
                        favorites.has(gig._id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      <Heart size={16} fill={favorites.has(gig._id) ? 'currentColor' : 'none'} />
                    </button>

                    {/* Pro Badge */}
                    {gig.sellerId?.level === 'top' && (
                      <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Award size={12} />
                        PRO
                      </div>
                    )}
                    <div className={viewMode === 'list' ? 'w-64 flex-shrink-0' : ''}>
                      <img
                        src={gig.image || (gig.images && gig.images[0]) || `https://picsum.photos/400/300?random=${gig._id}`}
                        alt={gig.title}
                        className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                          viewMode === 'list' ? 'w-full h-48' : 'w-full h-48'
                        }`}
                        onError={(e) => {
                          e.target.src = `https://picsum.photos/400/300?random=${gig._id}`;
                        }}
                      />
                    </div>
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex items-center mb-2">
                        <img
                          src={gig.sellerId?.avatar || `https://ui-avatars.com/api/?name=${gig.sellerId?.name}&background=random`}
                          alt={gig.sellerId?.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span className="text-sm text-gray-600 font-medium">{gig.sellerId?.name}</span>
                        <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {gig.category}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                        {gig.title}
                      </h3>
                      {viewMode === 'list' && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{gig.description}</p>
                      )}
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          <Star className="text-yellow-400 fill-current" size={16} />
                          <span className="ml-1 text-sm text-gray-600 font-medium">
                            {gig.rating || '5.0'} ({gig.reviews?.length || Math.floor(Math.random() * 100) + 10})
                          </span>
                        </div>
                        <div className="ml-auto flex items-center text-gray-500 text-sm">
                          <Clock size={14} className="mr-1" />
                          {gig.deliveryTime} days
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">STARTING AT</span>
                        <span className="text-xl font-bold text-gray-900">{formatGigPrice(gig.price)}</span>
                      </div>
                      
                      {/* Additional Professional Features */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {gig.deliveryTime <= 1 && (
                            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                              Express 24H
                            </span>
                          )}
                          {gig.totalOrders > 50 && (
                            <span className="flex items-center gap-1">
                              <TrendingUp size={12} />
                              Best Seller
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-green-600">
                          <Shield size={12} />
                          <span className="text-xs font-medium">Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseGigs;