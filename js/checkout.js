/**
 * TUNIC FASHIONS - Checkout Page Logic
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
    couponMessage: { text: '', type: '' },
    shippingRates: [],
    selectedShippingRate: 0,

    init() {
        if (!Auth.cart || Auth.cart.length === 0) {
            window.location.href = 'index.html';
            return;
        }
        this.fetchShippingRates();
    },

    async fetchShippingRates() {
        try {
            const res = await fetch(`${API_BASE_URL}/shipping`);
            if (res.ok) {
                this.shippingRates = await res.json();
                if (this.shippingRates.length > 0) {
                    // Set default country to the first rate available if current is empty
                    if (!this.shippingData.country) {
                        this.shippingData.country = this.shippingRates[0].country;
                    }
                    this.updateShippingCost();
                }
            }
        } catch(e) {}
        this.render();
    },

    updateShippingCost() {
        const rateObj = this.shippingRates.find(r => r.country === this.shippingData.country);
        this.selectedShippingRate = rateObj ? parseFloat(rateObj.rate) : 0;
        this.render();
    },

    render() {
        const wrap = document.getElementById('checkout-page-wrap');
        if (!wrap) return;

        const subtotal = Auth.cart.reduce((acc, item) => {
            const price = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
            return acc + (price * item.quantity);
        }, 0);
        let total = subtotal - this.discount + this.selectedShippingRate;
        // Fix for negative totals
        if (total < 0) total = 0;

        const shippingDisplay = this.selectedShippingRate > 0 ? `$${this.selectedShippingRate.toFixed(2)}` : 'FREE';

        wrap.innerHTML = `
            <div class="checkout-wrapper">
                <div class="checkout-header">
                    <h2>Checkout</h2>
                    <p>Complete your purchase securely</p>
                </div>
                
                <div class="checkout-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.step === 1 ? '50%' : '100%'}"></div>
                        <div class="step-nodes">
                            <div class="step-item active">
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
                                <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toLocaleString()}</span></div>
                                ${this.discount > 0 ? `<div class="summary-row discount"><span>Discount</span><span>-$${this.discount.toLocaleString()}</span></div>` : ''}
                                <div class="summary-row"><span>Shipping</span><span class="${this.selectedShippingRate === 0 ? 'free' : ''}">${shippingDisplay}</span></div>
                                
                                <div class="coupon-section">
                                    <div class="coupon-input-group">
                                        <input type="text" placeholder="Coupon Code" value="${this.couponCode}" 
                                               oninput="CheckoutHandler.couponCode = this.value">
                                        <button type="button" onclick="CheckoutHandler.applyCoupon(${subtotal})">Apply</button>
                                    </div>
                                    ${this.couponMessage.text ? `<p class="coupon-msg ${this.couponMessage.type}">${this.couponMessage.text}</p>` : ''}
                                </div>

                                <div class="summary-divider"></div>
                                <div class="summary-row total"><span>Total</span><span>$${total.toLocaleString()}</span></div></div>
                                <p class="gst-info">Inclusive of all taxes & GST</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    renderShippingForm() {
        const ALL_COUNTRIES = [
            "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","CÃ´te d'Ivoire","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Holy See","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine State","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
        ];

        let countryOptions = ALL_COUNTRIES.map(c => `<option value="${c}" ${this.shippingData.country === c ? 'selected' : ''}>${c}</option>`).join('');

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
                        <select name="country" onchange="CheckoutHandler.updateShip(this); CheckoutHandler.updateShippingCost();">
                            ${countryOptions}
                        </select>
                    </div>
                </div>
                <button type="submit" class="proceed-btn">Continue to Payment</button>
            </form>`;
    },

    renderPaymentArea() {
        const subtotal = Auth.cart.reduce((acc, item) => (acc + (parseFloat(item.price.toString().replace(/[^\d.]/g, '')) * item.quantity)), 0);
        let total = subtotal - this.discount + this.selectedShippingRate;
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
        if (this.couponCode.toUpperCase() === 'TUNIC FASHIONS15') {
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

