import React from "react";
import { useNavigate } from "react-router-dom";

const GigCard = ({ gig }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/client/gig/${gig._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="border p-4 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
    >
      <img
        src={gig.image || "https://placehold.co/300"}
        alt={gig.title}
        className="w-full h-40 object-cover rounded-md mb-3"
      />
      <h2 className="text-lg font-semibold">{gig.title}</h2>
      <p className="text-sm text-gray-600">{gig.description}</p>
      <p className="font-bold mt-2">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round((gig.price || 0) * 0.012))}</p>
      <p className="text-xs text-gray-500 mt-1">
        Delivery in {gig.deliveryTime} day(s)
      </p>
      <p className="text-xs text-blue-500 mt-1">
        Seller: {gig?.sellerId?.name || "Unknown"}
      </p>
    </div>
  );
};

export default GigCard;
