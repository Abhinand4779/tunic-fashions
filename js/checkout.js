/**
 * HUE - Checkout Page Logic
 * Replaces Checkout.jsx logic
 */

const CheckoutHandler = {
    step: 1,
    couponCode: '',
    discount: 0,
    couponMessage: { text: '', type: '' },
    processing: false,
    shippingData: {
        firstName: '',
        lastName: '',
        email: (Auth.user?.email || Auth.admin?.email || ''),
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
    },

    init() {
        if (Auth.cart.length === 0) {
            window.location.href = 'cart.html';
            return;
        }
        this.render();
    },

    render() {
        const wrap = document.getElementById('checkout-page-wrap');
        if (!wrap) return;

        const subtotal = Auth.cart.reduce((acc, item) => {
            const price = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
            return acc + (price * item.quantity);
        }, 0);
        const total = subtotal - this.discount;

        wrap.innerHTML = `
            <div class="checkout-page">
                <div class="checkout-container">
                    <div class="checkout-header">
                        <h1>Checkout</h1>
                        <div class="checkout-steps">
                            <div class="step-item ${this.step >= 1 ? 'active' : ''}">
                                <span class="step-num">1</span>
                                <span class="step-label">Shipping</span>
                            </div>
                            <div class="step-line"></div>
                            <div class="step-item ${this.step >= 2 ? 'active' : ''}">
                                <span class="step-num">2</span>
                                <span class="step-label">Payment</span>
                            </div>
                        </div>
                    </div>

                    <div class="checkout-layout">
                        <!-- Left area -->
                        <div class="checkout-main">
                            ${this.step === 1 ? this.renderShippingForm() : this.renderPaymentArea()}
                        </div>

                        <!-- Right Area -->
                        <div class="checkout-sidebar">
                            <div class="summary-card">
                                <h3>Order Summary</h3>
                                <div class="summary-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString()}</span></div>
                                ${this.discount > 0 ? `<div class="summary-row discount"><span>Discount (15%)</span><span>-₹${this.discount.toLocaleString()}</span></div>` : ''}
                                <div class="summary-row"><span>Shipping</span><span class="free">FREE</span></div>
                                
                                <div class="coupon-section">
                                    <div class="coupon-input-group">
                                        <input type="text" placeholder="Coupon Code" value="${this.couponCode}" 
                                               oninput="CheckoutHandler.couponCode = this.value">
                                        <button type="button" onclick="CheckoutHandler.applyCoupon(${subtotal})">Apply</button>
                                    </div>
                                    ${this.couponMessage.text ? `<p class="coupon-msg ${this.couponMessage.type}">${this.couponMessage.text}</p>` : ''}
                                </div>

                                <div class="summary-divider"></div>
                                <div class="summary-row total"><span>Total</span><span>₹${total.toLocaleString()}</span></div>
                                <p class="gst-info">Inclusive of all taxes & GST</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    renderShippingForm() {
        return `
            <form class="shipping-form" onsubmit="CheckoutHandler.handleShippingSubmit(event)">
                <h3 class="section-title">Shipping Information</h3>
                <div class="form-row">
                    <div class="form-group"><label>First Name</label><input type="text" name="firstName" value="${this.shippingData.firstName}" oninput="CheckoutHandler.updateShip(this)" required></div>
                    <div class="form-group"><label>Last Name</label><input type="text" name="lastName" value="${this.shippingData.lastName}" oninput="CheckoutHandler.updateShip(this)" required></div>
                </div>
                <div class="form-group"><label>Email Address</label><input type="email" name="email" value="${this.shippingData.email}" oninput="CheckoutHandler.updateShip(this)" required></div>
                <div class="form-group"><label>Phone Number</label><input type="tel" name="phone" value="${this.shippingData.phone}" oninput="CheckoutHandler.updateShip(this)" required></div>
                <div class="form-group"><label>Street Address</label><input type="text" name="address" value="${this.shippingData.address}" oninput="CheckoutHandler.updateShip(this)" required></div>
                <div class="form-row">
                    <div class="form-group"><label>City</label><input type="text" name="city" value="${this.shippingData.city}" oninput="CheckoutHandler.updateShip(this)" required></div>
                    <div class="form-group"><label>State</label><input type="text" name="state" value="${this.shippingData.state}" oninput="CheckoutHandler.updateShip(this)" required></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>ZIP Code</label><input type="text" name="zipCode" value="${this.shippingData.zipCode}" oninput="CheckoutHandler.updateShip(this)" required></div>
                    <div class="form-group">
                        <label>Country</label>
                        <select name="country" onchange="CheckoutHandler.updateShip(this)">
                            <option value="India" ${this.shippingData.country === 'India' ? 'selected' : ''}>India</option>
                            <option value="USA" ${this.shippingData.country === 'USA' ? 'selected' : ''}>USA</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="proceed-btn">Continue to Payment</button>
            </form>`;
    },

    renderPaymentArea() {
        const subtotal = Auth.cart.reduce((acc, item) => (acc + (parseInt(item.price.replace(/[^\d]/g, '')) * item.quantity)), 0);
        const total = subtotal - this.discount;
        return `
            <div class="payment-ready">
                <h3 class="section-title">Billing & Payment</h3>
                <p>All items will be shipped to:</p>
                <div class="address-preview">
                    <p><strong>${this.shippingData.firstName} ${this.shippingData.lastName}</strong></p>
                    <p>${this.shippingData.address}</p>
                    <p>${this.shippingData.city}, ${this.shippingData.state} - ${this.shippingData.zipCode}</p>
                    <p>${this.shippingData.phone}</p>
                </div>
                <button onclick="CheckoutHandler.step = 1; CheckoutHandler.render();" class="edit-addr-btn">Edit Shipping Info</button>

                <div class="razorpay-placeholder">
                    <i class="bi bi-credit-card-2-front"></i>
                    <p>Secure payment via Razorpay</p>
                    <button onclick="CheckoutHandler.handlePayment(${total})" class="pay-now-btn" ${this.processing ? 'disabled' : ''}>
                        ${this.processing ? 'Connecting to Razorpay...' : 'Pay Now with Razorpay'}
                    </button>
                </div>
            </div>`;
    },

    updateShip(el) { this.shippingData[el.name] = el.value; },

    applyCoupon(subtotal) {
        if (this.couponCode.toUpperCase() === 'HUE15') {
            this.discount = subtotal * 0.15;
            this.couponMessage = { text: 'Coupon applied successfully! (15% OFF)', type: 'success' };
        } else if (!this.couponCode.trim()) {
            this.couponMessage = { text: 'Please enter a code', type: 'error' };
        } else {
            this.couponMessage = { text: 'Invalid coupon code', type: 'error' };
            this.discount = 0;
        }
        this.render();
    },

    handleShippingSubmit(e) {
        e.preventDefault();
        this.step = 2;
        this.render();
    },

    async handlePayment(total) {
        if (this.processing) return;
        this.processing = true;
        this.render();

        const res = await Auth.placeOrder(this.shippingData, total);
        if (res?.checkout_url) {
            window.location.href = res.checkout_url;
        } else if (res?._id || res?.id) {
            alert("Order placed successfully! (Test Mode)");
            window.location.href = 'index.html';
        } else {
            alert("Order failed. Please check your details.");
            this.processing = false;
            this.render();
        }
    }
};

CheckoutHandler.init();


window.addEventListener('currencyUpdated', () => CheckoutHandler.renderSummary());

