// scrapping/scrapping.js
const cheerio = require("cheerio");
const launchBrowser = require('./chrome');

let browserInstance = null;

const getConfig = () => ({
    maxProducts: 40,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    navigationTimeout: 60000,
    waitForSelectorTimeout: 20000,
    retryCount: 2
});

const initializeBrowser = async () => {
    if (!browserInstance || !browserInstance.isConnected()) {
        console.log("Launching new persistent browser instance for Myntra...");
        browserInstance = await launchBrowser();
    }
    return browserInstance;
};

const autoScroll = async (page) => {
    console.log("Scrolling the page to load all products...");
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let previousHeight = -1;
            let scrollAttempts = 0;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, 200);
                scrollAttempts++;
                if (scrollHeight === previousHeight || scrollAttempts > 100) {
                    clearInterval(timer);
                    resolve();
                } else {
                    previousHeight = scrollHeight;
                }
            }, 300);
        });
    });
    console.log("Finished intelligent scrolling.");
};

const parseMyntraProducts = ($, selector, config) => {
    const results = [];
    console.log(`\n🔍 Starting to parse products for: Myntra`);
    $(selector).each((index, el) => {
        if (results.length >= config.maxProducts) return false;
        try {
            const link = $(el).find("a").attr("href");
            const image = $(el).find("picture.img-responsive img").attr("src");
            const brand = $(el).find(".product-brand").text().trim();
            const description = $(el).find(".product-product").text().trim();
            const title = `${brand} - ${description}`;
            const priceText = $(el).find(".product-discountedPrice").text().replace(/[₹,Rs. ]/g, "").trim() || $(el).find(".product-price span").text().replace(/[₹,Rs. ]/g, "").trim();
            const price = parseInt(priceText, 10) || 0;
            if (title && price > 0) {
                results.push({
                    title,
                    image_url: image || 'https://placehold.co/150x150?text=No+Image',
                    link: `https://www.myntra.com${link}`,
                    price: `₹${price}`,
                    description: title,
                    platform: "myntra"
                });
            }
        } catch (error) {
            console.error(`❗ Error parsing Myntra product #${index + 1}:`, error.message);
        }
    });
    console.log(`\n✅ Finished parsing Myntra. Total results: ${results.length}`);
    return results;
};

const scrapeMyntra = async (query, config) => {
    console.log("Starting Myntra scraping...");
    const searchUrl = `https://www.myntra.com/${encodeURIComponent(query)}`;
    let page;
    for (let attempts = 0; attempts < config.retryCount; attempts++) {
        try {
            if (!browserInstance || !browserInstance.isConnected()) {
                browserInstance = await initializeBrowser();
            }
            page = await browserInstance.newPage();
            await page.setUserAgent(config.userAgent);
            await page.setRequestInterception(true);
            page.on("request", (req) => {
                if (["stylesheet", "font"].includes(req.resourceType())) {
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