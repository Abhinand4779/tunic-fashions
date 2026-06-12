/**
 * HUE - Profile & Auth Page Logic
 * Replaces Profile.jsx logic
 */

const ProfileHandler = {
    isLogin: true,
    isGuestMode: false,
    loading: false,
    error: '',
    formData: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        guestEmail: ''
    },

    init() {
        if (Auth.user) {
            this.renderDashboard();
        } else {
            this.renderAuth();
        }
    },

    renderAuth() {
        const wrap = document.getElementById('profile-page-wrap');
        if (!wrap) return;

        wrap.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h1 class="auth-title">
                            ${this.isGuestMode ? 'Guest Checkout' : (this.isLogin ? 'Login' : 'Create Account')}
                        </h1>
                        <p class="auth-subtitle">
                            ${this.isGuestMode
                ? 'Provide your email to receive order updates'
                : (this.isLogin ? 'Enter your credentials to access your account' : 'Join the HUE community and start your style journey')}
                        </p>
                        ${this.error ? `<div class="error-alert mb-3">${this.error}</div>` : ''}
                    </div>

                    ${this.isGuestMode ? this.renderGuestForm() : this.renderAuthForm()}
                </div>
            </div>`;
    },

    renderGuestForm() {
        return `
            <form class="auth-form" onsubmit="ProfileHandler.handleGuestLogin(event)">
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" name="guestEmail" placeholder="guest@example.com" value="${this.formData.guestEmail}" oninput="ProfileHandler.updateForm(this)" required>
                </div>
                <button type="submit" class="auth-btn" ${this.loading ? 'disabled' : ''}>
                    ${this.loading ? 'Processing...' : 'Continue to Shop'}
                </button>
                <button type="button" class="toggle-btn" style="margin-top: 1rem; text-decoration: none" onclick="ProfileHandler.setGuestMode(false)">
                    &larr; Back to Login
                </button>
            </form>`;
    },

    renderAuthForm() {
        return `
            <form class="auth-form" onsubmit="ProfileHandler.handleSubmit(event)">
                ${!this.isLogin ? `
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" placeholder="John Doe" value="${this.formData.name}" oninput="ProfileHandler.updateForm(this)" required>
                    </div>` : ''}

                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" placeholder="name@example.com" value="${this.formData.email}" oninput="ProfileHandler.updateForm(this)" required>
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" placeholder="••••••••" value="${this.formData.password}" oninput="ProfileHandler.updateForm(this)" required>
                </div>

                ${!this.isLogin ? `
                    <div class="form-group">
                        <label>Confirm Password</label>
                        <input type="password" name="confirmPassword" placeholder="••••••••" value="${this.formData.confirmPassword}" oninput="ProfileHandler.updateForm(this)" required>
                    </div>` : ''}

                ${this.isLogin ? `
                    <div class="auth-options">
                        <label class="remember-me">
                            <input type="checkbox"> Remember me
                        </label>
                    </div>` : ''}

                <button type="submit" class="auth-btn" ${this.loading ? 'disabled' : ''}>
                    ${this.loading ? 'Processing...' : (this.isLogin ? 'Sign In' : 'Create Account')}
                </button>

                ${this.isLogin ? `
                    <div class="auth-divider">OR</div>
                    <button type="button" class="guest-btn" onclick="ProfileHandler.setGuestMode(true)">
                        <i class="bi bi-person-badge"></i> Continue as Guest
                    </button>` : ''}
            </form>

            <div class="auth-footer">
                <p>
                    ${this.isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onclick="ProfileHandler.toggleMode()" class="toggle-btn">
                        ${this.isLogin ? 'Register Now' : 'Login Here'}
                    </button>
                </p>
            </div>`;
    },

    renderDashboard() {
        const wrap = document.getElementById('profile-page-wrap');
        if (!wrap) return;

        const user = Auth.user;
        const orders = Auth.userOrders || [];

        wrap.innerHTML = `
            <div class="profile-dashboard">
                <header class="profile-header">
                    <h1>My Account</h1>
                    <div class="user-meta">
                        <span class="user-name">${user.name}</span>
                        <span class="user-email">${user.email}</span>
                        <button onclick="Auth.logout(); location.reload();" class="logout-btn">Logout</button>
                    </div>
                </header>

                <div class="profile-content">
                    <section class="orders-section">
                        <h3>Order History</h3>
                        ${orders.length === 0 ? `
                            <div class="empty-orders">
                                <i class="bi bi-box-seam"></i>
                                <p>You haven't placed any orders yet.</p>
                                <a href="shop.html" class="shop-now-lnk">Shop Now</a>
                            </div>
                        ` : `
                            <div class="orders-list">
                                ${orders.map(order => `
                                    <div class="order-card">
                                        <div class="order-head">
                                            <span class="order-id">Order #${(order._id || order.id).substring(0, 8)}</span>
                                            <span class="order-status badge ${order.status?.toLowerCase()}">${order.status || 'Pending'}</span>
                                        </div>
                                        <div class="order-body">
                                            <p>Total: <strong>${order.total_amount || order.total}</strong></p>
                                            <p>Date: ${new Date(order.created_at || order.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </section>
                </div>
            </div>`;
    },

    updateForm(el) { this.formData[el.name] = el.value; },
    toggleMode() { this.isLogin = !this.isLogin; this.isGuestMode = false; this.error = ''; this.renderAuth(); },
    setGuestMode(b) { this.isGuestMode = b; this.error = ''; this.renderAuth(); },

    async handleSubmit(e) {
        e.preventDefault();
        this.error = '';
        this.loading = true;
        this.renderAuth();

        try {
            if (!this.isLogin) {
                if (this.formData.password !== this.formData.confirmPassword) {
                    this.error = "Passwords do not match!";
                    this.loading = false;
                    this.renderAuth();
                    return;
                }
                const res = await fetch(`${Site.API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: this.formData.name,
                        email: this.formData.email,
                        password: this.formData.password
                    })
                });
                if (res.ok) {
                    alert("Registration successful! Please login.");
                    this.isLogin = true;
                    this.loading = false;
                    this.renderAuth();
                } else {
                    const err = await res.json();
                    this.error = err.detail || "Registration failed";
                    this.loading = false;
                    this.renderAuth();
                }
            } else {
                const loginData = new URLSearchParams();
                loginData.append('username', this.formData.email.trim());
                loginData.append('password', this.formData.password.trim());

                const res = await fetch(`${Site.API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: loginData
                });
                if (res.ok) {
                    const data = await res.json();
                    Auth.login({ name: this.formData.name || 'User', email: this.formData.email }, data.access_token);

                    const params = new URLSearchParams(window.location.search);
                    const action = params.get('action');
                    if (action === 'buy') window.location.href = 'checkout.html';
                    else window.location.href = 'index.html';
                } else {
                    const err = await res.json();
                    this.error = err.detail || "Invalid Email or Password";
                    this.loading = false;
                    this.renderAuth();
                }
            }
        } catch (err) {
            this.error = "Connection error. Please try again.";
            this.loading = false;
            this.renderAuth();
        }
    },

    handleGuestLogin(e) {
        e.preventDefault();
        if (!this.formData.guestEmail) {
            alert("Email required");
            return;
        }
        Auth.login({ name: 'Guest User', email: this.formData.guestEmail, role: 'guest' });
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'buy') window.location.href = 'checkout.html';
        else window.location.href = 'index.html';
    }
};

ProfileHandler.init();
window.addEventListener('siteDataLoaded', () => ProfileHandler.init());

