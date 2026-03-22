/**
 * ASTRA - Site Configuration
 * Replaces defaultConfig in SiteContext.jsx
 */

const API_BASE_URL = 'http://localhost:8000/api';

const DEFAULT_CONFIG = {
    hero: {
        bannerImg: 'assets/About/Banner.jpg',
        title: 'Elegance in Every Detail',
        subtitle: 'Explore the exclusive collection from Astra by Ash.',
        btnText: 'Shop Collection',
        btnLink: 'shop.html'
    },
    heroSliders: [
        { id: 1, image: 'assets/About/Banner.jpg', title: 'Elegance in Every Detail', subtitle: 'Explore the exclusive collection from Astra by Ash.' }
    ],
    coupon: {
        label: 'Special Offer',
        discount: '15% OFF',
        text: 'On your first order above ₹1999',
        code: 'ASTRA15'
    },
    highlights: [
        { id: 1, title: 'Summer Sale', image: 'assets/Ornaments_Categories/bangle.jpg', subtitle: 'Flat 20% Off', link: 'shop.html' },
        { id: 2, title: 'New Arrivals', image: 'assets/Ornaments_Categories/earings.jpg', subtitle: 'Signature Collection', link: 'shop.html' },
        { id: 3, title: 'Best Sellers', image: 'assets/Ornaments_Categories/chain.jpg', subtitle: 'Trending Now', link: 'shop.html' },
    ],
    promoCarousel: [
        {
            id: 1,
            image: 'assets/Ornaments_Categories/bangle.jpg',
            badge: 'New Arrival',
            title: 'Gold Bangles Collection',
            subtitle: 'Handcrafted with 22K gold plating — timeless elegance for every occasion.',
            link: 'shop.html',
            btnText: 'Shop Now',
            align: 'left'
        },
        {
            id: 2,
            image: 'assets/Ornaments_Categories/earings.jpg',
            badge: 'Trending',
            title: 'Signature Earrings',
            subtitle: 'Lightweight, bold and beautiful — statement pieces that tell your story.',
            link: 'shop.html',
            btnText: 'Explore',
            align: 'right'
        },
        {
            id: 3,
            image: 'assets/Ornaments_Categories/chain.jpg',
            badge: 'Best Seller',
            title: 'Layered Chain Sets',
            subtitle: 'Stack them, layer them, own them. Our chains are crafted for royalty.',
            link: 'shop.html',
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
        { id: 1, name: 'Women', image: 'assets/Main_Categories/women.png', path: 'shop.html?section=women' },
        { id: 2, name: 'Men', image: 'assets/Main_Categories/men.png', path: 'shop.html?section=men' },
        { id: 3, name: 'Kids', image: 'assets/Main_Categories/kids.png', path: 'shop.html?section=kids' },
        { id: 4, name: 'Traditional', image: 'assets/Main_Categories/traditional.png', path: 'shop.html?category=traditional' },
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
        { name: 'Women', path: 'shop.html?section=women', dropdown: [] },
        { name: 'Men', path: 'shop.html?section=men', dropdown: [] },
        { name: 'Kids', path: 'shop.html?section=kids', dropdown: [] },
        { name: 'Offer Zone', path: 'shop.html', dropdown: [] },
        { name: 'About Us', path: 'about.html', dropdown: [] },
        { name: 'Contact Us', path: 'contact.html', dropdown: [] }
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
    }
};
