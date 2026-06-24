/**
 * TUNIC FASHIONS - Coupons Management Logic
 */

const AdminCoupons = {
    coupons: [
        { 
            id: 1, 
            code: 'FESTIVAL20',
            discount: 20,
            visibility: 'public',
            expiry: '2026-12-31'
        },
        { 
            id: 2, 
            code: 'VIP50OFF',
            discount: 50,
            visibility: 'private',
            expiry: '2026-10-15'
        }
    ],

    init() {
        if (!Auth.admin) {
            window.location.href = 'login.html';
            return;
        }

        this.renderTable();
        this.setupModalEvents();
    },

    getVisibilityBadge(visibility) {
        if (visibility === 'public') {
            return '<span class="visibility-badge vis-public"><i class="bi bi-megaphone"></i> Public Offer</span>';
        }
        return '<span class="visibility-badge vis-private"><i class="bi bi-incognito"></i> Private Code</span>';
    },

    renderTable() {
        const tbody = document.getElementById('coupons-table-body');
        if (!tbody) return;

        if (this.coupons.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No coupons found.</td></tr>';
            return;
        }

        tbody.innerHTML = this.coupons.map((c, index) => `
            <tr>
                <td style="color: #64748b;">${index + 1}</td>
                <td><span class="coupon-code-badge">${c.code}</span></td>
                <td style="color: #334155; font-weight: 600;">${c.discount}% OFF</td>
                <td>${this.getVisibilityBadge(c.visibility)}</td>
                <td style="color: #64748b;">${c.expiry}</td>
                <td>
                    <div class="action-icons">
                        <i class="bi bi-pencil-fill" onclick="AdminCoupons.editCoupon(${c.id})" title="Edit"></i>
                        <i class="bi bi-trash-fill" onclick="AdminCoupons.deleteCoupon(${c.id})" title="Delete"></i>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    editCoupon(id) {
        const coupon = this.coupons.find(c => c.id === id);
        if (!coupon) return;

        document.getElementById('cCode').value = coupon.code;
        document.getElementById('cDiscount').value = coupon.discount;
        document.getElementById('cExpiry').value = coupon.expiry;
        
        // Select correct radio
        const radios = document.getElementsByName('cVisibility');
        for (let r of radios) {
            if (r.value === coupon.visibility) r.checked = true;
        }
        
        document.getElementById('couponModalOverlay').style.display = 'flex';
    },

    deleteCoupon(id) {
        if (confirm('Are you sure you want to delete this coupon?')) {
            this.coupons = this.coupons.filter(c => c.id !== id);
            this.renderTable();
        }
    },

    setupModalEvents() {
        document.getElementById('couponForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Here you would normally push to the array or an API.
            // For now, we'll just fake success and close.
            
            document.getElementById('couponModalOverlay').style.display = 'none';
            alert('Coupon saved successfully!');
            e.target.reset();
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AdminCoupons.init();
});

