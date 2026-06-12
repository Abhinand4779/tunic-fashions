/**
 * ASTRA - Admin Products Logic
 * Replaces AdminProducts.jsx
 */

const AdminProducts = {
    showModal: false,
    editingProduct: null,
    newProduct: {
        name: '', price: '', oldPrice: '', category: '', section: 'Women', description: '', images: ['', '', '', ''], details: ['Material: TBA', 'Weight: TBA']
    },

    init() {
        if (!Auth.admin) { window.location.href = '../profile.html'; return; }
        this.render();
        window.addEventListener('siteDataLoaded', () => this.render());
    },

    render() {
        const products = Site.products || [];
        const wrap = document.getElementById('admin-content');
        if (!wrap) return;

        wrap.innerHTML = `
            <div class="admin-products">
                <div class="page-header d-flex justify-content-between align-items-center mb-4 px-4">
                    <h2 class="page-title">Products</h2>
                    <button class="btn btn-dark" onclick="AdminProducts.openAdd()">
                        <i class="bi bi-plus-lg"></i> Add New Product
                    </button>
                </div>

                <div class="products-table-card mx-4">
                    <div class="table-responsive">
                        <table class="admin-table custom-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Section</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${products.map(p => `
                                    <tr>
                                        <td class="product-cell d-flex align-items-center">
                                            <img src="${p.images?.[0] || '../assets/Logo/original.png'}" style="width:40px;height:40px;object-fit:cover;border-radius:4px" class="me-3">
                                            <span>${p.name}</span>
                                        </td>
                                        <td><span class="badge ${p.section?.toLowerCase()}">${p.section}</span></td>
                                        <td>${p.category}</td>
                                        <td><strong>${p.price}</strong></td>
                                        <td>
                                            <button class="btn btn-sm text-primary" onclick="AdminProducts.openEdit('${p._id || p.id}')"><i class="bi bi-pencil"></i></button>
                                            <button class="btn btn-sm text-danger" onclick="AdminProducts.handleDelete('${p._id || p.id}')"><i class="bi bi-trash"></i></button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                ${this.showModal ? this.renderModal() : ''}
            </div>`;
    },

    renderModal() {
        const config = Site.config;
        const currentSection = (this.newProduct.section || 'Women').toLowerCase();
        const cats = config.sectionCategories[currentSection] || [];

        return `
            <div class="admin-modal-overlay">
                <div class="admin-modal">
                    <div class="modal-header">
                        <h3>${this.editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                        <button class="close-modal" onclick="AdminProducts.closeModal()">&times;</button>
                    </div>
                    <form class="admin-form p-4" onsubmit="AdminProducts.handleSave(event)">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">Name</label>
                                <input type="text" id="p-name" class="form-control" value="${this.newProduct.name || ''}" required>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small fw-bold">Price</label>
                                <input type="text" id="p-price" class="form-control" value="${this.newProduct.price || ''}" required>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small fw-bold">Old Price</label>
                                <input type="text" id="p-oldprice" class="form-control" value="${this.newProduct.oldPrice || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">Section</label>
                                <select id="p-section" class="form-select" onchange="AdminProducts.updateSectionSelect(this.value)">
                                    <option value="Women" ${this.newProduct.section === 'Women' ? 'selected' : ''}>Women</option>
                                    <option value="Men" ${this.newProduct.section === 'Men' ? 'selected' : ''}>Men</option>
                                    <option value="Kids" ${this.newProduct.section === 'Kids' ? 'selected' : ''}>Kids</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">Category</label>
                                <select id="p-category" class="form-select">
                                    <option value="">-- Select --</option>
                                    ${cats.map(c => `<option value="${c.name}" ${this.newProduct.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="col-12">
                                <label class="form-label small fw-bold">Images (Upload 4)</label>
                                <div class="d-flex gap-2">
                                    ${[0, 1, 2, 3].map(i => `
                                        <div class="img-up bg-light border p-1 rounded" style="width:25%; text-align:center">
                                            ${this.newProduct.images[i] ? `<img src="${this.newProduct.images[i]}" style="height:50px;display:block;margin:0 auto 5px">` : ''}
                                            <input type="file" class="form-control form-control-sm" onchange="AdminProducts.handleFileChange(event, ${i})">
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer mt-4 pt-3 border-top">
                            <button type="button" class="btn btn-light me-2" onclick="AdminProducts.closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-dark">Save Product</button>
                        </div>
                    </form>
                </div>
            </div>`;
    },

    openAdd() { this.showModal = true; this.editingProduct = null; this.newProduct = { name: '', price: '', oldPrice: '', category: '', section: 'Women', images: ['', '', '', ''], details: [] }; this.render(); },
    openEdit(id) {
        const p = Site.products.find(x => (x._id || x.id) === id);
        this.editingProduct = p;
        this.newProduct = { ...p, images: p.images || ['', '', '', ''] };
        this.showModal = true;
        this.render();
    },
    closeModal() { this.showModal = false; this.render(); },
    updateSectionSelect(v) { this.newProduct.section = v; this.render(); },

    handleFileChange(e, idx) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { this.newProduct.images[idx] = reader.result; this.render(); };
            reader.readAsDataURL(file);
        }
    },

    async handleSave(e) {
        e.preventDefault();
        const data = {
            ...this.newProduct,
            name: document.getElementById('p-name').value,
            price: document.getElementById('p-price').value,
            oldPrice: document.getElementById('p-oldprice').value,
            section: document.getElementById('p-section').value,
            category: document.getElementById('p-category').value,
            discount: ''
        };

        // Calc discount
        if (data.oldPrice) {
            const cur = parseInt(data.price.replace(/[^\d]/g, ''));
            const old = parseInt(data.oldPrice.replace(/[^\d]/g, ''));
            if (old > cur) data.discount = `${Math.round((old - cur) / old * 100)}%`;
        }

        const token = localStorage.getItem('adminToken');
        const url = `${Site.API_BASE_URL}/products/${this.editingProduct ? (this.editingProduct._id || this.editingProduct.id) : ''}`;
        const method = this.editingProduct ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });

        if (res.ok) { alert("Saved!"); window.location.reload(); }
    },

    async handleDelete(id) {
        if (!confirm("Delete product?")) return;
        const res = await fetch(`${Site.API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (res.ok) window.location.reload();
    }
};

AdminProducts.init();
Components.renderAdminSidebar();
