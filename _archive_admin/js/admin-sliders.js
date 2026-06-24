/**
 * TUNIC FASHIONS - Admin Sliders Logic
 * Replaces Hero Slider management
 */

const AdminSliders = {
    init() {
        if (!Auth.admin) { window.location.href = '../profile.html'; return; }
        this.render();
        window.addEventListener('siteDataLoaded', () => this.render());
    },

    render() {
        if (Site.loading) return;
        const sliders = Site.config.heroSliders || [];
        const wrap = document.getElementById('admin-content');
        if (!wrap) return;

        wrap.innerHTML = `
            <div class="admin-sliders px-4">
                <div class="page-header d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 class="page-title">Hero Sliders</h2>
                        <p class="page-subtitle">Manage multiple banners for your homepage</p>
                    </div>
                    <button class="btn btn-dark" onclick="AdminSliders.addSlide()">Add New Slide</button>
                </div>

                <div class="sliders-list" id="sliders-list">
                    ${sliders.map((s, i) => `
                        <div class="slider-edit-card premium-card p-4 mb-3 border">
                            <div class="row g-3">
                                <div class="col-md-3">
                                    <div class="slider-preview rounded border bg-light text-center" style="height:120px;overflow:hidden">
                                        <img src="${s.image}" style="height:100%; width:100%; object-fit:cover">
                                    </div>
                                    <input type="file" class="form-control form-control-sm mt-2" onchange="AdminSliders.handleFileChange(event, ${i})">
                                </div>
                                <div class="col-md-9">
                                    <div class="row g-2">
                                        <div class="col-12"><label class="form-label small fw-bold">Title</label><input type="text" class="form-control" value="${s.title}" id="slide-title-${i}"></div>
                                        <div class="col-12"><label class="form-label small fw-bold">Subtitle</label><input type="text" class="form-control" value="${s.subtitle}" id="slide-sub-${i}"></div>
                                    </div>
                                    <div class="d-flex justify-content-end gap-2 mt-3">
                                        <button class="btn btn-sm btn-outline-danger" onclick="AdminSliders.deleteSlide(${i})">Delete</button>
                                        <button class="btn btn-sm btn-dark" onclick="AdminSliders.saveSlide(${i})">Update Slide</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    },

    handleFileChange(e, i) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { Site.config.heroSliders[i].image = reader.result; this.render(); };
            reader.readAsDataURL(file);
        }
    },

    addSlide() {
        const sliders = [...Site.config.heroSliders, { image: '', title: 'New Banner', subtitle: 'Add exciting details here' }];
        Site.updateSection('heroSliders', sliders).then(() => this.render());
    },

    deleteSlide(i) {
        if (!confirm("Delete?")) return;
        const sliders = Site.config.heroSliders.filter((_, idx) => idx !== i);
        Site.updateSection('heroSliders', sliders).then(() => this.render());
    },

    saveSlide(i) {
        const sliders = [...Site.config.heroSliders];
        sliders[i].title = document.getElementById(`slide-title-${i}`).value;
        sliders[i].subtitle = document.getElementById(`slide-sub-${i}`).value;
        Site.updateSection('heroSliders', sliders).then(() => alert("Saved!"));
    }
};

AdminSliders.init();
Components.renderAdminSidebar();

