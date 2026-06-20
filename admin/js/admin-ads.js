/**
 * HUE - Ads/Banners Admin Logic
 */

const API_URL = 'https://huestorybyreshma.com/server/api';

const AdminHeroSliders = {
    sliders: [],
    
    async init() {
        await this.loadSettings();
        this.renderTable();
        this.setupEvents();
    },

    async loadSettings() {
        try {
            const res = await fetch(API_URL + '/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.hero_sliders) {
                    try {
                        this.sliders = JSON.parse(data.hero_sliders);
                    } catch(e) {
                        console.error('Failed to parse hero_sliders', e);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching settings', err);
        }
    },

    async saveSettings() {
        try {
            const payload = {
                settings: {
                    hero_sliders: JSON.stringify(this.sliders)
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
        const tbody = document.getElementById('hero-table-body');
        if (!tbody) return;

        if (this.sliders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No hero sliders found.</td></tr>';
            return;
        }

        tbody.innerHTML = this.sliders.map((slider, index) => `
            <tr>
                <td>$({index + 1})</td>
                <td>
                    <img src="$({slider.image})" class="ad-thumbnail" alt="Slider" style="max-height: 80px; max-width: 200px; object-fit: contain; background: #0f2230;">
                </td>
                <td>
                    <div class="action-icons">
                        <i class="bi bi-trash-fill" onclick="AdminHeroSliders.deleteSlider($({slider.id}))" title="Delete"></i>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    async deleteSlider(id) {
        if (confirm('Are you sure you want to delete this slider?')) {
            this.sliders = this.sliders.filter(s => s.id !== id);
            this.renderTable();
            await this.saveSettings();
        }
    },

    setupEvents() {
        const form = document.getElementById('heroForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('heroImageInput');
            if (fileInput.files.length === 0) return;

            const file = fileInput.files[0];
            const reader = new FileReader();
            
            // Read as Base64
            reader.onload = async (event) => {
                const base64Image = event.target.result;
                
                const newSlider = {
                    id: Date.now(),
                    image: base64Image
                };
                
                this.sliders.push(newSlider);
                this.renderTable();
                await this.saveSettings();
                
                document.getElementById('heroModalOverlay').style.display = 'none';
                form.reset();
            };
            
            reader.readAsDataURL(file);
        });
    }
};
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
    AdminHeroSliders.init();
});

