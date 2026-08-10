import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';

const WishlistModal = ({ onClose, onProductClick }) => {
    const { wishlist, toggleWishlist } = useContext(WishlistContext);
    const products = wishlist?.products || [];

    return (
        <div className="modal fade show d-block backdrop-blur" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-dark text-light border-secondary shadow-lg">
                    <div className="modal-header border-secondary">
                        <h5 className="modal-title fw-bold"><i className="bi bi-heart-fill text-danger me-2"></i>My Wishlist</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        {products.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="bi bi-heart fs-1 d-block mb-3"></i>
                                <h6 className="text-light">Your wishlist is empty</h6>
                                <p className="mb-0">Tap the heart on a product to save it for later.</p>
                            </div>
                        ) : (
                            <div className="row g-3">
                                {products.map(product => (
                                    <div className="col-md-6" key={product.id}>
                                        <div className="card card-dark h-100 p-2 d-flex flex-row gap-3 align-items-center">
                                            <img src={product.imageUrl || product.images?.[0]} alt={product.name} className="rounded" width="82" height="82" style={{ objectFit: 'cover' }} />
                                            <div className="flex-grow-1 overflow-hidden">
                                                <button className="btn btn-link p-0 text-start text-light fw-semibold text-decoration-none text-truncate w-100" onClick={() => onProductClick(product)}>{product.name}</button>
                                                <div className="small text-muted">{product.brand}</div>
                                                <div className="fw-bold text-success mt-1">${Number(product.price || product.basePriceCents / 100 || 0).toFixed(2)}</div>
                                            </div>
                                            <button className="btn btn-outline-danger btn-sm" title="Remove from wishlist" onClick={() => toggleWishlist(product.id)}><i className="bi bi-trash"></i></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WishlistModal;
