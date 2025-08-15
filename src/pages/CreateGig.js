import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { useAuth } from "../hooks/AuthContext";
import PageHeader from "../components/PageHeader";
import { Upload, DollarSign, Clock, Tag } from "lucide-react";

const CreateGig = ({ goBack }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

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
    
    // Validation
    if (!formData.title.trim()) {
      alert("Please enter a service title");
      return;
    }
    if (!formData.category) {
      alert("Please select a category");
      return;
    }
    if (!formData.description.trim()) {
      alert("Please enter a description");
      return;
    }
    if (!formData.price || formData.price < 100) {
      alert("Please enter a valid price (minimum ₹100)");
      return;
    }
    if (!formData.deliveryTime) {
      alert("Please select delivery time");
      return;
    }

    setUploading(true);

    const gigData = new FormData();
    gigData.append("title", formData.title.trim());
    gigData.append("category", formData.category);
    gigData.append("description", formData.description.trim());
    gigData.append("price", Number(formData.price));
    gigData.append("deliveryTime", Number(formData.deliveryTime));
    gigData.append("sellerId", user._id || user.id);

    if (image) {
      gigData.append("image", image);
    }

    try {
      console.log("Creating gig with data:", {
        title: formData.title,
        category: formData.category,
        price: formData.price,
        deliveryTime: formData.deliveryTime,
        hasImage: !!image
      });

      const response = await axios.post("/api/gigs", gigData);
      console.log("Gig created successfully:", response.data);

      alert("Service created successfully!");
      if (goBack) {
        goBack();
      } else {
        navigate("/freelancer/my-gigs");
      }
    } catch (err) {
      console.error("Gig creation failed:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Unknown error";
      alert(`Failed to create service: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Create New Service"
        subtitle="Share your skills and start earning"
        showBackButton={true}
        backButtonProps={{
          onClick: goBack || (() => navigate(-1)),
          label: "Back"
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-green-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="I will create a professional website for you"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    <option value="Programming & Tech">Programming & Tech</option>
                    <option value="Graphics & Design">Graphics & Design</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Writing & Translation">Writing & Translation</option>
                    <option value="Video & Animation">Video & Animation</option>
                    <option value="Music & Audio">Music & Audio</option>
                    <option value="Business">Business</option>
                    <option value="AI Services">AI Services</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={6}
                  placeholder="Describe your service in detail. What will you deliver? What makes your service unique?"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Pricing & Delivery */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Pricing & Delivery
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="1"
                    placeholder="500"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Set a competitive price for your service</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Time (days) *
                  </label>
                  <input
                    type="number"
                    name="deliveryTime"
                    required
                    min="1"
                    placeholder="3"
                    value={formData.deliveryTime}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">How many days will you need to complete this?</p>
                </div>
              </div>
            </div>

            {/* Service Image */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-green-600" />
                Service Image
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-sm font-medium text-green-600 hover:text-green-500">
                    Click to upload an image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                {image && (
                  <p className="text-sm text-green-600 mt-2">Selected: {image.name}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={uploading}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Service...
                  </>
                ) : (
                  "Create Service"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGig;
