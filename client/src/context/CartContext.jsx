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

    const addToCart = async (productId, quantity = 1) => {
        if (!user) return alert("Please login to add to cart");
        try {
            const response = await axios.post(`${API_BASE_URL}/api/cart/add`, { productId, quantity });
            setCart(response.data);
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/cart/update/${itemId}`, { quantity });
            setCart(response.data);
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    };

    const clearCart = () => {
        setCart(null);
    }

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, fetchCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
