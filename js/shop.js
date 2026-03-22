/**
 * ASTRA - Shop Page Logic
 * Replaces Shop.jsx logic
 */

const ShopHandler = {
    section: 'women',
    category: 'All',
    viewMode: 'grid',
    selectedSize: null,
    isFilterOpen: false,

    init() {
        const params = new URLSearchParams(window.location.search);
        this.section = params.get('slug') || params.get('section') || 'women';
        this.category = params.get('sub') || params.get('category') || 'All';

        this.render();
        window.addEventListener('siteDataLoaded', () => this.render());
    },

    render() {
        if (Site.loading) return;

        const allProducts = Site.products;
        const config = Site.config;
        const currentSection = this.section.toLowerCase();

        // Filtering
        const sectionProducts = allProducts.filter(p => p.section?.toLowerCase().trim() === currentSection);

        const activeCategories = (config.sectionCategories[currentSection] || []).map(cat => ({
            ...cat,
            count: sectionProducts.filter(p => p.category?.toLowerCase().trim() === cat.name.toLowerCase().trim()).length
        }));

        const filteredProducts = (this.category === 'All' || this.category.toLowerCase() === currentSection)
            ? sectionProducts
            : sectionProducts.filter(p => p.category?.toLowerCase().trim() === this.category.toLowerCase().trim());

        const displayTitle = (this.category === 'All' || this.category.toLowerCase() === currentSection)
            ? currentSection.charAt(0).toUpperCase() + currentSection.slice(1)
            : this.category;

        const wrap = document.getElementById('shop-page-wrap');
        if (!wrap) return;

        wrap.innerHTML = `
            <header class="shop-header">
                <div class="header-overlay">
                    <h1>${displayTitle}</h1>
                    <nav class="breadcrumb">
                        <a href="index.html">Home</a> / <a href="shop.html">Shop</a> / <span>${displayTitle}</span>
                    </nav>
                </div>
            </header>

            <div class="shop-container">
                <aside class="shop-sidebar ${this.isFilterOpen ? 'mobile-active' : ''}">
                    <div class="sidebar-mobile-header">
                        <h3>Filters</h3>
                        <button class="close-filters" onclick="ShopHandler.toggleFilter(false)">&times;</button>
                    </div>
                    ${currentSection !== 'kids' ? `
                        <div class="filter-group">
                            <h3 class="filter-title">Product Categories</h3>
                            <ul class="filter-list">
                                <li class="${(this.category === 'All' || this.category.toLowerCase() === currentSection) ? 'active' : ''}" 
                                    onclick="ShopHandler.setCategory('All')">
                                    All ${currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} Items
                                </li>
                                ${activeCategories.map(cat => `
                                    <li class="${this.category.toLowerCase().trim() === cat.name.toLowerCase().trim() ? 'active' : ''}" 
                                        onclick="ShopHandler.setCategory('${cat.name}')">
                                        ${cat.name} <span>(${cat.count})</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}

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
                                        <span class="p-category">${p.category}</span>
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

    setCategory(cat) { this.category = cat; this.isFilterOpen = false; this.render(); },
    setSize(s) { this.selectedSize = (this.selectedSize === s ? null : s); this.render(); },
    setView(v) { this.viewMode = v; this.render(); },
    toggleFilter(b) { this.isFilterOpen = b; this.render(); }
};

ShopHandler.init();
