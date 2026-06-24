/**
 * TUNIC FASHIONS - Product Detail Logic
 * Replaces ProductDetail.jsx logic
 */

const ProductDetailHandler = {
    productId: new URLSearchParams(window.location.search).get('id'),
    selectedImg: 0,
    selectedColorIdx: 0,
    selectedSize: null,
    quantity: 1,
    product: null,

    async init() {
        if (!this.productId) {
            window.location.href = 'shop.html';
            return;
        }

        await this.fetchProduct();
        await this.loadReviews();
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
        let images = product.image_path ? [product.image_path] : (product.image ? [product.image] : ['assets/Logo/tunic_logo.png']);
        let colorsHtml = '';
        let sizesHtml = '';

        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
            images = product.variants.map(v => v.image);
            colorsHtml = `
                <div class="product-colors" style="margin-top: 15px; margin-bottom: 20px;">
                    <h5 style="margin-bottom: 10px; font-weight: 600;">Available Colors:</h5>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${product.variants.map((v, idx) => `
                            <button onclick="ProductDetailHandler.setColor(${idx})" 
                                style="padding: 8px 15px; border: 2px solid ${this.selectedColorIdx === idx ? '#A60C37' : '#eee'}; 
                                border-radius: 4px; background: white; cursor: pointer; font-weight: 500; transition: all 0.2s;
                                color: ${this.selectedColorIdx === idx ? '#A60C37' : '#334155'};">
                                ${v.color}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            // Ensure selected image matches selected color
            this.selectedImg = this.selectedColorIdx;
        } else if (product.images && product.images.length > 0) {
            images = product.images;
        }

        if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
            if (this.selectedSize === null) this.selectedSize = product.sizes[0];
            sizesHtml = `
                <div class="product-sizes" style="margin-top: 15px; margin-bottom: 20px;">
                    <h5 style="margin-bottom: 10px; font-weight: 600;">Available Sizes:</h5>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${product.sizes.map(size => `
                            <button onclick="ProductDetailHandler.setSize('${size}')" 
                                style="padding: 8px 15px; border: 2px solid ${this.selectedSize === size ? '#A60C37' : '#eee'}; 
                                border-radius: 4px; background: white; cursor: pointer; font-weight: 500; transition: all 0.2s;
                                color: ${this.selectedSize === size ? '#A60C37' : '#334155'};">
                                ${size}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

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

                        ${colorsHtml}
                        ${sizesHtml}

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

                <!-- Customer Reviews Section -->
                <div class="reviews-section">
                    <div class="reviews-header">
                        <h3>Customer Reviews</h3>
                        <button class="btn-write-review" onclick="ProductDetailHandler.openReviewModal()">Write a Review</button>
                    </div>
                    <div class="reviews-list">
                        ${this.getReviews().length === 0 ? '<p style="color:#94a3b8;">No reviews yet. Be the first to review this product!</p>' : 
                          this.getReviews().map(r => `
                            <div class="review-item">
                                ${r.image ? `<img src="${r.image}" class="review-img" alt="Review Image">` : ''}
                                <div class="review-content">
                                    <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
                                    <div class="review-customer">${r.customer}</div>
                                    <div class="review-date">${new Date(r.date).toLocaleDateString()}</div>
                                    <div class="review-text">${r.text}</div>
                                </div>
                            </div>
                          `).join('')}
                    </div>
                </div>
            </div>`;
    },

    setImg(idx) {
        this.selectedImg = idx;
        this.render();
    },

    setColor(idx) {
        this.selectedColorIdx = idx;
        this.selectedImg = idx;
        this.render();
    },

    setSize(size) {
        this.selectedSize = size;
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

        Auth.addToCart({
            ...product,
            selectedColor: product.variants ? product.variants[this.selectedColorIdx].color : null,
            selectedSize: this.selectedSize
        }, this.quantity);
        
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
    },

    // --- REVIEWS LOGIC --- //

    // Load reviews from the API and store them in this.reviews
    async loadReviews() {
        try {
            const res = await fetch(`${API_BASE_URL}/reviews?product_id=${this.productId}`);
            if (res.ok) {
                this.reviews = await res.json();
            } else {
                this.reviews = [];
            }
        } catch (e) {
            console.error("Failed to load reviews:", e);
            this.reviews = [];
        }
    },

    // Synchronous getter that returns the loaded reviews array (or empty array)
    getReviews() {
        return this.reviews || [];
    },

    openReviewModal() {
        document.getElementById('reviewModalOverlay').style.display = 'flex';
    },

    closeReviewModal() {
        document.getElementById('reviewModalOverlay').style.display = 'none';
        document.getElementById('reviewForm').reset();
    },

    async submitReview(e) {
        e.preventDefault();
        const rating = parseInt(document.getElementById('reviewRating').value);
        if(rating === 0) {
            alert('Please select a star rating.');
            return;
        }

        const newReview = {
            product_id: this.productId,
            name: document.getElementById('reviewName').value,
            rating: rating,
            text: document.getElementById('reviewText').value,
            image_url: this.uploadedReviewImage || ''
        };

        try {
            const res = await fetch(`${API_BASE_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newReview)
            });

            if (res.ok) {
                alert("Review submitted successfully! It will appear once approved by an admin.");
                this.closeReviewModal();
                this.getReviews();
            } else {
                alert("Failed to submit review.");
            }
        } catch (err) {
            console.error("Failed to submit review", err);
            alert("Failed to connect to the server.");
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ProductDetailHandler.init();
    
    // Inject Modal & CSS
    const reviewStyles = document.createElement('style');
    reviewStyles.innerHTML = `
    .reviews-section { margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #e2e8f0; }
    .reviews-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .reviews-header h3 { font-size: 1.5rem; color: #0f172a; margin: 0; }
    .btn-write-review { background: #A60C37; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 500; transition: background 0.2s; }
    .btn-write-review:hover { background: #c29e2f; }
    .review-item { padding: 1.5rem; border: 1px solid #f1f5f9; border-radius: 8px; margin-bottom: 1rem; background: #fff; display: flex; gap: 1.5rem; }
    .review-img { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; flex-shrink: 0; }
    .review-content { flex-grow: 1; }
    .review-stars { color: #A60C37; margin-bottom: 0.5rem; font-size: 1.1rem; }
    .review-customer { font-weight: 600; color: #334155; margin-bottom: 0.2rem; }
    .review-date { font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.8rem; }
    .review-text { color: #475569; font-size: 0.95rem; line-height: 1.5; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; display: none; justify-content: center; align-items: center; }
    .modal-box { background: #fff; padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
    .modal-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 1.5rem; color:#0f172a;}
    .form-group { margin-bottom: 1rem; text-align: left; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem; color:#334155; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-family: inherit; }
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
    .btn-cancel { background: #f1f5f9; color: #475569; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 500; }
    `;
    document.head.appendChild(reviewStyles);

    const modalHTML = `
    <div id="reviewModalOverlay" class="modal-overlay">
        <div class="modal-box">
            <h3 class="modal-title">Write a Review</h3>
            <form id="reviewForm" onsubmit="ProductDetailHandler.submitReview(event)">
                <div class="form-group">
                    <label>Your Name</label>
                    <input type="text" id="reviewName" required placeholder="John Doe">
                </div>
                <div class="form-group">
                    <label>Rating</label>
                    <select id="reviewRating" required>
                        <option value="5">5 Stars - Excellent</option>
                        <option value="4">4 Stars - Good</option>
                        <option value="3">3 Stars - Average</option>
                        <option value="2">2 Stars - Poor</option>
                        <option value="1">1 Star - Terrible</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Review Text</label>
                    <textarea id="reviewText" required rows="4" placeholder="Tell us what you think about this product..."></textarea>
                </div>
                <div class="form-group">
                    <label>Attach an Image (Optional)</label>
                    <input type="file" id="reviewImage" accept="image/*">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-cancel" onclick="ProductDetailHandler.closeReviewModal()">Cancel</button>
                    <button type="submit" class="btn-write-review">Submit Review</button>
                </div>
            </form>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
});


window.addEventListener('currencyUpdated', () => ProductDetailHandler.render());



