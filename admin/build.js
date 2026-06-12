const fs = require('fs');
const path = require('path');

const adminDir = __dirname;
const shellTopPath = path.join(adminDir, 'shell-top.html');
const shellBottomPath = path.join(adminDir, 'shell-bottom.html');

const shellTop = fs.readFileSync(shellTopPath, 'utf8');
const shellBottom = fs.readFileSync(shellBottomPath, 'utf8');

const targetFiles = [
    'dashboard.html', 'products.html', 'ads.html', 'categories.html', 'subcategories.html', 'brands.html',
    'orders.html', 'product-create.html', 'pages.html', 'coupon-codes.html',
    'reviews.html', 'shipping-charges.html', 'main-titles.html',
    'dynamic-products.html', 'home-brands.html'
];

targetFiles.forEach(file => {
    const filePath = path.join(adminDir, file);
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${file}, not found.`);
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract <style> block
    let styleBlock = '';
    const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
    if (styleMatch) {
        styleBlock = `<style>\n${styleMatch[1]}\n</style>\n`;
    }
    
    // Extract main content
    let mainContent = '';
    const mainMatch = content.match(/<main class="(?:main-content w-full px-\[var\(--margin-x\)\] pb-8|admin-main)">\s+([\s\S]*?)<\/main>/);
    if (mainMatch) {
        mainContent = mainMatch[1];
        // Clean up any duplicated inner main tags from previous bad runs
        mainContent = mainContent.replace(/<main class="(?:main-content w-full px-\[var\(--margin-x\)\] pb-8|admin-main)">/g, '');
        // Clean up any stray closing main tags that may have accumulated
        mainContent = mainContent.replace(/<\/main>/g, '');
        // Clean up any custom scripts that got stuck inside mainContent
        mainContent = mainContent.replace(/<script src="(?:js\/admin-[^"]+)"><\/script>\s*/g, '');
    } else {
        console.log(`Warning: No main-content found in ${file}. Skipping.`);
        return;
    }
    
    // Automatically inject the corresponding custom script based on the filename
    const baseName = file.replace('.html', '');
    let customScript = '';
    
    // Most files have a matching admin-<name>.js script
    const scriptName = `admin-${baseName}.js`;
    const scriptPath = path.join(adminDir, 'js', scriptName);
    
    if (fs.existsSync(scriptPath)) {
        customScript = `<script src="js/${scriptName}"></script>\n`;
    }

    // Process Active States in Shell Top
    // The active class in dashboard.html for the sidebar panel looks like this:
    // class="flex py-2 text-xs+ tracking-wide outline-none transition-colors duration-300 ease-in-out font-medium text-primary dark:text-accent-light"
    // The inactive class looks like this:
    // class="flex py-2 text-xs+ tracking-wide outline-none transition-colors duration-300 ease-in-out text-slate-600 hover:text-slate-900 dark:text-navy-200 dark:hover:text-navy-50"
    
    // We can do a basic replace to activate the specific link
    let customizedShellTop = shellTop;
    
    // Build Secondary Navigation
    let secondaryLinks = [];
    const prodGroup = ['products.html', 'product-create.html', 'categories.html', 'subcategories.html', 'brands.html'];
    const adsGroup = ['ads.html', 'main-titles.html', 'dynamic-products.html', 'home-brands.html'];
    const ordersGroup = ['orders.html', 'shipping-charges.html'];
    const pagesGroup = ['pages.html', 'coupon-codes.html', 'reviews.html'];

    if (prodGroup.includes(file)) {
        secondaryLinks = [
            { name: 'Dashboard', href: 'dashboard.html' },
            { name: 'Category', href: 'categories.html' },
            { name: 'Sub Category', href: 'subcategories.html' },
            { name: 'Child Category', href: '#' },
            { name: 'Size', href: '#' },
            { name: 'Color', href: '#' },
            { name: 'Product Lists', href: 'products.html' },
            { name: 'Create Product', href: 'product-create.html' },
            { name: 'Warehouse', href: '#' }
        ];
    } else if (adsGroup.includes(file)) {
        secondaryLinks = [
            { name: 'Dashboard', href: 'dashboard.html' },
            { name: 'Banners', href: 'ads.html' },
            { name: 'Main titles / Videos', href: 'main-titles.html' },
            { name: 'Dynamic Products', href: 'dynamic-products.html' },
            { name: 'Home Brands', href: 'home-brands.html' }
        ];
    } else if (ordersGroup.includes(file)) {
        secondaryLinks = [
            { name: 'Dashboard', href: 'dashboard.html' },
            { name: 'Orders', href: 'orders.html' },
            { name: 'Shipping Charge', href: 'shipping-charges.html' }
        ];
    } else if (pagesGroup.includes(file)) {
        secondaryLinks = [
            { name: 'Dashboard', href: 'dashboard.html' },
            { name: 'Pages', href: 'pages.html' },
            { name: 'Coupon Codes', href: 'coupon-codes.html' },
            { name: 'Reviews', href: 'reviews.html' }
        ];
    } else {
        secondaryLinks = [{ name: 'Dashboard', href: 'dashboard.html' }];
    }

    let navHtml = '<ul class="flex flex-col flex-1 px-4 font-inter">\n';
    secondaryLinks.forEach(link => {
        const isActive = file === link.href || (link.href === '#' && false); // Basic active check
        const activeClass = isActive ? 'font-medium text-primary dark:text-accent-light' : 'text-slate-600 hover:text-slate-900 dark:text-navy-200 dark:hover:text-navy-50';
        
        navHtml += `<li>
            <a href="${link.href}" class="flex py-2 text-xs+ tracking-wide outline-none transition-colors duration-300 ease-in-out ${activeClass}">
                ${link.name}
            </a>
        </li>\n`;
    });
    navHtml += '</ul>';

    customizedShellTop = customizedShellTop.replace('<!-- SECONDARY_NAV_PLACEHOLDER -->', navHtml);

    // Also highlight the primary icon sidebar link
    const regex = new RegExp(`(<a[^>]+href="${file}"[^>]+class=")([^"]+)(")`, 'g');
    
    customizedShellTop = customizedShellTop.replace(regex, (match, p1, p2, p3) => {
        // Remove inactive classes
        let newClasses = p2.replace('text-slate-600 hover:text-slate-900 dark:text-navy-200 dark:hover:text-navy-50', '');
        // Add active classes
        if (!newClasses.includes('font-medium text-primary dark:text-accent-light')) {
            newClasses += ' font-medium text-primary dark:text-accent-light';
        }
        return p1 + newClasses.trim() + p3;
    });

    // Construct final HTML
    const finalHtml = customizedShellTop + 
                      '\n' + styleBlock + 
                      mainContent + 
                      '\n' + 
                      customScript + 
                      shellBottom;
                      
    fs.writeFileSync(filePath, finalHtml, 'utf8');
    console.log(`Processed and rebuilt ${file}`);
});

