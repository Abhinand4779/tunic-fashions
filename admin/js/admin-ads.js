/**
 * HUE - Ads/Banners Admin Logic
 */

const AdminAds = {
    ads: [
        { id: 1, title: 'Australia', image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=100&q=80' },
        { id: 2, title: 'Australia', image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=100&q=80' }
    ],

    init() {
        if (!Auth.admin) {
            window.location.href = 'login.html';
            return;
        }

        this.renderTable();
        this.setupModalEvents();
    },

    renderTable() {
        const tbody = document.getElementById('ads-table-body');
        if (!tbody) return;

        if (this.ads.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No ads found.</td></tr>';
            return;
        }

        tbody.innerHTML = this.ads.map(ad => `
            <tr>
                <td>${ad.id}</td>
                <td style="color: #64748b;">${ad.title}</td>
                <td>
                    <img src="${ad.image}" class="ad-thumbnail" alt="Ad">
                </td>
                <td>
                    <div class="action-icons">
                        <i class="bi bi-pencil-fill" onclick="AdminAds.editAd(${ad.id})" title="Edit"></i>
                        <i class="bi bi-trash-fill" onclick="AdminAds.deleteAd(${ad.id})" title="Delete"></i>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    editAd(id) {
        const ad = this.ads.find(a => a.id === id);
        if (!ad) return;

        document.getElementById('adTitle').value = ad.title;
        document.getElementById('imagePreview').src = ad.image;
        document.getElementById('imagePreview').style.display = 'block';
        
        document.getElementById('adModalOverlay').style.display = 'flex';
    },

    deleteAd(id) {
        if (confirm('Are you sure you want to delete this ad?')) {
            this.ads = this.ads.filter(a => a.id !== id);
            this.renderTable();
        }
    },

    setupModalEvents() {
        const dropArea = document.getElementById('imageDropArea');
        const fileInput = document.getElementById('adImageInput');
        const preview = document.getElementById('imagePreview');

        if (!dropArea) return;

        dropArea.addEventListener('click', () => fileInput.click());

        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropArea.style.borderColor = 'var(--admin-primary)';
        });

        dropArea.addEventListener('dragleave', () => {
            dropArea.style.borderColor = '#cbd5e1';
        });

        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            dropArea.style.borderColor = '#cbd5e1';
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                this.handleFileUpload(fileInput.files[0]);
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
                this.handleFileUpload(fileInput.files[0]);
            }
        });

        document.getElementById('adForm').addEventListener('submit', (e) => {
            e.preventDefault();
            // Just close and fake save for now
            document.getElementById('adModalOverlay').style.display = 'none';
            alert('Ad saved successfully!');
            // Reset form
            e.target.reset();
            preview.style.display = 'none';
        });
    },

    handleFileUpload(file) {
        const preview = document.getElementById('imagePreview');
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AdminAds.init();
});

