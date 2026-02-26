const { chromium } = require('@playwright/test');

(async () => {
    console.log('Launching browser...');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        // ignore webpack stuff
    });

    page.on('pageerror', error => {
        console.error(`[Browser PageError]: ${error.message}`);
    });

    console.log('Navigating to http://localhost:3000 ...');
    try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        // wait for animations to finish
        await page.waitForTimeout(3000);

        // Take a screenshot to literally see what the user is seeing
        await page.screenshot({ path: 'C:\\Users\\Steve\\.gemini\\antigravity\\brain\\aad8e33e-eb86-4e61-841f-dca4531bdc9b\\debug_screenshot.png', fullPage: true });
        console.log('Screenshot saved to debug_screenshot.png');
    } catch (e) {
        console.error('Navigation error:', e);
    }

    await browser.close();
})();
