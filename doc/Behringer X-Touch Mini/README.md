# LeP's X-Touch Mini for Bitwig

Six values types (**Volume**, **Pan**, **Send**, **Channel-Sends**, **Device Parameters (Remote Controls)**, **User Controls** 
controlled by the rotary encoders. Bidirectional with LED ring feedback.

## Installation

[![][setupImage]][setupImage]

Make sure the script is properly selected & activated in Bitwig's controller settings.
If set up correctly, it should look like in the picture above. 

### Overview
_(click to see fullsize)_
[![][overviewImage]][overviewImage]

* The right fader always controls the Master volume.
* By default, the 6 lower right buttons do what's printed on the device (REWIND, FORWARD, LOOP, STOP, PLAY, REC).
* Holding the `Shift`-Button (red) and pressing one of the 4 lower right buttons will toggle
  * Metronome
  * Auto-disable punch-in/out whenever transport stops 
  * Overdub
  * Write Automation
* The `BUTTON MODE` button (lower 2nd button) can either be held (to enable it temporarily) or pressed once (to enable it permanently). 
   While held or enabled (lit), the 6 lower right buttons will determine what the upper 8 buttons 
   are controlling (see labels in `[brackets]`):

### Button mode `TYPE` (=default)
With this mode enabled, the upper buttons determine the type of value that the 8 rotary encoders are controlling:
* **Volume** (8 channels at a time)
* **Pan** (8 channels at a time)
* **Send** (8 channels at a time)
  - The **`-`** and **`+`** buttons select the next/previous send.
* **CH-Sends** (all **sends of the selected channel**; lockable)
  - Initially, you're controlling "Send 1 - 8" of the selected channel. The **`-`** and **`+`** buttons switch 
    one send up/down, e.g. "Sends 2 - 9" after pressing **`+`** first time.
  - You can **lock MultiSend to the selected channel** ("pinning" in Bitwig speak) by **double-clicking** a 
    **`MultiSend`** button, so you keep control over that channel's sends even when selecting a different channel in the GUI.
  - A blinking **`MultiSend`** button indicates it is locked.
* **DEV-Param** (alias **Remote Controls** of the currently selected device; 2x lockable)
  - You can **lock (pin) to the device** by **double-clicking** this button, so you stay in control over that particular device even after navigating to a different device or channel.
  - A blinking **`Param`** button means it is locked to a device.
  - The **`-`** and **`+`** buttons select the previous/next Remote Control Page.
  - Pressing **`Param` + `-`** will **lock (pin) to the device AND the remote control page**, 
    i.e. it will stick to the current parameter page instead of following what gets selected in the GUI.
  - Pressing **`Param` & `+`** reveals the device's remote controls panel.
* **USER CONTROL**
  - **48 freely mappable User Controls** in 6 pages of 8 UCs each
  - The **`-`** and **`+`** buttons select the previous/next page.
  - each user control mappable in Bitwig via `Rightclick -> Map to Controller or Key`, then moving the desired rotary encoder.

### Button mode `PAGE`
In this mode, the upper buttons can switch directly to a page, depending on what `TYPE` of value the rotaries 
are currently controlling, e.g. a device parameter page when `Buttom Mode` > `Type` was set to `DEV-PARAM`.

### Button Modes `SEL.CH`, `MUTE`, `SOLO`, `ARM`
The upper buttons can directly select/mute/solo/arm one of the 8 channels.

---

### What else..

#### Push Encoders: high precision & reset to default
All rotaries are push encoders, so you can
- press while rotating them to make **4x more precise value adjustments**
- double-press them to reset a value to its default


#### Replacement caps (highly recommended)
As on the X-Touch Compact, Behringer's original encoder caps are a nightmare (IMHO), being slick as Teflon. 
I have found perfect replacements for me here (no affiliate link):
- [Encoder caps](https://www.reichelt.de/Potiknoepfe/KNOPF-13-164B/3/index.html?ACTION=3&LA=517&ARTICLE=73963&GROUPID=3139) 
  (ALPS 861050, 6mm axis, 13mm diameter, 16mm height; 0.75 €/piece)

----
## Download & Installation <a name="dlinstall"></a>
#### Layer A, default config required

The script is written for the X-Touch Mini's Layer A in default configuration. 
If you need the config, you can [download LayerA.bin here](https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20X-Touch%20Mini/Layer%20A.bin), then write it to your X-Touch Mini using Behringer's X-Touch Editor.
(Tested with X-Touch Mini Firmware 1.08).

#### Installation

1.  Download the latest ZIP file from the [stable-versions-for-download/][stableFolder] directory and extract it to your Bitwig controller scripts folder:
  * **Windows:** ~Documents\Bitwig Studio\Controller Scripts
  * **Linux/Mac:** ~Documents/Bitwig Studio/Controller Scripts
2.  Open the preferences in Bitwig and go to Controllers
3.  Add the Controller script **Behringer** > **X-Touch Mini (by Lennart Pegel)** and choose "X-Touch Mini" for both input and output.


[setupImage]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20X-Touch%20Mini/img/controller-setting.jpg
[overviewImage]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20X-Touch%20Mini/img/total.jpg
