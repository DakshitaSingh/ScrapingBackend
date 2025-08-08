// scrapping/chrome.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

async function findChrome() {
    const possiblePaths = [
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/google-chrome-stable',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ];
    for (const path of possiblePaths) {
        if (fs.existsSync(path)) {
            console.log(`✓ Found Chrome at: ${path}`);
            return path;
        }
    }
    const fallback = puppeteer.executablePath();
    console.log(`ℹ Using Puppeteer's bundled Chromium: ${fallback}`);
    return fallback;
}

const launchBrowser = async () => {
    const executablePath = await findChrome();
    return puppeteer.launch({
        headless: 'new',
        executablePath,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });
};

module.exports = launchBrowser;