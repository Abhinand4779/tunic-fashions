/**
 * ASTRA - Cart Page Logic
 * Replaces Cart.jsx logic
 */

const CartHandler = {
    render() {
        const wrap = document.getElementById('cart-page-wrap');
        if (!wrap) return;

        if (Auth.cart.length === 0) {
            wrap.innerHTML = `
                <div class="cart-page-empty">
                    <div class="empty-cart-message">
                        <i class="bi bi-handbag"></i>
                        <h2>Your Shopping Bag is Empty</h2>
                        <p>Looks like you haven't added anything to your cart yet.</p>
                        <button onclick="window.location.href='shop.html'" class="start-shopping-btn">Start Shopping</button>
                        <a href="wishlist.html" class="wishlist-link-empty">View your Wishlist →</a>
                    </div>
                </div>`;
            return;
        }

        const subtotal = Auth.cart.reduce((acc, item) => {
            const price = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
            return acc + (price * item.quantity);
        }, 0);

        wrap.innerHTML = `
            <div class="cart-page">
                <div class="cart-container">
                    <div class="cart-top-bar">
                        <h1 class="cart-title">Your Bag (${Auth.cart.length} ${Auth.cart.length === 1 ? 'item' : 'items'})</h1>
                        <button class="clear-cart-btn" onclick="CartHandler.clearCart()">
                            <i class="bi bi-trash3 me-1"></i> Clear Bag
                        </button>
                    </div>

                    <div class="cart-layout">
                        <div class="cart-items-section">
                            ${Auth.cart.map(item => `
                                <div class="cart-item">
                                    <div class="cart-item-img">
                                        <img src="${item.images?.[0] || item.image}" alt="${item.name}">
                                    </div>
                                    <div class="cart-item-details">
                                        <div class="item-header">
                                            <h4>${item.name}</h4>
                                            <p class="item-price">${item.price}</p>
                                        </div>
                                        <p class="item-meta">Category: ${item.category}</p>

                                        <div class="item-actions">
                                            <div class="qty-controls">
                                                <button onclick="CartHandler.updateQty('${item._id || item.id}', -1)" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                                                <span>${item.quantity}</span>
                                                <button onclick="CartHandler.updateQty('${item._id || item.id}', 1)">+</button>
                                            </div>
                                            <button class="remove-item-btn" onclick="Auth.removeFromCart('${item._id || item.id}')">
                                                <i class="bi bi-trash3"></i> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="cart-summary-section">
                            <div class="summary-card">
                                <h3>Order Summary</h3>
                                <div class="summary-row">
                                    <span>Subtotal (${Auth.cart.reduce((a, i) => a + i.quantity, 0)} items)</span>
                                    <span>₹${subtotal.toLocaleString()}</span>
                                </div>
                                <div class="summary-row">
                                    <span>Shipping</span>
                                    <span class="free">FREE</span>
                                </div>
                                <div class="summary-divider"></div>
                                <div class="summary-row total">
                                    <span>Total (Incl. GST)</span>
                                    <span>₹${subtotal.toLocaleString()}</span>
                                </div>
                                <button onclick="window.location.href='checkout.html'" class="checkout-btn">Proceed to Checkout</button>
                                <a href="wishlist.html" class="view-wishlist-link">
                                    <i class="bi bi-heart me-1"></i> View Wishlist
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    updateQty(pid, diff) {
        const item = Auth.cart.find(i => (i._id || i.id) === pid);
        if (item) {
            Auth.addToCart(item, diff);
            this.render();
        }
    },

    clearCart() {
        if (window.confirm('Clear your entire bag?')) {
            Auth.clearCart();
            this.render();
        }
    }
};

window.addEventListener('cartUpdated', () => CartHandler.render());
window.addEventListener('siteDataLoaded', () => CartHandler.render());
if (!Site.loading) CartHandler.render();
else setTimeout(() => CartHandler.render(), 500); // Fallback
