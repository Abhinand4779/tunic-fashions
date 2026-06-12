/**
 * ASTRA - Admin CMS Logic
 * Replaces AdminCMS.jsx
 */

const AdminCMS = {
    activeTab: 'hero',
    heroData: {}, couponData: {}, footerData: {}, highlightsData: [], categoriesData: [], navCats: [],

    init() {
        if (!Auth.admin) { window.location.href = '../profile.html'; return; }
        const config = Site.config;
        this.heroData = { ...config.hero };
        this.couponData = { ...config.coupon };
        this.footerData = { ...config.footer };
        this.highlightsData = [...config.highlights];
        this.categoriesData = [...config.homeCategories];
        this.navCats = [...config.navCategories];
        this.render();
    },

    render() {
        const wrap = document.getElementById('admin-content');
        if (!wrap) return;

        wrap.innerHTML = `
            <div class="admin-cms px-4">
                <div class="page-header mb-4">
                    <h2 class="page-title">Website Content Manager (CMS)</h2>
                    <p class="page-subtitle">Fully manage your store's banners, navigation, and promotional content.</p>
                </div>

                <div class="cms-tabs mb-4">
                    <button class="tab-btn ${this.activeTab === 'hero' ? 'active' : ''}" onclick="AdminCMS.setTab('hero')">Banners & Offers</button>
                    <button class="tab-btn ${this.activeTab === 'nav' ? 'active' : ''}" onclick="AdminCMS.setTab('nav')">Navigation Bar</button>
                    <button class="tab-btn ${this.activeTab === 'home' ? 'active' : ''}" onclick="AdminCMS.setTab('home')">Home Sections</button>
                    <button class="tab-btn ${this.activeTab === 'footer' ? 'active' : ''}" onclick="AdminCMS.setTab('footer')">Branding & Footer</button>
                </div>

                <div class="cms-content-area">
                    ${this.renderActiveTab()}
                </div>
            </div>`;
    },

    setTab(t) { this.activeTab = t; this.render(); },

    renderActiveTab() {
        if (this.activeTab === 'hero') {
            return `
                <section class="cms-section premium-card p-4">
                    <h3>Hero Banner Settings</h3>
                    <form onsubmit="AdminCMS.saveSection(event, 'hero', AdminCMS.heroData)">
                        <div class="mb-3">
                            <label class="form-label small fw-bold">Banner Image</label>
                            ${this.heroData.bannerImg ? `<img src="${this.heroData.bannerImg}" style="max-width:300px;display:block;margin-bottom:10px;border-radius:8px">` : ''}
                            <input type="file" class="form-control" onchange="AdminCMS.handleFileChange(event, 'hero', 'bannerImg')">
                        </div>
                        <div class="row g-3">
                            <div class="col-md-6"><label class="form-label small fw-bold">Title</label><input type="text" class="form-control" value="${this.heroData.title}" oninput="AdminCMS.heroData.title=this.value"></div>
                            <div class="col-md-6"><label class="form-label small fw-bold">Button Text</label><input type="text" class="form-control" value="${this.heroData.btnText}" oninput="AdminCMS.heroData.btnText=this.value"></div>
                            <div class="col-12"><label class="form-label small fw-bold">Subtitle</label><textarea class="form-control" oninput="AdminCMS.heroData.subtitle=this.value">${this.heroData.subtitle}</textarea></div>
                        </div>
                        <button class="btn btn-dark mt-4">Save Banner</button>
                    </form>
                </section>

                <section class="cms-section premium-card p-4 mt-4">
                    <h3>Coupon Manager</h3>
                    <form onsubmit="AdminCMS.saveSection(event, 'coupon', AdminCMS.couponData)">
                        <div class="row g-3">
                            <div class="col-md-6"><label class="form-label small fw-bold">Label</label><input type="text" class="form-control" value="${this.couponData.discount}" oninput="AdminCMS.couponData.discount=this.value"></div>
                            <div class="col-md-6"><label class="form-label small fw-bold">Code</label><input type="text" class="form-control" value="${this.couponData.code}" oninput="AdminCMS.couponData.code=this.value"></div>
                        </div>
                        <button class="btn btn-dark mt-4">Save Coupon</button>
                    </form>
                </section>`;
        }
        if (this.activeTab === 'nav') {
            return `
                <section class="cms-section premium-card p-4">
                    <div class="d-flex justify-content-between mb-3"><h3>Navigation Links</h3><button class="btn btn-sm btn-outline-dark" onclick="AdminCMS.addNavItem()">+ Add Link</button></div>
                    <div class="nav-list">
                        ${this.navCats.map((cat, i) => `
                            <div class="cms-item-card border p-3 mb-3 relative">
                                <button class="btn btn-sm text-danger absolute right-2 top-2" onclick="AdminCMS.deleteNavItem(${i})"><i class="bi bi-trash"></i></button>
                                <div class="row g-3">
                                    <div class="col-md-6"><input type="text" class="form-control" value="${cat.name}" oninput="AdminCMS.navCats[${i}].name=this.value"></div>
                                    <div class="col-md-6"><input type="text" class="form-control" value="${cat.path}" oninput="AdminCMS.navCats[${i}].path=this.value"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-dark" onclick="AdminCMS.saveNav()">Update Navigation</button>
                </section>`;
        }
        if (this.activeTab === 'footer') {
            return `
                <section class="cms-section premium-card p-4">
                    <h3>Store Identity</h3>
                    <form onsubmit="AdminCMS.saveSection(event, 'footer', AdminCMS.footerData)">
                        <div class="mb-3"><label class="form-label small fw-bold">Store Name</label><input type="text" class="form-control" value="${this.footerData.storeName}" oninput="AdminCMS.footerData.storeName=this.value"></div>
                        <div class="mb-3"><label class="form-label small fw-bold">Description</label><textarea class="form-control" oninput="AdminCMS.footerData.description=this.value">${this.footerData.description}</textarea></div>
                        <button class="btn btn-dark">Save Identity</button>
                    </form>
                </section>`;
        }
        return `<div>Coming Soon</div>`;
    },

    handleFileChange(e, section, field) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { this[`${section}Data`][field] = reader.result; this.render(); };
            reader.readAsDataURL(file);
        }
    },

    addNavItem() { this.navCats.push({ name: 'New Link', path: '/shop', dropdown: [] }); this.render(); },
    deleteNavItem(i) { if (confirm("Delete link?")) { this.navCats.splice(i, 1); this.render(); } },

    async saveSection(e, section, data) {
        if (e) e.preventDefault();
        const success = await Site.updateSection(section, data);
        if (success) alert("Updated successfully!");
    },

    async saveNav() {
        const success = await Site.updateSection('navCategories', this.navCats);
        if (success) alert("Navigation updated!");
    }
};

AdminCMS.init();
Components.renderAdminSidebar();
