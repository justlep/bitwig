# LeP's BCR2000 controller script for Bitwig

## How to use

Most identical with the BCF2000 (see the [documentation in the Wiki][wikiLink]).

---
## Required BCR Preset
You need a special preset installed on your BCR for the script to work.
It is contained in this SysEx-file: [**BCR2000-Bitwig-Preset28(CH13)-29(CH14).syx**][sysexfile]
(The file contains two presets: Preset 29  will be used by default, Preset 28 is an alternative).
You can transfer the file to your BCR using [MidiOX][midiOxLink]* ([screenshot][midiOxScreenshot])
or a similar tool. When Bitwig loads the controller script, it will try to switch your BCR to preset 29.

_(* The presets 28/29 are saved permanently on your BCR, so the sysex file needs to be transmitted only ONCE ever. )_

---
## Download & Installation

1.  Download the latest ZIP file from the [stable-versions-for-download/][stableFolder] directory and extract it to your Bitwig controller scripts folder:
    * **Windows:** ~Documents\Bitwig Studio\Controller Scripts
    * **Linux/Mac:** ~Documents/Bitwig Studio/Controller Scripts
2.  Open the preferences in Bitwig and go to Controllers
3.  Add the Controller script **Behringer** > **BCR2000 (LeP)** and choose BCR2000 port 1 for both input and output. ![Preferences][prefs]

That's it. Bitwig should switch your BCR2000 to preset 28 and initialize the controls. Have fun :)

[wikiLink]: https://github.com/justlep/bitwig/wiki/LeP's-BCF2000
[sysexfile]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20BCR2000/BCR2000-Bitwig-Preset28(CH13)-29(CH14).syx
[prefs]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20BCR2000/img/preferences.png
[stableFolder]: https://github.com/justlep/bitwig/tree/master/stable-version-for-download/
[midiOxScreenshot]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20BCF2000/img/MidiOX-send-SysEx.png
[midiOxLink]: http://www.midiox.com/

