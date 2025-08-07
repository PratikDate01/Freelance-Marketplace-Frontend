import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/AuthContext";

const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await axios.get("http://localhost:5000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    };
    fetchOrders();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">📦 My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order._id} className="p-4 border rounded shadow-sm bg-white">
              <h3 className="text-lg font-semibold">{order.gigId.title}</h3>
              <p className="text-sm text-gray-500">
                ₹{order.amount} — Status: {order.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Orders;
