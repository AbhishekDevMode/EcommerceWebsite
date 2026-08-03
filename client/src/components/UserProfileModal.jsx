import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const UserProfileModal = ({ initialTab = 'info', onClose }) => {
    const { user, addresses, updateProfile, addAddress, deleteAddress, logout } = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState(initialTab); // 'info' | 'orders' | 'addresses'

    // Profile form state
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [updating, setUpdating] = useState(false);
    const [msg, setMsg] = useState('');

    // Address form state
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddr, setNewAddr] = useState({
        fullName: user?.name || '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
    });

    // Orders state
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    useEffect(() => {
        if (activeTab === 'orders') {
            setLoadingOrders(true);
            axios.get(`${API_BASE_URL}/api/orders/history`)
                .then(res => setOrders(res.data || []))
                .catch(err => console.error('Error fetching order history:', err))
                .finally(() => setLoadingOrders(false));
        }
    }, [activeTab]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMsg('');
        try {
            await updateProfile({ name, phone });
            setMsg('Profile updated successfully!');
        } catch (err) {
            console.error('Update profile error:', err);
            setMsg('Failed to update profile.');
        } finally {
            setUpdating(false);
        }
    };

    const handleAddAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            await addAddress(newAddr);
            setShowAddAddress(false);
            setNewAddr({ fullName: user?.name || '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'United States' });
        } catch (err) {
            console.error('Add address error:', err);
        }
    };

    return (
        <div className="modal fade show d-block backdrop-blur" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-dark text-light border-secondary shadow-lg">
                    {/* Header */}
                    <div className="modal-header border-secondary px-4 py-3">
                        <h5 className="modal-title fw-bold text-gradient d-flex align-items-center gap-2">
                            <i className="bi bi-person-badge text-primary"></i> Account Dashboard
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="px-4 pt-3 bg-dark-subtle border-bottom border-secondary">
                        <ul className="nav nav-tabs border-0">
                            <li className="nav-item">
                                <button
                                    className={`nav-link bg-transparent text-light border-0 ${activeTab === 'info' ? 'border-bottom border-primary border-3 fw-bold text-primary active' : ''}`}
                                    onClick={() => setActiveTab('info')}
                                >
                                    <i className="bi bi-person-circle me-1"></i> Profile Info
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link bg-transparent text-light border-0 ${activeTab === 'orders' ? 'border-bottom border-primary border-3 fw-bold text-primary active' : ''}`}
                                    onClick={() => setActiveTab('orders')}
                                >
                                    <i className="bi bi-box-seam me-1"></i> Order History
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link bg-transparent text-light border-0 ${activeTab === 'addresses' ? 'border-bottom border-primary border-3 fw-bold text-primary active' : ''}`}
                                    onClick={() => setActiveTab('addresses')}
                                >
                                    <i className="bi bi-geo-alt me-1"></i> Saved Addresses ({addresses.length})
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Body */}
                    <div className="modal-body p-4">
                        {/* TAB 1: Profile Info */}
                        {activeTab === 'info' && (
                            <form onSubmit={handleUpdateProfile} style={{ maxWidth: '500px' }}>
                                {msg && <div className="alert alert-info py-2 small mb-3">{msg}</div>}

                                <div className="mb-3">
                                    <label className="form-label small text-muted">Email Address (Read-only)</label>
                                    <input type="email" className="form-control bg-dark-subtle text-muted border-secondary" value={user?.email || ''} readOnly />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Full Name</label>
                                    <input type="text" className="form-control bg-dark text-light border-secondary" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small text-muted">Phone Number</label>
                                    <input type="text" className="form-control bg-dark text-light border-secondary" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </div>

                                <div className="d-flex justify-content-between align-items-center">
                                    <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={updating}>
                                        {updating ? 'Saving...' : 'Save Profile Changes'}
                                    </button>
                                    <button type="button" className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => { onClose(); logout(); }}>
                                        Sign Out
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* TAB 2: Order History */}
                        {activeTab === 'orders' && (
                            <div>
                                {loadingOrders ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <div className="small text-muted mt-2">Loading order history...</div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-4">
                                        <i className="bi bi-box2 fs-1 text-muted mb-2"></i>
                                        <h6>No Past Orders Found</h6>
                                        <p className="small text-muted">When you place orders, they will show up here.</p>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {orders.map(order => (
                                            <div key={order.id} className="card card-dark p-3 border-secondary">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div>
                                                        <span className="fw-bold text-light me-2">#ORD-{order.id}</span>
                                                        <span className="badge bg-success">{order.status || 'CONFIRMED'}</span>
                                                    </div>
                                                    <div className="small text-muted">
                                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                                                    </div>
                                                </div>

                                                <div className="small text-muted mb-2">
                                                    <i className="bi bi-geo-alt me-1"></i> {order.shippingAddress}
                                                </div>

                                                <div className="bg-dark p-2 rounded mb-2">
                                                    {order.items?.map(item => (
                                                        <div key={item.id} className="d-flex justify-content-between small text-muted">
                                                            <span className="text-light">{item.quantity}x {item.product?.name}</span>
                                                            <span>${((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="small text-muted">Payment: <span className="text-light">{order.paymentMethod || 'Stripe'}</span></span>
                                                    <span className="fw-bold text-success fs-5">${order.totalAmount?.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: Saved Addresses */}
                        {activeTab === 'addresses' && (
                            <div>
                                {!showAddAddress && (
                                    <button className="btn btn-outline-primary btn-sm rounded-pill mb-3" onClick={() => setShowAddAddress(true)}>
                                        <i className="bi bi-plus-lg me-1"></i> Add New Address
                                    </button>
                                )}

                                {showAddAddress && (
                                    <form onSubmit={handleAddAddressSubmit} className="card card-dark p-3 border-secondary mb-4">
                                        <h6 className="fw-bold text-light mb-3">Add New Shipping Address</h6>
                                        <div className="row g-2">
                                            <div className="col-md-6 mb-2">
                                                <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" placeholder="Full Name" value={newAddr.fullName} onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })} required />
                                            </div>
                                            <div className="col-md-6 mb-2">
                                                <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" placeholder="Phone Number" value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} required />
                                            </div>
                                            <div className="col-12 mb-2">
                                                <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" placeholder="Street Address" value={newAddr.street} onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })} required />
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" placeholder="City" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} required />
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" placeholder="State" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} required />
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" placeholder="Zip Code" value={newAddr.zipCode} onChange={(e) => setNewAddr({ ...newAddr, zipCode: e.target.value })} required />
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2 justify-content-end mt-2">
                                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowAddAddress(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-sm btn-primary">Save Address</button>
                                        </div>
                                    </form>
                                )}

                                <div className="d-flex flex-column gap-3">
                                    {addresses.length === 0 ? (
                                        <div className="text-muted small text-center py-3">No saved addresses yet.</div>
                                    ) : (
                                        addresses.map(addr => (
                                            <div key={addr.id} className="card card-dark p-3 border-secondary d-flex flex-row justify-content-between align-items-center">
                                                <div>
                                                    <div className="fw-bold text-light">{addr.fullName} <span className="small text-muted">({addr.phone})</span></div>
                                                    <div className="small text-muted mt-1">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}, {addr.country}</div>
                                                </div>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteAddress(addr.id)}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
