const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down actions for observation
  });

  const context = await browser.newContext();
  const mainPage = await context.newPage();
  let activePage = mainPage;

  // Track console messages
  const consoleMessages = [];
  mainPage.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ timestamp: new Date().toISOString(), text });
    console.log(`[CONSOLE ${new Date().toISOString()}] ${text}`);
  });

  // Track network requests
  const authRequests = [];
  mainPage.on('request', request => {
    const url = request.url();
    if (url.includes('/api/auth/')) {
      const entry = {
        timestamp: new Date().toISOString(),
        method: request.method(),
        url: url,
        postData: request.postData()
      };
      authRequests.push(entry);
      console.log(`[NETWORK ${entry.timestamp}] ${entry.method} ${url}`);
    }
  });

  try {
    console.log('\n=== TEST START: Double Login Issue Verification ===\n');

    // Step 1: Navigate to the site
    console.log('Step 1: Navigating to https://oneguyconsulting.com');
    await activePage.goto('https://oneguyconsulting.com', { waitUntil: 'networkidle' });
    await activePage.waitForTimeout(2000);

    // Step 2: Find and click the login button
    console.log('\nStep 2: Looking for login button...');

    // Try multiple selectors for the login button
    const loginButton = await activePage.locator('button:has-text("Login"), button:has-text("Sign In"), a:has-text("Login"), a:has-text("Sign In")').first();

    if (await loginButton.isVisible({ timeout: 5000 })) {
      console.log('Found login button, preparing to handle popup...');

      // Listen for popup before clicking
      const popupPromise = context.waitForEvent('page');

      await loginButton.click();
      console.log('Login button clicked, waiting for popup...');

      // Wait for popup to open (or timeout)
      let popup = null;
      try {
        popup = await Promise.race([
          popupPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('No popup')), 5000))
        ]);
        console.log(`Popup opened: ${popup.url()}`);

        // Switch to popup for monitoring
        activePage = popup;

        // Set up listeners on popup
        popup.on('console', msg => {
          const text = msg.text();
          consoleMessages.push({ timestamp: new Date().toISOString(), text });
          console.log(`[CONSOLE ${new Date().toISOString()}] ${text}`);
        });

        popup.on('request', request => {
          const url = request.url();
          if (url.includes('/api/auth/')) {
            const entry = {
              timestamp: new Date().toISOString(),
              method: request.method(),
              url: url,
              postData: request.postData()
            };
            authRequests.push(entry);
            console.log(`[NETWORK ${entry.timestamp}] ${entry.method} ${url}`);
          }
        });

      } catch (e) {
        console.log('No popup detected, checking if modal appeared on same page...');
      }

      await activePage.waitForTimeout(2000);
    } else {
      console.log('WARNING: Could not find login button with expected text');
      // Take a screenshot for debugging
      await activePage.screenshot({ path: '/Users/chuckw./policy-library/website/debug-no-login-button.png' });
      throw new Error('Login button not found');
    }

    // Step 3: Wait for login form/modal
    console.log('\nStep 3: Waiting for login form...');
    await activePage.waitForSelector('input[type="email"], input[name="email"], input[type="text"]', { timeout: 5000 });
    await activePage.waitForTimeout(1000);

    // Step 4: Enter credentials
    console.log('\nStep 4: Entering test credentials...');

    // Clear any existing console messages from page load
    const preLoginConsoleCount = consoleMessages.length;
    const preLoginAuthRequestsCount = authRequests.length;

    console.log(`Pre-login state: ${preLoginConsoleCount} console messages, ${preLoginAuthRequestsCount} auth requests`);

    // Fill in email/username
    const emailInput = await activePage.locator('input[type="email"], input[name="email"], input[type="text"]').first();
    await emailInput.fill('test@example.com');
    await activePage.waitForTimeout(500);

    // Fill in password
    const passwordInput = await activePage.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill('testpassword123');
    await activePage.waitForTimeout(500);

    // Step 5: Submit the form
    console.log('\nStep 5: Submitting login form...');
    console.log('--- MONITORING STARTS NOW ---');

    const submitButton = await activePage.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
    await submitButton.click();

    console.log('Form submitted, monitoring for 15 seconds...\n');

    // Step 6: Wait 15 seconds and monitor
    await activePage.waitForTimeout(15000);

    console.log('\n--- MONITORING COMPLETE ---\n');

    // Step 7: Analyze results
    console.log('=== ANALYSIS ===\n');

    const postLoginConsoleMessages = consoleMessages.slice(preLoginConsoleCount);
    const postLoginAuthRequests = authRequests.slice(preLoginAuthRequestsCount);

    const signInAttempts = postLoginConsoleMessages.filter(msg =>
      msg.text.includes('Attempting signIn') || msg.text.includes('attempting signIn')
    );

    const credentialCallbacks = postLoginAuthRequests.filter(req =>
      req.url.includes('/api/auth/callback/credentials') && req.method === 'POST'
    );

    console.log(`Console "Attempting signIn..." count: ${signInAttempts.length}`);
    signInAttempts.forEach((msg, i) => {
      console.log(`  [${i + 1}] ${msg.timestamp}: ${msg.text}`);
    });

    console.log(`\nPOST to /api/auth/callback/credentials count: ${credentialCallbacks.length}`);
    credentialCallbacks.forEach((req, i) => {
      console.log(`  [${i + 1}] ${req.timestamp}: ${req.method} ${req.url}`);
    });

    console.log('\n=== VERDICT ===\n');

    let testPassed = true;
    const failures = [];

    if (signInAttempts.length === 0) {
      failures.push('⚠️  WARNING: No "Attempting signIn..." messages found - verification inconclusive');
      testPassed = false;
    } else if (signInAttempts.length === 1) {
      console.log('✅ PASS: Console shows "Attempting signIn..." EXACTLY ONCE');
    } else {
      failures.push(`❌ FAIL: Console shows "Attempting signIn..." ${signInAttempts.length} times (expected 1)`);
      testPassed = false;
    }

    if (credentialCallbacks.length === 0) {
      failures.push('⚠️  WARNING: No POST to /api/auth/callback/credentials found - verification inconclusive');
      testPassed = false;
    } else if (credentialCallbacks.length === 1) {
      console.log('✅ PASS: Network shows EXACTLY ONE POST to /api/auth/callback/credentials');
    } else {
      failures.push(`❌ FAIL: Network shows ${credentialCallbacks.length} POST requests to callback endpoint (expected 1)`);
      testPassed = false;
    }

    // Check for any other suspicious auth requests
    const otherAuthRequests = postLoginAuthRequests.filter(req =>
      !req.url.includes('/api/auth/callback/credentials')
    );

    if (otherAuthRequests.length > 0) {
      console.log(`\nℹ️  INFO: ${otherAuthRequests.length} other auth-related requests detected:`);
      otherAuthRequests.forEach((req, i) => {
        console.log(`  [${i + 1}] ${req.timestamp}: ${req.method} ${req.url}`);
      });
    }

    if (failures.length > 0) {
      console.log('\n--- FAILURES ---');
      failures.forEach(f => console.log(f));
    }

    console.log(`\n${'='.repeat(50)}`);
    if (testPassed) {
      console.log('🎉 TEST PASSED: Double login issue appears to be FIXED');
    } else {
      console.log('⚠️  TEST INCONCLUSIVE OR FAILED: See details above');
    }
    console.log(`${'='.repeat(50)}\n`);

    // Take final screenshot
    await activePage.screenshot({ path: '/Users/chuckw./policy-library/website/final-state.png' });
    console.log('Screenshot saved to: /Users/chuckw./policy-library/website/final-state.png');

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    await activePage.screenshot({ path: '/Users/chuckw./policy-library/website/error-state.png' });
    console.log('Error screenshot saved to: /Users/chuckw./policy-library/website/error-state.png');
  } finally {
    console.log('\nClosing browser in 5 seconds...');
    await activePage.waitForTimeout(5000);
    await browser.close();
  }
})();
