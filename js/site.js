/**
 * ASTRA - Site Management
 * Replaces SiteContext.jsx logic
 */

const Site = {
    config: DEFAULT_CONFIG,
    products: [],
    loading: true,

    // Deep merge helper (from React SiteContext.jsx)
    mergeConfig(base, override) {
        if (!override) return base;

        // Skip if server config is older than local version
        if (base.lastUpdated && override.lastUpdated && override.lastUpdated < base.lastUpdated) {
            console.warn("Server config is older than local config. Skipping.");
            return base;
        }

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
        // Step 1: Initialize with DEFAULT_CONFIG (merged with local)
        const stored = localStorage.getItem('astra_site_config_v2');
        if (stored) {
            try { this.config = this.mergeConfig(this.config, JSON.parse(stored)); } catch (e) { }
        }

        const lastProds = localStorage.getItem('astra_last_products') || localStorage.getItem('astra_last_products_lite');
        if (lastProds) {
            try { this.products = JSON.parse(lastProds); } catch (e) { }
        }

        // We have at least DEFAULT_CONFIG or CACHE, so stop loading
        this.loading = false;
        window.dispatchEvent(new CustomEvent('siteDataLoaded'));

        // Step 2: Background Refresh (Non-blocking)
        try {
            const configReq = fetch(`${API_BASE_URL}/settings/`).then(r => r.ok ? r.json() : null);
            const prodReq = fetch(`${API_BASE_URL}/products/`).then(r => r.ok ? r.json() : null);

            const [data, prodData] = await Promise.all([configReq, prodReq]);

            if (data && data.config) {
                this.config = this.mergeConfig(this.config, data.config);
                localStorage.setItem('astra_site_config_v2', JSON.stringify(data.config));
                window.dispatchEvent(new CustomEvent('siteDataLoaded'));
            }

            if (prodData) {
                this.products = prodData;
                try { localStorage.setItem('astra_last_products', JSON.stringify(prodData)); } catch (e) { }
                window.dispatchEvent(new CustomEvent('siteDataLoaded'));
            }
        } catch (e) {
            console.warn("Background sync failed", e);
        }
    },

    async updateSection(section, data) {
        if (section === 'products') {
            this.products = data;
            try {
                localStorage.setItem('astra_last_products', JSON.stringify(data));
                localStorage.removeItem('astra_last_products_lite');
            } catch (e) {
                const lite = data.map(({ images, ...rest }) => rest);
                localStorage.setItem('astra_last_products_lite', JSON.stringify(lite));
                localStorage.removeItem('astra_last_products');
            }
        } else {
            const configWithTime = { ...this.config, [section]: data, lastUpdated: Date.now() };
            this.config = configWithTime;
            localStorage.setItem('astra_site_config_v2', JSON.stringify(configWithTime));

            // Sync to backend if admin
            const token = localStorage.getItem('adminToken');
            if (token) {
                try {
                    const settingsToSave = { ...configWithTime };
                    // Never save products inside config to avoid large payloads
                    delete settingsToSave.products;

                    await fetch(`${API_BASE_URL}/settings/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(settingsToSave)
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

// Sync across tabs
window.addEventListener('storage', (e) => {
    if ((e.key === 'astra_site_config_v2' || e.key === 'astra_last_products') && e.newValue) {
        Site.fetchAll();
    }
});
