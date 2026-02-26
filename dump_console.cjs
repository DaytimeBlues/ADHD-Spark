const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
    console.log('Launching browser (headed)...');
    const browser = await chromium.launch({ headless: true }); // headless for background verification
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    const artifactDir = 'C:\\Users\\Steve\\.gemini\\antigravity\\brain\\aad8e33e-eb86-4e61-841f-dca4531bdc9b';

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`[Browser Console ERROR]: ${msg.text()}`);
        }
    });

    page.on('pageerror', error => {
        console.error(`[Browser PageError]: ${error.message}`);
    });

    console.log('Navigating to http://localhost:3000 ...');
    try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
        console.log('Page loaded.');

        // Wait for the app to initialize
        await page.waitForTimeout(5000);

        // Take screenshot of Home Screen
        console.log('Capturing home_screen.png...');
        await page.screenshot({ path: path.join(artifactDir, 'home_screen_matte_frost.png'), fullPage: true });

        // Check for "IGNITE" text or button
        console.log('Looking for IGNITE button...');
        const igniteBtn = page.getByText('IGNITE', { exact: false });
        if (await igniteBtn.isVisible()) {
            console.log('Clicking IGNITE...');
            await igniteBtn.click();

            // Wait for the fade transition (200ms duration, giving it 1s to be safe)
            await page.waitForTimeout(1000);

            console.log('Capturing ignite_screen.png after transition...');
            await page.screenshot({ path: path.join(artifactDir, 'ignite_screen_fade.png'), fullPage: true });
        } else {
            console.log('IGNITE button not found in initial view.');
            // Attempt to log body content for debugging
            const body = await page.innerText('body');
            console.log('Body text sample:', body.substring(0, 500));
        }

    } catch (e) {
        console.error('Navigation error:', e);
    }

    await browser.close();
    console.log('Verification script finished.');
})();
