/**
 * HUE - Currency Conversion System
 */

const Currency = {
    baseCurrency: 'INR',
    baseSymbol: '₹',
    currentCountry: localStorage.getItem('hue_country') || 'India',
    currentCurrency: localStorage.getItem('hue_currency_code') || 'INR',
    currentSymbol: localStorage.getItem('hue_currency_symbol') || '₹',
    rates: JSON.parse(localStorage.getItem('hue_exchange_rates')) || { INR: 1 },
    lastFetched: localStorage.getItem('hue_rates_timestamp') || 0,

    // Simplified map for major countries, default fallback is USD
    countryMap: {
        "India": { code: "INR", symbol: "₹" },
        "Sweden": { code: "SEK", symbol: "kr" },
        "United States": { code: "USD", symbol: "$" },
        "United Kingdom": { code: "GBP", symbol: "£" },
        "Australia": { code: "AUD", symbol: "A$" },
        "Canada": { code: "CAD", symbol: "C$" },
        "France": { code: "EUR", symbol: "€" },
        "Germany": { code: "EUR", symbol: "€" },
        "Italy": { code: "EUR", symbol: "€" },
        "Spain": { code: "EUR", symbol: "€" },
        "Japan": { code: "JPY", symbol: "¥" },
        "United Arab Emirates": { code: "AED", symbol: "د.إ" },
        "Saudi Arabia": { code: "SAR", symbol: "﷼" },
        "Singapore": { code: "SGD", symbol: "S$" },
        "Malaysia": { code: "MYR", symbol: "RM" },
        "New Zealand": { code: "NZD", symbol: "NZ$" },
        "Switzerland": { code: "CHF", symbol: "CHF" },
        "China": { code: "CNY", symbol: "¥" },
        "Brazil": { code: "BRL", symbol: "R$" },
        "South Africa": { code: "ZAR", symbol: "R" },
        "Russia": { code: "RUB", symbol: "₽" },
        "South Korea": { code: "KRW", symbol: "₩" },
        "Mexico": { code: "MXN", symbol: "$" }
    },

    async init() {
        await this.fetchRates();
        this.updateNavLabel();
    },

    async fetchRates() {
        const now = new Date().getTime();
        // Fetch new rates if older than 24 hours
        if (now - this.lastFetched > 24 * 60 * 60 * 1000) {
            try {
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
                if (response.ok) {
                    const data = await response.json();
                    this.rates = data.rates;
                    this.lastFetched = now;
                    localStorage.setItem('hue_exchange_rates', JSON.stringify(this.rates));
                    localStorage.setItem('hue_rates_timestamp', now);
                }
            } catch (err) {
                console.error("Failed to fetch exchange rates:", err);
            }
        }
    },

    setCountry(countryName) {
        this.currentCountry = countryName;
        const mapping = this.countryMap[countryName] || { code: "USD", symbol: "$" };
        
        this.currentCurrency = mapping.code;
        this.currentSymbol = mapping.symbol;

        localStorage.setItem('hue_country', this.currentCountry);
        localStorage.setItem('hue_currency_code', this.currentCurrency);
        localStorage.setItem('hue_currency_symbol', this.currentSymbol);

        this.updateNavLabel();
        window.dispatchEvent(new Event('currencyUpdated'));
    },

    updateNavLabel() {
        const labels = document.querySelectorAll('.country-nav-label');
        labels.forEach(l => {
            l.innerHTML = `${this.currentCountry} | ${this.currentCurrency} ${this.currentSymbol} <i class="bi bi-chevron-down ms-1" style="font-size:0.7rem;"></i>`;
        });
    },

    formatPrice(priceString) {
        if (!priceString) return '';
        
        // Extract raw number from string (e.g. "₹12,000" -> 12000)
        let rawPrice = 0;
        if (typeof priceString === 'number') {
            rawPrice = priceString;
        } else {
            rawPrice = parseInt(priceString.toString().replace(/[^\d]/g, '')) || 0;
        }
        
        if (rawPrice === 0) return priceString; // Fallback if unable to parse

        const rate = this.rates[this.currentCurrency] || 1;
        const convertedPrice = rawPrice * rate;

        // Format to local string format (e.g., 1,500.50)
        let formatted = convertedPrice.toLocaleString(undefined, { 
            minimumFractionDigits: rate === 1 ? 0 : 2, 
            maximumFractionDigits: rate === 1 ? 0 : 2 
        });

        // Some currencies look better with symbol before or after
        if (["SEK", "AED", "SAR", "CHF"].includes(this.currentCurrency)) {
            return `${formatted} ${this.currentSymbol}`;
        }
        return `${this.currentSymbol}${formatted}`;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    Currency.init();
});
