/**
 * HUE - Reviews Management Logic
 */

const AdminReviews = {
    reviews: [
        { 
            id: 1, 
            customer: 'John Doe',
            product: 'Kalyani cotton sarees',
            rating: 5,
            text: 'Absolutely beautiful! The quality is amazing.',
            status: 'Pending'
        },
        { 
            id: 2, 
            customer: 'Jane Smith',
            product: 'Golden necklace',
            rating: 2,
            text: 'It looks nice but broke after one week.',
            status: 'Pending'
        },
        { 
            id: 3, 
            customer: 'Alice Johnson',
            product: 'Premium Silk Saree',
            rating: 4,
            text: 'Very comfortable and rich color. Took a bit long to ship.',
            status: 'Accepted'
        }
    ],

    init() {
        if (!Auth.admin) {
            window.location.href = 'login.html';
            return;
        }

        this.renderTable();
    },

    getStarsHTML(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="bi bi-star-fill"></i> ';
            } else {
                stars += '<i class="bi bi-star"></i> ';
            }
        }
        return stars;
    },

    getStatusBadge(status) {
        if (status === 'Pending') return '<span class="status-badge status-pending">Pending</span>';
        if (status === 'Accepted') return '<span class="status-badge status-accepted">Accepted</span>';
        if (status === 'Rejected') return '<span class="status-badge status-rejected">Rejected</span>';
        return `<span>${status}</span>`;
    },

    renderTable() {
        const tbody = document.getElementById('reviews-table-body');
        if (!tbody) return;

        if (this.reviews.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No reviews found.</td></tr>';
            return;
        }

        tbody.innerHTML = this.reviews.map(r => `
            <tr>
                <td style="color: #64748b;">${r.id}</td>
                <td style="color: #334155; font-weight: 500;">${r.customer}</td>
                <td style="color: #64748b;">${r.product}</td>
                <td class="star-rating">${this.getStarsHTML(r.rating)}</td>
                <td class="review-text" title="${r.text}">${r.text}</td>
                <td>${this.getStatusBadge(r.status)}</td>
                <td>
                    <div class="action-btns">
                        ${r.status === 'Pending' ? `
                            <button class="btn-accept" onclick="AdminReviews.updateStatus(${r.id}, 'Accepted')" title="Accept">
                                <i class="bi bi-check-lg"></i>
                            </button>
                            <button class="btn-reject" onclick="AdminReviews.updateStatus(${r.id}, 'Rejected')" title="Reject">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        ` : `
                            <span style="color:#94a3b8; font-size:0.8rem;">Reviewed</span>
                        `}
                    </div>
                </td>
            </tr>
        `).join('');
    },

    updateStatus(id, newStatus) {
        const review = this.reviews.find(r => r.id === id);
        if (review) {
            review.status = newStatus;
            this.renderTable();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AdminReviews.init();
});

