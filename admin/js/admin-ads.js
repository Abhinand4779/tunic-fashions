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
            const res = await fetch(API_URL + '/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.hero_sliders) {
                    try {
                        this.ads = JSON.parse(data.hero_sliders);
                    } catch(e) {
                        console.error('Failed to parse hero_sliders', e);
                    }
                }
            }
            if (this.ads.length === 0 && window.DEFAULT_CONFIG && window.DEFAULT_CONFIG.heroSliders) {
                this.ads = [...window.DEFAULT_CONFIG.heroSliders];
            }
        } catch (err) {
            console.error('Error fetching settings', err);
        }
    },

    async saveSettings() {
        try {
            const payload = {
                settings: {
                    hero_sliders: JSON.stringify(this.ads)
                }
            };
            const token = localStorage.getItem('adminToken');
            const res = await fetch(API_URL + '/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                alert('Failed to save Hero Sliders to database.');
            }
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
            return \
                <tr>
                    <td>\</td>
                    <td style="color: #64748b;">\</td>
                    <td>
                        <img src="\" class="ad-thumbnail" alt="Ad" style="max-height: 60px; object-fit: contain; background: #0f2230; padding: 2px;">
                    </td>
                    <td>
                        <div class="action-icons">
                            <i class="bi bi-trash-fill" onclick="AdminAds.deleteAd(\)" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            \;
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