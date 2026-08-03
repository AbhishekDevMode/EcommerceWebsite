import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const ProductDetailModal = ({ product, onClose, onProductClick, onOpenAuth }) => {
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    const [selectedImage, setSelectedImage] = useState(product?.imageUrl || '');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reviews'

    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(5);
    const [newTitle, setNewTitle] = useState('');
    const [newComment, setNewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!product) return;
        setSelectedImage(product.imageUrl);
        setSelectedSize(product.sizes?.[0] || '');
        setSelectedColor(product.colors?.[0] || '');
        setQuantity(1);

        // Fetch related products
        axios.get(`${API_BASE_URL}/api/products/${product.id}/related`)
            .then(res => setRelatedProducts(res.data || []))
            .catch(err => console.error('Error fetching related products:', err));

        // Fetch reviews
        axios.get(`${API_BASE_URL}/api/reviews/product/${product.id}`)
            .then(res => setReviews(res.data || []))
            .catch(err => console.error('Error fetching reviews:', err));
    }, [product]);

    if (!product) return null;

    const imagesList = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPos({ x, y });
    };

    const handleAddToCart = async () => {
        const res = await addToCart(product.id, quantity, selectedSize, selectedColor);
        if (res?.requireAuth) {
            onOpenAuth('login');
        } else if (res?.success) {
            alert("Product added to cart!");
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            onOpenAuth('login');
            return;
        }
        if (!newComment.trim()) return;
        setSubmittingReview(true);
        try {
            await axios.post(`${API_BASE_URL}/api/reviews/add/${product.id}`, {
                rating: newRating,
                title: newTitle,
                comment: newComment
            });
            // Refresh reviews
            const res = await axios.get(`${API_BASE_URL}/api/reviews/product/${product.id}`);
            setReviews(res.data || []);
            setNewTitle('');
            setNewComment('');
            alert('Thank you! Your review has been published.');
        } catch (err) {
            console.error('Error adding review:', err);
            alert('Failed to submit review.');
        } finally {
            setSubmittingReview(false);
        }
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
        <div className="modal fade show d-block backdrop-blur" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-dark text-light border-secondary shadow-lg">
                    {/* Modal Header */}
                    <div className="modal-header border-secondary px-4 py-3">
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary px-3 py-1 fs-6">{product.category?.name}</span>
                            <h5 className="modal-title text-light fw-bold mb-0">{product.name}</h5>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body p-4">
                        <div className="row g-4">
                            {/* Left Column: Image Gallery with Zoom */}
                            <div className="col-lg-6">
                                <div
                                    className="main-image-box position-relative overflow-hidden rounded border border-secondary mb-3 cursor-zoom"
                                    onMouseEnter={() => setIsZoomed(true)}
                                    onMouseLeave={() => setIsZoomed(false)}
                                    onMouseMove={handleMouseMove}
                                    style={{ height: '380px', backgroundColor: '#111' }}
                                >
                                    <img
                                        src={selectedImage || product.imageUrl}
                                        alt={product.name}
                                        className="w-100 h-100 object-fit-contain"
                                        style={{
                                            transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
                                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                            transition: isZoomed ? 'none' : 'transform 0.3s ease'
                                        }}
                                    />
                                    <div className="position-absolute bottom-0 end-0 m-2 bg-dark bg-opacity-75 px-2 py-1 rounded small text-muted">
                                        <i className="bi bi-zoom-in me-1"></i> Hover to zoom
                                    </div>
                                </div>

                                {/* Thumbnails Selector */}
                                {imagesList.length > 1 && (
                                    <div className="d-flex gap-2 overflow-x-auto pb-2">
                                        {imagesList.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`Thumbnail ${idx}`}
                                                className={`rounded cursor-pointer border ${selectedImage === img ? 'border-primary border-2' : 'border-secondary opacity-75'}`}
                                                width="70"
                                                height="70"
                                                style={{ objectFit: 'cover' }}
                                                onClick={() => setSelectedImage(img)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Details & Variant Pickers */}
                            <div className="col-lg-6 d-flex flex-column">
                                <div className="small text-muted mb-1">{product.brand || 'Premium Brand'}</div>
                                <h3 className="fw-bold text-light mb-2">{product.name}</h3>

                                {/* Ratings Overview */}
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div className="d-flex gap-1">{renderStars(product.averageRating)}</div>
                                    <span className="fw-bold text-warning ms-1">{product.averageRating?.toFixed(1)}</span>
                                    <span className="text-muted">({reviews.length} customer reviews)</span>
                                </div>

                                {/* Price & Stock */}
                                <div className="d-flex align-items-baseline gap-3 mb-4">
                                    <span className="display-6 fw-bold text-success">${product.price?.toFixed(2)}</span>
                                    {product.stock > 0 ? (
                                        <span className="badge bg-success-subtle text-success border border-success px-3 py-1">
                                            In Stock ({product.stock} available)
                                        </span>
                                    ) : (
                                        <span className="badge bg-danger-subtle text-danger border border-danger px-3 py-1">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>

                                {/* Size Picker */}
                                {product.sizes && product.sizes.length > 0 && (
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Select Size:</label>
                                        <div className="d-flex flex-wrap gap-2">
                                            {product.sizes.map(sz => (
                                                <button
                                                    key={sz}
                                                    className={`btn btn-sm ${selectedSize === sz ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                    onClick={() => setSelectedSize(sz)}
                                                >
                                                    {sz}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Color Picker */}
                                {product.colors && product.colors.length > 0 && (
                                    <div className="mb-4">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Select Color:</label>
                                        <div className="d-flex flex-wrap gap-2">
                                            {product.colors.map(col => (
                                                <button
                                                    key={col}
                                                    className={`btn btn-sm ${selectedColor === col ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary'}`}
                                                    onClick={() => setSelectedColor(col)}
                                                >
                                                    {col}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity Counter & Add to Cart */}
                                <div className="d-flex align-items-center gap-3 mt-auto pt-3 border-top border-secondary">
                                    <div className="input-group" style={{ width: '130px' }}>
                                        <button className="btn btn-outline-secondary" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                                            -
                                        </button>
                                        <input
                                            type="text"
                                            className="form-control text-center bg-dark text-light border-secondary"
                                            value={quantity}
                                            readOnly
                                        />
                                        <button className="btn btn-outline-secondary" onClick={() => setQuantity(q => q + 1)}>
                                            +
                                        </button>
                                    </div>

                                    <button
                                        className="btn btn-gradient-primary flex-grow-1 py-2 fw-semibold fs-5 rounded-pill"
                                        onClick={handleAddToCart}
                                    >
                                        <i className="bi bi-bag-plus me-2"></i> Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Nav Tabs: Overview / Reviews */}
                        <ul className="nav nav-tabs border-secondary mt-5 mb-4">
                            <li className="nav-item">
                                <button
                                    className={`nav-link bg-transparent text-light border-0 ${activeTab === 'overview' ? 'border-bottom border-primary border-3 fw-bold text-primary active' : ''}`}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    Description & Details
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link bg-transparent text-light border-0 ${activeTab === 'reviews' ? 'border-bottom border-primary border-3 fw-bold text-primary active' : ''}`}
                                    onClick={() => setActiveTab('reviews')}
                                >
                                    Customer Reviews ({reviews.length})
                                </button>
                            </li>
                        </ul>

                        {/* Tab Content */}
                        {activeTab === 'overview' ? (
                            <div className="p-3 card card-dark border-0">
                                <h6 className="fw-bold text-gradient mb-2">Product Description</h6>
                                <p className="text-muted leading-relaxed mb-4">{product.description}</p>
                                
                                <h6 className="fw-bold text-gradient mb-2">Key Specifications</h6>
                                <ul className="list-unstyled text-muted small">
                                    <li><i className="bi bi-check2-circle text-success me-2"></i> Brand: <span className="text-light">{product.brand || 'N/A'}</span></li>
                                    <li><i className="bi bi-check2-circle text-success me-2"></i> Category: <span className="text-light">{product.category?.name}</span></li>
                                    <li><i className="bi bi-check2-circle text-success me-2"></i> SKU Code: <span className="text-light">APX-{product.id}-PRD</span></li>
                                </ul>
                            </div>
                        ) : (
                            <div className="p-3">
                                {/* Write a Review Form */}
                                <div className="card card-dark p-3 mb-4 border-secondary">
                                    <h6 className="fw-bold text-light mb-3"><i className="bi bi-pencil-square me-2 text-primary"></i>Write a Customer Review</h6>
                                    {!user ? (
                                        <div className="text-muted small">
                                            Please <button className="btn btn-link p-0 text-primary" onClick={() => onOpenAuth('login')}>login</button> to post your review.
                                        </div>
                                    ) : (
                                        <form onSubmit={handleReviewSubmit}>
                                            <div className="mb-3">
                                                <label className="form-label text-muted small">Rating (1 to 5 Stars):</label>
                                                <div className="d-flex gap-2">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <i
                                                            key={star}
                                                            className={`bi ${star <= newRating ? 'bi-star-fill text-warning' : 'bi-star text-muted'} fs-4 cursor-pointer`}
                                                            onClick={() => setNewRating(star)}
                                                        ></i>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mb-2">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm bg-dark text-light border-secondary"
                                                    placeholder="Review Headline / Title"
                                                    value={newTitle}
                                                    onChange={(e) => setNewTitle(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <textarea
                                                    className="form-control form-control-sm bg-dark text-light border-secondary"
                                                    rows="3"
                                                    placeholder="Share details of your experience with this product..."
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    required
                                                ></textarea>
                                            </div>
                                            <button type="submit" className="btn btn-primary btn-sm rounded-pill px-4" disabled={submittingReview}>
                                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                        </form>
                                    )}
                                </div>

                                {/* Existing Reviews List */}
                                <div className="d-flex flex-column gap-3">
                                    {reviews.length === 0 ? (
                                        <div className="text-muted text-center py-3">No reviews yet for this product. Be the first to review!</div>
                                    ) : (
                                        reviews.map(rev => (
                                            <div key={rev.id} className="card card-dark p-3 border-secondary">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="fw-bold text-light">{rev.user?.name || 'Verified Buyer'}</div>
                                                    <div className="small text-muted">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recently'}</div>
                                                </div>
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <div className="d-flex gap-1 small">{renderStars(rev.rating)}</div>
                                                    <span className="fw-bold text-light small">{rev.title}</span>
                                                </div>
                                                <p className="small text-muted mb-0">{rev.comment}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Related Products Section */}
                        {relatedProducts.length > 0 && (
                            <div className="mt-5 pt-4 border-top border-secondary">
                                <h5 className="fw-bold text-gradient mb-3"><i className="bi bi-grid me-2"></i>You Might Also Like</h5>
                                <div className="row g-3">
                                    {relatedProducts.map(rel => (
                                        <div key={rel.id} className="col-md-3 col-6">
                                            <div className="card card-product p-2 cursor-pointer h-100" onClick={() => onProductClick(rel)}>
                                                <img src={rel.imageUrl} alt={rel.name} className="card-img-top rounded" style={{ height: '120px', objectFit: 'cover' }} />
                                                <div className="card-body p-2">
                                                    <div className="fw-semibold text-light small text-truncate">{rel.name}</div>
                                                    <div className="fw-bold text-success mt-1">${rel.price?.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
