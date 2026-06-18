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
        if (navLinks) {
            navLinks.style.display = 'flex';
            navLinks.style.gap = '25px';
            navLinks.style.alignItems = 'center';
            navLinks.style.flexWrap = 'wrap';

            let categories = [];
            if (typeof LocalDB !== 'undefined') {
                categories = LocalDB.getCategories();
            } else if (typeof Site !== 'undefined' && Site.config && Site.config.navCategories) {
                categories = Site.config.navCategories.map(c => c.name);
            }
            
            let navLinksData = [];
            if (typeof Site !== 'undefined' && Site.config && Site.config.nav) {
                navLinksData = Site.config.nav;
            } else {
                navLinksData = [
                    { label: "HOME", url: "index.html" },
                    { label: "SHOP", url: "shop.html" },
                    { label: "CATEGORIES", url: "shop.html" }
                ];
            }

            let newHtml = navLinksData.map(link => {
                let linkLabel = link && link.label ? String(link.label) : '';
                let isCategoryLink = linkLabel.toUpperCase() === 'CATEGORIES';
                let dropdownHtml = '';
                
                if (isCategoryLink && categories.length > 0) {
                    let megaMenuInnerHtml = categories.map(cat => {
                        let subs = [];
                        if (typeof LocalDB !== 'undefined') {
                            subs = LocalDB.getSubCategories(cat);
                        } else if (typeof Site !== 'undefined' && Site.config && Site.config.navCategories) {
                            let catObj = Site.config.navCategories.find(c => c.name === cat);
                            if (catObj && catObj.dropdown) subs = catObj.dropdown.map(d => d.name || d);
                        }
                        
                        let subsHtml = subs.length > 0 
                            ? `<ul style="list-style: none; padding: 0; margin-top: 10px;">
                                ${subs.map(sub => `<li><a href="shop.html?category=${encodeURIComponent(cat)}&sub=${encodeURIComponent(sub)}" class="dropdown-link" style="padding: 5px 0; color: #aaa; text-transform: capitalize;">${sub}</a></li>`).join('')}
                               </ul>` 
                            : '';
                            
                        return `<div>
                                    <a href="shop.html?category=${encodeURIComponent(cat)}" class="mega-menu-link" style="font-weight: bold; font-size: 14px; border-bottom: 1px solid #333; display: block; padding-bottom: 5px; margin-bottom: 5px;">${cat}</a>
                                    ${subsHtml}
                                </div>`;
                    }).join('');
                    
                    dropdownHtml = `<div class="mega-menu"><div class="mega-menu-content">${megaMenuInnerHtml}</div></div>`;
                }

                return `<div class="nav-item"><a href="${link.url}" class="nav-link" style="text-transform: uppercase;">${link.label} ${isCategoryLink && categories.length > 0 ? '<i class="bi bi-chevron-down ms-1" style="font-size: 0.7em"></i>' : ''}</a>${dropdownHtml}</div>`;
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

        // Setup Country Dropdown
        const allCountries = [
            "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan",
            "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi",
            "Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czechia",
            "Denmark","Djibouti","Dominica","Dominican Republic",
            "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
            "Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
            "Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
            "Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Korea","Kosovo","Kuwait","Kyrgyzstan",
            "Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
            "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar",
            "Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Macedonia","Norway",
            "Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar",
            "Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
            "Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
            "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
            "Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
        ];
        
                                                const countrySelector = document.querySelector('.country-selector');
        if (countrySelector) {
            const dropdown = countrySelector.querySelector('.dropdown');
            countrySelector.addEventListener('mouseleave', () => { if (dropdown) dropdown.style.display = ''; });
        }

        const countryListEls = document.querySelectorAll('.country-dropdown-list');
        const searchInputs = document.querySelectorAll('.country-search-input');
        
        countryListEls.forEach((listEl, idx) => {
            const searchInput = searchInputs[idx];
            if (!listEl) return;
            
            const renderList = (filter = "") => {
                listEl.innerHTML = allCountries
                    .filter(c => c.toLowerCase().includes(filter.toLowerCase()))
                    .map(c => `<a href="#" class="dropdown-link country-link" data-country="${c}" style="padding: 8px 10px; display: block; color: #fff;">${c}</a>`)
                    .join("");
                    
                listEl.querySelectorAll('.country-link').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (typeof Currency !== "undefined") {
                            Currency.setCountry(e.target.getAttribute('data-country'));
                            const dropdown = e.target.closest('.dropdown');
                            if (dropdown) {
                                dropdown.style.setProperty('display', 'none', 'important');
                            }
                        }
                    });
                });
            };
            renderList();
            if (searchInput) {
                searchInput.addEventListener("input", (e) => renderList(e.target.value));
            }
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

window.addEventListener('siteDataLoaded', () => {
    Components.renderNavbar();
    Components.renderFooter();
    Components.attachNavbarEvents();
    Components.attachAdminNavbarEvents();

    // Populate Promo Banner Marquee
    const marqueeContainer = document.querySelector('.promo-banner-marquee');
    const marqueeContent = document.querySelector('.marquee-content');
    if (marqueeContainer && marqueeContent) {
        if (window.Site && window.Site.config && window.Site.config.coupon && window.Site.config.coupon.text) {
            const promoText = window.Site.config.coupon.text;
            let spansHtml = '';
            for (let i = 0; i < 15; i++) {
                spansHtml += `<span>${promoText}</span>`;
            }
            marqueeContent.innerHTML = spansHtml;
            marqueeContainer.style.display = 'flex';
        } else {
            marqueeContainer.style.display = 'none';
        }
    }
});

window.addEventListener('cartUpdated', () => Components.renderNavbar());
window.addEventListener('wishlistUpdated', () => Components.renderNavbar());

if (typeof Site !== 'undefined' && !Site.loading) {
    Components.renderNavbar();
    Components.renderFooter();
    Components.attachNavbarEvents();
    setTimeout(() => Components.attachAdminNavbarEvents(), 100);
}


