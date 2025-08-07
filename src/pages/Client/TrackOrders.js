import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/AuthContext";

const TrackOrders = ({ goBack }) => {
  const { token } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/orders/track", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setTracks(res.data))
      .catch(err => console.error("Tracking failed:", err))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button onClick={goBack} className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">← Back</button>
      <h2 className="text-2xl font-bold mb-6">📊 Track Order Status</h2>

      {loading ? (
        <p>Loading tracking data...</p>
      ) : tracks.length === 0 ? (
        <p>No tracking data available.</p>
      ) : (
        <ul className="space-y-4">
          {tracks.map(track => (
            <li key={track._id} className="p-4 border rounded shadow">
              <p><strong>Gig:</strong> {track.gigTitle}</p>
              <p><strong>Status:</strong> {track.status}</p>
              <p><strong>Expected Delivery:</strong> {track.expectedDeliveryDate}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrackOrders;
