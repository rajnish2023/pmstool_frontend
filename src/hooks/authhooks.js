import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('/api/auth/user');
                setUser(response.data);
            } catch (error) {
                console.error('Failed to fetch user', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, loading };
};

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/login', credentials);
            return response.data;
        } catch (error) {
            setError(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    return { login, loading, error };
};

export const useLogout = () => {
    const [loading, setLoading] = useState(false);

    const logout = async () => {
        setLoading(true);
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error('Failed to logout', error);
        } finally {
            setLoading(false);
        }
    };

    return { logout, loading };
};