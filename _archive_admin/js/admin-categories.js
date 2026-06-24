/**
 * TUNIC FASHIONS - Admin Categories Logic
 * Replaces AdminCategories.jsx
 */

const AdminCategories = {
    newCat: { section: 'Women', name: '', count: 0 },

    init() {
        if (!Auth.admin) { window.location.href = '../profile.html'; return; }
        this.render();
        window.addEventListener('siteDataLoaded', () => this.render());
    },

    render() {
        const config = Site.config;
        const categories = config?.sectionCategories || { women: [], men: [], kids: [] };

        const flattenedCats = [
            ...(categories.women || []).map(c => ({ ...c, section: 'Women' })),
            ...(categories.men || []).map(c => ({ ...c, section: 'Men' })),
            ...(categories.kids || []).map(c => ({ ...c, section: 'Kids' })),
        ];

        const wrap = document.getElementById('admin-content');
        if (!wrap) return;

        wrap.innerHTML = `
            <div class="admin-categories px-4">
                <h2 class="page-title mb-4">Category Management</h2>

                <div class="row g-4">
                    <div class="col-md-4">
                        <div class="cat-form-card premium-card p-4">
                            <h3>Add New Category Item</h3>
                            <form onsubmit="AdminCategories.handleAdd(event)">
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Section</label>
                                    <select class="form-select" id="cat-section"><option>Women</option><option>Men</option><option>Kids</option></select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Category Name</label>
                                    <input type="text" class="form-control" id="cat-name" placeholder="e.g. Bangles" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Product Count (Display only)</label>
                                    <input type="number" class="form-control" id="cat-count" value="0" required>
                                </div>
                                <button type="submit" class="btn btn-dark w-100">Add Category</button>
                            </form>
                        </div>
                    </div>

                    <div class="col-md-8">
                        <div class="cat-list-card premium-card p-4">
                            <h3>Current Categories (Total: ${flattenedCats.length})</h3>
                            <div class="table-responsive">
                                <table class="admin-table custom-table">
                                    <thead>
                                        <tr>
                                            <th>Section</th>
                                            <th>Category</th>
                                            <th>Count</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${flattenedCats.map(c => `
                                            <tr>
                                                <td><span class="badge ${c.section.toLowerCase()}">${c.section}</span></td>
                                                <td><strong>${c.name}</strong></td>
                                                <td>${c.count} items</td>
                                                <td>
                                                    <button class="btn btn-sm text-danger" onclick="AdminCategories.handleDelete('${c.section}', '${c.name}')"><i class="bi bi-trash"></i></button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    async handleAdd(e) {
        e.preventDefault();
        const section = document.getElementById('cat-section').value.toLowerCase();
        const name = document.getElementById('cat-name').value;
        const count = parseInt(document.getElementById('cat-count').value);

        const config = Site.config;
        const categories = { ...config.sectionCategories };
        categories[section] = [...(categories[section] || []), { name, count }];

        const success = await Site.updateSection('sectionCategories', categories);
        if (success) { alert("Category added!"); this.render(); }
    },

    async handleDelete(section, name) {
        if (!confirm(`Delete category "${name}"?`)) return;
        const secKey = section.toLowerCase();
        const config = Site.config;
        const categories = { ...config.sectionCategories };
        categories[secKey] = categories[secKey].filter(c => c.name !== name);

        const success = await Site.updateSection('sectionCategories', categories);
        if (success) { alert("Category deleted!"); this.render(); }
    }
};

AdminCategories.init();
Components.renderAdminSidebar();

