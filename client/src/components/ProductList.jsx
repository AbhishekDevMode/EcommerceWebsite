import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { FALLBACK_PRODUCT_IMAGE, replaceBrokenImage } from '../utils/imageFallback';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const ProductSkeleton = () => (
    <div className="col-xl-4 col-md-6">
        <div className="card card-product h-100 border-0 shadow-sm opacity-75">
            <div className="placeholder-glow">
                <div className="placeholder col-12 rounded-top" style={{ height: '220px' }}></div>
            </div>
            <div className="card-body d-flex flex-column gap-2">
                <div className="placeholder-glow">
                    <span className="placeholder col-4"></span>
                </div> 
                <div className="placeholder-glow">
                    <span className="placeholder col-8 fs-5"></span>
                </div>
                <div className="placeholder-glow">
                    <span className="placeholder col-6"></span>
                </div>
                <div className="mt-auto d-flex justify-content-between align-items-center pt-3 placeholder-glow">
                    <span className="placeholder col-4 fs-4"></span>
                    <span className="placeholder col-3 btn btn-sm btn-primary disabled"></span>
                </div>
            </div>
        </div>
    </div>
);

const ProductList = ({
    selectedCategory,
    searchTerm = '',
    onSelectCategory,
    categories = [],
    onProductClick,
    onOpenAuth
}) => {
    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isWishlisted } = useContext(WishlistContext);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); 

    // Filters state
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const fetchFilteredProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (selectedCategory) params.append('categoryId', selectedCategory);
            if (searchTerm.trim()) params.append('search', searchTerm.trim());
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (minRating) params.append('minRating', minRating);
            if (selectedBrand) params.append('brand', selectedBrand);
            if (selectedColor) params.append('color', selectedColor);
            if (selectedSize) params.append('productSize', selectedSize);
            params.append('sortBy', sortBy);
            params.append('page', page);
            params.append('size', searchTerm.trim() ? 100 : 12);

            const res = await axios.get(`${API_BASE_URL}/api/products/filter?${params.toString()}`);
            if (res.data && res.data.content) {
                setProducts(res.data.content);
                setTotalPages(res.data.totalPages || 1);
                setTotalElements(res.data.totalElements || 0);
            } else if (Array.isArray(res.data)) {
                setProducts(res.data);
                setTotalPages(1);
                setTotalElements(res.data.length);
            } else {
                // Fallback direct endpoint GET /api/products
                const fallbackRes = await axios.get(`${API_BASE_URL}/api/products`);
                const items = Array.isArray(fallbackRes.data) ? fallbackRes.data : [];
                setProducts(items);
                setTotalPages(1);
                setTotalElements(items.length);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to connect to backend product database. Please ensure Spring Boot server is running.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(0);
    }, [selectedCategory, searchTerm, minPrice, maxPrice, minRating, selectedBrand, selectedColor, selectedSize, sortBy]);

    useEffect(() => {
        fetchFilteredProducts();
    }, [selectedCategory, searchTerm, minPrice, maxPrice, minRating, selectedBrand, selectedColor, selectedSize, sortBy, page]);

    const showFilters = Boolean(searchTerm.trim());
    const brands = [...new Set(products.map(product => product.brand).filter(Boolean))].sort();
    const colors = [...new Set(products.flatMap(product => product.colors || []))].sort();
    const sizes = [...new Set(products.flatMap(product => product.sizes || []))].sort();

    const clearFilters = () => {
        if (onSelectCategory) onSelectCategory(null);
        setMinPrice('');
        setMaxPrice('');
        setMinRating('');
        setSelectedBrand('');
        setSelectedColor('');
        setSelectedSize('');
    };

    const handleQuickAddToCart = async (e, product) => {
        e.stopPropagation();
        const res = await addToCart(product.id, 1);
        if (res?.requireAuth && onOpenAuth) {
            onOpenAuth('login');
        }
    };

    const handleWishlist = async (e, product) => {
        e.stopPropagation();
        const result = await toggleWishlist(product.id);
        if (result?.requireAuth && onOpenAuth) onOpenAuth('login');
    };

    const getPrimaryImage = (product) => {
        if (product.productImages && product.productImages.length > 0) {
            const primary = product.productImages.find(img => img.isPrimary);
            if (primary && primary.imageUrl) return primary.imageUrl;
            if (product.productImages[0].imageUrl) return product.productImages[0].imageUrl;
        }
        if (product.imageUrl) return product.imageUrl;
        if (product.images && product.images.length > 0) return product.images[0];
        return FALLBACK_PRODUCT_IMAGE;
    };

    const formatPrice = (product) => {
        if (product.basePriceCents !== undefined && product.basePriceCents !== null) {
            return (product.basePriceCents / 100).toFixed(2);
        }
        if (product.price !== undefined && product.price !== null) {
            return Number(product.price).toFixed(2);
        }
        return "0.00";
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating || 0);
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
            } else if (i - 0.5 <= rating) {
                stars.push(<i key={i} className="bi bi-star-half text-warning"></i>);
            } else {
                stars.push(<i key={i} className="bi bi-star text-muted"></i>);
            }
        }
        return stars;
    };

    return (
        <div className="container my-4">
            <div className="row g-4">
                {/* Search-only filter panel */}
                {showFilters && <div className="col-lg-3 col-md-4">
                    <div className="card card-dark p-3 sticky-top" style={{ top: '80px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold mb-0 text-gradient"><i className="bi bi-funnel me-2"></i>Filters</h5>
                            {(selectedCategory || minPrice || maxPrice || minRating || selectedBrand || selectedColor || selectedSize) && (
                                <button className="btn btn-sm btn-link text-danger text-decoration-none p-0" onClick={clearFilters}>
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-muted small fw-bold text-uppercase">Brand</label>
                            <select className="form-select form-select-sm bg-dark text-light border-secondary" value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                                <option value="">All brands</option>
                                {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-muted small fw-bold text-uppercase">Color</label>
                            <select className="form-select form-select-sm bg-dark text-light border-secondary" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                                <option value="">All colors</option>
                                {colors.map(color => <option key={color} value={color}>{color}</option>)}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-muted small fw-bold text-uppercase">Size</label>
                            <select className="form-select form-select-sm bg-dark text-light border-secondary" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                                <option value="">All sizes</option>
                                {sizes.map(size => <option key={size} value={size}>{size}</option>)}
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div className="mb-4">
                            <label className="form-label text-muted small fw-bold text-uppercase">Category</label>
                            <div className="list-group list-group-flush">
                                <button
                                    className={`list-group-item list-group-item-action bg-transparent border-0 text-light py-2 ${!selectedCategory ? 'fw-bold text-primary active-category' : ''}`}
                                    onClick={() => onSelectCategory && onSelectCategory(null)}
                                >
                                    All Categories
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`list-group-item list-group-item-action bg-transparent border-0 text-light py-2 ${selectedCategory === cat.id ? 'fw-bold text-primary active-category' : ''}`}
                                        onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div className="mb-4">
                            <label className="form-label text-muted small fw-bold text-uppercase">Price Ranges ($)</label>
                            <div className="row g-2">
                                <div className="col-6">
                                    <input
                                        type="number"
                                        className="form-control form-control-sm bg-dark text-light border-secondary"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                </div>
                                <div className="col-6">
                                    <input
                                        type="number"
                                        className="form-control form-control-sm bg-dark text-light border-secondary"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Customer Ratings Filter */}
                        <div className="mb-3">
                            <label className="form-label text-muted small fw-bold text-uppercase">Minimum Rating</label>
                            <div className="d-flex flex-column gap-2">
                                {[4, 3, 2].map(r => (
                                    <div key={r} className="form-check cursor-pointer" onClick={() => setMinRating(minRating == r ? '' : r)}>
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="ratingFilter"
                                            checked={minRating == r}
                                            onChange={() => {}}
                                        />
                                        <label className="form-check-label text-light d-flex align-items-center gap-1 cursor-pointer">
                                            {renderStars(r)} <span className="small text-muted me-1">& Up</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>}

                {/* Main Product Catalog Display */}
                <div className={showFilters ? 'col-lg-9 col-md-8' : 'col-12'}>
                    {/* Top Control Bar */}
                    <div className="card card-dark p-3 mb-4 d-flex flex-row justify-content-between align-items-center flex-wrap gap-3">
                        <div className="text-muted">
                            {showFilters && <div className="fw-semibold text-light mb-1">Search results for “{searchTerm}”</div>}
                            Showing <span className="fw-bold text-light">{products.length}</span> of <span className="fw-bold text-light">{totalElements || products.length}</span> items
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            {/* Sort Selector */}
                            <div className="d-flex align-items-center gap-2">
                                <label className="text-muted small fw-semibold text-nowrap">Sort By:</label>
                                <select
                                    className="form-select form-select-sm bg-dark text-light border-secondary"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="popularity">Rating / Popularity</option>
                                </select>
                            </div>

                            {/* View Toggle Buttons */}
                            <div className="btn-group btn-group-sm">
                                <button
                                    className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => setViewMode('grid')}
                                    title="Grid View"
                                >
                                    <i className="bi bi-grid-3x3-gap-fill"></i>
                                </button>
                                <button
                                    className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => setViewMode('list')}
                                    title="List View"
                                >
                                    <i className="bi bi-list-ul"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
                            <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                            <div>{error}</div>
                        </div>
                    )}

                    {/* Products Grid / List / Skeleton */}
                    {loading ? (
                        <div className="row g-4">
                            <ProductSkeleton />
                            <ProductSkeleton />
                            <ProductSkeleton />
                            <ProductSkeleton />
                            <ProductSkeleton />
                            <ProductSkeleton />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-5 card card-dark p-4">
                            <i className="bi bi-search-heart text-muted fs-1 mb-3"></i>
                            <h4 className="fw-bold text-light">No Products Found</h4>
                            <p className="text-muted">Try adjusting your filters or search terms.</p>
                            <button className="btn btn-outline-primary btn-sm mx-auto" onClick={clearFilters}>Reset Filters</button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="row g-4">
                            {products.map(product => (
                                <div key={product.id} className="col-xl-4 col-md-6">
                                    <div className="card card-product h-100 cursor-pointer border-0 shadow-sm" onClick={() => onProductClick && onProductClick(product)}>
                                        <div className="position-relative overflow-hidden product-img-wrapper">
                                            <img
                                                src={getPrimaryImage(product)}
                                                className="card-img-top product-img"
                                                alt={product.title || product.name}
                                                onError={replaceBrokenImage}
                                                style={{ height: '220px', objectFit: 'cover' }}
                                            />
                                            {product.category?.name && (
                                                <span className="badge bg-secondary position-absolute top-0 start-0 m-2 px-2 py-1">
                                                    {product.category.name}
                                                </span>
                                            )}
                                            {product.stock <= 5 && product.stock > 0 && (
                                                <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-2">
                                                    Only {product.stock} left
                                                </span>
                                            )}
                                            <button
                                                className={`btn btn-sm rounded-circle position-absolute bottom-0 end-0 m-2 ${isWishlisted(product.id) ? 'btn-danger' : 'btn-dark'}`}
                                                title={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                                onClick={(e) => handleWishlist(e, product)}
                                            >
                                                <i className={`bi ${isWishlisted(product.id) ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                                            </button>
                                        </div>

                                        <div className="card-body d-flex flex-column">
                                            <div className="small text-muted mb-1">{product.brand || 'Premium Collection'}</div>
                                            <h6 className="card-title text-light fw-bold text-truncate mb-2">{product.title || product.name}</h6>
                                            
                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                <div className="d-flex align-items-center gap-1 small">
                                                    {renderStars(product.averageRating)}
                                                </div>
                                                <span className="small text-muted">({product.numReviews || 0})</span>
                                            </div>

                                            <div className="mt-auto d-flex justify-content-between align-items-center">
                                                <span className="fs-5 fw-bold text-success">${formatPrice(product)}</span>
                                                <button
                                                    className="btn btn-outline-primary btn-sm rounded-circle p-2"
                                                    title="Quick Add to Cart"
                                                    onClick={(e) => handleQuickAddToCart(e, product)}
                                                >
                                                    <i className="bi bi-cart-plus fs-5"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* List View Layout */
                        <div className="d-flex flex-column gap-3">
                            {products.map(product => (
                                <div key={product.id} className="card card-product p-3 cursor-pointer" onClick={() => onProductClick && onProductClick(product)}>
                                    <div className="row g-3 align-items-center">
                                        <div className="col-md-3 col-4">
                                            <img
                                                src={getPrimaryImage(product)}
                                                className="img-fluid rounded object-fit-cover"
                                                alt={product.title || product.name}
                                                onError={replaceBrokenImage}
                                                style={{ height: '140px', width: '100%' }}
                                            />
                                        </div>
                                        <div className="col-md-6 col-8">
                                            {product.category?.name && (
                                                <span className="badge bg-secondary mb-1">{product.category.name}</span>
                                            )}
                                            <h5 className="fw-bold text-light mb-1">{product.title || product.name}</h5>
                                            <div className="small text-muted mb-2">{product.brand}</div>
                                            <p className="small text-muted text-truncate mb-2" style={{ maxWidth: '400px' }}>{product.description}</p>
                                            <div className="d-flex align-items-center gap-1 small">
                                                {renderStars(product.averageRating)}
                                                <span className="ms-1 text-muted">({product.numReviews || 0} reviews)</span>
                                            </div>
                                        </div>
                                        <div className="col-md-3 col-12 d-flex flex-column justify-content-center align-items-md-end">
                                            <div className="fs-4 fw-bold text-success mb-2">${formatPrice(product)}</div>
                                            <button className={`btn btn-sm mb-2 w-100 ${isWishlisted(product.id) ? 'btn-danger' : 'btn-outline-danger'}`} onClick={(e) => handleWishlist(e, product)}>
                                                <i className={`bi ${isWishlisted(product.id) ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>{isWishlisted(product.id) ? 'Saved' : 'Wishlist'}
                                            </button>
                                            <button
                                                className="btn btn-primary btn-sm w-100 rounded-pill"
                                                onClick={(e) => handleQuickAddToCart(e, product)}
                                            >
                                                <i className="bi bi-cart-plus me-1"></i> Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                        <nav className="mt-4">
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                                    <button className="page-item-btn" onClick={() => setPage(p => Math.max(0, p - 1))}>
                                        Previous
                                    </button>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                                        <button className="page-item-btn" onClick={() => setPage(i)}>
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                                    <button className="page-item-btn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductList;
