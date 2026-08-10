import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import ProductDetailModal from './components/ProductDetailModal';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import WishlistModal from './components/WishlistModal';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const heroSlides = [
    { badge: 'Limited-time deal', title: 'Special Offers,', accent: 'Special Prices', text: 'Save big on hand-picked gadgets, fashion, and home essentials. New deals arrive every day.', action: 'Explore offers', search: 'sale', theme: 'offer' },
    { badge: 'Festive collection', title: 'Celebrate the', accent: 'Festive Season', text: 'Discover thoughtful gifts, bright home décor, and style for every celebration.', action: 'Shop festive picks', search: 'gift', theme: 'festive' },
    { badge: 'QuicKart Big Days', title: 'Big Deals.', accent: 'Bigger Smiles.', text: 'Our biggest-value event is here with extra savings across top brands and categories.', action: 'View big deals', search: 'electronics', theme: 'billions' },
    { badge: 'Fresh arrivals', title: 'Upgrade Your', accent: 'Everyday', text: 'Trending essentials, trusted brands, and delivery that keeps up with your life.', action: 'See new arrivals', search: 'new', theme: 'arrival' },
];

function AppContent() {
    const [categories, setCategories] = useState([]);
    const [categoryError, setCategoryError] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState(() => new URLSearchParams(window.location.search).get('search') || '');

    // Modal state controllers
    const [activeProduct, setActiveProduct] = useState(null);
    const [showCartModal, setShowCartModal] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [checkoutTotal, setCheckoutTotal] = useState(0);
    const [authModalMode, setAuthModalMode] = useState(null); // 'login' | 'signup' | null
    const [userProfileTab, setUserProfileTab] = useState(null); // 'info' | 'orders' | 'addresses' | null
    const [showWishlistModal, setShowWishlistModal] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('quickkart-theme') || 'dark');
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('quickkart-theme', theme);
    }, [theme]);

    useEffect(() => {
        if (selectedCategory || searchTerm) return undefined;
        const timer = window.setInterval(() => setActiveSlide(current => (current + 1) % heroSlides.length), 5000);
        return () => window.clearInterval(timer);
    }, [selectedCategory, searchTerm]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/categories`)
            .then(res => {
                setCategories(res.data || []);
                setCategoryError(false);
            })
            .catch(err => {
                console.error('Error fetching categories:', err);
                setCategoryError(true);
            });
    }, []);

    const handleProceedToCheckout = (totalAmount) => {
        setCheckoutTotal(totalAmount);
        setShowCheckoutModal(true);
    };

    return (
        <div className={`app-shell theme-${theme} d-flex flex-column min-vh-100 ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
            {/* Top Navigation */}
            <Navbar
                categories={categories}
                onSelectCategory={(id) => {
                    setSelectedCategory(id);
                    setSearchTerm('');
                    window.history.pushState({}, '', window.location.pathname);
                }}
                onSearch={(query) => {
                    setSelectedCategory(null);
                    setSearchTerm(query);
                    window.history.pushState({}, '', `${window.location.pathname}?search=${encodeURIComponent(query)}`);
                }}
                onOpenAuth={(mode) => setAuthModalMode(mode)}
                onOpenCart={() => setShowCartModal(true)}
                onOpenProfile={(tab) => setUserProfileTab(tab)}
                onOpenWishlist={() => setShowWishlistModal(true)}
                onProductClick={(product) => setActiveProduct(product)}
                theme={theme}
                onToggleTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
            />

            {/* Main Content Area */}
            <main className="flex-grow-1">
                {categoryError && (
                    <div className="container mt-3">
                        <div className="alert alert-warning mb-0" role="alert">
                            Categories could not be loaded. Check that <code>VITE_API_BASE_URL</code> points to the running backend, then rebuild the frontend.
                        </div>
                    </div>
                )}
                {/* Hero Showcase Banner */}
                {!selectedCategory && !searchTerm && (
                    <div className="container mt-4 mb-3">
                        <section className="hero-carousel shadow-lg" aria-label="Featured offers">
                            <div className="hero-carousel-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                                {heroSlides.map((slide) => (
                                    <article className={`hero-slide hero-slide-${slide.theme}`} key={slide.theme}>
                                        <div className="hero-content p-4 p-md-5 text-center text-md-start">
                                            <span className="badge hero-badge px-3 py-2 text-uppercase mb-3">{slide.badge}</span>
                                            <h1 className="display-4 fw-bold mb-3">{slide.title} <span>{slide.accent}</span></h1>
                                            <p className="lead mb-4" style={{ maxWidth: '600px' }}>{slide.text}</p>
                                            <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-md-start">
                                                <button className="btn btn-light rounded-pill px-4 py-2 fw-semibold" onClick={() => {
                                                    setSearchTerm(slide.search);
                                                    window.history.pushState({}, '', `${window.location.pathname}?search=${encodeURIComponent(slide.search)}`);
                                                }}>{slide.action} <i className="bi bi-arrow-right ms-1"></i></button>
                                                <a href="#catalog" className="btn btn-outline-light rounded-pill px-4 py-2 fw-semibold">Browse catalogue</a>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            <button className="hero-arrow hero-arrow-prev" aria-label="Previous offer" onClick={() => setActiveSlide(current => (current - 1 + heroSlides.length) % heroSlides.length)}><i className="bi bi-chevron-left"></i></button>
                            <button className="hero-arrow hero-arrow-next" aria-label="Next offer" onClick={() => setActiveSlide(current => (current + 1) % heroSlides.length)}><i className="bi bi-chevron-right"></i></button>
                            <div className="hero-dots">{heroSlides.map((slide, index) => <button key={slide.theme} className={index === activeSlide ? 'active' : ''} aria-label={`Show ${slide.badge}`} onClick={() => setActiveSlide(index)} />)}</div>
                        </section>
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
                        searchTerm={searchTerm}
                        onSelectCategory={(id) => setSelectedCategory(id)}
                        categories={categories}
                        onProductClick={(product) => setActiveProduct(product)}
                        onOpenAuth={(mode) => setAuthModalMode(mode)}
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className={`${theme === 'dark' ? 'bg-dark border-secondary' : 'bg-white border-light'} border-top mt-5 py-4 text-muted small`}>
                <div className="container text-center">
                    <div className="d-flex justify-content-center align-items-center gap-2 fw-bold text-gradient fs-5 mb-2">
                        <i className="bi bi-bag-heart-fill text-primary"></i> QuicKart
                    </div>
                    <p className="mb-2">Empowering seamless online shopping with high-grade security, instant checkout, and real-time inventory management.</p>
                    <div className="text-secondary">&copy; {new Date().getFullYear()} QuicKart E-Commerce Inc. All Rights Reserved.</div>
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

            {showWishlistModal && (
                <WishlistModal
                    onClose={() => setShowWishlistModal(false)}
                    onProductClick={(product) => {
                        setActiveProduct(product);
                        setShowWishlistModal(false);
                    }}
                />
            )}
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <WishlistProvider>
                <CartProvider>
                    <AppContent />
                </CartProvider>
            </WishlistProvider>
        </AuthProvider>
    );
}
