/**
 * HUE - Home Page Logic
 * Replaces Home.jsx logic
 */

const HomeHandler = {
    currentSlide: 0,
    promoSlide: 0,
    testiSlide: 0,
    heroInterval: null,
    promoInterval: null,
    testiInterval: null,

    init() {
        // Initial check in case data loaded before script
        if (!Site.loading && Site.config) {
            this.renderAll();
        }

        window.addEventListener('siteDataLoaded', () => {
            console.log("Home: Site data loaded event received");
            this.renderAll();
        });

        this.startAutoAdvance();
    },

    renderAll() {
        if (Site.loading) return;
        const config = Site.config;

        this.renderHero(config);
        this.renderCoupon(config);
        this.renderHighlights(config);
        this.renderPromo(config);
        this.renderCategories(config);
        this.renderTestimonials(config);
    },

    renderHero(config) {
        const wrap = document.getElementById('hero-slider-wrap');
        if (!wrap) return;

        const sliders = (config.heroSliders || []).filter(s => s.image);
        const hasSliders = sliders.length > 0;

        if (hasSliders) {
            const current = this.currentSlide;
            wrap.innerHTML = `
                ${sliders.map((slide, index) => `
                    <div class="slider-item ${index === current ? 'active' : ''}" 
                         style="position: ${index === current ? 'relative' : 'absolute'}; 
                                opacity: ${index === current ? 1 : 0}; width: 100%; height: 100%; top:0; left:0; transition: opacity 0.8s ease-in-out;">
                        <img src="${slide.image}" alt="${slide.title}" class="banner-img" style="width:100%; height:100%; object-fit:cover;">
                        <div class="banner-content">
                            <h2>${slide.title}</h2>
                            <p>${slide.subtitle}</p>
                            <a href="${config.hero.btnLink}" class="hero-btn">${config.hero.btnText}</a>
                        </div>
                    </div>
                `).join('')}
                <div class="slider-dots" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: ${sliders.length > 1 ? 'flex' : 'none'}; gap: 10px; z-index: 10;">
                    ${sliders.map((_, index) => `
                        <button style="width: 12px; height: 12px; border-radius: 50%; border: none; background-color: ${index === current ? '#d4af37' : 'rgba(255,255,255,0.5)'}; cursor: pointer; transition: all 0.3s;" onclick="HomeHandler.setHero(${index})"></button>
                    `).join('')}
                </div>
            `;
        } else {
            // Fallback to static hero
            wrap.innerHTML = `
                <div class="slider-item active" style="position: relative; width: 100%; height: 100%;">
                    <img src="${config.hero.bannerImg}" alt="${config.hero.title}" class="banner-img" style="width:100%; height:100%; object-fit:cover;">
                    <div class="banner-content">
                        <h2>${config.hero.title}</h2>
                        <p>${config.hero.subtitle}</p>
                        <a href="${config.hero.btnLink}" class="hero-btn">${config.hero.btnText}</a>
                    </div>
                </div>
            `;
        }
    },

    renderCoupon(config) {
        const wrap = document.getElementById('coupon-wrap');
        if (!wrap || !config.coupon) return;

        wrap.innerHTML = `
            <div class="coupon-card">
                <span class="coupon-label">${config.coupon.label}</span>
                <h3 class="coupon-discount">${config.coupon.discount}</h3>
                <p class="coupon-text">${config.coupon.text}</p>
                <div class="coupon-code-box" onclick="HomeHandler.copyCoupon('${config.coupon.code}')">
                    <span class="code-text">${config.coupon.code}</span>
                    <i class="bi bi-files ms-2"></i>
                </div>
                <p class="tap-text">Tap to copy code</p>
            </div>
        `;
    },

    renderHighlights(config) {
        const wrap = document.getElementById('highlights-wrap');
        if (!wrap || !config.highlights) return;

        wrap.innerHTML = config.highlights.map(item => `
            <div class="highlight-item">
                <img src="${item.image}" alt="${item.title}" class="highlight-img">
                <div class="highlight-overlay">
                    <span class="highlight-subtitle">${item.subtitle}</span>
                    <h3 class="highlight-title">${item.title}</h3>
                    <a href="${item.link}" class="highlight-link">View More</a>
                </div>
            </div>
        `).join('');
    },

    renderPromo(config) {
        const wrap = document.getElementById('promo-carousel-wrap');
        if (!wrap || !config.promoCarousel) return;

        const current = this.promoSlide;
        wrap.innerHTML = `
            <div class="promo-carousel-header">
                <p class="promo-section-label">Our Collections</p>
                <h2 class="promo-section-title">Crafted for You</h2>
            </div>
            <div class="promo-carousel-track">
                ${config.promoCarousel.map((slide, index) => `
                    <div class="promo-slide ${index === current ? 'promo-slide--active' : ''} ${slide.align === 'right' ? 'promo-slide--reverse' : ''}">
                        <div class="promo-slide__img-wrap">
                            <img src="${slide.image}" alt="${slide.title}" class="promo-slide__img">
                            <span class="promo-slide__badge">${slide.badge}</span>
                        </div>
                        <div class="promo-slide__content">
                            <p class="promo-slide__eyebrow">HUE — Featured</p>
                            <h2 class="promo-slide__title">${slide.title}</h2>
                            <p class="promo-slide__subtitle">${slide.subtitle}</p>
                            <a href="${slide.link}" class="promo-slide__btn">${slide.btnText}</a>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="promo-carousel-controls">
                <button class="promo-ctrl-btn" onclick="HomeHandler.goPromo(-1)"><i class="bi bi-arrow-left"></i></button>
                <div class="promo-dots">
                    ${config.promoCarousel.map((_, i) => `
                        <button class="promo-dot ${i === current ? 'promo-dot--active' : ''}" onclick="HomeHandler.setPromo(${i})"></button>
                    `).join('')}
                </div>
                <button class="promo-ctrl-btn" onclick="HomeHandler.goPromo(1)"><i class="bi bi-arrow-right"></i></button>
            </div>
        `;
    },

    renderCategories(config) {
        const wrap = document.getElementById('home-categories-wrap');
        if (!wrap || !config.homeCategories) return;

        wrap.innerHTML = config.homeCategories.map(cat => `
            <a href="${cat.path}" class="category-card">
                <div class="category-image-wrapper">
                    <img src="${cat.image}" alt="${cat.name}">
                </div>
                <h3 class="category-name">${cat.name}</h3>
            </a>
        `).join('');
    },

    renderTestimonials(config) {
        const wrap = document.getElementById('testimonials-wrap');
        if (!wrap || !config.testimonials) return;

        const current = this.testiSlide;
        wrap.innerHTML = `
            <div class="section-header text-center mb-5">
                <p class="label-style">Customer Stories</p>
                <h2 class="title-style">Loved by our Community</h2>
            </div>
            <div class="testimonials-carousel-container">
                <div class="testimonials-wrapper">
                    ${config.testimonials.map((item, index) => `
                        <div class="testimonial-slide ${index === current ? 'testimonial-slide--active' : ''}">
                            <div class="testimonial-card">
                                <div class="testimonial-header">
                                    <div class="user-icon">${item.name.charAt(0)}</div>
                                    <div class="user-info">
                                        <span class="user-name">${item.name}</span>
                                        <span class="user-handle">${item.handle}</span>
                                    </div>
                                    <i class="bi bi-instagram ms-auto insta-icon"></i>
                                </div>
                                <div class="testimonial-content">
                                    <div class="rating">
                                        ${[...Array(item.rating || 5)].map(() => `<i class="bi bi-star-fill active"></i>`).join('')}
                                    </div>
                                    <p class="testimonial-text">"${item.text}"</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="testi-dots">
                    ${config.testimonials.map((_, i) => `
                        <button class="testi-dot ${i === current ? 'testi-dot--active' : ''}" onclick="HomeHandler.setTesti(${i})"></button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    setHero(i) { this.currentSlide = i; this.renderHero(Site.config); },
    setPromo(i) { this.promoSlide = i; this.renderPromo(Site.config); },
    setTesti(i) { this.testiSlide = i; this.renderTestimonials(Site.config); },

    goPromo(dir) {
        const total = Site.config.promoCarousel.length;
        this.promoSlide = (this.promoSlide + dir + total) % total;
        this.renderPromo(Site.config);
    },

    copyCoupon(code) {
        navigator.clipboard.writeText(code);
        alert(`Coupon "${code}" copied to clipboard!`);
    },

    startAutoAdvance() {
        this.heroInterval = setInterval(() => {
            if (!Site.loading && Site.config.heroSliders) {
                this.currentSlide = (this.currentSlide + 1) % Site.config.heroSliders.length;
                this.renderHero(Site.config);
            }
        }, 5000);

        this.promoInterval = setInterval(() => {
            if (!Site.loading && Site.config.promoCarousel) {
                this.promoSlide = (this.promoSlide + 1) % Site.config.promoCarousel.length;
                this.renderPromo(Site.config);
            }
        }, 4500);

        this.testiInterval = setInterval(() => {
            if (!Site.loading && Site.config.testimonials) {
                this.testiSlide = (this.testiSlide + 1) % Site.config.testimonials.length;
                this.renderTestimonials(Site.config);
            }
        }, 5500);
    }
};

HomeHandler.init();


window.addEventListener('currencyUpdated', () => { HomeHandler.renderHero(); HomeHandler.renderPromo(); });
