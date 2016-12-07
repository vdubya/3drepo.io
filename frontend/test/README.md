Protractor
-
Setup - from the docs (http://www.protractortest.org/#/)

Use npm to install Protractor globally with:

* npm install -g protractor

On a Mac protractor will be installed here

* /usr/local/lib/node_modules/protractor

This will install two command line tools, **protractor** and **webdriver-manager**. Try running _protractor --version_ to make sure it's working.

The webdriver-manager is a helper tool to easily get an instance of a Selenium Server running. Use it to download the necessary binaries with:

* webdriver-manager update

Start up a server with:

* webdriver-manager start

If there is a "major.minor" java error the following can resolve it

- brew update
- brew cask install java

To run the tests (from **frontend/test/protractor**)

* Edit conf.js to enable/disable test specs (with comment '//')
* Then run _protractor conf.js_ from the command line

Jasmine
-
* These tests rely on the file _karma.conf.js_ in the root directory
    * ng-html2js (https://github.com/karma-runner/karma-ng-html2js-preprocessor) is used to convert jade files to html templates
* Directory _mock_services_ contains pared down versions of the real services