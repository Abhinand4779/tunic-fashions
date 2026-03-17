import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminCustomers.css';

const AdminCustomers = () => {
    const { customers, adminOrders, syncAdminData } = useAuth();

    // Helper to calculate stats per customer (CASE-INSENSITIVE)
    const getCustomerStats = (email) => {
        if (!email) return { count: 0, spent: "₹0" };
        const lowerEmail = email.toLowerCase().trim();

        // Match orders by any email field (direct, shipping_address, or shipTo)
        const userOrders = (adminOrders || []).filter(o => {
            const possibleEmails = [
                o.email,
                o.shipping_address?.email,
                o.shipTo?.email,
                o.user_id === email ? email : null // fallback if user_id is the email
            ].filter(Boolean).map(e => e.toLowerCase().trim());

            return possibleEmails.includes(lowerEmail);
        });

        const spent = userOrders.reduce((acc, order) => {
            const status = (order.order_status || order.status || '').toLowerCase();
            if (status === 'cancelled') return acc;
            const amountStr = (order.total_amount || order.total || '0').toString();
            const amount = parseInt(amountStr.replace(/[^\d]/g, ''));
            return acc + (isNaN(amount) ? 0 : amount);
        }, 0);

        return { count: userOrders.length, spent: `₹${spent.toLocaleString()}` };
    };

    const handleExportCSV = () => {
        if (!customers || customers.length === 0) return;

        const headers = ['Name', 'Email', 'Orders', 'Total Spent', 'Joining Date', 'Status'];
        const csvRows = [headers.join(',')];

        customers.forEach(c => {
            const stats = getCustomerStats(c.email);
            const row = [
                `"${(c.name || '').replace(/"/g, '""')}"`,
                `"${(c.email || '').replace(/"/g, '""')}"`,
                stats.count,
                `"${stats.spent}"`,
                `"${c.created_at ? new Date(c.created_at).toLocaleDateString() : (c.joining || 'N/A')}"`,
                `"${c.status || 'Active'}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `astra_customers_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (customerId, name) => {
        if (!customerId) return;
        if (window.confirm(`Are you sure you want to delete customer ${name}? This action cannot be undone.`)) {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            const token = localStorage.getItem('adminToken');

            try {
                const res = await fetch(`${API_BASE_URL}/auth/user/${customerId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.status === 401) {
                    alert("Admin session expired. Please login again.");
                    syncAdminData(); // This will trigger the internal logout logic in syncAdminData
                    return;
                }

                if (res.ok) {
                    alert("Customer record deleted successfully.");
                    syncAdminData(); // Refresh list automatically
                } else {
                    const err = await res.json().catch(() => ({}));
                    alert(`Failed to delete. Error: ${err.detail || 'Unknown error'}`);
                }
            } catch (err) {
                console.error("Delete failed", err);
                alert("Error connecting to server. Please check your connection.");
            }
        }
    };

    const handleMessage = (email) => {
        if (!email) return;
        window.location.href = `mailto:${email}?subject=Message from ASTRA Official Support&body=Hello, \n\nWe are writing to you regarding your purchase history with ASTRA...`;
    };

    const handleEdit = (customer) => {
        alert(`Editing profile for ${customer.name}. \n\nFull administrative editing tools are currently being finalized. You can monitor their latest activity in the Orders section.`);
    };

    if (!customers || customers.length === 0) {
        return (
            <div className="admin-customers px-4">
                <div className="page-header mb-4 text-center py-5">
                    <i className="bi bi-people display-1 text-muted mb-3 d-block"></i>
                    <h2 className="page-title">Customer Directory</h2>
                    <p className="page-subtitle text-muted">No registered customers found in your database.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-customers px-4">
            <div className="page-header mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="page-title">Customer Directory</h2>
                    <p className="page-subtitle">View and manage your registered users and their purchase history.</p>
                </div>
                <button className="btn btn-dark px-4 py-2 d-flex align-items-center gap-2" style={{ borderRadius: '12px' }} onClick={handleExportCSV}>
                    <i className="bi bi-download"></i> Export CSV
                </button>
            </div>

            <div className="premium-card">
                <div className="table-responsive">
                    <table className="admin-table custom-table">
                        <thead>
                            <tr>
                                <th>CUSTOMER</th>
                                <th>ORDERS</th>
                                <th>TOTAL SPENT</th>
                                <th>JOINING DATE</th>
                                <th>STATUS</th>
                                <th className="text-end">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => {
                                const stats = getCustomerStats(customer.email);
                                return (
                                    <tr key={customer._id || customer.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="avatar-small">{(customer.name || 'U').substring(0, 2).toUpperCase()}</div>
                                                <div className="d-flex flex-column">
                                                    <span className="fw-bold">{customer.name}</span>
                                                    <span className="text-muted small">
                                                        {customer.email}
                                                        {customer.is_admin && <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '10px' }}>Admin</span>}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="fw-600">{stats.count} Orders</span></td>
                                        <td><span className="fw-bold text-dark">{stats.spent}</span></td>
                                        <td>{customer.created_at ? new Date(customer.created_at).toLocaleDateString() : (customer.joining || new Date().toLocaleDateString())}</td>
                                        <td>
                                            <span className={`badge rounded-pill ${(customer.status || 'Active') === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                                                {customer.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button className="edit-btn" onClick={() => handleMessage(customer.email)} title="Contact Customer"><i className="bi bi-chat-left-dots"></i></button>
                                                <button className="edit-btn" onClick={() => handleEdit(customer)} title="Edit Details"><i className="bi bi-pencil"></i></button>
                                                <button className="del-btn text-danger" onClick={() => handleDelete(customer._id || customer.id, customer.name)} title="Remove Customer"><i className="bi bi-trash"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCustomers;

