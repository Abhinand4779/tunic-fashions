/**
 * HUE - Site Configuration
 * Replaces defaultConfig in SiteContext.jsx
 */

const API_BASE_URL = 'https://huestorybyreshma.com/server/api';

const DEFAULT_CONFIG = {
    hero: {
        bannerImg: 'assets/About/hero_navy.png',
        title: 'ELEGANCE IN<br>EVERY DETAIL',
        subtitle: 'Explore the exclusive fashion & jewelry collection from HUE.',
        btnText: 'SHOP COLLECTION',
        btnLink: 'shop.html'
    },
    heroSliders: [
        { id: 1, image: 'assets/About/hero_navy.png', title: 'ELEGANCE IN<br>EVERY DETAIL', subtitle: 'Explore the exclusive fashion & jewelry collection from HUE.' }
    ],
    coupon: {
        label: 'Special Offer',
        discount: '15% OFF',
        text: 'On your first order above ₹1999',
        code: 'HUE15'
    },
    highlights: [
        { id: 1, title: 'Summer Sale', image: 'assets/Ornaments_Categories/dress_navy.png', subtitle: 'Designer Dresses', link: 'shop.html' },
        { id: 2, title: 'New Arrivals', image: 'assets/Ornaments_Categories/jewelry_navy.png', subtitle: 'Signature Jewelry', link: 'shop.html' },
        { id: 3, title: 'Best Sellers', image: 'assets/Ornaments_Categories/saree_navy.png', subtitle: 'Ethnic Wear', link: 'shop.html' },
    ],
    promoCarousel: [
        {
            id: 1,
            image: 'assets/Ornaments_Categories/dress_navy.png',
            badge: 'New Arrival',
            title: 'Gold Bangles Collection',
            subtitle: 'Handcrafted with 22K gold plating — timeless elegance for every occasion.',
            link: 'shop.html',
            btnText: 'Shop Now',
            align: 'left'
        },
        {
            id: 2,
            image: 'assets/Ornaments_Categories/jewelry_navy.png',
            badge: 'Trending',
            title: 'Signature Jewelry',
            subtitle: 'Elegant statement pieces that perfectly complement your outfit.',
            link: 'shop.html',
            btnText: 'Explore',
            align: 'right'
        },
        {
            id: 3,
            image: 'assets/Ornaments_Categories/saree_navy.png',
            badge: 'Best Seller',
            title: 'Layered Chain Sets',
            subtitle: 'Stack them, layer them, own them. Our chains are crafted for royalty.',
            link: 'shop.html',
            btnText: 'View Collection',
            align: 'left'
        }
    ],
    testimonials: [
        { id: 1, name: "Anjali Sharma", handle: "@anjali_styles", text: "The gold plating is so authentic! I wore the bangles to a wedding and everyone thought they were real gold. Amazing quality from HUE.", rating: 5 },
        { id: 2, name: "Rahul Verma", handle: "@rahul_v", text: "Bought the layered chain set for my wife. The packaging and the finish of the product exceeded my expectations. Highly recommend!", rating: 5 },
        { id: 3, name: "Priya Iyer", handle: "@priya_jewels", text: "Finding traditional designs that don't feel heavy is hard. HUE's signature earrings are my new favorites for daily wear.", rating: 5 }
    ],
    homeCategories: [
        { id: 1, name: 'Necklaces', image: 'https://images.unsplash.com/photo-1599643478524-fb66f7ca265b?auto=format&fit=crop&w=300&q=80', path: 'shop.html?category=necklaces' },
        { id: 2, name: 'Bridal Sets', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=300&q=80', path: 'shop.html?category=bridal' },
        { id: 3, name: 'Bangles', image: 'https://images.unsplash.com/photo-1610030469983-98e550d61dc9?auto=format&fit=crop&w=300&q=80', path: 'shop.html?category=bangles' },
        { id: 4, name: 'Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80', path: 'shop.html?category=earrings' },
    ],
    footer: {
        storeName: 'Our Store',
        description: 'HUE was started in 2022 to bring elegance and tradition to your everyday style.',
        newsletterText: 'Sign up for our newsletter and receive 10% off your',
        copyright: '©2026 HUE. All Rights Reserved.',
        credit: 'Designed By RDR Technology',
        instagram: 'https://www.instagram.com/rdr.technology?igsh=eTc5NWUwOWN0eHBs'
    },
    navCategories: [
        { name: 'Necklaces', path: 'shop.html?category=necklaces', dropdown: ['Stone Necklace', 'Choker', 'Long Haram', 'Short Haram'] },
        { name: 'Bridal Sets', path: 'shop.html?category=bridal', dropdown: ['Antique Bridal', 'Nakshi Bridal'] },
        { name: 'Bangles', path: 'shop.html?category=bangles', dropdown: [] },
        { name: 'Earrings', path: 'shop.html?category=earrings', dropdown: [] },
        { name: 'Offer Zone', path: 'shop.html?category=offers', dropdown: [] }
    ],
    sectionCategories: {
        necklaces: [
            { name: "Stone Necklace", count: 42 },
            { name: "Choker", count: 25 },
            { name: "Long Haram", count: 18 },
            { name: "Short Haram", count: 64 },
            { name: "Layered Chains", count: 12 }
        ],
        bridal: [
            { name: 'Antique Bridal', count: 18 },
            { name: 'Nakshi Bridal', count: 35 },
            { name: 'Temple Jewelry', count: 12 }
        ],
        bangles: [
            { name: 'Gold Bangles', count: 24 },
            { name: 'Stone Bangles', count: 15 },
            { name: 'Ruby Studded', count: 12 }
        ]
    }
};


