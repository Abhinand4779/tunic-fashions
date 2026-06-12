/**
 * HUE Admin Components
 * Handles the dual-sidebar and top navigation
 */

 const AdminComponents = {
    renderSidebar() {
        const sidebarHTML = `
            <!-- Primary Icon Sidebar -->
            <aside class="admin-sidebar">
                <div class="admin-sidebar-header">
                    <img src="../assets/Logo/original.png" alt="HUE">
                </div>
                
                <nav class="admin-nav">
                    <a href="dashboard.html" class="admin-nav-link" title="Dashboards">
                        <i class="bi bi-speedometer2"></i>
                    </a>
                    <a href="#" class="admin-nav-link active" title="Products" id="nav-products">
                        <i class="bi bi-layers"></i>
                    </a>
                    <a href="#" class="admin-nav-link" title="Orders">
                        <i class="bi bi-cart3"></i>
                    </a>
                    <a href="#" class="admin-nav-link" title="Customers">
                        <i class="bi bi-people"></i>
                    </a>
                    <a href="#" class="admin-nav-link" title="Settings">
                        <i class="bi bi-gear"></i>
                    </a>
                </nav>
                
                <div class="admin-sidebar-avatar">
                    A
                </div>
            </aside>

            <!-- Secondary Slide-out Sidebar -->
            <aside class="admin-secondary-sidebar" id="secondary-sidebar">
                <div class="secondary-sidebar-header">
                    <h3>Products List</h3>
                    <button class="secondary-sidebar-close"><i class="bi bi-chevron-left"></i></button>
                </div>
                <nav class="secondary-nav">
                    <a href="dashboard.html" class="secondary-nav-link">Dashboard</a>
                    <a href="#" class="secondary-nav-link">Category</a>
                    <a href="#" class="secondary-nav-link">Sub Category</a>
                    <!-- Child Category intentionally omitted -->
                    <a href="#" class="secondary-nav-link">Size</a>
                    <a href="#" class="secondary-nav-link">Color</a>
                    <a href="products.html" class="secondary-nav-link active">Product Lists</a>
                    <a href="product-create.html" class="secondary-nav-link">Create Product</a>
                    <a href="#" class="secondary-nav-link">Warehouse</a>
                </nav>
            </aside>
        `;
        
        // Wrap existing content
        const body = document.body;
        const mainContent = body.innerHTML;
        
        body.innerHTML = `
            <div class="admin-layout">
                ${sidebarHTML}
                <div class="admin-main-wrapper">
                    ${this.getTopNavHTML()}
                    <main class="admin-main">
                        ${mainContent}
                    </main>
                </div>
            </div>
        `;
    },

    getTopNavHTML() {
        return `
            <header class="admin-top-header">
                <div class="header-left">
                    <button class="hamburger-btn" id="toggle-sidebar">
                        <i class="bi bi-list"></i>
                    </button>
                </div>
                <div class="header-right">
                    <div class="admin-search-container">
                        <i class="bi bi-search"></i>
                        <input type="text" placeholder="Search here...">
                    </div>
                    <button class="header-icon-btn"><i class="bi bi-sun"></i></button>
                    <button class="header-icon-btn"><i class="bi bi-palette"></i></button>
                    <button class="header-icon-btn">
                        <i class="bi bi-bell"></i>
                        <span class="notification-dot"></span>
                    </button>
                </div>
            </header>
        `;
    },

    init() {
        this.renderSidebar();
        
        // Basic sidebar toggle logic
        document.getElementById('toggle-sidebar').addEventListener('click', () => {
            const secSidebar = document.getElementById('secondary-sidebar');
            if (secSidebar.style.display === 'none') {
                secSidebar.style.display = 'flex';
            } else {
                secSidebar.style.display = 'none';
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AdminComponents.init();
});

