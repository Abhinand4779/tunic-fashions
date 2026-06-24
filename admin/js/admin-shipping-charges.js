/**
 * admin-shipping-charges.js
 * Logic for managing Shipping Charges from the Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {

    const tableBody = document.getElementById('shipping-table-body');
    const form = document.getElementById('shippingForm');
    const searchInput = document.querySelector('.search-mini input');
    
    let items = [];

    async function fetchItems() {
        try {
            const res = await fetch(`${API_BASE_URL}/shipping`);
            if (res.ok) {
                items = await res.json();
            }
        } catch (e) {
            console.warn('Backend not reachable');
        }
        renderTable();
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const filterText = searchInput.value.toLowerCase();
        
        // Match API column 'country' instead of 'location'
        const filtered = items.filter(c => c.country.toLowerCase().includes(filterText));

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">No shipping zones found.</td></tr>`;
            return;
        }

        filtered.forEach((item, index) => {
            const feeDisplay = item.rate > 0 ? `$${parseFloat(item.rate).toFixed(2)}` : '<span style="color: #166534; font-weight: 600;">Free</span>';

            tableBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td style="font-weight: 600; color: #334155;">${item.country}</td>
                    <td>${feeDisplay}</td>
                    <td>N/A</td>
                    <td>
                        <div class="action-icons">
                            <i class="fa fa-trash" onclick="deleteItem(${item.id})" title="Delete" style="cursor:pointer; color: #dc3545;"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    window.deleteItem = async function(id) {
        if (!confirm('Are you sure you want to delete this Shipping Rate?')) return;
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`${API_BASE_URL}/admin/shipping/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchItems();
            }
        } catch (e) {
            console.error(e);
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const country = form.querySelector('select[name="location"]').value;
        const rate = form.querySelector('input[name="fee"]').value;
        const token = localStorage.getItem('adminToken');

        try {
            const res = await fetch(`${API_BASE_URL}/admin/shipping`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ country, rate })
            });
            if (res.ok) {
                fetchItems();
            }
        } catch (e) {
            console.error(e);
        }

        document.getElementById('shippingModalOverlay').style.display = 'none';
        form.reset();
    });

    searchInput.addEventListener('input', renderTable);

    fetchItems();
});
