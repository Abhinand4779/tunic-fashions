const API_URL = 'http://localhost:8085/api';

document.addEventListener('DOMContentLoaded', async () => {
    // Populate categories dynamically from API
    try {
        const res = await fetch(API_URL + '/categories');
        if (res.ok) {
            const categories = await res.json();
            const catSelect = document.getElementById('p_category');
            if (catSelect) {
                catSelect.innerHTML = '<option value="">Choose...</option>';
                categories.forEach(cat => {
                    catSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
                });
            }
        }
    } catch (e) {
        console.error('Failed to load categories', e);
    }
});

async function saveProduct() {
    const btn = document.querySelector('.btn-apply');
    if (!btn) return;
    
    btn.disabled = true;
    btn.innerText = 'Saving...';
    
    try {
        const formData = new FormData();
        formData.append('name', document.getElementById('p_name').value);
        formData.append('description', document.getElementById('p_desc').value);
        formData.append('price', document.getElementById('p_price').value);
        
        const catId = document.getElementById('p_category').value;
        if (catId) {
            formData.append('category_id', catId);
        }

        const imageInput = document.getElementById('p_image');
        if (imageInput && imageInput.files.length > 0) {
            formData.append('image', imageInput.files[0]);
        }
        
        const token = localStorage.getItem('adminToken'); // Ensure using adminToken, not astra_admin_token

        const res = await fetch(API_URL + '/admin/products', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        });
        
        if(res.ok) {
            alert('Product successfully saved to Database!');
            window.location.href = 'products.html';
        } else {
            const data = await res.json();
            console.error(data);
            alert('Failed to save: ' + (data.message || 'Unknown error'));
        }
    } catch(err) {
        console.error('API Connection Error', err);
        alert('Failed to connect to the backend API. Please make sure the server is running.');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Save Product';
    }
}
