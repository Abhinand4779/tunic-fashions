document.addEventListener('DOMContentLoaded', () => {
    fetchShippingRates();
});

async function fetchShippingRates() {
    const tableBody = document.getElementById('shipping-table-body');
    try {
        const res = await fetch(`${API_BASE_URL}/shipping`);
        if (res.ok) {
            const rates = await res.json();
            tableBody.innerHTML = '';
            
            if (rates.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center;">No shipping rates configured. Default is $0.00 globally.</td></tr>`;
                return;
            }

            rates.forEach(rate => {
                tableBody.innerHTML += `
                    <tr>
                        <td style="font-weight: 500;">${rate.country}</td>
                        <td style="color: #334155; font-weight: 600;">$${parseFloat(rate.rate).toFixed(2)}</td>
                        <td>
                            <button onclick="deleteShippingRate(${rate.id})" style="padding: 6px 12px; background: #dc3545; color: #333333; border: none; border-radius: 4px; cursor: pointer;">
                                <i class="fa fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (e) {
        console.error('Failed to fetch shipping rates', e);
    }
}

window.saveShippingRate = async function() {
    const country = document.getElementById('newCountry').value;
    const rate = document.getElementById('newRate').value;
    const token = localStorage.getItem('adminToken');

    if (!country || rate === '') {
        alert('Please enter both country and shipping rate.');
        return;
    }

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
            document.getElementById('newCountry').value = '';
            document.getElementById('newRate').value = '';
            fetchShippingRates();
        } else {
            alert('Failed to save shipping rate.');
        }
    } catch (e) {
        console.error(e);
    }
};

window.deleteShippingRate = async function(id) {
    if (!confirm('Are you sure you want to delete this shipping rate?')) return;
    const token = localStorage.getItem('adminToken');

    try {
        const res = await fetch(`${API_BASE_URL}/admin/shipping/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            fetchShippingRates();
        }
    } catch (e) {
        console.error(e);
    }
};
