/**
 * TUNIC FASHIONS - Local Storage Database
 * Bypasses the broken backend API to allow adding products locally.
 */

const LocalDB = {
    init() {
        if (!localStorage.getItem('hue_products')) {
            // Seed with default saree products so the site isn't empty
            const defaultProducts = [
                { id: "p1", name: "Dusty Rose Silk Saree", price: "4250", category: "Silk Sarees", image: "assets/saree_product_1.png", sizes: ["Free Size"] },
                { id: "p2", name: "Golden Banarasi Saree", price: "6750", category: "Banarasi Sarees", image: "assets/saree_product_2.png", sizes: ["Free Size", "Standard"] },
                { id: "p3", name: "Lavender Chiffon Saree", price: "3250", category: "Chiffon Sarees", image: "assets/saree_product_3.png", sizes: ["Standard"] },
                { id: "p4", name: "Mint Green Georgette Saree", price: "3850", category: "Georgette Sarees", image: "assets/saree_product_4.png", sizes: ["Free Size", "Custom"] },
                { id: "p5", name: "Peach Organza Saree", price: "4150", category: "Organza Sarees", image: "assets/saree_product_2.png" },
                { id: "p6", name: "Wine Embroidered Saree", price: "5950", category: "Silk Sarees", image: "assets/saree_product_3.png" },
                { id: "p7", name: "Pastel Blue Silk Saree", price: "4950", category: "Silk Sarees", image: "assets/saree_product_4.png" },
                { id: "p8", name: "Ivory Festive Saree", price: "6250", category: "Festive Sarees", image: "assets/saree_product_1.png" }
            ];
            localStorage.setItem('hue_products', JSON.stringify(defaultProducts));
        }
    },

    getProducts() {
        try {
            return JSON.parse(localStorage.getItem('hue_products')) || [];
        } catch (e) {
            return [];
        }
    },

    addProduct(product) {
        const products = this.getProducts();
        product.id = 'p_' + Date.now();
        products.unshift(product);
        localStorage.setItem('hue_products', JSON.stringify(products));
        return product;
    },

    deleteProduct(id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        localStorage.setItem('hue_products', JSON.stringify(products));
    },

    getCategories() {
        try {
            return JSON.parse(localStorage.getItem('hue_categories')) || ["Silk Sarees", "Banarasi Sarees", "Chiffon Sarees", "Georgette Sarees", "Organza Sarees", "Festive Sarees"];
        } catch (e) {
            return ["Silk Sarees", "Banarasi Sarees", "Chiffon Sarees", "Georgette Sarees", "Organza Sarees", "Festive Sarees"];
        }
    },

    addCategory(catName) {
        let cats = this.getCategories();
        if(!cats.includes(catName)) {
            cats.push(catName);
            localStorage.setItem('hue_categories', JSON.stringify(cats));
        }
        return cats;
    },
    
        deleteCategory(catName) {
        let cats = this.getCategories();
        cats = cats.filter(c => c !== catName);
        localStorage.setItem('hue_categories', JSON.stringify(cats));
        
        // Remove image
        let images = this.getAllCategoryImages();
        delete images[catName];
        localStorage.setItem('hue_category_images', JSON.stringify(images));
    },

    getAllCategoryImages() {
        try {
            return JSON.parse(localStorage.getItem('hue_category_images')) || {};
        } catch (e) {
            return {};
        }
    },

    getCategoryImage(catName) {
        return this.getAllCategoryImages()[catName] || '';
    },

    setCategoryImage(catName, base64Image) {
        let images = this.getAllCategoryImages();
        images[catName] = base64Image;
        localStorage.setItem('hue_category_images', JSON.stringify(images));
    },

    getAllSubCategories() {
        try {
            return JSON.parse(localStorage.getItem('hue_subcategories')) || {};
        } catch (e) {
            return {};
        }
    },

    getSubCategories(catName) {
        const subs = this.getAllSubCategories();
        return subs[catName] || [];
    },

    addSubCategory(catName, subCatName) {
        let subs = this.getAllSubCategories();
        if(!subs[catName]) subs[catName] = [];
        if(!subs[catName].includes(subCatName)) {
            subs[catName].push(subCatName);
            localStorage.setItem('hue_subcategories', JSON.stringify(subs));
        }
    },

    deleteSubCategory(catName, subCatName) {
        let subs = this.getAllSubCategories();
        if(subs[catName]) {
            subs[catName] = subs[catName].filter(s => s !== subCatName);
            localStorage.setItem('hue_subcategories', JSON.stringify(subs));
        }
    }
};

LocalDB.init();



