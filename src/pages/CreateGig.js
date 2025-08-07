import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/AuthContext";

const CreateGig = ({ goBack }) => {
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    deliveryTime: "",
  });

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user || (!user._id && !user.id)) {
      alert("Please sign in again.");
      window.location.href = "/";
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert("Image size should be under 5MB.");
      return;
    }
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const gigData = new FormData();
    gigData.append("title", formData.title);
    gigData.append("category", formData.category);
    gigData.append("description", formData.description);
    gigData.append("price", Number(formData.price));
    gigData.append("deliveryTime", Number(formData.deliveryTime));
    gigData.append("sellerId", user._id || user.id);

    if (image) {
      gigData.append("image", image);
    }

    try {
      await axios.post("http://localhost:5000/api/gigs", gigData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Gig created successfully!");
      if (goBack) goBack();
    } catch (err) {
      console.error("Gig creation failed:", err.response?.data || err.message);
      alert(`Failed to create gig: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      {goBack && (
        <button
          onClick={goBack}
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Back
        </button>
      )}

      <h2 className="text-xl font-bold mb-4">Create New Gig</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          required
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <textarea
          name="description"
          required
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <input
          type="number"
          name="price"
          required
          min="1"
          placeholder="Price (INR)"
          value={formData.price}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <input
          type="number"
          name="deliveryTime"
          required
          min="1"
          placeholder="Delivery Time (days)"
          value={formData.deliveryTime}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={uploading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default CreateGig;
