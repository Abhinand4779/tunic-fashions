/**
 * admin-orders.js
 * Logic for managing Orders from the Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('orders-table-body');
    const searchInput = document.querySelector('.search-mini input');
    
    // Mock Data Fallback
    let orders = [
        { id: '#ORD-8923', customer: 'John Doe', date: '12 Jun 2026', amount: '$125.00', status: 'Delivered' },
        { id: '#ORD-8924', customer: 'Jane Smith', date: '12 Jun 2026', amount: '$45.50', status: 'Pending' }
    ];

    async function fetchOrders() { fallbackToLocal(); renderTable(); }

    function fallbackToLocal() {
        const localOrders = localStorage.getItem('hue_orders');
        if (localOrders) {
            try {
                const parsed = JSON.parse(localOrders);
                orders = parsed.map(o => ({
                    id: o.id || o._id,
                    customer: o.shipping?.firstName ? (o.shipping.firstName + ' ' + o.shipping.lastName) : 'Guest',
                    date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
                    amount: o.total ? '$' + parseFloat(o.total).toFixed(2) : '$0.00',
                    status: o.status || 'Processing'
                }));
            } catch(e) { console.error(e); }
        }
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const filterText = searchInput.value.toLowerCase();
        
        const filtered = orders.filter(o => 
            o.id.toLowerCase().includes(filterText) ||
            o.customer.toLowerCase().includes(filterText) ||
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
            
            tableBody.innerHTML += `
                <tr>
                    <td style="font-weight: 600;">${order.id}</td>
                    <td>${order.customer}</td>
                    <td>${order.date}</td>
                    <td style="font-weight: 500; color: #334155;">${order.amount}</td>
                    <td><span class="badge-status ${badgeClass}">${order.status}</span></td>
                    <td>
                        <div class="action-icons">
                            <i class="fa fa-eye" onclick="viewOrder('${order.id}')" title="View Details"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    window.viewOrder = function(id) {
        alert(`Viewing order details for ${id}. (Feature to be expanded in next phase)`);
    };

    searchInput.addEventListener('input', renderTable);

    // Init
    fetchOrders();
});



