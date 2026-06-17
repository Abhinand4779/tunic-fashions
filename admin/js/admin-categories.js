/**
 * admin-categories.js
 * Logic for managing Categories from the Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('categories-table-body');
    const catForm = document.getElementById('catForm');
    const searchInput = document.querySelector('.search-mini input');
    
    let categories = [];
    const API_URL = 'https://huestorybyreshma.com/server/api';

    async function fetchCategories() {
        try {
            const res = await fetch(`${API_URL}/categories`);
            if (res.ok) {
                categories = await res.json();
                renderTable();
            } else {
                console.error('Failed to fetch categories');
            }
        } catch (e) {
            console.error('Backend not reachable.', e);
        }
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const filterText = searchInput ? searchInput.value.toLowerCase() : '';
        
        const filtered = categories.filter(c => c.name.toLowerCase().includes(filterText));

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">No categories found.</td></tr>`;
            return;
        }

        filtered.forEach((cat, index) => {
            const badgeClass = 'bg-success-light';
            const statusText = 'Active';
            
            tableBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${cat.name}</td>
                    <td><span class="badge-status ${badgeClass}">${statusText}</span></td>
                    <td>
                        <div class="action-icons">
                            <i class="fa fa-trash" onclick="deleteCategory(${cat.id})" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    window.deleteCategory = async function(id) {
        if(confirm('Are you sure you want to delete this category?')) {
            try {
                const token = localStorage.getItem('adminToken');
                const res = await fetch(`${API_URL}/admin/categories/${id}`, { 
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                
                if(res.ok) {
                    categories = categories.filter(c => c.id !== id);
                    renderTable();
                } else {
                    alert('Failed to delete category');
                }
            } catch(e) {
                console.error('Delete failed', e);
            }
        }
    };

    if (catForm) {
        catForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = catForm.querySelector('input[type="text"]');
            if(!nameInput) return;
            
            const name = nameInput.value;
            
            const newCat = {
                name: name
            };

            try {
                const token = localStorage.getItem('adminToken');
                const res = await fetch(`${API_URL}/admin/categories`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(newCat)
                });
                
                if (res.ok) {
                    const created = await res.json();
                    categories.push(created);
                    renderTable();
                    document.getElementById('catModalOverlay').style.display = 'none';
                    catForm.reset();
                } else {
                    const data = await res.json();
                    alert('Failed to create category: ' + (data.message || 'Error'));
                }
            } catch(err) {
                console.error('Failed to create', err);
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', renderTable);
    }

    // Init
    fetchCategories();
});


