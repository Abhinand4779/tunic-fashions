const fs = require('fs');
 // Note: we can just read the html files directly

const files = [
    'about.html', 'cart.html', 'checkout.html', 'contact.html',
    'index.html', 'our-story.html', 'privacy-policy.html',
    'product.html', 'profile.html', 'shipping-return.html',
    'shipping.html', 'shop.html', 'wishlist.html'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Look for the navbar-wrapper inline style
    const regex = /(<div\s+class="navbar-wrapper"[^>]*style="[^"]*)(max-width:\s*1400px;\s*margin:\s*0\s+auto;)([^"]*")/g;
    
    if (regex.test(content)) {
        content = content.replace(regex, '$1$3');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed ${file}`);
    } else {
        // Try another variation just in case
        const regex2 = /(<div\s+class="navbar-wrapper"[^>]*style="[^"]*)max-width:\s*1400px;\s*margin:\s*0\s+auto;([^"]*")/g;
        if(content.match(regex2)) {
            content = content.replace(regex2, '$1$2');
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Fixed ${file}`);
        }
    }
});
console.log('Done.');
