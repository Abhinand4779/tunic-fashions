const fs = require('fs');
const files = ['admin/dashboard.html', 'admin/products.html'];
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    // Remove the <li> that contains the Child Category link.
    // Let's use string manipulation or a simple regex.
    const regex = /<li[^>]*>[\s\S]*?<a[^>]*href=\"[^\"]*child-category[^\"]*\"[^>]*>[\s\S]*?<\/a>[\s\S]*?<\/li>/gi;
    let oldLength = content.length;
    content = content.replace(regex, '');
    fs.writeFileSync(file, content);
    console.log('Fixed', file, 'Removed', oldLength - content.length, 'bytes');
}
