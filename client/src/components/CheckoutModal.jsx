import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const CheckoutModal = ({ onClose, finalTotalAmount, onOrderCompleted }) => {
    const { user, addresses, addAddress, fetchAddresses } = useContext(AuthContext);
    const { activeItems, clearCart, fetchCart } = useContext(CartContext);

    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation, 4: Success

    // Step 1: Shipping State
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        fullName: user?.name || '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
    });

    // Step 2: Payment Gateway State
    const [paymentMethod, setPaymentMethod] = useState('Stripe');
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '4242 •••• •••• 4242',
        cardHolder: user?.name || 'John Doe',
        expiry: '12/28',
        cvv: '123'
    });
    const [upiId, setUpiId] = useState('user@okaxis');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Step 4: Placed Order State
    const [placedOrder, setPlacedOrder] = useState(null);

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    useEffect(() => {
        if (addresses && addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0].id);
        }
    }, [addresses]);

    const handleSaveNewAddress = async (e) => {
        e.preventDefault();
        try {
            const added = await addAddress(newAddress);
            setSelectedAddressId(added.id);
            setShowNewAddressForm(false);
        } catch (err) {
            console.error('Error adding address:', err);
            alert('Failed to save address.');
        }
    };

    const getSelectedAddressFormatted = () => {
        if (showNewAddressForm || addresses.length === 0) {
            return `${newAddress.fullName}, ${newAddress.street}, ${newAddress.city}, ${newAddress.state} ${newAddress.zipCode}, ${newAddress.country}`;
        }
        const found = addresses.find(a => a.id == selectedAddressId);
        if (!found) return 'Default Shipping Address';
        return `${found.fullName}, ${found.street}, ${found.city}, ${found.state} ${found.zipCode}, ${found.country}`;
    };

    const handleProcessOrder = async () => {
        setIsProcessingPayment(true);
        try {
            // 1. Process payment gateway intent
            const payRes = await axios.post(`${API_BASE_URL}/api/payments/process`, {
                method: paymentMethod,
                amount: finalTotalAmount
            });

            if (payRes.data.status === 'SUCCESS') {
                // 2. Submit order to backend
                const orderRes = await axios.post(`${API_BASE_URL}/api/orders/checkout`, {
                    shippingAddress: getSelectedAddressFormatted(),
                    paymentMethod: paymentMethod
                });

                setPlacedOrder(orderRes.data);
                setStep(4);
                fetchCart();
            }
        } catch (err) {
            console.error('Checkout error:', err);
            alert('Checkout failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsProcessingPayment(false);
        }
    };

    return (
        <div className="modal fade show d-block backdrop-blur" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-dark text-light border-secondary shadow-lg">
                    {/* Header */}
                    <div className="modal-header border-secondary px-4 py-3">
                        <h5 className="modal-title fw-bold text-gradient">
                            <i className="bi bi-shield-check me-2 text-success"></i> Secure Checkout
                        </h5>
                        {step !== 4 && <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>}
                    </div>

                    {/* Stepper Navigation */}
                    {step !== 4 && (
                        <div className="px-4 py-3 bg-dark-subtle border-bottom border-secondary">
                            <div className="d-flex justify-content-between text-center position-relative">
                                <div className={`flex-grow-1 ${step >= 1 ? 'text-primary fw-bold' : 'text-muted'}`}>
                                    <div className={`rounded-circle mx-auto mb-1 d-flex align-items-center justify-content-center ${step >= 1 ? 'bg-primary text-white' : 'bg-secondary text-dark'}`} style={{ width: '30px', height: '30px' }}>1</div>
                                    <span className="small">1. Shipping</span>
                                </div>
                                <div className={`flex-grow-1 ${step >= 2 ? 'text-primary fw-bold' : 'text-muted'}`}>
                                    <div className={`rounded-circle mx-auto mb-1 d-flex align-items-center justify-content-center ${step >= 2 ? 'bg-primary text-white' : 'bg-secondary text-dark'}`} style={{ width: '30px', height: '30px' }}>2</div>
                                    <span className="small">2. Payment</span>
                                </div>
                                <div className={`flex-grow-1 ${step >= 3 ? 'text-primary fw-bold' : 'text-muted'}`}>
                                    <div className={`rounded-circle mx-auto mb-1 d-flex align-items-center justify-content-center ${step >= 3 ? 'bg-primary text-white' : 'bg-secondary text-dark'}`} style={{ width: '30px', height: '30px' }}>3</div>
                                    <span className="small">3. Confirmation</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Body */}
                    <div className="modal-body p-4">
                        {/* STEP 1: Shipping Address Selection */}
                        {step === 1 && (
                            <div>
                                <h6 className="fw-bold text-light mb-3"><i className="bi bi-geo-alt me-2 text-primary"></i>Select Shipping Address</h6>
                                
                                {addresses.length > 0 && !showNewAddressForm && (
                                    <div className="d-flex flex-column gap-3 mb-3">
                                        {addresses.map(addr => (
                                            <div
                                                key={addr.id}
                                                className={`card card-dark p-3 border cursor-pointer ${selectedAddressId == addr.id ? 'border-primary bg-primary-subtle bg-opacity-10' : 'border-secondary'}`}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                            >
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="addressRadio"
                                                        checked={selectedAddressId == addr.id}
                                                        onChange={() => setSelectedAddressId(addr.id)}
                                                    />
                                                    <label className="form-check-label text-light fw-semibold ms-2">
                                                        {addr.fullName} <span className="small text-muted">({addr.phone})</span>
                                                    </label>
                                                    <div className="small text-muted mt-1 ms-4">
                                                        {addr.street}, {addr.city}, {addr.state} {addr.zipCode}, {addr.country}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!showNewAddressForm && (
                                    <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => setShowNewAddressForm(true)}>
                                        <i className="bi bi-plus-lg me-1"></i> Add New Address
                                    </button>
                                )}

                                {(showNewAddressForm || addresses.length === 0) && (
                                    <form onSubmit={handleSaveNewAddress} className="card card-dark p-3 border-secondary mb-3">
                                        <h6 className="fw-bold text-light mb-3">Enter Delivery Address Details</h6>
                                        <div className="row g-2">
                                            <div className="col-md-6 mb-2">
                                                <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" placeholder="Full Name" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} required />
                                            </div>
                                            <div className="col-md-6 mb-2">
                                                <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" placeholder="Phone Number" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} required />
                                            </div>
                                            <div className="col-12 mb-2">
                                                <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" placeholder="Street Address" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} required />
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} required />
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} required />
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" placeholder="Zip Code" value={newAddress.zipCode} onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })} required />
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2 justify-content-end mt-2">
                                            {addresses.length > 0 && <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowNewAddressForm(false)}>Cancel</button>}
                                            <button type="submit" className="btn btn-sm btn-primary">Save & Use Address</button>
                                        </div>
                                    </form>
                                )}

                                <div className="d-flex justify-content-end mt-4">
                                    <button
                                        className="btn btn-primary rounded-pill px-4"
                                        disabled={!selectedAddressId && !showNewAddressForm}
                                        onClick={() => setStep(2)}
                                    >
                                        Continue to Payment <i className="bi bi-arrow-right ms-1"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Payment Gateway Selection */}
                        {step === 2 && (
                            <div>
                                <h6 className="fw-bold text-light mb-3"><i className="bi bi-credit-card me-2 text-primary"></i>Choose Payment Gateway</h6>

                                <div className="row g-3 mb-4">
                                    {['Stripe', 'PayPal', 'Razorpay'].map(gw => (
                                        <div key={gw} className="col-md-4">
                                            <div
                                                className={`card card-dark p-3 text-center cursor-pointer border ${paymentMethod === gw ? 'border-primary bg-primary-subtle bg-opacity-10' : 'border-secondary'}`}
                                                onClick={() => setPaymentMethod(gw)}
                                            >
                                                <i className={`bi ${gw === 'Stripe' ? 'bi-credit-card-2-front' : gw === 'PayPal' ? 'bi-paypal' : 'bi-qr-code-scan'} fs-2 text-primary mb-2`}></i>
                                                <div className="fw-bold text-light">{gw}</div>
                                                <span className="small text-muted">{gw === 'Stripe' ? 'Credit / Debit Card' : gw === 'PayPal' ? 'PayPal Wallet' : 'UPI / NetBanking'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Form for chosen payment method */}
                                {paymentMethod === 'Stripe' && (
                                    <div className="card card-dark p-3 border-secondary mb-4">
                                        <h6 className="small text-muted fw-bold mb-3">Stripe Card Details</h6>
                                        <div className="mb-2">
                                            <label className="form-label small text-muted">Card Number</label>
                                            <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" value={cardDetails.cardNumber} onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })} />
                                        </div>
                                        <div className="row g-2">
                                            <div className="col-6">
                                                <label className="form-label small text-muted">Expiry (MM/YY)</label>
                                                <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label small text-muted">CVV</label>
                                                <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" value={cardDetails.cvv} onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'PayPal' && (
                                    <div className="card card-dark p-3 border-secondary mb-4 text-center">
                                        <i className="bi bi-paypal text-primary fs-1 mb-2"></i>
                                        <p className="small text-muted">You will be redirected to PayPal sandbox express checkout to authenticate payment.</p>
                                    </div>
                                )}

                                {paymentMethod === 'Razorpay' && (
                                    <div className="card card-dark p-3 border-secondary mb-4">
                                        <h6 className="small text-muted fw-bold mb-2">Razorpay UPI ID / Virtual Payment Address</h6>
                                        <input type="text" className="form-control form-control-sm bg-dark text-light border-secondary" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                                    </div>
                                )}

                                <div className="d-flex justify-content-between mt-4">
                                    <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setStep(1)}>
                                        <i className="bi bi-arrow-left me-1"></i> Back
                                    </button>
                                    <button className="btn btn-primary rounded-pill px-4" onClick={() => setStep(3)}>
                                        Review Order <i className="bi bi-arrow-right ms-1"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Order Summary Review */}
                        {step === 3 && (
                            <div>
                                <h6 className="fw-bold text-light mb-3"><i className="bi bi-receipt me-2 text-primary"></i>Order Review & Submit</h6>

                                <div className="card card-dark p-3 border-secondary mb-3">
                                    <h6 className="small text-muted fw-bold mb-2">Shipping To:</h6>
                                    <div className="small text-light">{getSelectedAddressFormatted()}</div>
                                </div>

                                <div className="card card-dark p-3 border-secondary mb-3">
                                    <h6 className="small text-muted fw-bold mb-2">Payment via:</h6>
                                    <div className="small text-light d-flex align-items-center gap-2">
                                        <span className="badge bg-primary">{paymentMethod}</span>
                                        <span>Status: Ready for Authorization</span>
                                    </div>
                                </div>

                                <div className="card card-dark p-3 border-secondary mb-4">
                                    <h6 className="small text-muted fw-bold mb-3">Items Summary ({activeItems.length})</h6>
                                    <div className="d-flex flex-column gap-2 mb-3">
                                        {activeItems.map(item => (
                                            <div key={item.id} className="d-flex justify-content-between align-items-center small text-muted">
                                                <span className="text-light">{item.quantity}x {item.product?.name}</span>
                                                <span>${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <hr className="border-secondary my-2" />
                                    <div className="d-flex justify-content-between fw-bold text-light fs-5 mt-2">
                                        <span>Total Amount Due</span>
                                        <span className="text-success">${finalTotalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between mt-4">
                                    <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setStep(2)}>
                                        <i className="bi bi-arrow-left me-1"></i> Back
                                    </button>
                                    <button
                                        className="btn btn-gradient-primary rounded-pill px-5 py-2 fw-semibold fs-5"
                                        disabled={isProcessingPayment}
                                        onClick={handleProcessOrder}
                                    >
                                        {isProcessingPayment ? (
                                            <span><span className="spinner-border spinner-border-sm me-2"></span> Processing Payment...</span>
                                        ) : (
                                            <span>Place Order <i className="bi bi-check-lg ms-1"></i></span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Success Screen */}
                        {step === 4 && placedOrder && (
                            <div className="text-center py-4">
                                <div className="rounded-circle bg-success bg-opacity-25 p-3 d-inline-block mb-3">
                                    <i className="bi bi-check-circle-fill text-success fs-1"></i>
                                </div>
                                <h3 className="fw-bold text-light mb-2">Order Confirmed!</h3>
                                <p className="text-muted">Thank you for your purchase. Your order has been placed successfully.</p>

                                <div className="card card-dark p-3 border-secondary my-4 text-start mx-auto" style={{ maxWidth: '500px' }}>
                                    <div className="d-flex justify-content-between small text-muted mb-2">
                                        <span>Order Number:</span>
                                        <span className="fw-bold text-light">#ORD-{placedOrder.id}</span>
                                    </div>
                                    <div className="d-flex justify-content-between small text-muted mb-2">
                                        <span>Total Paid:</span>
                                        <span className="fw-bold text-success">${placedOrder.totalAmount?.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between small text-muted mb-2">
                                        <span>Payment Gateway:</span>
                                        <span className="badge bg-secondary">{placedOrder.paymentMethod}</span>
                                    </div>
                                    <div className="d-flex justify-content-between small text-muted">
                                        <span>Delivery Status:</span>
                                        <span className="badge bg-success">{placedOrder.status}</span>
                                    </div>
                                </div>

                                <button className="btn btn-primary rounded-pill px-5 py-2" onClick={onClose}>
                                    Continue Shopping
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
