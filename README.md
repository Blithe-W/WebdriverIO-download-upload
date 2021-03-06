# Down and Uploading files

## Introduction
This repo will explain how to test down and uploading on Sauce Labs VM's with **WebdriverIO V4.**

> Make sure the `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` are set as environment variables. They will be used for uploading and test execution.
> Also make sure Chrome and Firefox are installed on the local machine to execute the local tests

## Downloading files 
In comparison to what many sites say, files **can** be downloaded with Selenium. There are only a lot of downsides to downloading files to local or cloud machines:

- downloading files with Selenium can be very time consuming. Creating and debugging a script can cost a lot of time and there might be faster and better ways do test downloads (depending on the business case)
- downloaded files can be *verified* on local machines, because you have rights on a local machine to check the file structure, but cloud machine don't give you the possibility to access the directory structure (see [Sauce Labs Download Test](#sauce-labs-download-test) for a possible solution)

### Run the download tests
For more information about running the download tests in this project please check [here](#run-tests).

#### Local download configurations
For local download tests the browser setting for downloading files is the most important and most blocking setting. To make sure all tests on a local machine work make sure the browser will store all downloads to a default location.
This prevents the browser from showing the dialog for selecting a location. If this can't be done only Chrome and Firefox can be used by adding some settings.

##### Chrome settings
Chrome can be configured in such a way that it will overwrite the default download location and will not show the dialog. This can be done by adding the following to the capabilities:

```js
config.capabilities = [
  {
    browserName: 'chrome',
    // this overrides the default chrome download directory with our temporary one
    chromeOptions: {
      prefs: {
        'download.default_directory': 'your-temporary-folder'
      }
    }
  },
];
``` 

##### Firefox profile settings
Firefox needs to load a profile with all the settings. This can be done by using the [WebdriverIO Firefox profile service](http://v4.webdriver.io/guide/services/firefox-profile.html).
When the service is installed it can be used like this

```js
config.services = [ 'firefox-profile' ];
// For the options see
// http://kb.mozillazine.org/Firefox_:_FAQs_:_About:config_Entries
config.firefoxProfile = {
  'browser.download.dir': global.downloadDir.firefox,
  "browser.download.folderList": 2,
  // Check the allowed MIME types here
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
  'browser.helperApps.neverAsk.saveToDisk': 'application/octet-stream',
};

config.capabilities = [
  {
    browserName: 'firefox',
  },
];
``` 

## Uploading files
Testing uploading files from a local machine isn't that compled in comparison to testing it from a cloud solution like for example.
There are some ways to do that, more info can be found here [Uploading Files to a Sauce Labs Virtual Machine during a Test](https://support.saucelabs.com/hc/en-us/articles/115003685593-Uploading-Files-to-a-Sauce-Labs-Virtual-Machine-during-a-Test), but it will also be explained below.

### Pre-run executable
A Sauce Labs VM starts in a clean state, meaning there is no data on the machine. To be able to test uploading files there needs to be a example file on the Sauce Labs VM.

Sauce Labs provides a way to upload a file to a Sauce Labs virtual machine prior to testing that can be used for testing uploads. This can be done with a *pre-run executable*. More info can be found here [Downloading Files to a Sauce Labs Virtual Machine Prior to Testing](https://wiki.saucelabs.com/display/DOCS/Downloading+Files+to+a+Sauce+Labs+Virtual+Machine+Prior+to+Testing)

> **NOTE:** If you want to download a file that is only accessible on your network, this won't work even if you have Sauce Connect running. This is because the connection from the VM to your network is limited only to the browsers and doesn't work on all outbound connections

The pre-run executable should hold a script that can download a file from a public server a folder on the Sauce Labs virtual machine. 

#### Create a script
Each platform needs to have it's own script Sauce Labs provides 3 different platforms, see all the links to see how the scripts should look like

- Windows* [script](./scripts/windows_download.bat)
- Linux [script](./scripts/linux_download.sh)
- Mac [script](./scripts/mac_download.sh)

> *Windows uses `%userprofile%` because Chrome and Firefox VM-images have a different root user (*Administrator*) in comparison to the MicrosoftEdge and internet explorer (*sauce*).
> The variable fixes this when downloading and pushing the file.

#### Sauce Storage
When all the scripts are created they need to be uploaded to the [Sauce Storage](https://wiki.saucelabs.com/display/DOCS/Uploading+Mobile+Applications+to+Sauce+Storage+for+Testing).
This is a temporary private storage space where all assets are cleared after seven days. If it has been over seven days since the last test execution with the usage Sauce Storage, you will need to upload it again. 

Advice is to upload all the pre-run executables in one call. This can be done by creating  1 script that will be ran before WebdriverIO starts and can be found [here](./scripts/push_to_storage.sh). 
When the test command `npm run test` will be used the script will upload all the pre-run executables as a preprocess before all tests are executed.

> **NOTE:** The [`push_to_storage.sh`](./scripts/push_to_storage.sh)-script in this repo are used and made for a Mac, check the platform you are using and create your own script  

#### Add script to capabilities
When the scripts are stored in the Sauce Storage the capabilities need to be enriched with the `prerun` capability, see the example below  

```
capabilities: [
    {
        browserName: 'chrome',
        platform: 'Windows 10',
        // This is the `prerun` capability that needs to point to the 
        // platform specific script
        prerun: 'sauce-storage:windows_download.bat',
    },
] 
```

Keep in mind that each plaform has his own script, see [Create a script](#create-a-script).

The pre-run executable will download the file before the tests starts and stores it in the given location.

## Run tests

1. Clone the project
    
        $ git clone 
    
2. Install all the dependencies
    
        $ npm install
    
### Local Download Test
> **NOTE:**
> Make sure you have Chrome and Firefox installed on you local machine

Run the following command
  
    $ npm run test.local.download

This will run the local download test, which can be found [here](./tests/specs/local.download.spec.js), on Chrome and Firefox.
    
### Sauce Labs Download Test
> **NOTE:**
> Make sure the `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` are set as environment variables. They will be used for uploading and test execution.

Run the following command
  
    $ npm run test.sauce.download

This will run the sauce download test, which can be found [here](./tests/specs/sauce.download.spec.js), on the following OS/browser combinations

- Windows:
  - Chrome
  - Firefox
- Mac:
  - Chrome
  - Firefox
  - Safari
- Linux
  - Chrome
  - Firefox 

> In this testcase we found a way to verify that the file has been downloaded.
 
    
### Local Download Test
> **NOTE:**
> Make sure you have Chrome and Firefox installed on you local machine

Run the following command
  
    $ npm run test.local.upload

This will run the local download test, which can be found [here](./tests/specs/local.upload.spec.js), on Chrome and Firefox.

### Sauce Labs Upload Test
> **NOTES:** 
> Make sure the `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` are set as environment variables. They will be used for uploading and test execution.

> Keep in mind that [`push_to_storage.sh`](./scripts/push_to_storage.sh)-script in this repo are used and made for a Mac, check the platform you are using and create your own script

Run the following command
  
    $ npm run test.sauce.upload

This will run the upload test, which can be found [here](./tests/specs/sauce.upload.spec.js), on all 9 different browser and OS combinations

- Windows:
  - Chrome
  - Firefox
  - Microsoft Edge
  - Internet Explorer
- Mac:
  - Chrome
  - Firefox
  - Safari
- Linux
  - Chrome
  - Firefox    
