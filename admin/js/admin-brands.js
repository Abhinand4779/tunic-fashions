/**
 * admin-brands.js
 * Logic for managing Brands from the Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('brands-table-body');
    const brandForm = document.getElementById('brandForm');
    const searchInput = document.querySelector('.search-mini input');
    
    // Mock Data Fallback
    let brands = [
        { id: 1, name: 'HUE Premium', image: '../assets/Logo/original.png', status: 'active' }
    ];

    async function fetchBrands() {
        try {
            const res = await fetch(`${API_BASE_URL}/brands`);
            if (res.ok) {
                brands = await res.json();
            }
        } catch (e) {
            console.warn('Backend not reachable, using mock brands.');
        }
        renderTable();
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const filterText = searchInput.value.toLowerCase();
        
        const filtered = brands.filter(b => b.name.toLowerCase().includes(filterText));

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">No brands found.</td></tr>`;
            return;
        }

        filtered.forEach((brand, index) => {
            const badgeClass = brand.status === 'active' ? 'bg-success-light' : 'bg-danger-light';
            const statusText = brand.status.charAt(0).toUpperCase() + brand.status.slice(1);
            
            tableBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${brand.name}</td>
                    <td><img src="${brand.image || '../assets/Logo/original.png'}" alt="${brand.name}" class="cat-thumbnail"></td>
                    <td><span class="badge-status ${badgeClass}">${statusText}</span></td>
                    <td>
                        <div class="action-icons">
                            <i class="fa fa-edit" onclick="editBrand(${brand.id})" title="Edit"></i>
                            <i class="fa fa-trash" onclick="deleteBrand(${brand.id})" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    window.deleteBrand = async function(id) {
        if (!confirm('Are you sure you want to delete this brand?')) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/brands/${id}`, { method: 'DELETE' });
            if (res.ok) {
                brands = brands.filter(b => b.id !== id);
                renderTable();
            }
        } catch (e) {
            console.warn('Mock Delete');
            brands = brands.filter(b => b.id !== id);
            renderTable();
        }
    };

    window.editBrand = function(id) {
        const brand = brands.find(b => b.id === id);
        if(!brand) return;
        
        document.getElementById('brandModalOverlay').style.display = 'flex';
        // In a real app, populate the form fields here
    };

    brandForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = brandForm.querySelector('input[type="text"]').value;
        const status = brandForm.querySelector('select').value;
        
        const newBrand = {
            id: Date.now(),
            name: name,
            status: status,
            image: '../assets/Logo/original.png' // Mock upload
        };

        try {
            const res = await fetch(`${API_BASE_URL}/brands`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBrand)
            });
            if (res.ok) {
                const saved = await res.json();
                brands.push(saved);
            }
        } catch (e) {
            console.warn('Mock Create');
            brands.push(newBrand);
        }

        document.getElementById('brandModalOverlay').style.display = 'none';
        brandForm.reset();
        renderTable();
    });

    searchInput.addEventListener('input', renderTable);

    // Init
    fetchBrands();
});

