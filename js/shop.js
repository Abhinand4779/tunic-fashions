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
        try {
            const res = await fetch(API_URL + '/products');
            if(res.ok) {
                this.products = await res.json();
            } else {
                console.warn('Backend returned non-ok status. Fallback to static mock data.');
                if (window.Site) this.products = window.Site.products || [];
            }
        } catch(e) {
            console.error('Failed to fetch from DB', e);
            if (window.Site) this.products = window.Site.products || [];
        }
    },

    render() {
        // Build dynamic categories based on available DB products
        let filteredProducts = this.products;

        if (this.categoryParam !== 'All') {
            const catLower = this.categoryParam.toLowerCase().trim();
            filteredProducts = filteredProducts.filter(p => 
                p.category?.toLowerCase().trim() === catLower ||
                p.section?.toLowerCase().trim() === catLower
            );
        }

        if (this.subCategoryParam !== 'All') {
            const subLower = this.subCategoryParam.toLowerCase().trim();
            filteredProducts = filteredProducts.filter(p => 
                p.sub_category?.toLowerCase().trim() === subLower ||
                p.category?.toLowerCase().trim() === subLower
            );
        }

        const availableSubCategories = {};
        this.products.forEach(p => {
            if (this.categoryParam !== 'All') {
                const catLower = this.categoryParam.toLowerCase().trim();
                if (p.category?.toLowerCase().trim() === catLower || p.section?.toLowerCase().trim() === catLower) {
                    const subName = p.sub_category || p.category || 'Uncategorized';
                    availableSubCategories[subName] = (availableSubCategories[subName] || 0) + 1;
                }
            } else {
                const catName = p.category || p.section || 'Uncategorized';
                availableSubCategories[catName] = (availableSubCategories[catName] || 0) + 1;
            }
        });

        const activeCategories = Object.keys(availableSubCategories).map(k => ({
            name: k,
            count: availableSubCategories[k]
        }));

        const displayTitle = this.subCategoryParam !== 'All' ? this.subCategoryParam : 
                             (this.categoryParam !== 'All' ? this.categoryParam : 'All Products');
        
        const titleFormatted = displayTitle.charAt(0).toUpperCase() + displayTitle.slice(1);

        const wrap = document.getElementById('shop-page-wrap');
        if (!wrap) return;

        wrap.innerHTML = `
            <header class="shop-header">
                <div class="header-overlay">
                    <h1>${titleFormatted}</h1>
                    <nav class="breadcrumb">
                        <a href="index.html">Home</a> / <a href="shop.html">Shop</a> / <span>${titleFormatted}</span>
                    </nav>
                </div>
            </header>

            <div class="shop-container">
                <aside class="shop-sidebar ${this.isFilterOpen ? 'mobile-active' : ''}">
                    <div class="sidebar-mobile-header">
                        <h3>Filters</h3>
                        <button class="close-filters" onclick="ShopHandler.toggleFilter(false)">&times;</button>
                    </div>
                    
                    <div class="filter-group">
                        <h3 class="filter-title">Product Categories</h3>
                        <ul class="filter-list">
                            <li class="${this.subCategoryParam === 'All' && this.categoryParam === 'All' ? 'active' : ''}" 
                                onclick="window.location.href='shop.html'">
                                All Products
                            </li>
                            ${this.categoryParam !== 'All' ? `
                                <li class="${this.subCategoryParam === 'All' ? 'active' : ''}" 
                                    onclick="window.location.href='shop.html?category=${this.categoryParam}'">
                                    All ${titleFormatted}
                                </li>
                            ` : ''}
                            ${activeCategories.map(cat => `
                                <li class="${(this.subCategoryParam.toLowerCase() === cat.name.toLowerCase() || this.categoryParam.toLowerCase() === cat.name.toLowerCase()) ? 'active' : ''}" 
                                    onclick="window.location.href='${this.categoryParam !== 'All' ? `shop.html?category=${this.categoryParam}&sub=${cat.name}` : `shop.html?category=${cat.name}`}'">
                                    ${cat.name} <span>(${cat.count})</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="filter-group">
                        <h3 class="filter-title">Filter By Material</h3>
                        <div class="material-tags">
                            ${['22K Gold', '18K Gold', 'Rose Gold', 'Silver'].map(mat => `
                                <label class="material-checkbox">
                                    <input type="checkbox">
                                    <span class="checkmark"></span>
                                    ${mat}
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <div class="filter-group">
                        <h3 class="filter-title">Select Size</h3>
                        <div class="size-selector">
                            ${['12', '14', '16', '18'].map(size => `
                                <button class="size-option ${this.selectedSize === size ? 'active' : ''}" 
                                        onclick="ShopHandler.setSize('${size}')">${size}</button>
                            `).join('')}
                        </div>
                    </div>
                </aside>

                <main class="shop-content">
                    <div class="content-toolbar">
                        <p class="results-count">Showing 1–${filteredProducts.length} results</p>
                        <div class="toolbar-right">
                            <button class="mobile-filter-btn" onclick="ShopHandler.toggleFilter(true)">
                                <i class="bi bi-filter"></i> Filters
                            </button>
                            <div class="view-switcher">
                                <button class="view-btn ${this.viewMode === 'grid' ? 'active' : ''}" onclick="ShopHandler.setView('grid')"><i class="bi bi-grid-3x3-gap"></i></button>
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
                                        <img src="${p.images?.[0] || 'assets/Logo/original.png'}" alt="${p.name}" loading="lazy">
                                        <button class="quick-view">Quick View</button>
                                    </div>
                                    <div class="p-card-info">
                                        <span class="p-category">${p.sub_category || p.category || p.section || ''}</span>
                                        <h4 class="p-name">${p.name}</h4>
                                        <div class="price-wrapper">
                                            <p class="p-price">${p.price}</p>
                                            ${p.oldPrice ? `<p class="p-old-price" style="text-decoration: line-through; color: #999; font-size: 0.9em; margin-left: 10px;">${p.oldPrice}</p>` : ''}
                                        </div>
                                        <button class="buy-now-btn">Buy Now</button>
                                    </div>
                                </div>`;
                        }).join('')}
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
