const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const timestamp = Date.now();
  const screenshotDir = path.join(__dirname, 'login-test-screenshots', `automated-test-${timestamp}`);

  // Create screenshots directory
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // Create a log file for detailed observations
  const logPath = path.join(screenshotDir, 'test-log.txt');
  const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(logPath, logMessage);
  };

  log('=== Starting Automated Double Login Test ===');
  log(`Screenshots will be saved to: ${screenshotDir}`);
  log('');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down to observe
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Track all navigation events
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      log(`NAVIGATION: ${frame.url()}`);
    }
  });

  // Track console messages
  page.on('console', msg => {
    log(`CONSOLE [${msg.type()}]: ${msg.text()}`);
  });

  // Track authentication requests
  let authPromptCount = 0;
  page.on('request', request => {
    if (request.url().includes('auth') || request.url().includes('login')) {
      log(`REQUEST [${request.method()}]: ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('auth') || response.url().includes('login')) {
      log(`RESPONSE [${response.status()}]: ${response.url()}`);
    }
  });

  try {
    // Step 1: Navigate to homepage
    log('STEP 1: Navigating to https://oneguyconsulting.com');
    await page.goto('https://oneguyconsulting.com', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotDir, '01-homepage.png'), fullPage: true });
    log('✓ Homepage loaded');
    log('');

    // Step 2: Find and click login button
    log('STEP 2: Looking for login button');
    const loginButton = await page.locator('a:has-text("Login")').first();
    await page.screenshot({ path: path.join(screenshotDir, '02-before-click-login.png'), fullPage: true });
    log('✓ Found login button');
    log('');

    // Step 3: Click login and wait for navigation
    log('STEP 3: Clicking login button');
    const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle' });
    await loginButton.click();
    await navigationPromise;

    log(`✓ Navigated to: ${page.url()}`);
    await page.screenshot({ path: path.join(screenshotDir, '03-after-login-click.png'), fullPage: true });
    log('');

    // Step 4: Examine the login form
    log('STEP 4: Examining authentication form (FIRST PROMPT)');
    log(`Current URL: ${page.url()}`);

    // Look for form fields
    const emailInput = await page.locator('input[type="email"], input[name*="email"], input[id*="email"]').first();
    const passwordInput = await page.locator('input[type="password"]').first();

    const emailVisible = await emailInput.isVisible({ timeout: 2000 }).catch(() => false);
    const passwordVisible = await passwordInput.isVisible({ timeout: 2000 }).catch(() => false);

    log(`Email field visible: ${emailVisible}`);
    log(`Password field visible: ${passwordVisible}`);

    if (!emailVisible || !passwordVisible) {
      log('⚠ WARNING: Expected login form not found!');
      throw new Error('Login form not found');
    }

    log('');

    // Step 5: Fill in test credentials
    log('STEP 5: Filling in test credentials');
    log('NOTE: Using dummy credentials - test@example.com / testpassword123');

    await emailInput.fill('test@example.com');
    await passwordInput.fill('testpassword123');
    await page.screenshot({ path: path.join(screenshotDir, '04-credentials-filled.png'), fullPage: true });
    log('✓ Credentials entered');
    log('');

    // Step 6: Submit the form and watch for second prompt
    log('STEP 6: Submitting login form');
    const submitButton = await page.locator('button:has-text("Sign In"), button[type="submit"], button:has-text("Login")').first();

    log('Clicking submit button...');
    authPromptCount = 1;
    log(`AUTH PROMPT COUNT: ${authPromptCount} (First credential entry)`);

    // Listen for navigation after submit
    const postSubmitNavigation = page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null);
    await submitButton.click();
    await page.screenshot({ path: path.join(screenshotDir, '05-after-submit-click.png'), fullPage: true });

    await postSubmitNavigation;
    log(`✓ Form submitted, current URL: ${page.url()}`);
    log('');

    // Wait for page to settle
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotDir, '06-after-submission.png'), fullPage: true });

    // Step 7: Check for SECOND credential prompt
    log('STEP 7: Checking for SECOND credential prompt');
    log(`Current URL: ${page.url()}`);

    // Look for another login form
    const hasEmailInput = await page.locator('input[type="email"], input[name*="email"], input[id*="email"]').count() > 0;
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;

    if (hasEmailInput && hasPasswordInput) {
      authPromptCount = 2;
      log('');
      log('🚨 DOUBLE LOGIN DETECTED! 🚨');
      log('A SECOND credential prompt has appeared!');
      log(`AUTH PROMPT COUNT: ${authPromptCount}`);
      log('');

      await page.screenshot({ path: path.join(screenshotDir, '07-SECOND-LOGIN-PROMPT.png'), fullPage: true });

      // Get the page title and heading
      const title = await page.title();
      const heading = await page.locator('h1, h2, h3').first().textContent().catch(() => 'N/A');

      log(`Page Title: ${title}`);
      log(`Main Heading: ${heading}`);
      log('');

      // Save the HTML for analysis
      const html = await page.content();
      fs.writeFileSync(path.join(screenshotDir, '07-second-prompt-source.html'), html);
      log('✓ Saved HTML source of second prompt');

    } else {
      log('✓ No second credential prompt detected');
      log('User successfully authenticated after first prompt');

      // Check if we're on a dashboard or success page
      const currentUrl = page.url();
      log(`Final URL: ${currentUrl}`);

      if (currentUrl.includes('dashboard') || currentUrl.includes('portal') && !currentUrl.includes('login')) {
        log('✓ Successfully reached authenticated area');
      } else if (currentUrl.includes('login') || currentUrl.includes('auth')) {
        log('⚠ Still on login/auth page - possible error or validation failure');
      }
    }
    log('');

    // Step 8: Final state capture
    log('STEP 8: Final state capture');
    await page.screenshot({ path: path.join(screenshotDir, '08-final-state.png'), fullPage: true });

    const finalHtml = await page.content();
    fs.writeFileSync(path.join(screenshotDir, '08-final-page-source.html'), finalHtml);

    log('');
    log('=== Test Results Summary ===');
    log(`Total authentication prompts encountered: ${authPromptCount}`);
    log(`Final URL: ${page.url()}`);
    log(`Screenshots saved to: ${screenshotDir}`);

    if (authPromptCount > 1) {
      log('');
      log('⚠ ISSUE CONFIRMED: Double login detected');
      log('Users are being asked to authenticate TWICE');
    } else {
      log('');
      log('✓ No double login issue detected in this test run');
      log('(Note: Issue may be intermittent or require valid credentials)');
    }

  } catch (error) {
    log('');
    log(`ERROR during test: ${error.message}`);
    log(error.stack);
    await page.screenshot({ path: path.join(screenshotDir, 'ERROR-state.png'), fullPage: true });
    throw error;
  } finally {
    log('');
    log('Closing browser in 3 seconds...');
    await page.waitForTimeout(3000);
    await browser.close();
    log('Browser closed');
  }
})();
