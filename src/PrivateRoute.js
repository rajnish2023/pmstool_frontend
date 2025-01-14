import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserProfile } from './api/api';   

const isAuthenticated = () => localStorage.getItem('token');  

const PrivateRoute = ({ element: Component, allowedRoles }) => {
  const [isAuth, setIsAuth] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = isAuthenticated();
      if (!token) {
        setIsAuth(false);  
        return;
      }

      try {
        const user = await getUserProfile(token);    
        setUserRole(user.data.role);  
        setIsAuth(true);
      } catch (err) {
        console.error("Error fetching user profile:", err);   
        setIsAuth(false);  
      }
    };

    fetchUser();
  }, []);

  if (isAuth === null) return <div>Loading...</div>;  
 
  if (!isAuth || (allowedRoles && !allowedRoles.includes(userRole))) {
    return <Navigate to="/login" />;  
  }

  return <Component />;   
};

export default PrivateRoute;
