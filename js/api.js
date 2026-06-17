const API_BASE_URL = 'https://huestorybyreshma.com/server/api';

/**
 * Helper function to fetch from the API.
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/products')
 * @param {object} options - Fetch options (method, headers, body)
 * @returns {Promise<any>}
 */
async function apiFetch(endpoint, options = {}) {
    const defaultHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('admin_token');
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API Request Failed');
    }

    return await response.json();
}

/**
 * Automatically record a page visit to the backend analytics.
 */
async function trackVisit() {
    const pageName = window.location.pathname.split('/').pop() || 'index.html';
    try {
        await apiFetch('/analytics/visit', {
            method: 'POST',
            body: JSON.stringify({ page_name: pageName })
        });
    } catch (e) {
        console.error("Failed to track visit", e);
    }
}

// Automatically track visit on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', trackVisit);
}


