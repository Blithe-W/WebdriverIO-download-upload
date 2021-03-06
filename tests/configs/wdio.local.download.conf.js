const { ensureDirSync, removeSync } = require('fs-extra');
const { join } = require('path');
const config = require('./wdio.shared.conf').config;

// Store the directory path in a global, which allows to access this path inside the tests
global.downloadDir = {
  chrome: join(process.cwd(), '.tmp/chromeDownloadFolder'),
  firefox: join(process.cwd(), '.tmp/firefoxDownloadFolder'),
};

// ========
// Services
// ========
config.services = [ 'selenium-standalone', 'firefox-profile' ];
// For the options see
// http://kb.mozillazine.org/Firefox_:_FAQs_:_About:config_Entries
config.firefoxProfile = {
  'browser.download.dir': global.downloadDir.firefox,
  "browser.download.folderList": 2,
  // Check the allowed MIME types here
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
  'browser.helperApps.neverAsk.saveToDisk': 'application/octet-stream',
};

// ============
// Specs
// ============
config.specs = [
  './tests/specs/local.download.spec.js'
];

// ============
// Capabilities
// ============
config.capabilities = [
  {
    browserName: 'chrome',
    // this overrides the default chrome download directory with our temporary one
    chromeOptions: {
      prefs: {
        'download.default_directory': global.downloadDir.chrome
      }
    }
  },
  {
    browserName: 'firefox',
  },
];

// =====
// Hooks
// =====
config.onPrepare = () => {
  // Make sure the download directory exists
  ensureDirSync(global.downloadDir.chrome);
  ensureDirSync(global.downloadDir.firefox);
};
config.onComplete = () => {
  // Remove the dir after all tests have been executed so a new testrun starts with a clean state
  removeSync(global.downloadDir.chrome);
  removeSync(global.downloadDir.firefox);
};

exports.config = config;
