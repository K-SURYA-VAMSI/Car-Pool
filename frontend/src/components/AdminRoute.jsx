import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const AdminRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        await axios.get('http://localhost:5000/api/admin/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsAdmin(true);
      } catch (error) {
        localStorage.removeItem('adminToken');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdmin();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAdmin ? children : <Navigate to="/admin/login" />;
};

export default AdminRoute; 