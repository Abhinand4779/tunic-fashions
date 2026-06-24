const fs = require('fs');

async function testEcommerceFlow() {
    const API_URL = 'https://huestorybyreshma.com/server/api';
    let adminToken = '';
    let categoryId = '';
    let productId = '';
    let userToken = '';

    console.log("=== TUNIC FASHIONS Ecommerce Flow Test ===");

    try {
        // 1. Admin Login
        console.log("1. Admin Login");
        const loginRes = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@hue.com', password: 'password' }) // Or admin@astra.com if DB not updated
        });
        
        let loginData = await loginRes.json();
        
        // If login failed, try the old email just in case the seeder wasn't updated
        if (!loginRes.ok) {
            console.log("Failed with admin@hue.com, trying admin@astra.com...");
            const loginRes2 = await fetch(`${API_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'admin@astra.com', password: 'password' })
            });
            loginData = await loginRes2.json();
            if (!loginRes2.ok) throw new Error("Admin login failed.");
        }
        
        adminToken = loginData.token || loginData.access_token;
        if (!adminToken) throw new Error("No admin token returned.");
        console.log("-> Admin logged in successfully!");

        // 2. Create Category
        console.log("2. Admin Creating Category");
        const catRes = await fetch(`${API_URL}/admin/categories`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ name: 'Test Accessories' })
        });
        const catData = await catRes.json();
        if (!catRes.ok) throw new Error(`Category creation failed: ${JSON.stringify(catData)}`);
        categoryId = catData.id;
        console.log(`-> Category 'Test Accessories' created with ID ${categoryId}.`);

        // 3. Edit Category
        console.log("3. Admin Editing Category");
        const editCatRes = await fetch(`${API_URL}/admin/categories/${categoryId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ name: 'Test Accessories Updated' })
        });
        if (!editCatRes.ok) throw new Error("Category edit failed.");
        console.log("-> Category successfully edited.");

        // 4. Create Product
        console.log("4. Admin Creating Product");
        const formData = new FormData();
        formData.append('name', 'Luxury Gold Watch');
        formData.append('description', 'A beautiful watch.');
        formData.append('price', '500');
        formData.append('category_id', categoryId);

        const prodRes = await fetch(`${API_URL}/admin/products`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json'
            },
            body: formData
        });
        const prodData = await prodRes.json();
        if (!prodRes.ok) throw new Error(`Product creation failed: ${JSON.stringify(prodData)}`);
        productId = prodData.id;
        console.log(`-> Product 'Luxury Gold Watch' created with ID ${productId}.`);

        // 5. User fetch Categories (Navbar validation)
        console.log("5. User Fetching Categories (Navbar)");
        const getCatRes = await fetch(`${API_URL}/categories`);
        const getCatData = await getCatRes.json();
        const foundCat = getCatData.find(c => c.id === categoryId);
        if (!foundCat || foundCat.name !== 'Test Accessories Updated') throw new Error("Category not found or not updated in user API.");
        console.log("-> Categories successfully fetched. Navbar sync works!");

        // 6. User fetch Products
        console.log("6. User Fetching Products");
        const getProdRes = await fetch(`${API_URL}/products`);
        const getProdData = await getProdRes.json();
        const foundProd = getProdData.find(p => p.id === productId);
        if (!foundProd) throw new Error("Product not found in user API.");
        console.log("-> Products successfully fetched. Shop feed sync works!");

        // 7. Skip User Login since POST /orders is public
        console.log("7. User Login (Skipping, order is public)");

        // 8. User Create Order
        console.log("8. User Purchasing Item (Creating Order)");
        const orderRes = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: [{ product_id: productId, quantity: 1 }],
                customer_name: 'Test User',
                customer_email: 'user@example.com',
                shipping_address: '123 Test St, City, ST 12345',
                phone: '5551234567',
                total_amount: 500,
                status: 'Processing'
            })
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(`Order creation failed: ${JSON.stringify(orderData)}`);
        console.log(`-> Order created successfully! Order ID: ${orderData.id}`);

        console.log("=== All Tests Passed Successfully! The application is acting like a perfect ecommerce website! ===");
        
    } catch (e) {
        console.error("Test Failed!", e);
    } finally {
        if (fs.existsSync('dummy_image.png')) fs.unlinkSync('dummy_image.png');
    }
}

testEcommerceFlow();


