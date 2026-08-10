import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { FALLBACK_PRODUCT_IMAGE, replaceBrokenImage } from '../utils/imageFallback';
import { AuthContext } from '../context/AuthContext';

const CartModal = ({ onClose, onProceedToCheckout, onOpenAuth }) => {
    const {
        activeItems,
        savedItems,
        subtotal,
        tax,
        shipping,
        total,
        updateQuantity,
        saveForLater,
        moveToCart,
        removeFromCart
    } = useContext(CartContext);

    const { user } = useContext(AuthContext);
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [promoApplied, setPromoApplied] = useState(false);

    const handleApplyPromo = (e) => {
        e.preventDefault();
        if (promoCode.trim().toUpperCase() === 'APEX10') {
            setDiscount(subtotal * 0.10);
            setPromoApplied(true);
        } else {
            alert('Invalid Promo Code. Try "APEX10" for 10% off!');
        }
    };

    const finalTotal = Math.max(0, total - discount);

    return (
        <div className="modal fade show d-block backdrop-blur" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-dark text-light border-secondary shadow-lg">
                    {/* Header */}
                    <div className="modal-header border-secondary px-4 py-3">
                        <h5 className="modal-title fw-bold text-gradient d-flex align-items-center gap-2">
                            <i className="bi bi-cart3 text-primary"></i> Shopping Cart & Saved Items
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body p-4">
                        {!user ? (
                            <div className="text-center py-5">
                                <i className="bi bi-person-lock fs-1 text-muted mb-3"></i>
                                <h5>Please Sign In to View Your Cart</h5>
                                <p className="text-muted small">Your saved items and cart history will sync across devices.</p>
                                <button className="btn btn-primary rounded-pill px-4 mt-2" onClick={() => { onClose(); onOpenAuth('login'); }}>
                                    Sign In Now
                                </button>
                            </div>
                        ) : activeItems.length === 0 && savedItems.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bi bi-cart-x fs-1 text-muted mb-3"></i>
                                <h5>Your Shopping Cart is Empty</h5>
                                <p className="text-muted small">Explore our products catalog and add items to your cart.</p>
                                <button className="btn btn-outline-primary rounded-pill px-4 mt-2" onClick={onClose}>
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {/* Left Side: Active Cart & Saved Items */}
                                <div className="col-lg-7">
                                    <h6 className="fw-bold text-light mb-3">
                                        Active Items ({activeItems.length})
                                    </h6>

                                    {activeItems.length === 0 ? (
                                        <div className="text-muted small p-3 card card-dark mb-4 text-center">No active items in cart.</div>
                                    ) : (
                                        <div className="d-flex flex-column gap-3 mb-4">
                                            {activeItems.map(item => (
                                                <div key={item.id} className="card card-dark p-3 border-secondary">
                                                    <div className="d-flex gap-3 align-items-center">
                                                        <img
                                                            src={item.product?.imageUrl || FALLBACK_PRODUCT_IMAGE}
                                                            onError={replaceBrokenImage}
                                                            alt={item.product?.name}
                                                            className="rounded object-fit-cover"
                                                            width="70"
                                                            height="70"
                                                        />
                                                        <div className="flex-grow-1 overflow-hidden">
                                                            <h6 className="fw-bold text-light text-truncate mb-1">{item.product?.name}</h6>
                                                            <div className="small text-muted mb-2">
                                                                {item.selectedSize && <span className="badge bg-secondary me-1">Size: {item.selectedSize}</span>}
                                                                {item.selectedColor && <span className="badge bg-secondary">Color: {item.selectedColor}</span>}
                                                            </div>
                                                            <div className="fw-bold text-success">${item.product?.price?.toFixed(2)}</div>
                                                        </div>

                                                        {/* Quantity & Action Controls */}
                                                        <div className="d-flex flex-column align-items-end gap-2">
                                                            <div className="input-group input-group-sm" style={{ width: '100px' }}>
                                                                <button className="btn btn-outline-secondary" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                                                <input type="text" className="form-control text-center bg-dark text-light border-secondary p-0" value={item.quantity} readOnly />
                                                                <button className="btn btn-outline-secondary" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                                            </div>

                                                            <div className="d-flex gap-2">
                                                                <button className="btn btn-sm btn-link text-info text-decoration-none p-0 small" onClick={() => saveForLater(item.id)}>
                                                                    <i className="bi bi-bookmark me-1"></i> Save for later
                                                                </button>
                                                                <button className="btn btn-sm btn-link text-danger text-decoration-none p-0 small" onClick={() => removeFromCart(item.id)}>
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Saved For Later Section */}
                                    {savedItems.length > 0 && (
                                        <div className="mt-4 pt-3 border-top border-secondary">
                                            <h6 className="fw-bold text-info mb-3">
                                                <i className="bi bi-bookmark-fill me-1"></i> Saved For Later ({savedItems.length})
                                            </h6>
                                            <div className="d-flex flex-column gap-2">
                                                {savedItems.map(item => (
                                                    <div key={item.id} className="card card-dark p-2 border-secondary d-flex flex-row align-items-center justify-content-between">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <img src={item.product?.imageUrl || FALLBACK_PRODUCT_IMAGE} onError={replaceBrokenImage} alt={item.product?.name} className="rounded" width="40" height="40" style={{ objectFit: 'cover' }} />
                                                            <div>
                                                                <div className="small text-light fw-semibold text-truncate" style={{ maxWidth: '180px' }}>{item.product?.name}</div>
                                                                <div className="small text-success">${item.product?.price?.toFixed(2)}</div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex gap-2">
                                                            <button className="btn btn-sm btn-outline-primary" onClick={() => moveToCart(item.id)}>
                                                                Move to Cart
                                                            </button>
                                                            <button className="btn btn-sm btn-link text-danger" onClick={() => removeFromCart(item.id)}>
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Financial Summary */}
                                <div className="col-lg-5">
                                    <div className="card card-dark p-3 border-secondary">
                                        <h6 className="fw-bold text-light mb-3">Order Price Summary</h6>

                                        <div className="d-flex justify-content-between small text-muted mb-2">
                                            <span>Subtotal ({activeItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                                            <span className="text-light">${subtotal.toFixed(2)}</span>
                                        </div>

                                        <div className="d-flex justify-content-between small text-muted mb-2">
                                            <span>Estimated Tax (8%)</span>
                                            <span className="text-light">${tax.toFixed(2)}</span>
                                        </div>

                                        <div className="d-flex justify-content-between small text-muted mb-2">
                                            <span>Shipping Fee</span>
                                            <span className="text-light">
                                                {shipping === 0 ? <span className="text-success fw-bold">FREE (Orders &gt; $50)</span> : `$${shipping.toFixed(2)}`}
                                            </span>
                                        </div>

                                        {promoApplied && (
                                            <div className="d-flex justify-content-between small text-success mb-2">
                                                <span>Promo Discount (APEX10)</span>
                                                <span>-${discount.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <hr className="border-secondary" />

                                        <div className="d-flex justify-content-between fw-bold fs-5 text-light mb-4">
                                            <span>Total Amount</span>
                                            <span className="text-success">${finalTotal.toFixed(2)}</span>
                                        </div>

                                        {/* Promo Code Input */}
                                        <form onSubmit={handleApplyPromo} className="mb-3">
                                            <div className="input-group input-group-sm">
                                                <input
                                                    type="text"
                                                    className="form-control bg-dark text-light border-secondary"
                                                    placeholder="Promo Code (e.g. APEX10)"
                                                    value={promoCode}
                                                    onChange={(e) => setPromoCode(e.target.value)}
                                                />
                                                <button className="btn btn-outline-secondary" type="submit">Apply</button>
                                            </div>
                                        </form>

                                        <button
                                            className="btn btn-gradient-primary w-100 py-2 fw-semibold rounded-pill"
                                            disabled={activeItems.length === 0}
                                            onClick={() => {
                                                onClose();
                                                onProceedToCheckout(finalTotal);
                                            }}
                                        >
                                            Proceed to Checkout <i className="bi bi-arrow-right ms-1"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartModal;
