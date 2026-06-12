/**
 * HUE - Authentication and State Management
 * Replaces AuthContext.jsx logic
 */

const Auth = {
    user: JSON.parse(localStorage.getItem('astra_user')) || null,
    admin: JSON.parse(localStorage.getItem('astra_admin')) || null,
    cart: JSON.parse(localStorage.getItem('astra_cart')) || [],
    wishlist: JSON.parse(localStorage.getItem('astra_wishlist')) || [],
    userOrders: [],
    adminOrders: [],
    customers: [],

    // Sync admin-only data (Orders and Customers list)
    async syncAdminData() {
        const token = localStorage.getItem('adminToken');
        if (!token || token === 'null' || token === 'undefined') return;

        try {
            const [ordRes, custRes] = await Promise.all([
                fetch(`${API_BASE_URL}/orders/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/auth/all`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (ordRes.status === 401) {
                this.logout();
                return;
            }

            if (ordRes.ok) this.adminOrders = await ordRes.json();
            if (custRes.ok) this.customers = await custRes.json();

            window.dispatchEvent(new CustomEvent('adminDataSynced'));
        } catch (err) {
            console.error("Sync Admin Data Failed", err);
        }
    },

    // Sync user-specific orders
    async syncUserOrders() {
        const token = localStorage.getItem('astra_token');
        if (!token || token === 'null' || token === 'undefined') return;

        try {
            const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                this.userOrders = data;
                window.dispatchEvent(new CustomEvent('userOrdersUpdated'));
            }
        } catch (err) {
            console.error("Sync User Orders Failed", err);
        }
    },

    login(userData, token) {
        this.user = { ...userData, token };
        localStorage.setItem('astra_user', JSON.stringify(this.user));
        if (token) {
            localStorage.setItem('astra_token', token);
            this.syncUserOrders();
        }
        window.dispatchEvent(new CustomEvent('authChanged'));
    },

    adminLogin(adminData, token) {
        this.admin = { ...adminData, token };
        localStorage.setItem('astra_admin', JSON.stringify(this.admin));
        if (token) {
            localStorage.setItem('adminToken', token);
            this.syncAdminData();
        }
        window.dispatchEvent(new CustomEvent('adminAuthChanged'));
    },

    logout() {
        this.user = null;
        this.admin = null;
        this.cart = [];
        this.wishlist = [];
        this.userOrders = [];
        this.adminOrders = [];
        this.customers = [];

        localStorage.clear(); // Safe for this app as all app keys start fresh
        window.location.href = 'index.html';
    },

    // Quota Protection: Strip heavy data before saving to localStorage
    slimProduct(product) {
        return {
            _id: product._id,
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            category: product.category,
            section: product.section,
            images: product.images ? [product.images[0]] : [],
            image: product.image || (product.images && product.images[0]) || null,
            quantity: product.quantity
        };
    },

    saveCart() {
        try {
            const slimCart = this.cart.map(item => this.slimProduct(item));
            localStorage.setItem('astra_cart', JSON.stringify(slimCart));
        } catch (e) {
            console.warn('Cart quota exceeded', e);
        }
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    },

    addToCart(product, quantity) {
        const pId = product._id || product.id;
        const existing = this.cart.find(item => (item._id || item.id) === pId);

        if (existing) {
            existing.quantity = Math.max(1, existing.quantity + quantity);
        } else {
            this.cart.push({ ...product, quantity });
        }
        this.saveCart();
    },

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => (item._id || item.id) !== productId);
        this.saveCart();
    },

    clearCart() {
        this.cart = [];
        this.saveCart();
    },

    toggleWishlist(product) {
        const pId = product._id || product.id;
        const exists = this.wishlist.some(item => (item._id || item.id) === pId);

        if (exists) {
            this.wishlist = this.wishlist.filter(item => (item._id || item.id) !== pId);
        } else {
            this.wishlist.push(this.slimProduct(product));
        }

        try {
            localStorage.setItem('astra_wishlist', JSON.stringify(this.wishlist));
        } catch (e) {
            console.warn('Wishlist quota exceeded', e);
        }
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    },

    isInWishlist(productId) {
        return this.wishlist.some(item => (item._id || item.id) === productId);
    },

    async placeOrder(shippingInfo, totalAmount = null) {
        const subtotal = this.cart.reduce((acc, item) => {
            const price = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
            return acc + (price * item.quantity);
        }, 0);
        const finalTotal = totalAmount || subtotal;

        const orderData = {
            items: this.cart.map(item => ({
                product_id: (item._id || item.id).toString(),
                quantity: item.quantity
            })),
            customer_name: shippingInfo.firstName + ' ' + shippingInfo.lastName,
            customer_email: shippingInfo.email || (this.user ? this.user.email : 'guest@example.com'),
            shipping_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`,
            phone: shippingInfo.phone,
            total_amount: finalTotal,
            status: 'Processing'
        };

        try {
            const rawToken = localStorage.getItem('astra_token');
            const token = (rawToken && rawToken !== 'null' && rawToken !== 'undefined') ? rawToken : null;

            const res = await fetch(`${API_BASE_URL}/orders/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const createdOrder = await res.json();
                if (!createdOrder.checkout_url) {
                    this.userOrders.unshift(createdOrder);
                }
                this.clearCart();
                return createdOrder;
            } else {
                throw new Error("Failed to place order via backend.");
            }
        } catch (err) {
            console.error("Place Order Failed", err);
            throw err;
        }
    },

    async updateOrderStatus(orderId, statusData) {
        const token = localStorage.getItem('adminToken');
        if (!token) return false;

        try {
            const url = new URL(`${API_BASE_URL}/orders/${orderId}/status`);
            url.searchParams.append("order_status", statusData.status);
            if (statusData.trackingId) url.searchParams.append("tracking_id", statusData.trackingId);
            if (statusData.trackingUrl) url.searchParams.append("tracking_url", statusData.trackingUrl);

            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                await this.syncAdminData();
                return true;
            }
        } catch (err) {
            console.error("Update Status Failed", err);
        }
        return false;
    }
};

// Initial Sync
if (Auth.user) setTimeout(() => Auth.syncUserOrders(), 100);
if (Auth.admin) setTimeout(() => Auth.syncAdminData(), 100);

