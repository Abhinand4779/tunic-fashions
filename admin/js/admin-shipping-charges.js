/**
 * admin-shipping-charges.js
 * Logic for managing Shipping Charges from the Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {


    const tableBody = document.getElementById('shipping-table-body');
    const form = document.getElementById('shippingForm');
    const searchInput = document.querySelector('.search-mini input');
    
    // Mock Data Fallback
    let items = [
        { id: 1, location: 'Domestic (India)', fee: 0, minAmount: 0 },
        { id: 2, location: 'International', fee: 500, minAmount: 10000 }
    ];

    async function fetchItems() {
        try {
            const res = await fetch(`${API_BASE_URL}/shipping-charges`);
            if (res.ok) {
                items = await res.json();
            }
        } catch (e) {
            console.warn('Backend not reachable, using mock shipping charges.');
        }
        renderTable();
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const filterText = searchInput.value.toLowerCase();
        
        const filtered = items.filter(c => c.location.toLowerCase().includes(filterText));

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">No shipping zones found.</td></tr>`;
            return;
        }

        filtered.forEach((item, index) => {
            const feeDisplay = item.fee > 0 ? `₹${item.fee}` : '<span style="color: #166534; font-weight: 600;">Free</span>';
            const thresholdDisplay = item.minAmount > 0 ? `Free above ₹${item.minAmount}` : 'N/A';

            tableBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td style="font-weight: 600; color: #334155;">${item.location}</td>
                    <td>${feeDisplay}</td>
                    <td>${thresholdDisplay}</td>
                    <td>
                        <div class="action-icons">
                            <i class="fa fa-edit" onclick="editItem(${item.id})" title="Edit"></i>
                            <i class="fa fa-trash" onclick="deleteItem(${item.id})" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    window.deleteItem = async function(id) {
        if (!confirm('Are you sure you want to delete this Shipping Zone?')) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/shipping-charges/${id}`, { method: 'DELETE' });
            if (res.ok) {
                items = items.filter(c => c.id !== id);
                renderTable();
            }
        } catch (e) {
            items = items.filter(c => c.id !== id);
            renderTable();
        }
    };

    window.editItem = function(id) {
        const item = items.find(c => c.id === id);
        if(!item) return;
        
        document.getElementById('shippingModalOverlay').style.display = 'flex';
        // In a real app, populate the form fields here
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const location = form.querySelector('input[name="location"]').value;
        const fee = form.querySelector('input[name="fee"]').value;
        const minAmount = form.querySelector('input[name="minAmount"]').value;
        
        const newItem = {
            id: Date.now(),
            location: location,
            fee: parseFloat(fee) || 0,
            minAmount: parseFloat(minAmount) || 0
        };

        try {
            const res = await fetch(`${API_BASE_URL}/shipping-charges`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
            if (res.ok) {
                const saved = await res.json();
                items.push(saved);
            }
        } catch (e) {
            items.push(newItem);
        }

        document.getElementById('shippingModalOverlay').style.display = 'none';
        form.reset();
        renderTable();
    });

    searchInput.addEventListener('input', renderTable);

    // Init
    fetchItems();
});

