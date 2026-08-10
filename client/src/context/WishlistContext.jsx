import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const WishlistProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [wishlist, setWishlist] = useState(null);

    const fetchWishlist = async () => {
        if (!user) {
            setWishlist(null);
            return null;
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/api/wishlist`);
            setWishlist(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            return null;
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [user]);

    const toggleWishlist = async (productId) => {
        if (!user) return { requireAuth: true };
        const saved = wishlist?.products?.some(product => product.id === productId);
        try {
            const response = saved
                ? await axios.delete(`${API_BASE_URL}/api/wishlist/remove/${productId}`)
                : await axios.post(`${API_BASE_URL}/api/wishlist/add/${productId}`);
            setWishlist(response.data);
            return { success: true, saved: !saved };
        } catch (error) {
            console.error('Error updating wishlist:', error);
            return { success: false };
        }
    };

    const isWishlisted = (productId) => Boolean(wishlist?.products?.some(product => product.id === productId));

    return (
        <WishlistContext.Provider value={{ wishlist, fetchWishlist, toggleWishlist, isWishlisted }}>
            {children}
        </WishlistContext.Provider>
    );
};
