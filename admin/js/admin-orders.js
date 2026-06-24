/**
 * admin-orders.js
 * Logic for managing Orders from the Admin Dashboard
 */

let currentOrders = [];
let selectedOrderId = null;

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('orders-table-body');
    const searchInput = document.querySelector('.search-mini input');

    async function fetchOrders() {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                currentOrders = await res.json();
                renderTable();
            }
        } catch (e) {
            console.error("Failed to load orders from backend:", e);
        }
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const filterText = searchInput ? searchInput.value.toLowerCase() : '';
        
        const filtered = currentOrders.filter(o => 
            o.id.toString().includes(filterText) ||
            o.customer_name.toLowerCase().includes(filterText) ||
            o.status.toLowerCase().includes(filterText)
        );

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4">No orders found.</td></tr>`;
            return;
        }

        filtered.forEach(order => {
            let badgeClass = 'bg-warning-light';
            if (order.status.toLowerCase() === 'delivered') badgeClass = 'bg-success-light';
            if (order.status.toLowerCase() === 'cancelled') badgeClass = 'bg-danger-light';
            if (order.status.toLowerCase() === 'shipped') badgeClass = 'bg-info-light';
            
            tableBody.innerHTML += `
                <tr>
                    <td style="font-weight: 600;">#ORD-${order.id}</td>
                    <td>${order.customer_name}</td>
                    <td>${new Date(order.created_at).toLocaleDateString()}</td>
                    <td style="font-weight: 500; color: #334155;">$${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                    <td><span class="badge-status ${badgeClass}">${order.status}</span></td>
                    <td>
                        <div class="action-icons">
                            <i class="fa fa-eye" onclick="viewOrder(${order.id})" title="View Details" style="cursor:pointer; color:#0d6efd;"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', renderTable);
    }

    fetchOrders();

    // Export fetchOrders to global scope so other functions can call it
    window.fetchOrders = fetchOrders;
});

window.viewOrder = function(id) {
    selectedOrderId = id;
    const order = currentOrders.find(o => o.id === id);
    if (!order) return;

    document.getElementById('modalOrderTitle').innerText = `Order #ORD-${order.id}`;
    document.getElementById('modalCustomerName').innerText = order.customer_name;
    document.getElementById('modalCustomerEmail').innerText = order.customer_email;
    document.getElementById('modalCustomerAddress').innerText = order.shipping_address || 'N/A';
    document.getElementById('modalTotalAmount').innerText = parseFloat(order.total_amount || 0).toFixed(2);
    document.getElementById('modalStatusBadge').innerText = order.status;
    document.getElementById('updateStatusSelect').value = order.status;
    document.getElementById('trackingProvider').value = order.tracking_provider || '';
    document.getElementById('trackingNumber').value = order.tracking_number || '';

    document.getElementById('orderModal').style.display = 'block';
};

document.getElementById('closeOrderModal').onclick = function() {
    document.getElementById('orderModal').style.display = 'none';
};

window.saveOrderStatus = async function() {
    if (!selectedOrderId) return;
    const newStatus = document.getElementById('updateStatusSelect').value;
    const token = localStorage.getItem('adminToken');

    try {
        const res = await fetch(`${API_BASE_URL}/admin/orders/${selectedOrderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            alert('Status updated successfully!');
            document.getElementById('modalStatusBadge').innerText = newStatus;
            window.fetchOrders();
        } else {
            alert('Failed to update status.');
        }
    } catch (e) {
        console.error(e);
    }
};

window.saveTracking = async function() {
    if (!selectedOrderId) return;
    const provider = document.getElementById('trackingProvider').value;
    const number = document.getElementById('trackingNumber').value;
    const token = localStorage.getItem('adminToken');

    if (!provider || !number) {
        alert("Please enter both courier name and tracking number.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/admin/orders/${selectedOrderId}/tracking`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ tracking_provider: provider, tracking_number: number })
        });
        if (res.ok) {
            alert('Tracking updated and emailed to customer successfully! Status changed to Shipped.');
            document.getElementById('modalStatusBadge').innerText = 'Shipped';
            document.getElementById('updateStatusSelect').value = 'Shipped';
            window.fetchOrders();
        } else {
            alert('Failed to update tracking.');
        }
    } catch (e) {
        console.error(e);
    }
};

window.printInvoice = function() {
    if (!selectedOrderId) return;
    const order = currentOrders.find(o => o.id === selectedOrderId);
    if (!order) return;

    let itemsHtml = '';
    if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
            itemsHtml += `<tr><td>${item.title || item.name || 'Product'}</td><td>${item.quantity || 1}</td><td>$${parseFloat(item.price || 0).toFixed(2)}</td></tr>`;
        });
    } else {
        itemsHtml = `<tr><td colspan="3">Items not detailed in this legacy order</td></tr>`;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>Invoice - ORD-${order.id}</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f9f9f9; }
            .total { text-align: right; margin-top: 20px; font-size: 20px; font-weight: bold; }
        </style>
        </head><body>
            <div class="header">
                <h1>TUNIC FASHIONS. Jewelry</h1>
                <h2>INVOICE</h2>
            </div>
            <div class="details">
                <div>
                    <strong>Billed To:</strong><br>
                    ${order.customer_name}<br>
                    ${order.customer_email}<br>
                    ${order.shipping_address || 'Address Not Provided'}
                </div>
                <div>
                    <strong>Invoice #:</strong> INV-${order.id}<br>
                    <strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}<br>
                    <strong>Status:</strong> ${order.status}
                </div>
            </div>
            <table>
                <thead><tr><th>Item</th><th>Quantity</th><th>Price</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <div class="total">Grand Total: $${parseFloat(order.total_amount || 0).toFixed(2)}</div>
            <p style="margin-top:50px; text-align:center; color:#888;">Thank you for your business!</p>
            <script>window.print();</script>
        </body></html>
    `);
    printWindow.document.close();
};

window.printReceipt = function() {
    window.printInvoice(); // Uses same logic for MVP
};



