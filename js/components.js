/**
 * HUE - Shared Components Loader
 * Handles dynamic navigation and footer injection
 */

const Components = {
    renderNavbar() {
        const navCount = document.getElementById('cart-count');
        const wishlistBadge = document.querySelector('.wishlist-badge');

        const cartTotal = Auth.cart.reduce((acc, item) => acc + item.quantity, 0);
        const wishlistLen = Auth.wishlist.length;

        if (navCount) navCount.textContent = cartTotal;
        // If the badge doesn't exist but we have items, we might need to inject just the badge
        // but for now, we'll assume the HTML has the span

        const navLinks = document.getElementById('navbar-links');
        if (navLinks && Site.config.navCategories) {
            // We still update links dynamically to ensure they match config
            const navCategories = Site.config.navCategories;
            const newHtml = navCategories.map(cat => {
                const sectionKey = cat.name.toLowerCase();
                const items = Site.config.sectionCategories[sectionKey] || cat.dropdown || [];
                const hasDropdown = items.length > 0;
                let dropdownHtml = '';
                if (hasDropdown) {
                    if (['women', 'men', 'kids'].includes(sectionKey)) {
                        dropdownHtml = `<div class="mega-menu"><div class="mega-menu-content">${items.map(item => `<a href="shop.html?slug=${sectionKey}&sub=${(item.name || item).toLowerCase().replace(/ /g, '-')}" class="mega-menu-link">${item.name || item}</a>`).join('')}</div></div>`;
                    } else {
                        dropdownHtml = `<ul class="dropdown">${items.map(item => `<li><a href="shop.html?slug=${sectionKey}&sub=${(item.name || item).toLowerCase().replace(/ /g, '-')}" class="dropdown-link">${item.name || item}</a></li>`).join('')}</ul>`;
                    }
                }
                return `<div class="nav-item"><a href="${cat.path}" class="nav-link">${cat.name} ${hasDropdown ? '<i class="bi bi-chevron-down ms-1" style="font-size: 0.7em"></i>' : ''}</a>${dropdownHtml}</div>`;
            }).join('');
            
            if (navLinks.innerHTML !== newHtml) {
                navLinks.innerHTML = newHtml;
            }
        }
    },

    renderFooter() {
        const footerElem = document.getElementById('main-footer');
        if (!footerElem) return;
        const { footer } = Site.config;
        if (!footer) return;

        // Update only text content if possible to avoid layout shift
        const storeName = footerElem.querySelector('.footer-heading-logo');
        if (storeName) storeName.textContent = footer.storeName;

        const desc = footerElem.querySelector('.footer-description');
        if (desc) desc.textContent = footer.description;

        const copy = footerElem.querySelector('.footer-copyright');
        if (copy) copy.textContent = footer.copyright;
    },

    attachNavbarEvents() {
        const mobileToggle = document.getElementById('mobile-toggle');
        const navLinks = document.getElementById('navbar-links');
        const searchToggle = document.getElementById('search-toggle');
        const searchOverlay = document.getElementById('search-overlay');
        const searchClose = document.getElementById('search-close');

        mobileToggle?.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.querySelector('i').classList.toggle('bi-list');
            mobileToggle.querySelector('i').classList.toggle('bi-x');
        });

        searchToggle?.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            document.getElementById('search-input')?.focus();
        });

        searchClose?.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });
    },

    attachAdminNavbarEvents() {
        const hamburgerBtn = document.querySelector('.hamburger-btn');
        const secondarySidebar = document.getElementById('admin-secondary-sidebar');
        
        if (hamburgerBtn && secondarySidebar) {
            hamburgerBtn.addEventListener('click', () => {
                if (secondarySidebar.style.display === 'none') {
                    secondarySidebar.style.display = 'flex';
                } else {
                    secondarySidebar.style.display = 'none';
                }
            });
        }
    }
};

// Listen for updates and initial load
window.addEventListener('siteDataLoaded', () => {
    Components.renderNavbar();
    Components.renderFooter();
    Components.attachAdminNavbarEvents();
});

window.addEventListener('cartUpdated', () => Components.renderNavbar());
window.addEventListener('wishlistUpdated', () => Components.renderNavbar());

// Fallback if data is already loaded
if (!Site.loading) {
    Components.renderNavbar();
    Components.renderFooter();
    setTimeout(() => Components.attachAdminNavbarEvents(), 100);
}

