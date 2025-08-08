// scrapping/scrapping.js
const cheerio = require("cheerio");
const launchBrowser = require('./chrome');

// ... getConfig() and initializeBrowser() functions are unchanged ...
const getConfig = () => ({ /* ... */ });
const initializeBrowser = async () => { /* ... */ };
const autoScroll = async (page) => { /* ... */ };
const parseMyntraProducts = ($, selector, config) => { /* ... */ };


const scrapeMyntra = async (query, config) => {
    console.log("Starting Myntra scraping with advanced stealth...");
    const searchUrl = `https://www.myntra.com/${encodeURIComponent(query)}`;
    let page;
    for (let attempts = 0; attempts < config.retryCount; attempts++) {
        try {
            if (!browserInstance || !browserInstance.isConnected()) {
                browserInstance = await initializeBrowser();
            }
            page = await browserInstance.newPage();

            // =================================================================
            // START: NEW STEALTH SETTINGS
            // =================================================================
            await page.setViewport({ width: 1920, height: 1080 });
            await page.emulateTimezone("Asia/Kolkata"); // Set timezone to India
            // =================================================================
            // END: NEW STEALTH SETTINGS
            // =================================================================

            await page.setUserAgent(config.userAgent);
            await page.setRequestInterception(true);
            page.on("request", (req) => {
                if (["stylesheet", "font", "image"].includes(req.resourceType())) { // Block images too
                    req.abort();
                } else {
                    req.continue();
                }
            });

            console.log(`Attempt ${attempts + 1} to navigate to Myntra: ${searchUrl}`);
            await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: config.navigationTimeout });
            
            await page.waitForSelector("li.product-base", { timeout: config.waitForSelectorTimeout });
            await autoScroll(page);
            await page.waitForTimeout(2000);
            
            const content = await page.content();
            const $ = cheerio.load(content);
            return parseMyntraProducts($, "li.product-base", config);
        } catch (err) {
            console.error(`Error during Myntra scraping (Attempt ${attempts + 1}/${config.retryCount}):`, err.message);
            if (page) {
                await page.screenshot({ path: 'myntra_last_attempt_error.png' });
            }
            if (page && !page.isClosed()) await page.close();
            if (attempts >= config.retryCount - 1) return [];
            if (err.message.includes('disconnected') || err.message.includes('closed')) {
                if (browserInstance && browserInstance.isConnected()) await browserInstance.close();
                browserInstance = null;
            }
        } finally {
            if (page && !page.isClosed()) await page.close();
        }
    }
    return [];
};

module.exports = {
    getConfig,
    scrapeMyntra,
    initializeBrowser
};