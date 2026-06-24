const fs = require('fs');
const files = ['admin/dashboard.html', 'admin/products.html'];
const source_files = ['admin/scraped_dashboard.html', 'admin/scraped_products.html'];

for (let i = 0; i < files.length; i++) {
    let content = fs.readFileSync(source_files[i], 'utf8');
    
    // Only replace navigation links, NOT asset links!
    // We only want to replace href="https://TUNIC FASHIONS.com/admin/..."
    
    content = content.replace(/href=\"https:\/\/TUNIC FASHIONS\.com\/admin\/product\/list\"/g, 'href="products.html"');
    content = content.replace(/href=\"https:\/\/TUNIC FASHIONS\.com\/admin\/dashboard\"/g, 'href="dashboard.html"');
    content = content.replace(/href=\"https:\/\/TUNIC FASHIONS\.com\/admin\/([a-zA-Z0-9_-]+)\"/g, 'href="$1.html"');
    
    fs.writeFileSync(files[i], content);
    console.log('Restored and fixed links in', files[i]);
}

