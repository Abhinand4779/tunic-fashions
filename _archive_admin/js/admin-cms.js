/**
 * TUNIC FASHIONS - Admin CMS / Site Settings
 */

const AdminCMS = {
    async init() {
        if (!Auth.admin) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            const res = await fetch(`${API_BASE_URL}/admin/settings`, {
                headers: { 'Authorization': `Bearer ${Auth.admin.token}` }
            });
            const settings = res.ok ? await res.json() : [];
            
            // Map settings array to object for easier use
            this.config = {};
            if (Array.isArray(settings)) {
                settings.forEach(s => {
                    this.config[s.key] = s.value;
                });
            }
            
            this.render();
        } catch(e) {
            console.error("Settings load error", e);
            this.config = {};
            this.render();
        }
    },

    render() {
        const wrap = document.getElementById('admin-content');
        if (!wrap) return;

        wrap.innerHTML = `
            <div class="admin-dashboard-premium">
                
                <header style="margin-bottom: 2rem;">
                    <h2 style="font-weight:800;font-size:1.8rem;color:#0f172a;margin-bottom:0.2rem;">Site Settings</h2>
                    <p style="color:var(--admin-text-muted);font-size:0.95rem;font-weight:500;">
                        Configure your store appearance and information
                    </p>
                </header>

                <!-- TABS CONTAINER -->
                <div style="background:#fff;border-radius:12px;padding:0.5rem;display:flex;gap:0.5rem;overflow-x:auto;margin-bottom:2rem;box-shadow:var(--admin-shadow);border:1px solid var(--admin-border);">
                    <button class="cms-tab active" data-tab="homepage"><i class="bi bi-house"></i> Homepage</button>
                    <button class="cms-tab" data-tab="navigation"><i class="bi bi-list"></i> Navigation</button>
                    <button class="cms-tab" data-tab="about"><i class="bi bi-info-circle"></i> About Us</button>
                    <button class="cms-tab" data-tab="team"><i class="bi bi-people"></i> Our Team</button>
                    <button class="cms-tab" data-tab="contact"><i class="bi bi-telephone"></i> Contact</button>
                    <button class="cms-tab" data-tab="advanced"><i class="bi bi-shield-check"></i> Advanced</button>
                    <button class="cms-tab" data-tab="policies"><i class="bi bi-file-text"></i> Policies</button>
                    <button class="cms-tab" data-tab="coupons"><i class="bi bi-ticket-perforated"></i> Coupons</button>
                </div>

                <!-- TAB CONTENT -->
                <div class="premium-card" id="cms-content-area" style="padding: 2.5rem;">
                    <!-- Content injected here -->
                </div>

            </div>`;
            
        // Setup Tab styles
        const style = document.createElement('style');
        style.textContent = `
            .cms-tab {
                background: transparent;
                color: var(--admin-text-muted);
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
            }
            .cms-tab:hover {
                background: #f1f5f9;
                color: var(--admin-text-dark);
            }
            .cms-tab.active {
                background: var(--admin-primary);
                color: #333333;
                box-shadow: 0 4px 10px rgba(93, 95, 239, 0.3);
            }
            .cms-input-group {
                margin-bottom: 1.5rem;
            }
            .cms-input-label {
                display: block;
                font-size: 0.75rem;
                font-weight: 700;
                color: var(--admin-text-muted);
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 0.5rem;
            }
            .cms-input {
                width: 100%;
                padding: 1rem 1.25rem;
                border: 1px solid var(--admin-border);
                border-radius: 8px;
                font-size: 0.95rem;
                font-family: inherit;
                color: var(--admin-text-dark);
                outline: none;
                transition: border-color 0.2s;
            }
            .cms-input:focus {
                border-color: var(--admin-primary);
            }
            .cms-btn-submit {
                width: 100%;
                background: var(--admin-primary);
                color: #333333;
                border: none;
                padding: 1rem;
                border-radius: 8px;
                font-weight: 700;
                font-size: 1rem;
                letter-spacing: 1px;
                margin-top: 1rem;
                transition: all 0.2s;
            }
            .cms-btn-submit:hover {
                background: #4b4dcd;
            }
        `;
        document.head.appendChild(style);

        this.bindTabs();
        this.renderHomepageTab(); // Default
    },

    bindTabs() {
        const tabs = document.querySelectorAll('.cms-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                const target = e.currentTarget.dataset.tab;
                if (target === 'homepage') this.renderHomepageTab();
                else if (target === 'contact') this.renderContactTab();
                else if (target === 'about') this.renderAboutTab();
                else if (target === 'policies') this.renderPoliciesTab();
                else this.renderPlaceholderTab(target);
            });
        });
    },

    renderHomepageTab() {
        const contentArea = document.getElementById('cms-content-area');
        
        // Use backend settings or fallbacks
        let bannerText = "FREE SHIPPING on orders above 899 | COD Available | 10,000+ Happy Customers";
        let heroTitle = "PREMIUM WALL ART FOR YOUR SPACE";
        let heroSub = "Elevate your room with high-quality posters";
        
        try {
            if (this.config['announcement_bar']) bannerText = JSON.parse(this.config['announcement_bar']);
        } catch(e){}
        
        contentArea.innerHTML = `
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:2rem;">
                <i class="bi bi-window" style="font-size:1.5rem;color:var(--admin-text-dark);"></i>
                <h3 style="font-weight:800;font-size:1.4rem;color:var(--admin-text-dark);margin:0;">Homepage Banner</h3>
            </div>
            
            <form id="cms-homepage-form">
                <div class="cms-input-group">
                    <label class="cms-input-label">ANNOUNCEMENT BAR</label>
                    <input type="text" class="cms-input" id="announcement_bar" value="${bannerText}">
                </div>
                
                <div class="cms-input-group">
                    <label class="cms-input-label">HERO TITLE</label>
                    <input type="text" class="cms-input" id="hero_title" value="${heroTitle}">
                </div>

                <div class="cms-input-group">
                    <label class="cms-input-label">HERO SUBTITLE</label>
                    <textarea class="cms-input" id="hero_subtitle" rows="3" style="resize:none;">${heroSub}</textarea>
                </div>
                
                <button type="submit" class="cms-btn-submit">UPDATE HOME BANNERS</button>
            </form>
        `;

        document.getElementById('cms-homepage-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = "UPDATING...";
            
            try {
                // Here we would typically send individual updates for keys
                // For simplicity we will update announcement_bar
                await fetch(`${API_BASE_URL}/admin/settings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Auth.admin.token}`
                    },
                    body: JSON.stringify({
                        settings: {
                            'announcement_bar': document.getElementById('announcement_bar').value,
                            'hero_title': document.getElementById('hero_title').value,
                            'hero_subtitle': document.getElementById('hero_subtitle').value
                        }
                    })
                });
                
                btn.textContent = "UPDATED SUCCESSFULLY";
                btn.style.background = "#10b981";
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = "";
                }, 2000);
            } catch(e) {
                console.error(e);
                btn.textContent = "ERROR";
                btn.style.background = "#ef4444";
            }
        });
    },

    renderContactTab() {
        const contentArea = document.getElementById('cms-content-area');
        
        let email = this.config['contact_email'] || 'support@astra.com';
        let phone = this.config['contact_phone'] || '+1 234 567 890';
        let address = this.config['contact_address'] || '123 Jewelry Lane, NY 10001';

        contentArea.innerHTML = `
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:2rem;">
                <i class="bi bi-telephone" style="font-size:1.5rem;color:var(--admin-text-dark);"></i>
                <h3 style="font-weight:800;font-size:1.4rem;color:var(--admin-text-dark);margin:0;">Contact Information</h3>
            </div>
            
            <form id="cms-contact-form">
                <div class="cms-input-group">
                    <label class="cms-input-label">SUPPORT EMAIL</label>
                    <input type="email" class="cms-input" id="contact_email" value="${email}">
                </div>
                <div class="cms-input-group">
                    <label class="cms-input-label">PHONE NUMBER</label>
                    <input type="text" class="cms-input" id="contact_phone" value="${phone}">
                </div>
                <div class="cms-input-group">
                    <label class="cms-input-label">STORE ADDRESS</label>
                    <textarea class="cms-input" id="contact_address" rows="3" style="resize:none;">${address}</textarea>
                </div>
                
                <button type="submit" class="cms-btn-submit">UPDATE CONTACT INFO</button>
            </form>
        `;
        
        this.bindFormSubmit('cms-contact-form', ['contact_email', 'contact_phone', 'contact_address']);
    },

    renderAboutTab() {
        const contentArea = document.getElementById('cms-content-area');
        
        let storeName = this.config['about_store_name'] || 'TUNIC FASHIONS';
        let tagline = this.config['about_tagline'] || 'Timeless jewelry that tells your unique story.';
        let desc = this.config['about_description'] || 'Handcrafted with passion and precision.';

        contentArea.innerHTML = `
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:2rem;">
                <i class="bi bi-info-circle" style="font-size:1.5rem;color:var(--admin-text-dark);"></i>
                <h3 style="font-weight:800;font-size:1.4rem;color:var(--admin-text-dark);margin:0;">About Us Details</h3>
            </div>
            
            <form id="cms-about-form">
                <div class="cms-input-group">
                    <label class="cms-input-label">STORE NAME</label>
                    <input type="text" class="cms-input" id="about_store_name" value="${storeName}">
                </div>
                <div class="cms-input-group">
                    <label class="cms-input-label">BRAND TAGLINE</label>
                    <input type="text" class="cms-input" id="about_tagline" value="${tagline}">
                </div>
                <div class="cms-input-group">
                    <label class="cms-input-label">BRAND DESCRIPTION</label>
                    <textarea class="cms-input" id="about_description" rows="4" style="resize:none;">${desc}</textarea>
                </div>
                
                <button type="submit" class="cms-btn-submit">UPDATE ABOUT US</button>
            </form>
        `;
        
        this.bindFormSubmit('cms-about-form', ['about_store_name', 'about_tagline', 'about_description']);
    },

    renderPoliciesTab() {
        const contentArea = document.getElementById('cms-content-area');
        
        let privacy = this.config['policy_privacy'] || 'https://astra.com/privacy';
        let refund = this.config['policy_refund'] || 'https://astra.com/refund';

        contentArea.innerHTML = `
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:2rem;">
                <i class="bi bi-file-text" style="font-size:1.5rem;color:var(--admin-text-dark);"></i>
                <h3 style="font-weight:800;font-size:1.4rem;color:var(--admin-text-dark);margin:0;">Store Policies</h3>
            </div>
            
            <form id="cms-policies-form">
                <div class="cms-input-group">
                    <label class="cms-input-label">PRIVACY POLICY LINK</label>
                    <input type="url" class="cms-input" id="policy_privacy" value="${privacy}">
                </div>
                <div class="cms-input-group">
                    <label class="cms-input-label">REFUND & RETURNS LINK</label>
                    <input type="url" class="cms-input" id="policy_refund" value="${refund}">
                </div>
                
                <button type="submit" class="cms-btn-submit">UPDATE POLICIES</button>
            </form>
        `;
        
        this.bindFormSubmit('cms-policies-form', ['policy_privacy', 'policy_refund']);
    },
    
    renderPlaceholderTab(name) {
        const contentArea = document.getElementById('cms-content-area');
        contentArea.innerHTML = `
            <div style="text-align:center;padding:4rem 0;">
                <i class="bi bi-tools" style="font-size:3rem;color:var(--admin-text-muted);margin-bottom:1rem;"></i>
                <h3 style="font-weight:700;color:var(--admin-text-dark);">${name.toUpperCase()} SETTINGS</h3>
                <p style="color:var(--admin-text-muted);">This specific configuration tab is still being designed for a premium experience.</p>
            </div>
        `;
    },

    bindFormSubmit(formId, fields) {
        document.getElementById(formId).addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = "UPDATING...";
            
            const settingsPayload = {};
            fields.forEach(f => {
                settingsPayload[f] = document.getElementById(f).value;
            });
            
            try {
                await fetch(`${API_BASE_URL}/admin/settings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Auth.admin.token}`
                    },
                    body: JSON.stringify({ settings: settingsPayload })
                });
                
                // Update local config
                fields.forEach(f => {
                    this.config[f] = settingsPayload[f];
                });
                
                btn.textContent = "UPDATED SUCCESSFULLY";
                btn.style.background = "#10b981";
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = "";
                }, 2000);
            } catch(err) {
                console.error(err);
                btn.textContent = "ERROR";
                btn.style.background = "#ef4444";
            }
        });
    }
};

AdminCMS.init();
Components.renderAdminSidebar();

