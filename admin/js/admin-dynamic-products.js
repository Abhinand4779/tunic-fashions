/**
 * admin-dynamic-products.js
 * Logic for managing Dynamic Products Groups from the Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {


    const tableBody = document.getElementById('dp-table-body');
    const form = document.getElementById('dpForm');
    const searchInput = document.querySelector('.search-mini input');
    
    // Mock Data Fallback
    let items = [
        { id: 1, title: 'Trending This Week', layout: 'Carousel', count: 12, status: 'Active' },
        { id: 2, title: 'New Arrivals', layout: 'Grid', count: 8, status: 'Active' }
    ];

    async function fetchItems() {
        try {
            const res = await fetch(`${API_BASE_URL}/dynamic-products`);
            if (res.ok) {
                items = await res.json();
            }
        } catch (e) {
            console.warn('Backend not reachable, using mock dynamic product groups.');
        }
        renderTable();
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const filterText = searchInput.value.toLowerCase();
        
        const filtered = items.filter(c => c.title.toLowerCase().includes(filterText) || c.layout.toLowerCase().includes(filterText));

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4">No groups found.</td></tr>`;
            return;
        }

        filtered.forEach((item, index) => {
            const badgeClass = item.status === 'Active' ? 'bg-success-light' : 'bg-danger-light';

            tableBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td style="font-weight: 600; color: #334155;">${item.title}</td>
                    <td><span class="badge-status bg-success-light" style="background: #e2e8f0; color: #475569;">${item.layout}</span></td>
                    <td><span style="font-weight: 500;">${item.count || 0}</span> items</td>
                    <td><span class="badge-status ${badgeClass}">${item.status}</span></td>
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
        if (!confirm('Are you sure you want to delete this group?')) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/dynamic-products/${id}`, { method: 'DELETE' });
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
        
        document.getElementById('dpModalOverlay').style.display = 'flex';
        // In a real app, populate the form fields here
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = form.querySelector('input[name="title"]').value;
        const layout = form.querySelector('select[name="layout"]').value;
        const status = form.querySelector('select[name="status"]').value;
        
        const newItem = {
            id: Date.now(),
            title: title,
            layout: layout,
            status: status,
            count: 0 // New groups have 0 products initially
        };

        try {
            const res = await fetch(`${API_BASE_URL}/dynamic-products`, {
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

        document.getElementById('dpModalOverlay').style.display = 'none';
        form.reset();
        renderTable();
    });

    searchInput.addEventListener('input', renderTable);

    // Init
    fetchItems();
});

