# LeP's BCF2000 controller script for Bitwig

### How to use

(Labels like **[BUTTON]** mean **`SHIFT + BUTTON`**)

[![][overviewImage]][overviewImage]

The script controls 8 channels at a time. The **`Channel Page`** buttons switch to the next/previous channel page. **`SHIFT+ChannelPage`** switches to the next/previous device.

The 4 **encoder group buttons** (upper right) determine the mode of the two button rows left of them.  
(!) If you **hold** those buttons, they'll **auto-switch back** to the previous mode when released. If you press them shortly, the mode remains selected.

#### Mode "VALUE TYPE" (default mode)

The **upper buttons 1-6** determine what type of value (red labels) is assigned to the rotatary encoders, the **lower buttons** do the same for the **faders**, so you can have any kind of value either on the encoders or on the faders anytime.  

[![][upperButtonsImage]][upperButtonsImage]

Available value types are:
* **Volume** (for channels 1-8)
* **Pan** (for channels 1-8)
* **Send** (for channels 1-8)
* **MultiSend** (all **sends of the selected channel**)  
  (!) You can **double-click** this button to **lock to the selected channel** ("pinning" in Bitwig speak), so you can keep controlling one particular channel's sends even after another channel is selected.
* **Parameters** (remote controls of the currently selected device)  
  You can **double-click** this button to **lock to the device** (pin), so you can keep controlling it even after another device or channel is selected. This works independent from the MultiSend lock mode.  
  **`SHIFT+Param`** reveals the device's remote controls panel.
* **UserControls** (freely assignable)

**`PrevPage`** and **`NextPage`** switch to the previous/next value page. What that means depends on the value type:
* **Send**: the controlled send (e.g. 1) common for all controlled channels
* **MultiSend**: initially you're controlling Send 1 to 8 of the selected channel. Pressing **`NextPage`** goes up 1 Send, so you'll be controlling Send 2 to 9 of the selected channel.
* **Parameters**: switch between the selected **Remote Control Pages** of the selected device a device.   
* **UserControls** 6 pages of freely-assignable user controls (8 per page, 48 altogether)

Buttons are lit only if such a respective next/previous page exists.

#### Mode "VALUE PAGE" 
**Buttons 1-6** allow directly choosing the value page while **Button 7+8** work just like in VALUE TYPE mode.

#### Mode "SOLO/MUTE"
Upper buttons toggle the channel **SOLO**, lower buttons the channel **MUTE**.

(You can enable "SOLO **exclusive**" behavior in Bitwig's preference dialog for the controller script. If enabled, soloing one channel will un-solo all others (default is non-exclusive))

#### Mode "ARM/SELECT"
The upper buttons toggle the channel **ARM TRACK**, the lower buttons **SELECTS** the channel.

#### Mute noisy faders
If you have lots of automation going on, you can "mute" the faders temporarily by pressing **`SHIFT+STOP`**, so they won't follow value changes in Bitwig anymore but still will send MIDI data when YOU move them. When un-muting them, they'll move back to the correct position immediately.

#### Push+turn encoders for higher precision
Holding an encoder pushed while twisting it allows for 4 times finer value adjustments.

#### Auto-reset PunchIn/PunchOut when Playback stops
By pressing the **`SHIFT+PunchOut`** button, you can toggle that both `PunchIn` and `PunchOut` will get turned off automatically whenever transport stops. This feature is enabled by default.

[overviewImage]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20BCF2000/img/overview.gif
[upperButtonsImage]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20BCF2000/img/upper-buttons.gif

### Picture & replacement caps

Here's a [picture of my device](https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20BCF2000/img/wikiOnly/full.jpg). 

For perfect grip, I replaced the crappy Behringer fader caps with nicer ones from **Alps**, and I can finally tell fader 4 from 5 at first glance ;). It's the Alps Lever 1 (inner 8x1.2mm, outer 25x13mm), and they're just 51 Cents a piece at [reichelt.de][faderShopUrl].

[faderShopUrl]: http://www.reichelt.de/KNOPF-8X1-2SW/3/index.html?&ACTION=3&LA=446&ARTICLE=73938&artnr=KNOPF+8X1%2C2SW&SEARCH=alps+lever+1


---
### Required BCF Preset
You need a special preset installed on your BCF for the script to work.
It is contained in this SysEx-file: [**BCF2000-Bitwig-Preset28(CH13)-29(CH14).syx**][sysexfile]
(The file contains two presets: Preset 28  will be used by default, Preset 29 is an alternative).
You can transfer the file to your BCF using [MidiOX][midiOxLink]* ([screenshot][midiOxScreenshot])
or a similar tool. When Bitwig loads the controller script, it will try to switch your BCF to preset 28.

_(* The presets 28/29 are saved permanently on your BCF, so the sysex file needs to be transmitted only ONCE ever. )_

---
### Download & Installation

1.  Download the latest ZIP file from the [stable-versions-for-download/][stableFolder] directory and extract it to your Bitwig controller scripts folder:
    * **Windows:** ~Documents\Bitwig Studio\Controller Scripts
    * **Linux/Mac:** ~Documents/Bitwig Studio/Controller Scripts
2.  Open the preferences in Bitwig and go to Controllers
3.  Add the Controller script **Behringer** > **BCF2000 (LeP)** and choose BCF2000 port 1 for both input and output. ![Preferences][prefs]

That's it. Bitwig should switch your BCF2000 to preset 28 and initialize the controls. Have fun :)

[wikiLink]: https://github.com/justlep/bitwig/wiki/LeP's-BCF2000
[sysexfile]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20BCF2000/BCF2000-Bitwig-Preset28(CH13)-29(CH14).syx
[prefs]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20BCF2000/img/preferences.png
[stableFolder]: https://github.com/justlep/bitwig/tree/master/stable-version-for-download/
[midiOxScreenshot]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20BCF2000/img/MidiOX-send-SysEx.png
[midiOxLink]: http://www.midiox.com/
[err14]: https://github.com/justlep/bitwig/issues/5
