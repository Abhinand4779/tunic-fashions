/**
 * admin-main-titles.js
 * Logic for managing Main Titles and Videos from the Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {


    const tableBody = document.getElementById('mt-table-body');
    const form = document.getElementById('mtForm');
    const searchInput = document.querySelector('.search-mini input');
    
    // Mock Data Fallback
    let items = [
        { id: 1, title: 'Summer Collection Promo', type: 'Video URL', sourceUrl: 'https://youtube.com/watch?v=example' }
    ];

    async function fetchItems() {
        try {
            const res = await fetch(`${API_BASE_URL}/main-titles`);
            if (res.ok) {
                items = await res.json();
            }
        } catch (e) {
            console.warn('Backend not reachable, using mock main titles.');
        }
        renderTable();
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const filterText = searchInput.value.toLowerCase();
        
        const filtered = items.filter(c => c.title.toLowerCase().includes(filterText) || c.type.toLowerCase().includes(filterText));

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">No entries found.</td></tr>`;
            return;
        }

        filtered.forEach((item, index) => {
            const sourceDisplay = item.sourceUrl ? `<a href="${item.sourceUrl}" target="_blank" style="color: var(--admin-primary); text-decoration: none; word-break: break-all;">${item.sourceUrl}</a>` : '<span style="color: #94a3b8;">N/A</span>';

            tableBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td style="font-weight: 600; color: #334155;">${item.title}</td>
                    <td><span class="badge-status bg-success-light" style="background: #e2e8f0; color: #475569;">${item.type}</span></td>
                    <td>${sourceDisplay}</td>
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
        if (!confirm('Are you sure you want to delete this entry?')) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/main-titles/${id}`, { method: 'DELETE' });
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
        
        document.getElementById('mtModalOverlay').style.display = 'flex';
        // In a real app, populate the form fields here
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = form.querySelector('input[name="title"]').value;
        const type = form.querySelector('select[name="type"]').value;
        const sourceUrl = form.querySelector('input[name="sourceUrl"]').value;
        
        const newItem = {
            id: Date.now(),
            title: title,
            type: type,
            sourceUrl: sourceUrl
        };

        try {
            const res = await fetch(`${API_BASE_URL}/main-titles`, {
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

        document.getElementById('mtModalOverlay').style.display = 'none';
        form.reset();
        renderTable();
    });

    searchInput.addEventListener('input', renderTable);

    // Init
    fetchItems();
});

