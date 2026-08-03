import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const { user } = useContext(AuthContext);

    const fetchCart = async () => {
        if (!user) {
            setCart(null);
            return;
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/api/cart`);
            setCart(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    const addToCart = async (productId, quantity = 1, selectedSize = null, selectedColor = null) => {
        if (!user) {
            return { success: false, requireAuth: true };
        }
        try {
            const response = await axios.post(`${API_BASE_URL}/api/cart/add`, {
                productId,
                quantity,
                selectedSize,
                selectedColor
            });
            setCart(response.data);
            return { success: true };
        } catch (error) {
            console.error('Error adding to cart:', error);
            return { success: false, error: error.message };
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        if (!user) return;
        try {
            const response = await axios.put(`${API_BASE_URL}/api/cart/update/${itemId}`, { quantity });
            setCart(response.data);
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    };

    const saveForLater = async (itemId) => {
        if (!user) return;
        try {
            const response = await axios.put(`${API_BASE_URL}/api/cart/save-for-later/${itemId}`);
            setCart(response.data);
        } catch (error) {
            console.error('Error saving item for later:', error);
        }
    };

    const moveToCart = async (itemId) => {
        if (!user) return;
        try {
            const response = await axios.put(`${API_BASE_URL}/api/cart/move-to-cart/${itemId}`);
            setCart(response.data);
        } catch (error) {
            console.error('Error moving item to cart:', error);
        }
    };

    const removeFromCart = async (itemId) => {
        if (!user) return;
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/cart/remove/${itemId}`);
            setCart(response.data);
        } catch (error) {
            console.error('Error removing item from cart:', error);
        }
    };

    const clearCart = () => {
        setCart(null);
    };

    // Calculate active items vs saved for later items
    const activeItems = cart?.items ? cart.items.filter(item => !item.savedForLater) : [];
    const savedItems = cart?.items ? cart.items.filter(item => item.savedForLater) : [];

    const subtotal = activeItems.reduce((acc, item) => acc + ((item.product?.price || 0) * item.quantity), 0);
    const tax = Math.round((subtotal * 0.08) * 100) / 100;
    const shipping = subtotal > 50 || subtotal === 0 ? 0 : 9.99;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;

    return (
        <CartContext.Provider value={{
            cart,
            activeItems,
            savedItems,
            subtotal,
            tax,
            shipping,
            total,
            addToCart,
            updateQuantity,
            saveForLater,
            moveToCart,
            removeFromCart,
            fetchCart,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
