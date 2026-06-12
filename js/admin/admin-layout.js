/**
 * HUE - Admin Layout Logic
 * Handles sidebar toggling and authentication checks
 */

const AdminLayout = {
    init() {
        if (!Auth.admin) {
            window.location.href = 'login.html';
            return;
        }

        this.renderSidebar();
        this.renderHeader();
        this.attachEvents();
    },

    renderSidebar() {
        const sidebar = document.getElementById('admin-sidebar');
        if (!sidebar) return;

        const navItems = [
            { name: 'Dashboard', icon: 'speedometer2', path: 'dashboard.html' },
            { name: 'Products', icon: 'bag', path: 'products.html' },
            { name: 'Categories', icon: 'grid', path: 'categories.html' },
            { name: 'Orders', icon: 'cart', path: 'orders.html' },
            { name: 'Customers', icon: 'people', path: 'customers.html' },
            { name: 'CMS', icon: 'layout-text-sidebar-reverse', path: 'cms.html' },
            { name: 'Sliders', icon: 'images', path: 'sliders.html' }
        ];

        const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';

        sidebar.innerHTML = `
            <div class="sidebar-brand">
                <img src="../assets/Logo/original.png" alt="HUE Logo">
                <h2>HUE UI</h2>
            </div>

            <nav class="sidebar-nav">
                ${navItems.map(item => `
                    <a href="${item.path}" class="nav-link ${currentPath === item.path ? 'active' : ''}">
                        <i class="bi bi-${item.icon}"></i>
                        <span>${item.name}</span>
                    </a>
                `).join('')}
            </nav>

            <div class="sidebar-footer">
                <button class="logout-btn" onclick="Auth.logout()"><i class="bi bi-box-arrow-left"></i> Logout</button>
            </div>
        `;
    },

    renderHeader() {
        const header = document.getElementById('admin-header');
        if (!header) return;

        header.innerHTML = `
            <div class="header-left">
                <button id="sidebar-toggle" class="sidebar-toggle"><i class="bi bi-list"></i></button>
                <div class="header-breadcrumb">
                    <span>Admin</span> / <span class="current-page">${document.title.split(' - ')[0]}</span>
                </div>
            </div>

            <div class="header-right">
                <div class="admin-user">
                    <div class="user-avatar">${Auth.admin.name[0]}</div>
                    <div class="user-info">
                        <strong>${Auth.admin.name}</strong>
                        <span>Administrator</span>
                    </div>
                </div>
            </div>
        `;
    },

    attachEvents() {
        document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }
};

AdminLayout.init();

