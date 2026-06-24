const { chromium } = require('playwright');
const fs = require('fs');

async function scrapeAdmin() {
    console.log('Starting Playwright...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('Navigating to login...');
        await page.goto('https://TUNIC FASHIONS.com/admin/dashboard');

        // Fill login form
        console.log('Filling credentials...');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password');
        
        console.log('Clicking login...');
        await Promise.all([
            page.waitForNavigation(),
            page.click('button[type="submit"]')
        ]);

        console.log('Logged in. Waiting for dashboard to load...');
        await page.waitForTimeout(2000); // Give it a moment to render charts etc.

        // Get Dashboard HTML
        const dashHtml = await page.evaluate(() => document.documentElement.outerHTML);
        fs.writeFileSync('c:/Users/HP/OneDrive/Desktop/TUNIC FASHIONS_FRONTEND/admin/scraped_dashboard.html', dashHtml);
        console.log('Saved dashboard HTML.');

        // Navigate to Products
        console.log('Navigating to Products...');
        await page.goto('https://TUNIC FASHIONS.com/admin/products');
        await page.waitForTimeout(2000);

        const prodHtml = await page.evaluate(() => document.documentElement.outerHTML);
        fs.writeFileSync('c:/Users/HP/OneDrive/Desktop/TUNIC FASHIONS_FRONTEND/admin/scraped_products.html', prodHtml);
        console.log('Saved products HTML.');

        // Grab the CSS files used by the page to save locally
        const stylesheets = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                .map(link => link.href)
                .filter(href => href.includes('TUNIC FASHIONS.com'));
        });

        console.log('Downloading CSS files...', stylesheets);
        let combinedCss = '';
        for (const url of stylesheets) {
            try {
                const res = await page.evaluate(async (cssUrl) => {
                    const req = await fetch(cssUrl);
                    return await req.text();
                }, url);
                combinedCss += `\n/* Source: ${url} */\n${res}`;
            } catch (e) {
                console.log('Failed to fetch CSS', url);
            }
        }
        
        fs.writeFileSync('c:/Users/HP/OneDrive/Desktop/TUNIC FASHIONS_FRONTEND/css/scraped-admin.css', combinedCss);
        console.log('Saved combined CSS.');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
}

scrapeAdmin();

