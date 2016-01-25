# LeP's controller scripts for Bitwig [![Build Status](https://travis-ci.org/justlep/bitwig.svg?branch=master)](https://travis-ci.org/justlep/bitwig)
##### Available scripts:
* [LeP's Behringer BCF2000](./doc/Behringer%20BCF2000/)
* [Arturia Beatstep Pro](./doc/ArturiaBeatstepPro/)
* Roland A-49
* [Alesis PerformancePad](./doc/Alesis%20PerformancePad/)
* [Behringer CMD DC-1](./doc/Behringer%20CMD%20DC-1) (as comfy ProgramChange message generator)

### Installation 
Go to the [stable-version-for-download](./stable-version-for-download/)-directory and get the latest release there.  
Do NOT use the "Download ZIP" button on top of this page.

---

If you're a developer and want to reuse the project, you'll best have nodejs installed.

1.  Clone the project
2.  In the project's root directory run:
    ```shell
    $ npm install
    $ grunt
    ``` 
    
    This will install Grunt and some modules simplifying development a lot.
    Also, it will try to copy the .js stubs from Bitwig's install directory into the */bitwigApiStubs* folder 
    (helping IDEs like Webstorm with code completion).
    If the right folders can't be determined on your machine, edit *Gruntfile.js* as you like. I wrote this on Windows, sorry ;-)
* To **validate** the .js files (jshint) or run **JavaScript-tests** (Mocha), call
   ```shell
   $ grunt validate
   $ grunt test
   ```
   
* To **copy the controller scripts to Bitwig** in order to test them live, run
   ```sh
   $ grunt copyToBitwigForTest
   ```
   
   The previously installed version will be overwritten, and Bitwig will reload the changed script files automatically.
* To **pack** the script and doc files into a new release *ZIP* file, run
   ```shell
   $ grunt buildStableRelease
   ```
   
   Credentials for the ZIP's filename etc. will be taken from */package.json*, so the version in there should be counted up afterwards.
   
That's it for now.
