/**
 * admin-subSub Categories.js
 * Logic for managing subSub Categories from the Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('subSub Categories-table-body');
    const subCatForm = document.getElementById('subCatForm');
    const searchInput = document.querySelector('.search-mini input');
    
    // Mock Data Fallback
    let subCategories = [
        { id: 1, name: 'Women', image: '../assets/Logo/original.png', status: 'active', parentName: 'Fashion' },
        { id: 2, name: 'Men', image: '../assets/Logo/original.png', status: 'active', parentName: 'Fashion' }
    ];

    let parentCategories = [];

    async function fetchCategories() {
        try {
            const res = await fetch(`${API_BASE_URL}/subcategories`);
            if (res.ok) {
                subCategories = await res.json();
                localStorage.setItem('astra_subcategories', JSON.stringify(subCategories));
            } else {
                fallbackToLocal();
            }
        } catch (e) {
            console.warn('Backend not reachable, using mock subcategories.');
            fallbackToLocal();
        }
        
        // Load parent categories for the select dropdown
        const storedCats = localStorage.getItem('astra_categories');
        if (storedCats) {
            parentCategories = JSON.parse(storedCats);
        }
        populateParentSelect();

        renderTable();
    }

    function fallbackToLocal() {
        const stored = localStorage.getItem('astra_subcategories');
        if (stored) {
            subCategories = JSON.parse(stored);
        } else {
            // Save mock initial
            localStorage.setItem('astra_subcategories', JSON.stringify(subCategories));
        }
    }

    function populateParentSelect() {
        const select = document.getElementById('parentCatSelect');
        if (!select) return;
        select.innerHTML = '<option value="">Select Category</option>';
        parentCategories.forEach(cat => {
            select.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
        });
    }

    function renderTable() {
        tableBody.innerHTML = '';

        const term = searchInput.value.toLowerCase();
        const filtered = subCategories.filter(c => c.name.toLowerCase().includes(term));

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">No subSub Categories found.</td></tr>`;
            return;
        }

        filtered.forEach((cat, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">${index + 1}</td>
                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0; font-weight: 500;">
                    <img src="${cat.image || '../assets/Logo/original.png'}" alt="${cat.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px; margin-right: 0.5rem; vertical-align: middle;">
                    ${cat.name} <span style="font-size: 0.8rem; color: #64748b;">(${cat.parentName || 'No Parent'})</span>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                    <span style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; background: ${cat.status === 'active' ? '#dcfce7' : '#f1f5f9'}; color: ${cat.status === 'active' ? '#16a34a' : '#64748b'};">
                        ${cat.status}
                    </span>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="editCategory(${cat.id})"><i class="fa fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${cat.id})"><i class="fa fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    window.deleteCategory = async function(id) {
        if (!confirm('Are you sure you want to delete this category?')) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/subcategories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                subCategories = subCategories.filter(c => c.id !== id);
                renderTable();
            } else {
                subCategories = subCategories.filter(c => c.id !== id);
            }
        } catch (e) {
            console.warn('Mock Delete');
            subCategories = subCategories.filter(c => c.id !== id);
            renderTable();
        }
        localStorage.setItem('astra_subcategories', JSON.stringify(subCategories));
    };

    window.editCategory = function(id) {
        const cat = subCategories.find(c => c.id === id);
        if(!cat) return;
        
        document.getElementById('subCatModalOverlay').style.display = 'flex';
        // In a real app, populate the form fields here
    };

    subCatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = subCatForm.querySelector('input[type="text"]').value;
        const status = subCatForm.querySelector('select:not(#parentCatSelect)').value;
        const parentName = document.getElementById('parentCatSelect').value;
        
        const newCat = {
            id: Date.now(),
            name: name,
            parentName: parentName,
            status: status,
            image: '../assets/Logo/original.png' // Mock upload
        };

        try {
            const res = await fetch(`${API_BASE_URL}/subcategories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCat)
            });
            if (res.ok) {
                const saved = await res.json();
                subCategories.push(saved);
            } else {
                subCategories.push(newCat);
            }
        } catch (e) {
            console.warn('Mock Create');
            subCategories.push(newCat);
        }

        localStorage.setItem('astra_subcategories', JSON.stringify(subCategories));

        document.getElementById('subCatModalOverlay').style.display = 'none';
        subCatForm.reset();
        renderTable();
    });

    if (searchInput) {
        searchInput.addEventListener('input', renderTable);
    }

    // Init
    fetchCategories();
});

