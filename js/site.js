/**
 * HUE - Site Management
 * Connects frontend to Laravel backend
 */

const Site = {
    config: DEFAULT_CONFIG,
    products: [],
    loading: true,

    // Deep merge helper
    mergeConfig(base, override) {
        if (!override) return base;
        const merged = { ...base };
        Object.keys(override).forEach(key => {
            if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key]) && base[key]) {
                merged[key] = { ...base[key], ...override[key] };
            } else {
                merged[key] = override[key];
            }
        });
        return merged;
    },

    async fetchAll() {
        try {
            // 1. Fetch data from backend concurrently
            const configReq = fetch(`${API_BASE_URL}/settings`).then(r => r.ok ? r.json() : null).catch(() => null);
            const prodReq = fetch(`${API_BASE_URL}/products`).then(r => r.ok ? r.json() : null).catch(() => null);
            const catReq = fetch(`${API_BASE_URL}/categories`).then(r => r.ok ? r.json() : null).catch(() => null);

            const [data, prodData, catData] = await Promise.all([configReq, prodReq, catReq]);

            // 2. Map Settings
            if (data) {
                const mappedData = {};
                if (data.announcement_bar) {
                    try { mappedData.coupon = { label: 'OFFER', discount: '', text: JSON.parse(data.announcement_bar), code: 'HUE10' }; } 
                    catch(e) { mappedData.coupon = { label: 'OFFER', discount: '', text: data.announcement_bar, code: 'HUE10' }; }
                }
                if (data.hero_title || data.hero_subtitle) {
                    mappedData.hero = { ...this.config.hero };
                    if (data.hero_title) mappedData.hero.title = data.hero_title;
                    if (data.hero_subtitle) mappedData.hero.subtitle = data.hero_subtitle;
                }
                this.config = this.mergeConfig(this.config, { ...data, ...mappedData });
            }

            // 3. Map Products
            if (prodData) {
                this.products = prodData;
            }

            // 4. Map Categories to Navbar
            if (catData && Array.isArray(catData)) {
                // catData contains top-level categories with their 'children'
                const dynamicNav = catData.filter(c => c.status !== 'inactive').map(cat => {
                    const relatedSubCats = (cat.children || []).filter(sc => sc.status !== 'inactive').map(sc => sc.name);
                    return {
                        name: cat.name,
                        path: `shop.html?category=${encodeURIComponent(cat.name.toLowerCase())}`,
                        dropdown: relatedSubCats
                    };
                });
                this.config.navCategories = dynamicNav;
            }

        } catch (e) {
            console.warn("Backend sync failed", e);
        } finally {
            this.loading = false;
            window.dispatchEvent(new CustomEvent('siteDataLoaded'));
        }
    },

    async updateSection(section, data) {
        if (section === 'products') {
            this.products = data;
        } else {
            const configWithTime = { ...this.config, [section]: data };
            this.config = configWithTime;

            // Sync to backend if admin
            const token = localStorage.getItem('adminToken');
            if (token) {
                try {
                    const settingsToSave = { ...configWithTime };
                    delete settingsToSave.products;

                    await fetch(`${API_BASE_URL}/settings`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ settings: settingsToSave })
                    });
                } catch (err) {
                    console.error("Failed to sync backend", err);
                }
            }
        }
        window.dispatchEvent(new CustomEvent('siteDataLoaded'));
    }
};

// Start Fetching on Load
Site.fetchAll();


// Global Admin Mobile Sidebar Toggle Fix
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtns = document.querySelectorAll('.menu-toggle');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.classList.toggle('is-sidebar-open');
        });
    });
});

// Dynamic Site Settings Initialization
document.addEventListener('DOMContentLoaded', () => {
    const configData = localStorage.getItem('hue_site_config');
    const SiteConfig = configData ? JSON.parse(configData) : {
        hero: {
            subtitle: 'CRAFTING ELEGANCE.',
            title: 'TELLING YOUR STORY.',
            desc: 'Discover timeless sarees crafted with passion, designed to celebrate your unique journey. Because every story deserves to shine.'
        },
        nav: [
            { label: 'HOME', url: 'index.html' },
            { label: 'SHOP', url: 'shop.html' },
            { label: 'CATEGORIES', url: 'shop.html' },
            { label: 'PAGES', url: '#' },
            { label: 'ABOUT US', url: 'about-us.html' }
        ]
    };

    // 1. Render Navbar
    const navContainer = document.getElementById('navbar-links');
    if (navContainer) {
        navContainer.innerHTML = SiteConfig.nav.map(link => 
            <div class="nav-item"><a href="" class="nav-link"></a></div>
        ).join('');
    }

    // 2. Render Hero (only on index.html)
    const heroSubtitle = document.getElementById('hero-dynamic-subtitle');
    const heroTitle = document.getElementById('hero-dynamic-title');
    const heroDesc = document.getElementById('hero-dynamic-desc');

    if (heroSubtitle) heroSubtitle.innerText = SiteConfig.hero.subtitle;
    if (heroTitle) heroTitle.innerText = SiteConfig.hero.title;
    if (heroDesc) heroDesc.innerText = SiteConfig.hero.desc;
});
