/**
 * HUE - Premium Admin Dashboard Logic
 */

const AdminDashboard = {
    async init() {
        if (!Auth.admin) {
            window.location.href = 'login.html';
            return;
        }

        try {
            // Fetch Analytics & Orders
            const [analyticsRes, ordersRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/analytics`, {
                    headers: { 'Authorization': `Bearer ${Auth.admin.token}` }
                }),
                fetch(`${API_BASE_URL}/admin/orders`, {
                    headers: { 'Authorization': `Bearer ${Auth.admin.token}` }
                })
            ]);

            const analytics = analyticsRes.ok ? await analyticsRes.json() : {};
            const orders = ordersRes.ok ? await ordersRes.json() : [];

            this.render(analytics, orders);
        } catch (e) {
            console.error("Dashboard init error", e);
            this.render({}, []);
        }
    },

    render(analytics, orders) {
        const wrap = document.getElementById('admin-content');
        if (!wrap) return;

        const totalRevenue = analytics.total_revenue || 0;
        const totalOrders = analytics.total_orders || 0;
        const totalCustomers = (Auth.customers || []).length || 6; // Mock if no endpoint
        const totalVisitors = analytics.total_visits || 0;
        const todayVisitors = Math.round(totalVisitors * 0.1) || 0; // Mock breakdown

        const recentOrders = orders.slice(0, 5);

        const currentMonth = new Date().getMonth();
        const monthlyOrders = orders.filter(o => new Date(o.created_at).getMonth() === currentMonth).length;

        wrap.innerHTML = `
            <div class="admin-dashboard-light">
                
                <!-- 4 TOP STAT CARDS -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
                    
                    <div class="premium-card stat-card-light">
                        <div class="stat-label">TOTAL ORDERS</div>
                        <div class="stat-main">
                            <div class="stat-val">${totalOrders}</div>
                            <div class="stat-icon" style="color: #f97316;"><i class="bi bi-person-fill"></i></div>
                        </div>
                    </div>

                    <div class="premium-card stat-card-light">
                        <div class="stat-label">MONTHLY ORDERS</div>
                        <div class="stat-main">
                            <div class="stat-val">${monthlyOrders}</div>
                            <div class="stat-icon" style="color: #0ea5e9;"><i class="bi bi-eye-fill"></i></div>
                        </div>
                    </div>

                    <div class="premium-card stat-card-light">
                        <div class="stat-label">TOTAL INCOME</div>
                        <div class="stat-main">
                            <div class="stat-val">AUD$${totalRevenue.toLocaleString()}</div>
                            <div class="stat-icon" style="color: #22c55e;"><i class="bi bi-hand-thumbs-up-fill"></i></div>
                        </div>
                    </div>

                    <div class="premium-card stat-card-light">
                        <div class="stat-label">TOTAL USERS</div>
                        <div class="stat-main">
                            <div class="stat-val">${totalCustomers}</div>
                            <div class="stat-icon" style="color: #ef4444;"><i class="bi bi-bug-fill"></i></div>
                        </div>
                    </div>

                </div>

                <!-- CHART AREA -->
                <div class="premium-card chart-card">
                    <div class="chart-header">
                        <h3>Monthly Paid Sales</h3>
                        <button class="download-btn"><i class="bi bi-download"></i></button>
                    </div>
                    <div class="chart-container" style="position: relative; height: 400px; width: 100%;">
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>

            </div>
            
            <style>
                .admin-dashboard-light {
                    padding: 1rem 0;
                }
                .stat-card-light {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 120px;
                }
                .stat-label {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                .stat-main {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }
                .stat-val {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1;
                }
                .stat-icon {
                    font-size: 1.5rem;
                }
                .chart-card {
                    padding: 2rem;
                }
                .chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .chart-header h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #334155;
                    margin: 0;
                }
                .download-btn {
                    background: transparent;
                    border: none;
                    color: #64748b;
                    font-size: 1.2rem;
                    cursor: pointer;
                }
            </style>
        `;

        // Render Chart.js
        this.renderChart();
    },

    renderChart() {
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => this.drawChart();
            document.head.appendChild(script);
        } else {
            this.drawChart();
        }
    },

    drawChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Sales (AUD)',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#38bdf8',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) { return 'AUD$' + value; },
                            color: '#94a3b8',
                            font: { size: 11, family: 'Outfit' },
                            stepSize: 0.4,
                            max: 2
                        },
                        grid: {
                            color: '#f1f5f9',
                            drawBorder: false,
                            borderDash: [5, 5]
                        }
                    },
                    x: {
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 12, family: 'Outfit' }
                        },
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    }
                }
            }
        });
    }
};

AdminDashboard.init();
Components.renderAdminSidebar();

