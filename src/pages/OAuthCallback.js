import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const user = JSON.parse(decodeURIComponent(params.get('user')));

    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      // ✅ Redirect to correct profile based on role
      if (user.role === 'freelancer') {
        navigate('/freelancer/profile');
      } else if (user.role === 'client') {
        navigate('/client/profile');
      } else {
        navigate('/'); // fallback if role is missing
      }
    } else {
      navigate('/signin');
    }
  }, [navigate, setUser]);

  return <p className="text-center mt-20">Redirecting...</p>;
};

export default OAuthCallback;
