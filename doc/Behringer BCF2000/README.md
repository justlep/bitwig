# LeP's BCF2000 Pro controller script for Bitwig
![LeP's BCF2000][overviewImage]
---
##### Required SysEx file:
For the script to work, you need to install a special preset on your BCF (actually it is two, however the script will use preset 28 by default).
The following SysEx-file contains the two presets:  [**BCF2000-Bitwig-Preset28(CH13)-29(CH14).syx**][sysexfile].
You can transmit the SysEx-file to your BCF using [MidiOX][midiOxLink] ([screenshot][midiOxScreenshot]) or a similar tool. When the script loads, it will try to switch to preset 28.

---
##### Installing the controller script:

1.  Download the [latest ZIP file][latestZip] from the [stable-versions-for-download][stableFolder] and extract it to your Bitwig controller scripts folder:
    * **Windows:** ~Documents\Bitwig Studio\Controller Scripts
    * **Linux/Mac:** ~Documents/Bitwig Studio/Controller Scripts
2.  Open the preferences in Bitwig and go to Controllers
3.  Add the Controller script **Behringer** > **BCF2000 (LeP)** and choose BCF2000 port 1 for both input and output. ![Preferences][prefs]

That's it. Bitwig should switch your BCF2000 to preset 28 and initialize the controls. Have fun :)

[latestZip]: https://github.com/justlep/bitwig/blob/master/stable-version-for-download/LeP's%20Controller%20Scripts%20v1.0.0.zip?raw=true
[overviewImage]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20BCF2000/img/LeP's-BCF-2000.png
[sysexfile]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20BCF2000/BCF2000-Bitwig-Preset28(CH13)-29(CH14).syx
[prefs]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20BCF2000/img/preferences.png
[stableFolder]: https://github.com/justlep/bitwig/tree/master/stable-version-for-download/
[midiOxScreenshot]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20BCF2000/img/MidiOX-send-SysEx.png
[midiOxLink]: http://www.midiox.com/