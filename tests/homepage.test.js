const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Resume Scorer Tests', function() {
  this.timeout(60000);
  
  let driver;
  
  before(async function() {
    // Configure Chrome options
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    // Build the driver with chromedriver directly added to PATH by the nanasess/setup-chromedriver action
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });
  
  after(async function() {
    if (driver) {
      await driver.quit();
    }
  });
  
  // Basic test to verify the application loads
  it('should load the homepage', async function() {
    try {
      await driver.get('http://localhost:3000');
      
      // Wait for the page to load
      await driver.wait(until.elementLocated(By.css('body')), 10000);
      
      // Get the page title
      const title = await driver.getTitle();
      console.log(`Page title: ${title}`);
      assert(title.length > 0, `Page title should not be empty, got: "${title}"`);
      
      // Get page source for debugging if needed
      const source = await driver.getPageSource();
      console.log(`Page source length: ${source.length} characters`);
      
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });
});