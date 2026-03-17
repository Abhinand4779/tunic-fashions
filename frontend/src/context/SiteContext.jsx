import React, { createContext, useContext, useState, useEffect } from 'react';
import { allProducts as initialProducts } from '../data/products';

// Import existing assets for default values
import Women from '../assets/Main_Categories/women.png';
import Men from '../assets/Main_Categories/men.png';
import Kids from '../assets/Main_Categories/kids.png';
import Traditional from '../assets/Main_Categories/traditional.png';
import BannerImg from '../assets/About/Banner.jpg';
import Featured1 from '../assets/Ornaments_Categories/bangle.jpg';
import Featured2 from '../assets/Ornaments_Categories/earings.jpg';
import Featured3 from '../assets/Ornaments_Categories/chain.jpg';

const defaultConfig = {
    hero: {
        bannerImg: BannerImg,
        title: 'Elegance in Every Detail',
        subtitle: 'Explore the exclusive collection from Astra by Ash.',
        btnText: 'Shop Collection',
        btnLink: '/shop'
    },
    coupon: {
        label: 'Special Offer',
        discount: '15% OFF',
        text: 'On your first order above ₹1999',
        code: 'ASTRA15'
    },
    highlights: [
        { id: 1, title: 'Summer Sale', image: Featured1, subtitle: 'Flat 20% Off', link: '/offer-zone' },
        { id: 2, title: 'New Arrivals', image: Featured2, subtitle: 'Signature Collection', link: '/shop' },
        { id: 3, title: 'Best Sellers', image: Featured3, subtitle: 'Trending Now', link: '/shop' },
    ],
    promoCarousel: [
        {
            id: 1,
            image: Featured1,
            badge: 'New Arrival',
            title: 'Gold Bangles Collection',
            subtitle: 'Handcrafted with 22K gold plating — timeless elegance for every occasion.',
            link: '/shop',
            btnText: 'Shop Now',
            align: 'left'
        },
        {
            id: 2,
            image: Featured2,
            badge: 'Trending',
            title: 'Signature Earrings',
            subtitle: 'Lightweight, bold and beautiful — statement pieces that tell your story.',
            link: '/category/women',
            btnText: 'Explore',
            align: 'right'
        },
        {
            id: 3,
            image: Featured3,
            badge: 'Best Seller',
            title: 'Layered Chain Sets',
            subtitle: 'Stack them, layer them, own them. Our chains are crafted for royalty.',
            link: '/shop',
            btnText: 'View Collection',
            align: 'left'
        }
    ],
    testimonials: [
        { id: 1, name: "Anjali Sharma", handle: "@anjali_styles", text: "The gold plating is so authentic! I wore the bangles to a wedding and everyone thought they were real gold. Amazing quality from Astra.", rating: 5 },
        { id: 2, name: "Rahul Verma", handle: "@rahul_v", text: "Bought the layered chain set for my wife. The packaging and the finish of the product exceeded my expectations. Highly recommend!", rating: 5 },
        { id: 3, name: "Priya Iyer", handle: "@priya_jewels", text: "Finding traditional designs that don't feel heavy is hard. Astra's signature earrings are my new favorites for daily wear.", rating: 5 }
    ],
    homeCategories: [
        { id: 1, name: 'Women', image: Women, path: '/category/women' },
        { id: 2, name: 'Men', image: Men, path: '/category/men' },
        { id: 3, name: 'Kids', image: Kids, path: '/category/kids' },
        { id: 4, name: 'Traditional', image: Traditional, path: '/category/traditional' },
    ],
    footer: {
        storeName: 'Our Store',
        description: 'Astra by Ash was started in 2022 to bring elegance and tradition to your everyday style.',
        newsletterText: 'Sign up for our newsletter and receive 10% off your',
        copyright: '©2026 Astra by Ash. All Rights Reserved.',
        credit: 'Designed By RDR Technology',
        instagram: 'https://www.instagram.com/rdr.technology?igsh=eTc5NWUwOWN0eHBs'
    },
    navCategories: [
        { name: 'Women', path: '/category/women', dropdown: [] },
        { name: 'Men', path: '/category/men', dropdown: [] },
        { name: 'Kids', path: '/category/kids', dropdown: [] },
        { name: 'Offer Zone', path: '/offer-zone', dropdown: [] },
        { name: 'About Us', path: '/about-us', dropdown: [] },
        { name: 'Contact Us', path: '/contact-us', dropdown: [] }
    ],
    sectionCategories: {
        women: [
            { name: "Anklets", count: 42 },
            { name: "Adjustable Bangle", count: 25 },
            { name: "Diamond Replica", count: 18 },
            { name: "Bracelet", count: 64 },
            { name: "Earrings", count: 210 },
            { name: "Hindu God Chains", count: 12 },
            { name: "Rings", count: 56 },
            { name: "Traditional", count: 42 },
            { name: "Hip Chain", count: 15 },
            { name: "Jumkhas", count: 32 },
            { name: "Bangles", count: 85 },
            { name: "Chains", count: 120 },
            { name: "Neckpiece", count: 124 },
            { name: "Hindu Thali chains", count: 8 },
            { name: "Toe Ring", count: 14 }
        ],
        men: [
            { name: 'Bracelets', count: 18 },
            { name: 'Chains', count: 35 },
            { name: 'Hindu God Chains', count: 12 },
            { name: 'Cross Chains', count: 8 }
        ],
        kids: [
            { name: 'Earrings', count: 24 },
            { name: 'Neckpiece', count: 15 },
            { name: 'Bracelets', count: 12 },
            { name: 'Chains', count: 10 }
        ]
    },
    products: initialProducts
};

const SiteContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Helper to deep merge and respect timestamps
const mergeConfig = (base, override) => {
    if (!override) return base;

    // Safety check: if the server config is actually older than our local one, don't overwrite
    if (base.lastUpdated && override.lastUpdated && override.lastUpdated < base.lastUpdated) {
        console.warn("Server config is older than local config. Skipping overwrite.");
        return base;
    }

    const merged = { ...base };
    Object.keys(override).forEach(key => {
        if (
            override[key] &&
            typeof override[key] === 'object' &&
            !Array.isArray(override[key]) &&
            base[key]
        ) {
            merged[key] = { ...base[key], ...override[key] };
        } else {
            merged[key] = override[key];
        }
    });
    return merged;
};

export const SiteProvider = ({ children }) => {
    const [config, setConfig] = useState(defaultConfig);
    const [products, setProducts] = useState(initialProducts);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        // OPTIMIZATION: Check for local config immediately and show UI faster
        let hasLocalData = false;
        const stored = localStorage.getItem('astra_site_config_v2');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setConfig(prev => mergeConfig(prev, parsed));
                hasLocalData = true;
            } catch (err) { }
        }

        const lastProds = localStorage.getItem('astra_last_products') || localStorage.getItem('astra_last_products_lite');
        if (lastProds) {
            try {
                setProducts(JSON.parse(lastProds));
                hasLocalData = true;
            } catch (err) { }
        }

        // If we have local data, we can stop showing the spinner immediately
        // while we fetch fresh data in the background
        if (hasLocalData) {
            setLoading(false);
        }

        try {
            // Parallelize fetching for faster load
            const [configRes, prodRes] = await Promise.all([
                fetch(`${API_BASE_URL}/settings/`),
                fetch(`${API_BASE_URL}/products/`)
            ]);

            if (configRes.ok) {
                const data = await configRes.json();
                if (data && data.config) {
                    setConfig(prev => mergeConfig(prev, data.config));
                    localStorage.setItem('astra_site_config_v2', JSON.stringify(data.config));
                }
            }

            if (prodRes.ok) {
                const prodData = await prodRes.json();
                setProducts(prodData);
                try {
                    localStorage.setItem('astra_last_products', JSON.stringify(prodData));
                } catch (e) {
                    // Quota safety is already handled in updateSection, but good to have here
                    const lite = prodData.map(({ images, ...rest }) => rest);
                    localStorage.setItem('astra_last_products_lite', JSON.stringify(lite));
                }
            }
        } catch (e) {
            console.warn("Background sync failed, using local/cached data.", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();

        // Listen for storage changes (sync between tabs)
        const handleStorageChange = (e) => {
            if (e.key === 'astra_site_config_v2' && e.newValue) {
                try {
                    setConfig(prev => mergeConfig(prev, JSON.parse(e.newValue)));
                } catch (err) {
                    console.error("Error syncing config from storage", err);
                }
            }
            if (e.key === 'astra_last_products' && e.newValue) {
                try {
                    setProducts(JSON.parse(e.newValue));
                } catch (err) {
                    console.error("Error syncing products from storage", err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const saveConfig = async (newConfig) => {
        // Add a timestamp to this version
        const configWithTime = { ...newConfig, lastUpdated: Date.now() };

        // Optimistically update UI
        setConfig(configWithTime);

        // 1. Save to localStorage for redundancy and speed
        localStorage.setItem('astra_site_config_v2', JSON.stringify(configWithTime));

        // 2. Save to Backend (Requires Auth Token if it's an admin)
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                // Don't send products in settings if they are large
                const settingsToSave = { ...configWithTime };
                delete settingsToSave.products; // Ensure products are not saved with config

                const res = await fetch(`${API_BASE_URL}/settings/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(settingsToSave)
                });

                if (!res.ok) {
                    const errorMsg = await res.text();
                    console.error("Backend Save Failed:", res.status, errorMsg);
                    if (res.status === 413) {
                        alert("Error: The image sizes are too large to save to the database. Please use smaller photos.");
                    } else {
                        alert("Warning: Could not save changes to permanent database. Changes will be lost after logout.");
                    }
                } else {
                    console.log("Config successfully synced to cloud.");
                }
            } catch (err) {
                console.error("Failed to connect to backend for saving", err);
                alert("Network Error: Changes saved locally but failed to sync to server.");
            }
        }
    };

    const updateSection = (section, data) => {
        if (section === 'products') {
            setProducts(data);
            try {
                localStorage.setItem('astra_last_products', JSON.stringify(data));
                localStorage.removeItem('astra_last_products_lite'); // Clean up lite if full fits
            } catch (e) {
                console.warn("Product list too large for full cache. Switching to Lite Cache.");
                try {
                    const lite = data.map(({ images, ...rest }) => rest);
                    localStorage.setItem('astra_last_products_lite', JSON.stringify(lite));
                    localStorage.removeItem('astra_last_products');
                } catch (err) {
                    console.error("Storage completely full. Cache disabled.");
                }
            }
        } else {
            const newConfig = { ...config, [section]: data };
            saveConfig(newConfig);
        }
    };

    return (
        <SiteContext.Provider value={{ config, products, updateSection, loading }}>
            {children}
        </SiteContext.Provider>
    );
};

export const useSite = () => useContext(SiteContext);
