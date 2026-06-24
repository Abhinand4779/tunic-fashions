/**
 * admin-settings.js
 * Logic for configuring Global Storefront Settings via Live API
 */

const API_URL = 'https://huestorybyreshma.com/server/api';

const DEFAULT_SITE_CONFIG = {
    hero: {
        subtitle: "CRAFTING ELEGANCE.",
        title: "TELLING YOUR STORY.",
        desc: "Discover timeless sarees crafted with passion, designed to celebrate your unique journey. Because every story deserves to shine."
    },
    nav: [
        { label: "HOME", url: "index.html" },
        { label: "SHOP", url: "shop.html" },
        { label: "CATEGORIES", url: "shop.html" },
        { label: "PAGES", url: "#" },
        { label: "ABOUT US", url: "about-us.html" }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('astra_admin') || !localStorage.getItem('adminToken')) {
        alert('You are not logged in. Redirecting to login page...');
        window.location.href = 'login.html';
        return;
    }
    // Create a floating Save button as a failsafe
    if (!document.getElementById('floating-save-btn')) {
        const btn = document.createElement('button');
        btn.id = 'floating-save-btn';
        btn.innerText = 'Save Changes (Failsafe)';
        btn.style.cssText = 'position: fixed; bottom: 30px; right: 30px; z-index: 99999; padding: 15px 30px; background: #A60C37; color: #000; font-weight: bold; border-radius: 50px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border: none; font-size: 1.2rem;';
        btn.onclick = (e) => {
            const form = document.getElementById('settings-form');
            if (form) window.saveSettings({ preventDefault: () => {}, target: form });
        };
        document.body.appendChild(btn);
    }

    loadSettings();
    loadCategoriesForNavbar();
});

async function loadSettings() {
    let config = DEFAULT_SITE_CONFIG;
    let backendSettings = {};

    try {
        const res = await fetch(`${API_URL}/settings`);
        if (res.ok) {
            backendSettings = await res.json();
            
            // Map backend settings to config object
            if (backendSettings.hero_subtitle) config.hero.subtitle = backendSettings.hero_subtitle;
            if (backendSettings.hero_title) config.hero.title = backendSettings.hero_title;
            if (backendSettings.hero_desc) config.hero.desc = backendSettings.hero_desc;
            if (backendSettings.main_nav_links) {
                try {
                    config.nav = JSON.parse(backendSettings.main_nav_links);
                } catch(e) {}
            }
        }
    } catch(e) {
        console.warn("Could not fetch settings from API, checking local storage", e);
        let localConfig = localStorage.getItem('hue_site_config');
        if (localConfig) {
            config = JSON.parse(localConfig);
        }
    }

    document.getElementById('promo-banner').value = backendSettings.announcement_bar || '';
    document.getElementById('hero-subtitle').value = config.hero.subtitle || '';
    document.getElementById('hero-title').value = config.hero.title || '';
    document.getElementById('hero-desc').value = config.hero.desc || '';

    const navContainer = document.getElementById('nav-links-container');
    navContainer.innerHTML = '';
    
    (config.nav || []).forEach(link => {
        addNavLinkHtml(link.label, link.url);
    });

    // Save the backend settings globally so the category loader can use it
    window.currentBackendSettings = backendSettings;
}

