const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Resume Scorer Tests', function() {
  // Extend timeout for Selenium tests
  this.timeout(60000);
  
  let driver;
  
  before(async function() {
    // Configure Chrome options
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    // Build the driver
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
    await driver.get('http://localhost:3000');
    
    // Wait for the page to load (adjust selector based on your actual page structure)
    await driver.wait(until.elementLocated(By.css('body')), 10000);
    
    // Get the page title
    const title = await driver.getTitle();
    assert(title.includes('Resume'), `Title should contain "Resume", but got "${title}"`);
  });
  
  // You can add more tests as needed
});