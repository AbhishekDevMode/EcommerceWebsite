import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setAddresses([]);
        delete axios.defaults.headers.common['Authorization'];
    };

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token || token === 'undefined') {
            logout();
            setLoading(false);
            return;
        }
        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.get(`${API_BASE_URL}/api/auth/profile`);
            setUser(res.data);
            if (res.data.addresses) {
                setAddresses(res.data.addresses);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            if (err.response?.status === 401) {
                logout();
            } else {
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    try { setUser(JSON.parse(savedUser)); } catch (e) {}
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Global axios 401 handler
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response && error.response.status === 401) {
                    const token = localStorage.getItem('token');
                    // Only logout if token was present but rejected
                    if (token) {
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );

        const token = localStorage.getItem('token');
        if (token && token !== 'undefined') {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    fetchProfile();
                }
            } catch (error) {
                logout();
            }
        } else {
            logout();
            setLoading(false);
        }

        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const login = (tokenArg, userData) => {
        let validToken = tokenArg;
        if (!validToken || validToken === 'undefined') {
            validToken = userData?.token || userData?.accessToken;
        }
        if (!validToken || validToken === 'undefined') {
            console.error("Invalid token received during login");
            return;
        }
        localStorage.setItem('token', validToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${validToken}`;
        fetchProfile();
    };

    const socialLogin = async (provider) => {
        try {
            const fakeEmail = `${provider.toLowerCase()}_user@example.com`;
            const fakeName = `${provider} User`;
            try {
                const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                    email: fakeEmail,
                    password: "socialpassword123"
                });
                const token = res.data.token || res.data.accessToken;
                login(token, res.data);
            } catch (e) {
                await axios.post(`${API_BASE_URL}/api/auth/signup`, {
                    name: fakeName,
                    email: fakeEmail,
                    password: "socialpassword123"
                });
                const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                    email: fakeEmail,
                    password: "socialpassword123"
                });
                const token = res.data.token || res.data.accessToken;
                login(token, res.data);
            }
        } catch (err) {
            console.error('Social login error:', err);
            throw err;
        }
    };

    const updateProfile = async (updatedData) => {
        try {
            const res = await axios.put(`${API_BASE_URL}/api/auth/profile`, updatedData);
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            return res.data;
        } catch (err) {
            console.error('Update profile error:', err);
            throw err;
        }
    };

    const fetchAddresses = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/auth/addresses`);
            setAddresses(res.data);
            return res.data;
        } catch (err) {
            console.error('Fetch addresses error:', err);
            return [];
        }
    };

    const addAddress = async (addressData) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/addresses`, addressData);
            setAddresses(prev => [...prev, res.data]);
            return res.data;
        } catch (err) {
            console.error('Add address error:', err);
            throw err;
        }
    };

    const deleteAddress = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/auth/addresses/${id}`);
            setAddresses(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error('Delete address error:', err);
            throw err;
        }
    };

    const forgotPassword = async (email) => {
        const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
        return res.data;
    };

    const resetPassword = async (token, newPassword) => {
        const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { token, newPassword });
        return res.data;
    };

    return (
        <AuthContext.Provider value={{
            user,
            addresses,
            loading,
            login,
            logout,
            socialLogin,
            updateProfile,
            fetchAddresses,
            addAddress,
            deleteAddress,
            forgotPassword,
            resetPassword
        }}>
            {children}
        </AuthContext.Provider>
    );
};
