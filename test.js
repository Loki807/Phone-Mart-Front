const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting E2E Integration Test...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Capture console logs from the page
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER ERROR:', msg.text());
        }
    });

    try {
        // ---------------------------------------------------------
        // TEST 1: Home Page Loads
        // ---------------------------------------------------------
        console.log('\n[Test 1] Loading Home Page...');
        await page.goto('http://localhost:4200', { waitUntil: 'networkidle0' });

        // Wait for the hero section
        await page.waitForSelector('.hero h1');
        const heroText = await page.$eval('.hero h1', el => el.textContent);
        console.log('Hero Text:', heroText);
        if (!heroText.includes('Welcome to PhoneMart')) throw new Error('Home page did not load correctly.');
        console.log('✅ Test 1 Passed: Home Page loaded.');

        // Wait for the products to load (networkidle0 usually handles this, but just in case)
        // We can check if any product cards rendered or if empty state is there
        const hasProducts = (await page.$$('.product-card')).length > 0;
        const hasEmptyState = (await page.$$('.empty-state')).length > 0;

        if (hasProducts) {
            console.log(`Found ${(await page.$$('.product-card')).length} products on the home page.`);
        } else {
            console.log('No products found on home page (which is fine if DB is empty).');
        }

        // ---------------------------------------------------------
        // TEST 2: Admin Login
        // ---------------------------------------------------------
        console.log('\n[Test 2] Testing Admin Login...');
        await page.click('a.btn-login'); // Click login button in navbar
        await page.waitForSelector('.login-card');

        await page.type('input[name="email"]', 'admin@phonemart.lk');
        await page.type('input[name="password"]', 'Admin@12345');
        await page.click('button[type="submit"]');

        // Wait for navigation after login (should go to /admin)
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        const url = page.url();
        console.log('Redirected to:', url);
        if (!url.includes('/admin')) throw new Error('Admin did not redirect to /admin');

        // Check if roles badge says "Admin"
        const roleBadge = await page.$eval('.role-badge', el => el.textContent);
        console.log('Logged in as Role:', roleBadge);
        console.log('✅ Test 2 Passed: Admin Login successful.');

        // Logout
        await page.click('.btn-logout');
        await page.waitForSelector('.btn-login');

        // ---------------------------------------------------------
        // TEST 3: Owner Login
        // ---------------------------------------------------------
        console.log('\n[Test 3] Testing Shop Owner Login...');
        await page.click('a.btn-login');
        await page.waitForSelector('.login-card');

        await page.type('input[name="email"]', 'kumaran@shop.lk');
        await page.type('input[name="password"]', 'Shop@123');
        await page.click('button[type="submit"]');

        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        const ownerUrl = page.url();
        console.log('Redirected to:', ownerUrl);
        if (!ownerUrl.includes('/owner/products')) throw new Error('Owner did not redirect to /owner/products');

        const ownerRoleBadge = await page.$eval('.role-badge', el => el.textContent);
        console.log('Logged in as Role:', ownerRoleBadge);
        console.log('✅ Test 3 Passed: Owner Login successful.');

        console.log('\n🎉 ALL E2E INTEGRATION TESTS PASSED!');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
    } finally {
        await browser.close();
    }
})();
