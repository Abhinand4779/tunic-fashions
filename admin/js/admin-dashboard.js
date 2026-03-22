/**
 * ASTRA - Admin Dashboard Logic
 * Replaces AdminDashboard.jsx
 */

const AdminDashboard = {
    init() {
        if (!Auth.admin) {
            window.location.href = 'login.html';
            return;
        }
        this.render();
        window.addEventListener('siteDataLoaded', () => this.render());
        window.addEventListener('adminDataSynced', () => this.render());
    },

    render() {
        if (Site.loading) return;

        const products = Site.products || [];
        const orders = Auth.adminOrders || [];
        const customers = Auth.customers || [];

        // Calculation
        const totalRevenue = orders.reduce((acc, o) => {
            if ((o.order_status || o.status)?.toLowerCase() === 'cancelled') return acc;
            const amt = parseInt((o.total_amount || o.total || '0').replace(/[^\d]/g, ''));
            return acc + (isNaN(amt) ? 0 : amt);
        }, 0);

        const recentOrders = orders.slice(0, 5);

        const wrap = document.getElementById('admin-content');
        if (!wrap) return;

        wrap.innerHTML = `
            <div class="admin-dashboard">
                <header class="dashboard-header">
                    <h2>Welcome back, Admin</h2>
                    <p>Here's what's happening with your store today.</p>
                </header>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-left">
                            <span class="stat-label">Total Revenue</span>
                            <div class="stat-value">₹${totalRevenue.toLocaleString()}</div>
                            <div class="stat-trend up"><i class="bi bi-arrow-up-short"></i>Live</div>
                        </div>
                        <div class="stat-icon-wrapper" style="background:#f0fdf4; color:#16a34a"><i class="bi bi-currency-rupee"></i></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-left">
                            <span class="stat-label">Active Orders</span>
                            <div class="stat-value">${orders.length}</div>
                            <div class="stat-trend up"><i class="bi bi-arrow-up-short"></i>Live</div>
                        </div>
                        <div class="stat-icon-wrapper" style="background:#eff6ff; color:#2563eb"><i class="bi bi-cart-check"></i></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-left">
                            <span class="stat-label">Total Products</span>
                            <div class="stat-value">${products.length}</div>
                            <div class="stat-trend up"><i class="bi bi-arrow-up-short"></i>Live</div>
                        </div>
                        <div class="stat-icon-wrapper" style="background:#fff7ed; color:#ea580c"><i class="bi bi-gem"></i></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-left">
                            <span class="stat-label">Total Customers</span>
                            <div class="stat-value">${customers.length}</div>
                            <div class="stat-trend up"><i class="bi bi-arrow-up-short"></i>Live</div>
                        </div>
                        <div class="stat-icon-wrapper" style="background:#f5f3ff; color:#7c3aed"><i class="bi bi-people"></i></div>
                    </div>
                </div>

                <main class="dashboard-main-grid">
                    <div class="premium-card">
                        <div class="card-title-row"><h3>Recent Transactions</h3></div>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle custom-table">
                                <thead>
                                    <tr>
                                        <th>ORDER ID</th>
                                        <th>CUSTOMER</th>
                                        <th>STATUS</th>
                                        <th>DATE</th>
                                        <th class="text-end">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recentOrders.map(o => `
                                        <tr>
                                            <td><span class="fw-bold small">${(o._id || o.id).substring(0, 8)}</span></td>
                                            <td>${o.shipping_address?.name || o.shipping_address?.firstName || 'Guest'}</td>
                                            <td><span class="badge rounded-pill ${o.status?.toLowerCase()}">${o.status || 'Pending'}</span></td>
                                            <td class="text-muted small">${new Date(o.created_at || o.date).toLocaleDateString()}</td>
                                            <td class="text-end fw-bold">${o.total_amount || o.total}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>`;
    }
};

AdminDashboard.init();
Components.renderAdminSidebar();
