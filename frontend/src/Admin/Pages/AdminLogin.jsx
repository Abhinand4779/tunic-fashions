import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { adminLogin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const formData = new URLSearchParams();
            formData.append('username', credentials.email.trim());
            formData.append('password', credentials.password.trim());

            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                
                // Fetch full admin profile to get ID and other details
                const profileRes = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${data.access_token}` }
                });
                
                let adminData = { email: credentials.email, role: 'admin' };
                if (profileRes.ok) {
                    adminData = await profileRes.json();
                }

                adminLogin(adminData, data.access_token);
                navigate('/admin/dashboard');
            } else {
                const errData = await response.json().catch(() => ({}));
                setError(errData.detail || 'Invalid Admin Credentials');
            }
        } catch (err) {
            console.error("Login error", err);
            setError('Connection to backend failed');
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <div className="login-header">
                    <h2>ASTRA <span>ADMIN</span></h2>
                    <p>Secure Management Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="admin-login-form">
                    {error && <div className="error-alert">{error}</div>}

                    <div className="form-group">
                        <label>Admin Email</label>
                        <input
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="admin@astra.in"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn">Secure Login</button>

                    <p className="login-footer">
                        Secure administrative area. All actions are logged.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
