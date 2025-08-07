import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/AuthContext';

const MyGigs = ({ goBack, onEdit }) => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { token } = useAuth();

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/gigs/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGigs(res.data);
    } catch (err) {
      console.error('Failed to load gigs:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/gigs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    <div className="p-6 max-w-6xl mx-auto">
      {goBack && (
        <button
          onClick={goBack}
          className="mb-4 px-4 py-2 bg-gray-200 text-sm font-medium rounded hover:bg-gray-300"
        >
          ← Back
        </button>
      )}

      <h2 className="text-3xl font-bold mb-6 text-center">📁 My Gigs</h2>

      {message && (
        <p className="mb-4 text-green-600 font-medium text-center">{message}</p>
      )}

      {loading ? (
        <p className="text-center text-gray-600">Loading gigs...</p>
      ) : gigs.length === 0 ? (
        <p className="text-center text-gray-500">No gigs found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div
              key={gig._id}
              className="bg-white border rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden"
            >
              {gig.image && (
                <img
                  src={gig.image}
                  alt={gig.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-1">{gig.title}</h3>
                <p className="text-gray-500 text-sm mb-2 italic">
                  {gig.description}
                </p>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-semibold">Category:</span>{' '}
                    {gig.category}
                  </p>
                  <p>
                    <span className="font-semibold">Price:</span> ₹{gig.price}
                  </p>
                  <p>
                    <span className="font-semibold">Delivery:</span>{' '}
                    {gig.deliveryTime} day(s)
                  </p>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => onEdit(gig)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(gig._id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGigs;
