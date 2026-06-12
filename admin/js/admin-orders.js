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

    async function fetchOrders() {
        try {
            const res = await fetch(`${API_BASE_URL}/orders/all`); // Matches backend logic
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    // Map backend data to local structure if needed
                    orders = data.map(o => ({
                        id: o._id || o.id,
                        customer: o.customerName || o.userId || 'Guest',
                        date: new Date(o.createdAt || Date.now()).toLocaleDateString(),
                        amount: `₹${o.totalAmount || 0}`,
                        status: o.status || 'Pending'
                    }));
                }
            } else {
                fallbackToLocal();
            }
        } catch (e) {
            console.warn('Backend not reachable, using local storage fallback for orders.');
            fallbackToLocal();
        }
        renderTable();
    }

    function fallbackToLocal() {
        const localOrders = localStorage.getItem('astra_orders');
        if (localOrders) {
            try {
                const parsed = JSON.parse(localOrders);
                orders = parsed.map(o => ({
                    id: o.id || o._id,
                    customer: o.shipping_address?.firstName + ' ' + o.shipping_address?.lastName || 'Guest',
                    date: o.date || new Date().toLocaleDateString(),
                    amount: o.total_amount || '$0.00',
                    status: o.status || 'Pending'
                }));
            } catch(e) {}
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

