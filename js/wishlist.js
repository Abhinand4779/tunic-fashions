/**
 * HUE - Wishlist Page Logic
 * Replaces Wishlist.jsx logic
 */

const WishlistHandler = {
    render() {
        const wrap = document.getElementById('wishlist-page-wrap');
        if (!wrap) return;

        if (Auth.wishlist.length === 0) {
            wrap.innerHTML = `
                <div class="wishlist-page-empty">
                    <div class="empty-wishlist-message">
                        <i class="bi bi-heart"></i>
                        <h2>Your Wishlist is Empty</h2>
                        <p>Save items you love so you can revisit them anytime.</p>
                        <button onclick="window.location.href='shop.html'" class="start-shopping-btn">Explore Collection</button>
                    </div>
                </div>`;
            return;
        }

        wrap.innerHTML = `
            <div class="wishlist-page">
                <div class="wishlist-container">
                    <div class="wishlist-header">
                        <div>
                            <h1 class="wishlist-title">My Wishlist</h1>
                            <p class="wishlist-subtitle">${Auth.wishlist.length} ${Auth.wishlist.length === 1 ? 'item' : 'items'} saved</p>
                        </div>
                        <a href="cart.html" class="go-to-cart-btn">
                            <i class="bi bi-handbag me-2"></i> Go to Bag
                        </a>
                    </div>

                    <div class="wishlist-grid">
                        ${Auth.wishlist.map(item => `
                            <div class="wishlist-card">
                                <div class="wishlist-card-img" onclick="window.location.href='product.html?id=${item._id || item.id}'">
                                    <img src="${item.images?.[0] || item.image}" alt="${item.name}">
                                    <button class="wishlist-remove-btn" onclick="event.stopPropagation(); Auth.toggleWishlist(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                                        <i class="bi bi-x-lg"></i>
                                    </button>
                                </div>
                                <div class="wishlist-card-info">
                                    <p class="wishlist-category">${item.category}</p>
                                    <h3 class="wishlist-name" onclick="window.location.href='product.html?id=${item._id || item.id}'">${item.name}</h3>
                                    <div class="wishlist-price-row">
                                        <span class="wishlist-price">${Currency.formatPrice(item.price)}</span>
                                        ${item.oldPrice ? `<span class="wishlist-old-price">${Currency.formatPrice(item.oldPrice)}</span>` : ''}
                                        ${item.discount ? `<span class="wishlist-discount">${item.discount} OFF</span>` : ''}
                                    </div>
                                    <div class="wishlist-actions">
                                        <button class="move-to-cart-btn" onclick="WishlistHandler.moveToCart('${item._id || item.id}')">
                                            <i class="bi bi-handbag me-2"></i> Move to Bag
                                        </button>
                                        <button class="wishlist-del-btn" onclick="Auth.toggleWishlist(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                                            <i class="bi bi-trash3"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
    },

    moveToCart(pid) {
        const item = Auth.wishlist.find(i => (i._id || i.id) === pid);
        if (item) {
            Auth.addToCart(item, 1);
            Auth.toggleWishlist(item); // Removes from wishlist
            window.location.href = 'cart.html';
        }
    }
};

window.addEventListener('wishlistUpdated', () => WishlistHandler.render());
window.addEventListener('siteDataLoaded', () => WishlistHandler.render());
if (!Site.loading) WishlistHandler.render();
else setTimeout(() => WishlistHandler.render(), 500);


window.addEventListener('currencyUpdated', () => WishlistHandler.render());
