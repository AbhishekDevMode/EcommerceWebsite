import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import ProductDetailModal from './components/ProductDetailModal';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function AppContent() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Modal state controllers
    const [activeProduct, setActiveProduct] = useState(null);
    const [showCartModal, setShowCartModal] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [checkoutTotal, setCheckoutTotal] = useState(0);
    const [authModalMode, setAuthModalMode] = useState(null); // 'login' | 'signup' | null
    const [userProfileTab, setUserProfileTab] = useState(null); // 'info' | 'orders' | 'addresses' | null

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/categories`)
            .then(res => setCategories(res.data || []))
            .catch(err => console.error('Error fetching categories:', err));
    }, []);

    const handleProceedToCheckout = (totalAmount) => {
        setCheckoutTotal(totalAmount);
        setShowCheckoutModal(true);
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-dark text-light">
            {/* Top Navigation */}
            <Navbar
                categories={categories}
                onSelectCategory={(id) => setSelectedCategory(id)}
                onOpenAuth={(mode) => setAuthModalMode(mode)}
                onOpenCart={() => setShowCartModal(true)}
                onOpenProfile={(tab) => setUserProfileTab(tab)}
                onProductClick={(product) => setActiveProduct(product)}
            />

            {/* Main Content Area */}
            <main className="flex-grow-1">
                {/* Hero Showcase Banner */}
                {!selectedCategory && (
                    <div className="container mt-4 mb-3">
                        <div className="hero-banner p-4 p-md-5 text-center text-md-start d-flex flex-column justify-content-center shadow-lg">
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <span className="badge bg-primary px-3 py-2 text-uppercase mb-3">Summer Flash Sale</span>
                                    <h1 className="display-4 fw-bold text-light mb-3">
                                        Next-Gen Tech & <span className="text-gradient">Premium Fashion</span>
                                    </h1>
                                    <p className="lead text-muted mb-4" style={{ maxWidth: '600px' }}>
                                        Discover top-tier acoustics, smart wearables, handcrafted leather, and high-performance athletic footwear with free express delivery.
                                    </p>
                                    <div className="d-flex flex-wrap gap-3">
                                        <a href="#catalog" className="btn btn-gradient-primary rounded-pill px-4 py-2 fw-semibold">
                                            Explore Collection <i className="bi bi-arrow-down-short ms-1"></i>
                                        </a>
                                        <button className="btn btn-outline-light rounded-pill px-4 py-2 fw-semibold" onClick={() => setSelectedCategory(categories[0]?.id)}>
                                            Shop Electronics
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Features Bar */}
                <div className="container mb-4">
                    <div className="row g-3 text-center">
                        <div className="col-md-3 col-6">
                            <div className="card card-dark p-3 h-100 d-flex flex-row align-items-center justify-content-center gap-3">
                                <i className="bi bi-truck fs-2 text-primary"></i>
                                <div className="text-start">
                                    <div className="fw-bold small text-light">Free Express Delivery</div>
                                    <div className="small text-muted">Orders over $50</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-6">
                            <div className="card card-dark p-3 h-100 d-flex flex-row align-items-center justify-content-center gap-3">
                                <i className="bi bi-shield-check fs-2 text-success"></i>
                                <div className="text-start">
                                    <div className="fw-bold small text-light">Money Back Guarantee</div>
                                    <div className="small text-muted">30 Days Return</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-6">
                            <div className="card card-dark p-3 h-100 d-flex flex-row align-items-center justify-content-center gap-3">
                                <i className="bi bi-credit-card-2-front fs-2 text-warning"></i>
                                <div className="text-start">
                                    <div className="fw-bold small text-light">Secure Checkout</div>
                                    <div className="small text-muted">Stripe & PayPal</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-6">
                            <div className="card card-dark p-3 h-100 d-flex flex-row align-items-center justify-content-center gap-3">
                                <i className="bi bi-headset fs-2 text-info"></i>
                                <div className="text-start">
                                    <div className="fw-bold small text-light">24/7 Dedicated Support</div>
                                    <div className="small text-muted">Instant Assistance</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Catalog List */}
                <div id="catalog">
                    <ProductList
                        selectedCategory={selectedCategory}
                        onSelectCategory={(id) => setSelectedCategory(id)}
                        categories={categories}
                        onProductClick={(product) => setActiveProduct(product)}
                        onOpenAuth={(mode) => setAuthModalMode(mode)}
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-dark border-top border-secondary mt-5 py-4 text-muted small">
                <div className="container text-center">
                    <div className="d-flex justify-content-center align-items-center gap-2 fw-bold text-gradient fs-5 mb-2">
                        <i className="bi bi-bag-heart-fill text-primary"></i> ApexMarket
                    </div>
                    <p className="mb-2">Empowering seamless online shopping with high-grade security, instant checkout, and real-time inventory management.</p>
                    <div className="text-secondary">&copy; {new Date().getFullYear()} ApexMarket E-Commerce Inc. All Rights Reserved.</div>
                </div>
            </footer>

            {/* Modals Container */}
            {activeProduct && (
                <ProductDetailModal
                    product={activeProduct}
                    onClose={() => setActiveProduct(null)}
                    onProductClick={(p) => setActiveProduct(p)}
                    onOpenAuth={(mode) => setAuthModalMode(mode)}
                />
            )}

            {showCartModal && (
                <CartModal
                    onClose={() => setShowCartModal(false)}
                    onProceedToCheckout={handleProceedToCheckout}
                    onOpenAuth={(mode) => setAuthModalMode(mode)}
                />
            )}

            {showCheckoutModal && (
                <CheckoutModal
                    onClose={() => setShowCheckoutModal(false)}
                    finalTotalAmount={checkoutTotal}
                />
            )}

            {authModalMode && (
                <AuthModal
                    initialMode={authModalMode}
                    onClose={() => setAuthModalMode(null)}
                />
            )}

            {userProfileTab && (
                <UserProfileModal
                    initialTab={userProfileTab}
                    onClose={() => setUserProfileTab(null)}
                />
            )}
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <AppContent />
            </CartProvider>
        </AuthProvider>
    );
}