async function loadCategoriesForNavbar() {
    const container = document.getElementById('navbar-categories-container');
    try {
        const res = await fetch(`${API_URL}/categories`);
        if (res.ok) {
            const data = await res.json();
            const activeCats = data.filter(c => c.status !== 'inactive');
            
            let savedNavCats = [];
            // We wait briefly if loadSettings hasn't finished, though DOMContentLoaded fires synchronously
            if (window.currentBackendSettings && window.currentBackendSettings.navbar_categories) {
                try {
                    savedNavCats = JSON.parse(window.currentBackendSettings.navbar_categories);
                } catch(e) {}
            } else {
                // Fetch settings again if not loaded
                const setRes = await fetch(`${API_URL}/settings`);
                if (setRes.ok) {
                    const set = await setRes.json();
                    if (set.navbar_categories) {
                        try { savedNavCats = JSON.parse(set.navbar_categories); } catch(e) {}
                    }
                }
            }

            if (activeCats.length === 0) {
                container.innerHTML = '<div style="font-size: 0.9rem; color: #94a3b8;">No active categories found.</div>';
                return;
            }

            container.innerHTML = activeCats.map(cat => {
                const isChecked = savedNavCats.includes(cat.name) ? 'checked' : '';
                return `
                    <label style="display: flex; align-items: center; gap: 0.5rem; background: #f8fafc; padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">
                        <input type="checkbox" class="nav-cat-checkbox" value="${cat.name}" ${isChecked} style="width: 1.1rem; height: 1.1rem; accent-color: #2c9cdb;">
                        <span style="font-size: 0.9rem; color: #334155; font-weight: 500;">${cat.name}</span>
                    </label>
                `;
            }).join('');
        } else {
            container.innerHTML = '<div style="font-size: 0.9rem; color: #ef4444;">Failed to load categories.</div>';
        }
    } catch(e) {
        console.error("Error loading categories", e);
        container.innerHTML = '<div style="font-size: 0.9rem; color: #ef4444;">Error loading categories from API.</div>';
    }
}

function addNavLinkHtml(label = '', url = '') {
    const container = document.getElementById('nav-links-container');
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '1rem';
    row.style.alignItems = 'center';
    row.innerHTML = `
        <div style="flex: 1;">
            <input type="text" placeholder="Link Label (e.g. SHOP)" class="form-control nav-label" style="width: 100%;" value="${label}" required>
        </div>
        <div style="flex: 2;">
            <input type="text" placeholder="URL (e.g. shop.html)" class="form-control nav-url" style="width: 100%;" value="${url}" required>
        </div>
        <button type="button" class="btn-cancel" onclick="this.parentElement.remove()" style="padding: 0.6rem 1rem; border-color: #ef4444; color: #ef4444; background: white; border: 1px solid #ef4444; border-radius: 4px;"><i class="fa fa-trash"></i></button>
    `;
    container.appendChild(row);
}

window.addNavLink = function() {
    addNavLinkHtml();
};

window.saveSettings = async function(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]') || document.getElementById('floating-save-btn');
    let originalText = 'Save Changes';
    if (submitBtn) {
        originalText = submitBtn.innerText;
        submitBtn.innerText = 'Saving...';
        submitBtn.disabled = true;
    }

    const navRows = document.querySelectorAll('#nav-links-container > div');
    let navLinks = [];
    navRows.forEach(row => {
        const label = row.querySelector('.nav-label').value;
        const url = row.querySelector('.nav-url').value;
        if (label && url) {
            navLinks.push({ label, url });
        }
    });

    const checkedCatInputs = document.querySelectorAll('.nav-cat-checkbox:checked');
    let selectedNavCats = Array.from(checkedCatInputs).map(input => input.value);

    // Save to local storage as fallback
    const config = {
        hero: {
            subtitle: document.getElementById('hero-subtitle').value,
            title: document.getElementById('hero-title').value,
            desc: document.getElementById('hero-desc').value
        },
        nav: navLinks
    };
    localStorage.setItem('hue_site_config', JSON.stringify(config));

    // Save to API
    const payload = {
        settings: {
            hero_subtitle: config.hero.subtitle,
            hero_title: config.hero.title,
            hero_desc: config.hero.desc,
            announcement_bar: document.getElementById('promo-banner').value,
            main_nav_links: JSON.stringify(navLinks),
            navbar_categories: JSON.stringify(selectedNavCats)
        }
    };

    try {
        const res = await fetch(`${API_URL}/admin/settings`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Settings saved to live database! The website navbar will now reflect your selected categories.");
        } else {
            alert("Settings saved locally, but failed to sync to live server. Your admin session may have expired. Please try logging out and logging back in.");
        }
    } catch(err) {
        console.error("API error", err);
        alert("Settings saved locally. API connection failed. Your admin session may have expired. Please try logging out and logging back in.");
    } finally {
        if (submitBtn) {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    }
};
