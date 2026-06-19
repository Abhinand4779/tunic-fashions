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
            const ts = new Date().getTime();
            // 1. Fetch data from backend concurrently (with cache busting)
            const configReq = fetch(`${API_BASE_URL}/settings?t=${ts}`).then(r => r.ok ? r.json() : null).catch(() => null);
            const prodReq = fetch(`${API_BASE_URL}/products?t=${ts}`).then(r => r.ok ? r.json() : null).catch(() => null);
            const catReq = fetch(`${API_BASE_URL}/categories?t=${ts}`).then(r => r.ok ? r.json() : null).catch(() => null);

            const [data, prodData, catData] = await Promise.all([configReq, prodReq, catReq]);

            // 2. Map Settings
            if (data) {
                const mappedData = {};
                if (data.announcement_bar !== undefined && data.announcement_bar !== null) {
                    try { mappedData.coupon = { label: 'OFFER', discount: '', text: JSON.parse(data.announcement_bar), code: 'HUE10' }; } 
                    catch(e) { mappedData.coupon = { label: 'OFFER', discount: '', text: data.announcement_bar, code: 'HUE10' }; }
                }
                if (data.hero_title || data.hero_subtitle) {
                    mappedData.hero = { ...this.config.hero };
                    if (data.hero_title) mappedData.hero.title = data.hero_title;
                    if (data.hero_subtitle) mappedData.hero.subtitle = data.hero_subtitle;
                }

                if (data.navbar_categories) {
                    try { mappedData.navbar_categories = JSON.parse(data.navbar_categories); }
                    catch(e) { mappedData.navbar_categories = []; }
                }

                if (data.main_nav_links) {
                    try { mappedData.nav = JSON.parse(data.main_nav_links); }
                    catch(e) {}
                }

                this.config = this.mergeConfig(this.config, { ...data, ...mappedData });
            }

            // 3. Map Products
            if (prodData) {
                this.products = prodData;
            }

            // 4. Map Categories to Navbar & Homepage
            if (catData && Array.isArray(catData)) {
                // catData contains top-level categories with their 'children'
                const activeCats = catData.filter(c => c.status !== 'inactive');
                
                let filteredNavCats = activeCats;
                if (this.config.navbar_categories && Array.isArray(this.config.navbar_categories) && this.config.navbar_categories.length > 0) {
                    filteredNavCats = activeCats.filter(c => this.config.navbar_categories.includes(c.name));
                    // Sort to match the order saved by admin (optional but nice)
                    filteredNavCats.sort((a, b) => this.config.navbar_categories.indexOf(a.name) - this.config.navbar_categories.indexOf(b.name));
                }

                const dynamicNav = filteredNavCats.map(cat => {
                    const relatedSubCats = (cat.children || []).filter(sc => sc.status !== 'inactive').map(sc => sc.name);
                    return {
                        name: cat.name,
                        path: `shop.html?category=${encodeURIComponent(cat.name.toLowerCase())}`,
                        dropdown: relatedSubCats
                    };
                });
                this.config.navCategories = dynamicNav;

                const existingHomeCats = this.config.homeCategories || [];
                const dynamicHomeCats = activeCats.map(cat => {
                    // Try to reuse an existing image mapping if available, otherwise use a placeholder
                    const existing = existingHomeCats.find(ec => ec.name.toLowerCase() === cat.name.toLowerCase());
                    let finalImage = cat.image_url; // From live database API
                    if (!finalImage && existing) finalImage = existing.image; // Fallback to hardcoded mapping
                    if (!finalImage) finalImage = 'assets/category_placeholder.jpg'; // Ultimate fallback

                    return {
                        name: cat.name,
                        path: `shop.html?category=${encodeURIComponent(cat.name.toLowerCase())}`,
                        image: finalImage
                    };
                });
                this.config.homeCategories = dynamicHomeCats;
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
window.Site = Site;
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
