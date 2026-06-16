/**
 * admin-settings.js
 * Logic for configuring Global Storefront Settings
 */

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
    loadSettings();
});

function loadSettings() {
    let config = localStorage.getItem('hue_site_config');
    if (!config) {
        config = DEFAULT_SITE_CONFIG;
    } else {
        config = JSON.parse(config);
    }

    document.getElementById('hero-subtitle').value = config.hero.subtitle || '';
    document.getElementById('hero-title').value = config.hero.title || '';
    document.getElementById('hero-desc').value = config.hero.desc || '';

    const navContainer = document.getElementById('nav-links-container');
    navContainer.innerHTML = '';
    
    (config.nav || []).forEach(link => {
        addNavLinkHtml(link.label, link.url);
    });
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
        <button type="button" class="btn-cancel" onclick="this.parentElement.remove()" style="padding: 0.6rem 1rem; border-color: #ef4444; color: #ef4444;"><i class="fa fa-trash"></i></button>
    `;
    container.appendChild(row);
}

window.addNavLink = function() {
    addNavLinkHtml();
};

window.saveSettings = function(e) {
    e.preventDefault();

    const config = {
        hero: {
            subtitle: document.getElementById('hero-subtitle').value,
            title: document.getElementById('hero-title').value,
            desc: document.getElementById('hero-desc').value
        },
        nav: []
    };

    const navRows = document.querySelectorAll('#nav-links-container > div');
    navRows.forEach(row => {
        const label = row.querySelector('.nav-label').value;
        const url = row.querySelector('.nav-url').value;
        if (label && url) {
            config.nav.push({ label, url });
        }
    });

    localStorage.setItem('hue_site_config', JSON.stringify(config));
    
    alert("Storefront settings saved successfully! Refresh the storefront to see changes.");
};
