/**
 * admin-home-brands.js
 * Logic for managing Home Brands from the Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {


    const tableBody = document.getElementById('hb-table-body');
    const form = document.getElementById('hbForm');
    const searchInput = document.querySelector('.search-mini input');
    
    // Mock Data Fallback
    let items = [
        { id: 1, image: '../assets/Logo/tunic_logo.png', link: 'https://example.com/brand1' }
    ];

    async function fetchItems() {
        try {
            const res = await fetch(`${API_BASE_URL}/home-brands`);
            if (res.ok) {
                items = await res.json();
            }
        } catch (e) {
            console.warn('Backend not reachable, using mock home brands.');
        }
        renderTable();
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const filterText = searchInput.value.toLowerCase();
        
        const filtered = items.filter(c => (c.link || '').toLowerCase().includes(filterText));

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-4">No home brands found.</td></tr>`;
            return;
        }

        filtered.forEach((item, index) => {
            tableBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td><img src="${item.image}" alt="Home Brand" class="cat-thumbnail" style="width: 100px; object-fit: contain;"></td>
                    <td><a href="${item.link}" target="_blank" style="color: var(--admin-primary); text-decoration: none;">${item.link || 'N/A'}</a></td>
                    <td>
                        <div class="action-icons">
                            <i class="fa fa-trash" onclick="deleteItem(${item.id})" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    window.deleteItem = async function(id) {
        if (!confirm('Are you sure you want to delete this Home Brand?')) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/home-brands/${id}`, { method: 'DELETE' });
            if (res.ok) {
                items = items.filter(c => c.id !== id);
                renderTable();
            }
        } catch (e) {
            items = items.filter(c => c.id !== id);
            renderTable();
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const link = form.querySelector('input[name="link"]').value;
        
        const newItem = {
            id: Date.now(),
            image: '../assets/Logo/tunic_logo.png', // Mock upload
            link: link
        };

        try {
            const res = await fetch(`${API_BASE_URL}/home-brands`, {
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

        document.getElementById('hbModalOverlay').style.display = 'none';
        form.reset();
        renderTable();
    });

    searchInput.addEventListener('input', renderTable);

    // Init
    fetchItems();
});

