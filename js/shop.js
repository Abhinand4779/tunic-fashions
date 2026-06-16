const API_URL = 'http://localhost:8085/api';

const ShopHandler = {
    categoryParam: 'All',
    subCategoryParam: 'All',
    viewMode: 'grid',
    selectedSize: null,
    isFilterOpen: false,
    products: [],

    async init() {
        const params = new URLSearchParams(window.location.search);
        this.categoryParam = params.get('category') || params.get('slug') || params.get('section') || 'All';
        this.subCategoryParam = params.get('sub') || 'All';

        await this.fetchProducts();
        this.render();
    },

    async fetchProducts() {
        if (typeof LocalDB !== 'undefined') {
            this.products = LocalDB.getProducts();
        } else if (window.Site) {
            this.products = window.Site.products || [];
        } else {
            this.products = [];
        }
    },

    render() {
        let filteredProducts = this.products;

        if (this.categoryParam !== 'All') {
            const catLower = this.categoryParam.toLowerCase().trim();
            filteredProducts = filteredProducts.filter(p => 
                String(p.category || '').toLowerCase().trim() === catLower ||
                String(p.section || '').toLowerCase().trim() === catLower
            );
        }

        if (this.subCategoryParam !== 'All') {
            const subLower = this.subCategoryParam.toLowerCase().trim();
            filteredProducts = filteredProducts.filter(p => 
                String(p.subcategory || p.sub_category || '').toLowerCase().trim() === subLower ||
                String(p.category || '').toLowerCase().trim() === subLower
            );
        }

        const availableSubCategories = {};
        filteredProducts.forEach(p => {
            const sub = p.subcategory || p.sub_category;
            if (sub) {
                availableSubCategories[sub] = (availableSubCategories[sub] || 0) + 1;
            }
        });

        const wrap = document.getElementById('shop-page-wrap');
        if (!wrap) return;

        wrap.innerHTML = `
            <div class="shop-container">
                <aside class="shop-sidebar ${this.isFilterOpen ? 'open' : ''}">
                    <div class="filter-close" onclick="ShopHandler.toggleFilter(false)"><i class="bi bi-x-lg"></i></div>
                    <div class="filter-section">
                        <h4 class="filter-title">PRODUCT CATEGORIES</h4>
                        <ul class="filter-list">
                            <li><a href="shop.html" class="filter-link">All Products</a></li>
                            ${this.categoryParam !== 'All' ? `<li><a href="#" class="filter-link" style="color:#d4af37;">All ${this.categoryParam}</a></li>` : ''}
                            ${Object.keys(availableSubCategories).map(sub => `
                                <li><a href="shop.html?category=${this.categoryParam}&sub=${sub}" class="filter-link ${this.subCategoryParam === sub ? 'active' : ''}">${sub} <span class="filter-count">(${availableSubCategories[sub]})</span></a></li>
                            `).join('' )}
                        </ul>
                    </div>
                </aside>
                
                <main class="shop-main">
                    <div class="shop-toolbar">
                        <button class="mobile-filter-btn" onclick="ShopHandler.toggleFilter(true)"><i class="bi bi-funnel"></i> Filter</button>
                        <div class="toolbar-right">
                            <span class="showing-results">Showing ${filteredProducts.length > 0 ? '1' : '0'}-${filteredProducts.length} results</span>
                            <div class="view-toggles">
                                <button class="view-btn ${this.viewMode === 'grid' ? 'active' : ''}" onclick="ShopHandler.setView('grid')"><i class="bi bi-grid"></i></button>
                                <button class="view-btn ${this.viewMode === 'list' ? 'active' : ''}" onclick="ShopHandler.setView('list')"><i class="bi bi-view-list"></i></button>
                            </div>
                        </div>
                    </div>

                    <div class="product-display ${this.viewMode}-view">
                        ${filteredProducts.length === 0 ? '<p style="width:100%;text-align:center;">No products found for this category.</p>' : ''}
                        ${filteredProducts.map(p => {
                            const pid = p._id || p.id;
                            return `
                                <div class="premium-product-card" onclick="window.location.href='product.html?id=${pid}'">
                                    <div class="p-card-image">
                                        ${p.discount ? `<span class="discount-badge">-${p.discount}</span>` : ''}
                                        <img src="${p.image || p.images?.[0] || 'assets/Logo/hue%20logo.png'}" alt="${p.name}" loading="lazy">
                                        <button class="quick-view">Quick View</button>
                                    </div>
                                    <div class="p-card-info">
                                        <span class="p-category">${p.sub_category || p.category || p.section || ''}</span>
                                        <h4 class="p-name">${p.name}</h4>
                                        <div class="price-wrapper">
                                            <p class="p-price">${Currency.formatPrice(p.price)}</p>
                                            ${p.oldPrice ? `<p class="p-old-price" style="text-decoration: line-through; color: #999; font-size: 0.9em; margin-left: 10px;">${Currency.formatPrice(p.oldPrice)}</p>` : ''}
                                        </div>
                                        <button class="buy-now-btn">Buy Now</button>
                                    </div>
                                </div>`;
                        }).join('' )}
                    </div>
                </main>
            </div>`;
    },

    setSize(s) { this.selectedSize = (this.selectedSize === s ? null : s); this.render(); },
    setView(v) { this.viewMode = v; this.render(); },
    toggleFilter(b) { this.isFilterOpen = b; this.render(); },
    setCategory(cat) { window.location.href = `shop.html?category=${cat}`; }
};

document.addEventListener('DOMContentLoaded', () => {
    ShopHandler.init();
});

window.addEventListener('currencyUpdated', () => ShopHandler.render());




