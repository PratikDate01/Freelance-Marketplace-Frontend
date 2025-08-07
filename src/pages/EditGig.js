// client/src/pages/EditGig.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/AuthContext';

const EditGig = ({ gigData, goBack }) => {
  const { token } = useAuth();
  const [gig, setGig] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    deliveryTime: '',
    image: '',
  });

  useEffect(() => {
    if (gigData) {
      setGig({
        title: gigData.title || '',
        description: gigData.description || '',
        category: gigData.category || '',
        price: gigData.price || '',
        deliveryTime: gigData.deliveryTime || '',
        image: gigData.image || '',
      });
    }
  }, [gigData]);

  const handleChange = (e) => {
    setGig({ ...gig, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/gigs/${gigData._id}`,
        { ...gig },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Gig updated successfully!');
      goBack(); // ✅ go back to profile
    } catch (err) {
      console.error('Failed to update gig:', err);
      alert('Error updating gig.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      {goBack && (
        <button
          onClick={goBack}
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Back
        </button>
      )}
      <h2 className="text-2xl font-bold mb-6 text-center">Edit Gig</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          value={gig.title}
          onChange={handleChange}
          placeholder="Gig Title"
          required
          className="w-full border rounded px-3 py-2"
        />
        <textarea
          name="description"
          value={gig.description}
          onChange={handleChange}
          placeholder="Description"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          name="category"
          value={gig.category}
          onChange={handleChange}
          placeholder="Category"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          name="price"
          value={gig.price}
          onChange={handleChange}
          placeholder="Price"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          name="deliveryTime"
          value={gig.deliveryTime}
          onChange={handleChange}
          placeholder="Delivery Time (in days)"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          name="image"
          value={gig.image}
          onChange={handleChange}
          placeholder="Image URL"
          className="w-full border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditGig;
