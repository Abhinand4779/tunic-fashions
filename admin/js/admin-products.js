const API_URL = 'http://localhost:8085/api';

const AdminProducts = {
    products: [],

    async init() {
        if (!Auth.admin) {
            window.location.href = 'login.html';
            return;
        }
        await this.fetchProducts();
        this.renderTable();
    },

    async fetchProducts() {
        try {
            const res = await fetch(API_URL + '/products', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if(res.ok) {
                this.products = await res.json();
            } else {
                console.error('Failed to load products');
            }
        } catch(err) {
            console.error('API Connection Error', err);
        }
    },

    renderTable() {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;

        if (this.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No products found.</td></tr>';
            return;
        }

        tbody.innerHTML = this.products.map(p => {
            const id = p.id || p._id;
            return \
            <tr>
                <td style="color: #64748b;">\</td>
                <td>
                    <div style="display: flex; align-items: center; color: #334155; font-weight: 500;">
                        <img src="\" class="product-thumbnail" alt="\">
                        \
                    </div>
                </td>
                <td>
                    <label class="toggle-switch">
                        <input type="checkbox" \ onchange="AdminProducts.toggle('\', 'topSelling', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </td>
                <td>
                    <label class="toggle-switch">
                        <input type="checkbox" \ onchange="AdminProducts.toggle('\', 'buyTwoOneFree', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </td>
                <td>
                    <select class="warehouse-select">
                        <option>Choose...</option>
                        <option selected>\</option>
                    </select>
                </td>
                <td><i class="bi bi-layers" style="color:#64748b; font-size: 1.1rem;"></i></td>
                <td><i class="bi bi-list-task" style="color:#64748b; font-size: 1.1rem; margin-right:5px;"></i><i class="bi bi-chevron-double-right" style="color:#64748b; font-size: 0.9rem;"></i></td>
                <td><i class="bi bi-arrows-collapse" style="color:#64748b; font-size: 1.1rem;"></i></td>
                <td>
                    <div class="action-icons">
                        <i class="bi bi-pencil-fill" onclick="window.location.href='product-create.html?id=\'" title="Edit"></i>
                        <i class="bi bi-trash-fill" onclick="AdminProducts.deleteProduct('\')" title="Delete"></i>
                    </div>
                </td>
            </tr>
        \}).join('');
    },

    async toggle(id, field, value) {
        console.log(\Product \: \ changed to \\);
        // Normally we'd fire a PUT request here to update the DB flag
    },

    async deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const res = await fetch(API_URL + '/products/' + id, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }
                });
                if(res.ok) {
                    this.products = this.products.filter(p => (p.id || p._id) !== id);
                    this.renderTable();
                } else {
                    alert('Failed to delete product from database.');
                }
            } catch(err) {
                console.error(err);
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AdminProducts.init();
});


