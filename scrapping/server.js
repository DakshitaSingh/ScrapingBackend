// scrapping/server.js
const express = require('express');
const cors = require('cors');
const {
    scrapeMyntra,
    getConfig,
    initializeBrowser
} = require('./scrapping');

const app = express();
const PORT = process.env.PORT || 3001;

let isBrowserInitialized = false;
async function startBrowser() {
    if (!isBrowserInitialized) {
        console.log("Initializing Puppeteer browser instance for Myntra Service...");
        await initializeBrowser();
        isBrowserInitialized = true;
        console.log("Puppeteer browser initialized.");
    }
}
startBrowser();

app.use(cors());
app.use(express.json());

app.get('/api/products/myntra/:query', async (req, res) => {
    const { query } = req.params;
    const config = getConfig();
    console.log(`Received request to scrape Myntra for: "${query}"`);

    try {
        const products = await scrapeMyntra(query, config);
        if (products.length === 0) {
            console.warn(`No products found for "${query}" on Myntra.`);
        }
        res.json(products);
    } catch (error) {
        console.error(`Error scraping Myntra for "${query}":`, error);
        res.status(500).json({ error: `Failed to scrape products from Myntra.` });
    }
});

app.get('/', (req, res) => {
    res.send('Myntra Scraper Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Myntra backend server listening on port ${PORT}`);
});