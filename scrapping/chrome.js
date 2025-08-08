// scrapping/chrome.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

async function findChrome() { /* ... your existing findChrome function ... */ }

const launchBrowser = async () => {
    const executablePath = await findChrome();
    return puppeteer.launch({
        headless: 'new',
        executablePath,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1920,1080', // Set a common desktop resolution
            '--lang=en-IN,en;q=0.9', // Set language to Indian English
        ]
    });
};

module.exports = launchBrowser;