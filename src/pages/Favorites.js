import React, { useState, useEffect } from 'react';
import { Heart, Star, Clock, DollarSign, User, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import PageHeader from '../components/PageHeader';
import axios from 'axios';
import { toast } from 'react-toastify';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/favorites', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFavorites(response.data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // For now, set empty array if API doesn't exist
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (gigId) => {
    try {
      await axios.delete(`/api/users/favorites/${gigId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setFavorites(favorites.filter(fav => fav._id !== gigId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="My Favorites"
        subtitle="Services and freelancers you've saved for later"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No favorites yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring services and save the ones you like by clicking the heart icon. 
              They'll appear here for easy access later.
            </p>
            <Link
              to={user?.role === 'client' ? '/client/browse-gigs' : '/freelancer/dashboard'}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Heart className="w-5 h-5" />
              Browse Services
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {favorites.length} Saved {favorites.length === 1 ? 'Service' : 'Services'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((gig) => (
                <div key={gig._id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  {/* Gig Image */}
                  <div className="relative h-48 bg-gray-200">
                    {gig.images && gig.images.length > 0 ? (
                      <img
                        src={gig.images[0]}
                        alt={gig.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-gray-400 text-6xl">🎨</div>
                      </div>
                    )}
                    
                    {/* Remove from favorites button */}
                    <button
                      onClick={() => removeFavorite(gig._id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Gig Content */}
                  <div className="p-4">
                    {/* Freelancer Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {gig.freelancer?.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                      </div>
                      <span className="text-sm text-gray-600">{gig.freelancer?.name || 'Unknown Freelancer'}</span>
                    </div>

                    {/* Gig Title */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {gig.title}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">
                        {gig.rating || '5.0'}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({gig.reviewCount || 0} reviews)
                      </span>
                    </div>

                    {/* Category */}
                    <div className="mb-3">
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {gig.category}
                      </span>
                    </div>

                    {/* Price and Delivery */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{gig.deliveryTime || '3'} days</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Starting at</span>
                        <span className="font-bold text-gray-900">
                          {formatPrice(gig.price || 50)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2">
                      <Link
                        to={user?.role === 'client' ? `/client/gig/${gig._id}` : `/gig/${gig._id}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View Details
                      </Link>
                      {user?.role === 'client' && (
                        <Link
                          to={`/client/place-order/${gig._id}`}
                          className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Order Now
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;