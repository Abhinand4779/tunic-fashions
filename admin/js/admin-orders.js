/**
 * ASTRA - Admin Orders Logic
 * Replaces AdminOrders.jsx
 */

const AdminOrders = {
    updatingId: null,
    viewingId: null,
    statusData: { status: 'Processing', trackingId: '', trackingUrl: '' },

    init() {
        if (!Auth.admin) { window.location.href = '../profile.html'; return; }
        this.render();
        window.addEventListener('siteDataLoaded', () => this.render());
    },

    render() {
        const orders = Auth.adminOrders || [];
        const wrap = document.getElementById('admin-content');
        if (!wrap) return;

        wrap.innerHTML = `
            <div class="admin-orders px-4">
                <div class="page-header mb-4">
                    <h2 class="page-title">Order Management</h2>
                    <p class="page-subtitle">Track and manage customer orders. Updating status to 'Shipped' sends a tracking email.</p>
                </div>

                <div class="premium-card">
                    <div class="table-responsive">
                        <table class="admin-table custom-table">
                            <thead>
                                <tr>
                                    <th>ORDER</th>
                                    <th>CUSTOMER</th>
                                    <th>TOTAL</th>
                                    <th>STATUS</th>
                                    <th class="text-end">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orders.length > 0 ? orders.map(order => this.renderTableRow(order)).join('') : `
                                    <tr><td colspan="5" class="text-center py-5">No orders found.</td></tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>`;
    },

    renderTableRow(order) {
        const id = order._id || order.id;
        const status = order.order_status || order.status || 'Pending';
        const isViewing = this.viewingId === id;
        const isUpdating = this.updatingId === id;

        return `
            <tr>
                <td><span class="fw-bold fs-7">${id.substring(0, 10)}</span></td>
                <td>
                    <div class="d-flex flex-column">
                        <span class="fw-bold">${order.shipping_address?.firstName || 'Guest'} ${order.shipping_address?.lastName || ''}</span>
                        <span class="text-muted small">${order.shipping_address?.email || 'No Email'}</span>
                    </div>
                </td>
                <td><span class="fw-bold text-dark">${order.total_amount || order.total}</span></td>
                <td><span class="badge rounded-pill ${status.toLowerCase()}">${status}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-dark me-2" onclick="AdminOrders.toggleDetails('${id}')">
                        ${isViewing ? 'Hide' : 'View Details'}
                    </button>
                    <button class="btn btn-sm btn-dark" onclick="AdminOrders.toggleUpdate('${id}')">Update</button>
                </td>
            </tr>
            ${isViewing ? this.renderDetailsRow(order) : ''}
            ${isUpdating ? this.renderUpdateRow(order) : ''}`;
    },

    renderDetailsRow(order) {
        return `
            <tr class="bg-white elevation-1">
                <td colspan="5" class="p-4 border-start border-4 border-primary">
                    <div class="row">
                        <div class="col-md-5 border-end">
                            <h6 class="text-uppercase fw-bold mb-3 small" style="color:#b59b5a">Shipping Address</h6>
                            <p class="mb-1 fw-bold">${order.shipping_address?.firstName} ${order.shipping_address?.lastName}</p>
                            <p class="mb-1 text-muted small">${order.shipping_address?.address}, ${order.shipping_address?.city}</p>
                            <p class="mb-1 text-muted small">${order.shipping_address?.state} - ${order.shipping_address?.zipCode}</p>
                            <p class="mb-0 fw-bold small mt-2">Tel: ${order.shipping_address?.phone || 'N/A'}</p>
                        </div>
                        <div class="col-md-7 ps-4">
                            <h6 class="text-uppercase fw-bold mb-3 small" style="color:#b59b5a">Ordered Items (${order.items?.length})</h6>
                            ${order.items?.map(item => `
                                <div class="d-flex align-items-center mb-2 bg-light p-2 rounded">
                                    <img src="${item.image}" style="width:40px;height:40px;object-fit:cover;border-radius:4px" class="me-3">
                                    <div class="flex-grow-1"><div class="fw-bold small">${item.name}</div><div class="text-muted small">Qty: ${item.quantity} | ${item.price}</div></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </td>
            </tr>`;
    },

    renderUpdateRow(order) {
        const id = order._id || order.id;
        return `
            <tr class="bg-light">
                <td colspan="5" class="p-4 border-start border-4 border-primary">
                    <div class="p-3 bg-white rounded shadow-sm border">
                        <h6 class="fw-bold mb-3">Update Order Status</h6>
                        <div class="row g-3 align-items-end">
                            <div class="col-md-3">
                                <label class="form-label small fw-bold">Status</label>
                                <select class="form-select" id="upd-status"><option ${this.statusData.status === 'Processing' ? 'selected' : ''}>Processing</option><option ${this.statusData.status === 'Shipped' ? 'selected' : ''}>Shipped</option><option ${this.statusData.status === 'Delivered' ? 'selected' : ''}>Delivered</option><option ${this.statusData.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option></select>
                            </div>
                            <div class="col-md-3"><label class="form-label small fw-bold">Tracking ID</label><input type="text" class="form-control" id="upd-track-id" value="${this.statusData.trackingId}"></div>
                            <div class="col-md-4"><label class="form-label small fw-bold">Tracking Link</label><input type="text" class="form-control" id="upd-track-url" value="${this.statusData.trackingUrl}"></div>
                            <div class="col-md-2"><button class="btn btn-primary w-100" onclick="AdminOrders.saveUpdate('${id}')">Save & Notify</button></div>
                        </div>
                    </div>
                </td>
            </tr>`;
    },

    toggleDetails(id) { this.viewingId = (this.viewingId === id ? null : id); this.render(); },
    toggleUpdate(id) {
        if (this.updatingId === id) this.updatingId = null;
        else {
            const o = Auth.adminOrders.find(ord => (ord._id || ord.id) === id);
            this.updatingId = id;
            this.statusData = { status: o.order_status || 'Shipped', trackingId: o.tracking_id || '', trackingUrl: o.tracking_url || '' };
        }
        this.render();
    },

    async saveUpdate(id) {
        const data = {
            status: document.getElementById('upd-status').value,
            trackingId: document.getElementById('upd-track-id').value,
            trackingUrl: document.getElementById('upd-track-url').value
        };
        const success = await Auth.updateOrderStatus(id, data);
        if (success) { this.updatingId = null; alert("Order Updated!"); window.location.reload(); }
    }
};

AdminOrders.init();
Components.renderAdminSidebar();
