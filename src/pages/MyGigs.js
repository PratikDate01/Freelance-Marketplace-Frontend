import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { useAuth } from '../hooks/AuthContext';
import PageHeader from '../components/PageHeader';
import { Edit, Trash2, Eye, Plus, DollarSign, Clock } from 'lucide-react';

const MyGigs = ({ goBack, onEdit }) => {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { token } = useAuth();

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/gigs/mine');
      setGigs(res.data);
    } catch (err) {
      console.error('Failed to load gigs:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/gigs/${id}`);
      setMessage('Gig deleted successfully.');
      fetchGigs();
    } catch (err) {
      console.error('Failed to delete gig:', err.response?.data || err.message);
      setMessage('Error deleting gig.');
    }
  };

  useEffect(() => {
    if (token) fetchGigs();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="My Services"
        subtitle={`Manage your ${gigs.length} active services`}
        showBackButton={true}
        backButtonProps={{
          onClick: goBack || (() => navigate(-1)),
          label: "Back"
        }}
      >
        <button
          onClick={() => navigate('/freelancer/create-gig')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Service
        </button>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium text-center">{message}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your services...</p>
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-600 mb-6">Create your first service to start earning!</p>
            <button
              onClick={() => window.location.href = '/freelancer/create-gig'}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Your First Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <div
                key={gig._id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {(gig.image || (gig.images && gig.images[0])) && (
                  <img
                    src={gig.image || gig.images[0]}
                    alt={gig.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {gig.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {gig.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {gig.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">₹{gig.price}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{gig.deliveryTime} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit ? onEdit(gig) : navigate(`/freelancer/edit-gig/${gig._id}`)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(gig._id)}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center justify-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGigs;
