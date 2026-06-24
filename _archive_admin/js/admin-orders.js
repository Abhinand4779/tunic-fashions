/**
 * TUNIC FASHIONS - Admin Orders Logic
 */

const AdminOrders = {
    async init() {
        if (!Auth.admin) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            const res = await fetch(`${API_BASE_URL}/admin/orders`, {
                headers: { 'Authorization': `Bearer ${Auth.admin.token}` }
            });
            const orders = res.ok ? await res.json() : [];
            this.render(orders);
        } catch(e) {
            console.error("Orders load error", e);
            this.render([]);
        }
    },

    render(orders) {
        const wrap = document.getElementById('admin-content');
        if (!wrap) return;

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((acc, o) => {
            if ((o.order_status || o.status)?.toLowerCase() === 'cancelled') return acc;
            const amt = parseInt((o.total_amount || o.total || '0').toString().replace(/[^\d]/g, ''));
            return acc + (isNaN(amt) ? 0 : amt);
        }, 0);

        wrap.innerHTML = `
            <div class="admin-dashboard-premium">
                
                <header style="margin-bottom: 2rem;">
                    <h2 style="font-weight:800;font-size:1.8rem;color:#0f172a;margin-bottom:0.2rem;">Order Management</h2>
                    <p style="color:var(--admin-text-muted);font-size:0.95rem;font-weight:500;">
                        ${totalOrders} Total Orders &bull; ₹${totalRevenue.toLocaleString()} Revenue
                    </p>
                </header>

                <div class="premium-card">
                    <div class="admin-search-container" style="width:100%;max-width:400px;margin-bottom:1.5rem;background:#fff;border:1px solid var(--admin-border);">
                        <i class="bi bi-search"></i>
                        <input type="text" placeholder="Search orders..." id="order-search-input">
                    </div>

                    <div class="table-responsive">
                        <table class="custom-table" id="orders-table">
                            <thead>
                                <tr>
                                    <th>ORDER ID</th>
                                    <th>CUSTOMER</th>
                                    <th>AMOUNT</th>
                                    <th>DATE</th>
                                    <th>STATUS</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orders.length === 0 ? '<tr><td colspan="6" class="text-center">No orders found.</td></tr>' : ''}
                                ${orders.map(o => `
                                    <tr>
                                        <td><span style="color:var(--admin-primary);font-weight:700;font-size:0.85rem;">ORD${o.id.toString().padStart(12, '0')}</span></td>
                                        <td>
                                            <div style="font-weight:600;color:var(--admin-text-dark);">${o.customer_name || o.shipping_address?.name || 'Guest'}</div>
                                            <div style="font-size:0.8rem;color:var(--admin-text-muted);">${o.customer_email || 'No email'}</div>
                                        </td>
                                        <td><span style="font-weight:700;color:var(--admin-text-dark);">₹${o.total_amount || 0}</span></td>
                                        <td style="color:var(--admin-text-muted);font-size:0.9rem;">${new Date(o.created_at).toLocaleDateString()}</td>
                                        <td><span class="badge ${o.status?.toLowerCase() || 'pending'}">${o.status || 'Pending'}</span></td>
                                        <td>
                                            <button onclick="AdminOrders.viewOrder(${o.id})" style="background:transparent;border:1px solid var(--admin-border);padding:0.4rem 1rem;border-radius:20px;font-size:0.85rem;font-weight:600;color:var(--admin-text-dark);transition:all 0.2s;">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>`;

        // Search Filter Logic
        document.getElementById('order-search-input')?.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#orders-table tbody tr');
            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    },

    async viewOrder(id) {
        alert("View Order details for ID: " + id + "\\n(Modal functionality to be implemented)");
    }
};

AdminOrders.init();
Components.renderAdminSidebar();

