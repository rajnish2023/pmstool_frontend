import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserProfile } from './api/api';

const isAuthenticated = () => {
    return localStorage.getItem('token');
};

const PrivateRoute = ({ element: Component, ...rest }) => {
    const [isAuth, setIsAuth] = useState(null);
    const [loadingError, setLoadingError] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = isAuthenticated();
            
            // Check if there's a token in localStorage
            if (!token) {
                setIsAuth(false);
                return;
            }

            try {
                // Attempt to get user profile
                await getUserProfile(token);
                setIsAuth(true); // If the API call succeeds, set as authenticated
            } catch (error) {
                // Log error for debugging
                console.error('Authentication failed:', error);
                <navigate to="/login" />;
                setIsAuth(false); // Set as not authenticated
            }
        };

        checkAuth();
    }, []);

    // Loading state and error display
    if (isAuth === null) {
        return <div>Loading...</div>;
    }

    if (loadingError) {
        return <div>{loadingError}</div>; // Show error message
    }

    // If authenticated, render the requested component, otherwise redirect to login
    return isAuth ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default PrivateRoute;
