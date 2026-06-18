const API_URL = 'https://huestorybyreshma.com/server/api';

const ShopHandler = {
    selectedCategories: [],
    selectedSubCategories: [],
    selectedSizes: [],
    minPrice: '',
    maxPrice: '',
    viewMode: 'grid',
    isFilterOpen: false,
    products: [],

    async init() {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('category') || params.get('slug') || params.get('section');
        if (cat && cat !== 'All') {
            this.selectedCategories.push(cat);
        }
        const sub = params.get('sub');
        if (sub && sub !== 'All') {
            this.selectedSubCategories.push(sub);
        }

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

    toggleFilterValue(type, value) {
        const arr = this[type];
        const idx = arr.indexOf(value);
        if (idx === -1) arr.push(value);
        else arr.splice(idx, 1);
        this.render();
    },

    updatePrice(min, max) {
        this.minPrice = min;
        this.maxPrice = max;
        this.render();
    },

    clearFilters() {
        this.selectedCategories = [];
        this.selectedSubCategories = [];
        this.selectedSizes = [];
        this.minPrice = '';
        this.maxPrice = '';
        window.history.replaceState({}, document.title, "shop.html");
        this.render();
    },

    render() {
        let filteredProducts = this.products;

        if (this.selectedCategories.length > 0) {
            filteredProducts = filteredProducts.filter(p => {
                const pCat = String(p.category || p.section || '').toLowerCase().trim();
                return this.selectedCategories.some(c => c.toLowerCase().trim() === pCat);
            });
        }

        if (this.selectedSubCategories.length > 0) {
            filteredProducts = filteredProducts.filter(p => {
                const pSub = String(p.subcategory || p.sub_category || '').toLowerCase().trim();
                return this.selectedSubCategories.some(s => s.toLowerCase().trim() === pSub);
            });
        }

        if (this.selectedSizes.length > 0) {
            filteredProducts = filteredProducts.filter(p => {
                if (!p.sizes || p.sizes.length === 0) return false;
                return p.sizes.some(s => this.selectedSizes.includes(s));
            });
        }

        if (this.minPrice !== '' || this.maxPrice !== '') {
            const min = parseFloat(this.minPrice) || 0;
            const max = parseFloat(this.maxPrice) || Infinity;
            filteredProducts = filteredProducts.filter(p => {
                const price = parseFloat(p.price);
                return price >= min && price <= max;
            });
        }

        const allCats = new Set();
        const allSubs = new Set();
        const allSizes = new Set();

        this.products.forEach(p => {
            if (p.category) allCats.add(p.category);
            if (p.subcategory || p.sub_category) allSubs.add(p.subcategory || p.sub_category);
            if (p.sizes) p.sizes.forEach(s => allSizes.add(s));
        });

        const wrap = document.getElementById('shop-page-wrap');
        if (!wrap) return;

        wrap.innerHTML = `
            <div class="shop-container">
                <aside class="shop-sidebar ${this.isFilterOpen ? 'mobile-active' : ''}">
                    <div class="filter-close" onclick="ShopHandler.toggleFilter(false)"><i class="bi bi-x-lg"></i></div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin:0; font-family: 'Inter', sans-serif; font-weight: 800; font-size: 1.2rem;">FILTERS</h3>
                        <button onclick="ShopHandler.clearFilters()" style="background:none; border:none; color:#d4af37; cursor:pointer; font-size:0.85rem; font-weight:bold;">Clear All</button>
                    </div>

                    <div class="filter-section">
                        <h4 class="filter-title">CATEGORIES</h4>
                        <ul class="filter-list" style="list-style: none; padding: 0;">
                            ${Array.from(allCats).map(cat => `
                                <li style="margin-bottom: 8px;">
                                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.95rem; color: #444;">
                                        <input type="checkbox" ${this.selectedCategories.includes(cat) ? 'checked' : ''} 
                                               onchange="ShopHandler.toggleFilterValue('selectedCategories', '${cat}')" 
                                               style="margin-right: 10px; cursor: pointer;">
                                        ${cat}
                                    </label>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    ${allSubs.size > 0 ? `
                    <div class="filter-section">
                        <h4 class="filter-title">SUB-CATEGORIES</h4>
                        <ul class="filter-list" style="list-style: none; padding: 0;">
                            ${Array.from(allSubs).map(sub => `
                                <li style="margin-bottom: 8px;">
                                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.95rem; color: #444;">
                                        <input type="checkbox" ${this.selectedSubCategories.includes(sub) ? 'checked' : ''} 
                                               onchange="ShopHandler.toggleFilterValue('selectedSubCategories', '${sub}')" 
                                               style="margin-right: 10px; cursor: pointer;">
                                        ${sub}
                                    </label>
                                </li>
                            `).join('')}
                        </ul>
                    </div>` : ''}

                    <div class="filter-section">
                        <h4 class="filter-title">PRICE RANGE (?)</h4>
                        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                            <input type="number" id="filter-min-price" value="${this.minPrice}" placeholder="Min" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; outline: none;">
                            <span>-</span>
                            <input type="number" id="filter-max-price" value="${this.maxPrice}" placeholder="Max" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; outline: none;">
                        </div>
                        <button onclick="ShopHandler.updatePrice(document.getElementById('filter-min-price').value, document.getElementById('filter-max-price').value)" style="width: 100%; padding: 8px; background: #0f2230; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.85rem; letter-spacing: 1px;">APPLY</button>
                    </div>

                    ${allSizes.size > 0 ? `
                    <div class="filter-section">
                        <h4 class="filter-title">SIZE</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                            ${Array.from(allSizes).map(size => `
                                <button onclick="ShopHandler.toggleFilterValue('selectedSizes', '${size}')" 
                                        style="padding: 6px 12px; border: 1px solid ${this.selectedSizes.includes(size) ? '#d4af37' : '#ddd'}; background: ${this.selectedSizes.includes(size) ? '#fbf8f1' : '#fff'}; color: ${this.selectedSizes.includes(size) ? '#000' : '#555'}; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                                    ${size}
                                </button>
                            `).join('')}
                        </div>
                    </div>` : ''}
                </aside>
                
                <main class="shop-main">
                    <div class="content-toolbar">
                        <button class="mobile-filter-btn" onclick="ShopHandler.toggleFilter(true)"><i class="bi bi-funnel"></i> Filter</button>
                        <div class="toolbar-right" style="margin-left: auto;">
                            <span class="showing-results">Showing ${filteredProducts.length > 0 ? '1' : '0'}-${filteredProducts.length} results</span>
                            <div class="view-toggles">
                                <button class="view-btn ${this.viewMode === 'grid' ? 'active' : ''}" onclick="ShopHandler.setView('grid')"><i class="bi bi-grid"></i></button>
                                <button class="view-btn ${this.viewMode === 'list' ? 'active' : ''}" onclick="ShopHandler.setView('list')"><i class="bi bi-view-list"></i></button>
                            </div>
                        </div>
                    </div>

                    <div class="product-display ${this.viewMode}-view">
                        ${filteredProducts.length === 0 ? '<div style="width:100%; padding: 3rem 0; text-align:center; color: #666;"><i class="bi bi-search" style="font-size: 3rem; margin-bottom: 1rem; color: #ccc; display: block;"></i>No products matched your filters.</div>' : ''}
                        ${filteredProducts.map(p => {
                            const pid = p._id || p.id;
                            return `<div class="premium-product-card" onclick="window.location.href='product.html?id=${pid}'">
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
                        }).join('')}
                    </div>
                </main>
            </div>`;
    },

    setView(v) { this.viewMode = v; this.render(); },
    toggleFilter(b) { this.isFilterOpen = b; this.render(); }
};

document.addEventListener('DOMContentLoaded', () => {
    ShopHandler.init();
});

window.addEventListener('currencyUpdated', () => ShopHandler.render());


