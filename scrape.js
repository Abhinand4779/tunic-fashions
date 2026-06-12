const fs = require('fs');

async function run() {
    try {
        console.log('Fetching login page...');
        // 1. Get login page to grab CSRF token and cookies
        const initRes = await fetch('https://HUE.com/login');
        const initHtml = await initRes.text();
        const cookies = initRes.headers.get('set-cookie');
        const tokenMatch = initHtml.match(/name=\"_token\" value=\"([^\"]+)\"/);
        if (!tokenMatch) {
            console.log('No CSRF token found');
            return;
        }
        const token = tokenMatch[1];
        console.log('Got token:', token);
        
        // 2. Post login
        const loginParams = new URLSearchParams();
        loginParams.append('_token', token);
        loginParams.append('email', 'test@example.com');
        loginParams.append('password', 'password');
        
        console.log('Logging in...');
        const loginRes = await fetch('https://HUE.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookies,
                'Referer': 'https://HUE.com/login'
            },
            body: loginParams.toString(),
            redirect: 'manual'
        });
        
        const loginCookies = loginRes.headers.get('set-cookie');
        const allCookies = (cookies || '') + ';' + (loginCookies || '');
        
        // 3. Get Dashboard
        console.log('Fetching dashboard...');
        const dashRes = await fetch('https://HUE.com/admin/dashboard', {
            headers: { 'Cookie': allCookies }
        });
        const dashHtml = await dashRes.text();
        
        fs.writeFileSync('c:/Users/HP/OneDrive/Desktop/HUE_FRONTEND/scraped_dashboard.html', dashHtml);
        console.log('Successfully saved to scraped_dashboard.html');
        
        // Let's also grab the Products page
        console.log('Fetching products page...');
        const prodRes = await fetch('https://HUE.com/admin/products', {
            headers: { 'Cookie': allCookies }
        });
        const prodHtml = await prodRes.text();
        fs.writeFileSync('c:/Users/HP/OneDrive/Desktop/HUE_FRONTEND/scraped_products.html', prodHtml);
        console.log('Successfully saved to scraped_products.html');

    } catch(e) { 
        console.error(e); 
    }
}

run();

