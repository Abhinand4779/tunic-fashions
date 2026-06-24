const API_URL = 'https://huestorybyreshma.com/server/api';

const AdminAds = {
    ads: [],

    async init() {
        if (!Auth.admin) {
            window.location.href = 'login.html';
            return;
        }

        await this.loadSettings();
        this.renderTable();
        this.setupModalEvents();
    },

    async loadSettings() {
        try {
            const saved = localStorage.getItem('hue_hero_sliders');
            if (saved) {
                this.ads = JSON.parse(saved);
            } else if (window.DEFAULT_CONFIG && window.DEFAULT_CONFIG.heroSliders) {
                this.ads = [...window.DEFAULT_CONFIG.heroSliders];
            }
        } catch (err) {
            console.error('Error loading settings', err);
        }
    },

    async saveSettings() {
        try {
            localStorage.setItem('hue_hero_sliders', JSON.stringify(this.ads));
        } catch (err) {
            console.error('Error saving settings', err);
            alert('Error saving settings.');
        }
    },

    renderTable() {
        const tbody = document.getElementById('ads-table-body');
        if (!tbody) return;

        if (this.ads.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hero images found.</td></tr>';
            return;
        }

        tbody.innerHTML = this.ads.map((ad, idx) => {
            let imgSrc = ad.image;
            if (!imgSrc.startsWith('http') && !imgSrc.startsWith('data:')) {
                imgSrc = '../' + imgSrc;
            }
            return `
                <tr>
                    <td>${idx + 1}</td>
                    <td style="color: #64748b;">${ad.title || 'Hero Banner'}</td>
                    <td>
                        <img src="${imgSrc}" class="ad-thumbnail" alt="Ad" style="max-height: 60px; object-fit: contain; background: #f9f9f9; padding: 2px;">
                    </td>
                    <td>
                        <div class="action-icons">
                            <i class="bi bi-trash-fill" onclick="AdminAds.deleteAd(${ad.id})" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    async deleteAd(id) {
        if (confirm('Are you sure you want to delete this hero image?')) {
            this.ads = this.ads.filter(a => a.id !== id);
            this.renderTable();
            await this.saveSettings();
        }
    },

    setupModalEvents() {
        const dropArea = document.getElementById('imageDropArea');
        const fileInput = document.getElementById('adImageInput');
        const preview = document.getElementById('imagePreview');
        const form = document.getElementById('adForm');

        if (!dropArea || !form) return;

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

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('adTitle').value;
            
            if (fileInput.files.length === 0) {
                alert("Please select an image");
                return;
            }

            const file = fileInput.files[0];
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                const base64Image = event.target.result;
                const newAd = {
                    id: Date.now(),
                    title: title || 'Hero Banner',
                    image: base64Image
                };
                
                this.ads.push(newAd);
                this.renderTable();
                await this.saveSettings();
                
                document.getElementById('adModalOverlay').style.display = 'none';
                form.reset();
                preview.style.display = 'none';
            };
            
            reader.readAsDataURL(file);
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