/**
 * HUE - Product Detail Logic
 * Replaces ProductDetail.jsx logic
 */

const ProductDetailHandler = {
    productId: new URLSearchParams(window.location.search).get('id'),
    selectedImg: 0,
    quantity: 1,
    product: null,

    async init() {
        if (!this.productId) {
            window.location.href = 'shop.html';
            return;
        }

        await this.fetchProduct();
        this.render();
        window.addEventListener('authChanged', () => this.render());
    },

    async fetchProduct() {
        if (typeof LocalDB !== 'undefined') {
            let all = LocalDB.getProducts();
            this.product = all.find(p => (p._id || p.id)?.toString() === this.productId);
        }
        if (!this.product && window.Site) {
            this.product = window.Site.products.find(p => (p._id || p.id)?.toString() === this.productId);
        }
    },

    render() {
        const wrap = document.getElementById('product-page-wrap');
        if (!wrap) return;

        const product = this.product;

        if (!product) {
            wrap.innerHTML = `
                <div class="container py-5 text-center">
                    <i class="bi bi-search display-1 text-muted mb-4 d-block"></i>
                    <h3>Product Not Found</h3>
                    <p class="text-muted mb-4">The item you are looking for might have been removed or is currently unavailable.</p>
                    <a href="shop.html" class="btn btn-primary px-4 py-2">Return to Shop</a>
                </div>`;
            return;
        }

        const inWishlist = Auth.isInWishlist(product._id || product.id);
        const images = product.image ? [product.image] : (product.images && product.images.length > 0 ? product.images : ['assets/Logo/hue%20logo.png']);

        wrap.innerHTML = `
            <div class="detail-container">
                <nav class="detail-breadcrumb">
                    <a href="index.html">Home</a> /
                    <a href="shop.html">Shop</a> /
                    <span class="current">${product.name}</span>
                </nav>

                <div class="product-main-layout">
                    <!-- Left: Image Gallery -->
                    <div class="image-gallery-section">
                        <div class="thumbnail-list">
                            ${images.map((img, idx) => `
                                <div class="thumbnail-item ${this.selectedImg === idx ? 'active' : ''}" onclick="ProductDetailHandler.setImg(${idx})">
                                    <img src="${img}" alt="Thumb ${idx}">
                                </div>
                            `).join('')}
                        </div>
                        <div class="main-image-wrapper">
                            ${product.discount ? `<span class="detail-discount-badge">-${product.discount}</span>` : ''}
                            <img src="${images[this.selectedImg]}" alt="${product.name}" class="main-display-img">
                        </div>
                    </div>

                    <!-- Right: Product Info -->
                    <div class="product-info-section">
                        <span class="detail-category">${product.category || 'Jewelry'}</span>
                        <h1 class="detail-title">${product.name}</h1>

                        <div class="detail-price-wrapper">
                            <span class="current-price">${Currency.formatPrice(product.price)}</span>
                            ${product.oldPrice ? `<span class="old-price">${Currency.formatPrice(product.oldPrice)}</span>` : ''}
                        </div>

                        <p class="detail-description">${product.description || ''}</p>

                        <div class="product-specs">
                            <h5>Product Specification:</h5>
                            <ul>
                                ${(product.details || ['Premium Quality', 'Handcrafted', 'Elegant Design']).map(spec => `<li>${spec}</li>`).join('')}
                            </ul>
                        </div>

                        <div class="purchase-controls">
                            <div class="quantity-selector">
                                <button onclick="ProductDetailHandler.setQty(-1)">-</button>
                                <span>${this.quantity}</span>
                                <button onclick="ProductDetailHandler.setQty(1)">+</button>
                            </div>

                            <div class="action-buttons">
                                <button class="add-to-cart-btn" onclick="ProductDetailHandler.handleAction('cart')">
                                    <i class="bi bi-cart3 me-2"></i> Add To Cart
                                </button>
                                <button class="buy-now-detail-btn" onclick="ProductDetailHandler.handleAction('buy')">
                                    Buy Now
                                </button>
                                <button class="wishlist-toggle-btn ${inWishlist ? 'active' : ''}" onclick="ProductDetailHandler.handleWishlist()">
                                    <i class="bi ${inWishlist ? 'bi-heart-fill' : 'bi-heart'}"></i>
                                </button>
                            </div>
                        </div>

                        <div class="trust-badges">
                            <div class="badge-item"><i class="bi bi-truck"></i><span>Free Shipping</span></div>
                            <div class="badge-item"><i class="bi bi-shield-check"></i><span>Secure Payment</span></div>
                            <div class="badge-item"><i class="bi bi-arrow-repeat"></i><span>Easy Returns</span></div>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    setImg(idx) {
        this.selectedImg = idx;
        this.render();
    },

    setQty(dir) {
        this.quantity = Math.max(1, this.quantity + dir);
        this.render();
    },

    handleAction(action) {
        const product = this.product;
        if (!Auth.user) {
            alert(`Please login to ${action === 'cart' ? 'add items to cart' : 'buy this item'}.`);
            window.location.href = `profile.html?from=product.html?id=${this.productId}`;
            return;
        }

        Auth.addToCart(product, this.quantity);
        if (action === 'buy') {
            window.location.href = 'checkout.html';
        } else {
            alert('Added to Cart!');
        }
    },

    handleWishlist() {
        const product = this.product;
        if (!Auth.user) {
            alert('Please login to add items to your wishlist.');
            window.location.href = `profile.html?from=product.html?id=${this.productId}`;
            return;
        }
        Auth.toggleWishlist(product);
        this.render();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ProductDetailHandler.init();
});


window.addEventListener('currencyUpdated', () => ProductDetailHandler.render());



