import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/AuthContext";

const PlaceOrder = () => {
  const { id } = useParams(); // gig id
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);

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

  // Note: Role-based access control is handled by ProtectedRoute component

  if (loading || !gig || !user) {
    return <div className="text-center mt-10">Loading...</div>;
  }


  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Place Order</h2>
      <p className="text-lg mb-2"><strong>Gig:</strong> {gig.title}</p>
      <p className="mb-4">{gig.description}</p>
      <p className="mb-4"><strong>Price:</strong> ₹{gig.price}</p>
      <button
        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        onClick={() => navigate("/client/order-success")}
      >
        Confirm Order
      </button>
    </div>
  );
};

export default PlaceOrder;
