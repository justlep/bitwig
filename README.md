# LeP's controller scripts for Bitwig
##### Available scripts:
* [LeP's Behringer BCF2000](./doc/Behringer%20BCF2000/)
* [Arturia Beatstep Pro](./doc/ArturiaBeatstepPro/)

For the latest version, go to the [stable-version-for-download](./stable-version-for-download/)-directory and download the ZIP with the latest  version.

---

If you're a developer and want to reuse the project, you'll best have nodejs installed.

1.  Clone the project
2.  In the project's root directory run:
    ```shell
    $ npm install
    $ grunt
    ```
    This will install Grunt and some modules simplifying development a lot.
    Also, it will try to copy the .js stubs from Bitwig's install directory into the */bitwigApiStubs* folder (helping IDEs like Webstorm with code completion).
    If the right folders can't be determined on your machine, edit *Gruntfile.js* as you like. I wrote this on Windows, sorry ;-)
* To **validate** all the .js files, run
   ```shell
   $ grunt validate
   ```
* To **copy to Bitwig** all the script files in order to test it live, run
   ```shell
   $ grunt copyToBitwigForTest
   ```
* To **pack and release** the script it as a new *ZIP* file, run
   ```shell
   $ grunt buildStableRelease
   ```
   Credentials for the ZIP's filename etc. will be taken from */package.json*, so the version in there should be counted up afterwards.
   
That's it for now.
