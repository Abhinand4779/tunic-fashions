/**
 * admin-pages.js
 * Logic for managing Custom Pages from the Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {


    const tableBody = document.getElementById('pages-table-body');
    const form = document.getElementById('pageForm');
    const searchInput = document.querySelector('.search-mini input');
    
    // Mock Data Fallback
    let items = [
        { id: 1, title: 'About Us', slug: 'about-us', status: 'active' },
        { id: 2, title: 'Terms and Conditions', slug: 'terms', status: 'active' },
        { id: 3, title: 'Privacy Policy', slug: 'privacy', status: 'draft' }
    ];

    async function fetchItems() {
        try {
            const res = await fetch(`${API_BASE_URL}/pages`);
            if (res.ok) {
                items = await res.json();
            }
        } catch (e) {
            console.warn('Backend not reachable, using mock pages.');
        }
        renderTable();
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const filterText = searchInput.value.toLowerCase();
        
        const filtered = items.filter(c => c.title.toLowerCase().includes(filterText) || c.slug.toLowerCase().includes(filterText));

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">No pages found.</td></tr>`;
            return;
        }

        filtered.forEach((item, index) => {
            const badgeClass = item.status === 'active' ? 'bg-success-light' : 'bg-warning-light';
            const statusText = item.status === 'active' ? 'Published' : 'Draft';
            
            tableBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td style="font-weight: 600; color: #334155;">${item.title}</td>
                    <td><a href="/${item.slug}" target="_blank" style="color: var(--admin-primary); text-decoration: none;">/${item.slug}</a></td>
                    <td><span class="badge-status ${badgeClass}">${statusText}</span></td>
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
        if (!confirm('Are you sure you want to delete this Page?')) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/pages/${id}`, { method: 'DELETE' });
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
        
        document.getElementById('pageModalOverlay').style.display = 'flex';
        // In a real app, populate the form fields here
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = form.querySelector('input[name="title"]').value;
        const slug = form.querySelector('input[name="slug"]').value;
        const status = form.querySelector('select[name="status"]').value;
        
        const newItem = {
            id: Date.now(),
            title: title,
            slug: slug,
            status: status
        };

        try {
            const res = await fetch(`${API_BASE_URL}/pages`, {
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

        document.getElementById('pageModalOverlay').style.display = 'none';
        form.reset();
        renderTable();
    });

    searchInput.addEventListener('input', renderTable);

    // Init
    fetchItems();
});

