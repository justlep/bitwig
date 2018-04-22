# LeP's X-Touch Compact for Bitwig

Six values types (**Volume**, **Pan**, **Send**, **MultiSend**, **Device Parameters (Remote Controls)**, **User Controls** freely assignable to three groups of hardware controls (**Top Encoders**, **Right Encoders**, **Motorized Faders**). Fully flexible & bidirectional.

### Overview 
_(click to see fullsize)_
[![][overviewImage]][overviewImage]


You control 8 channels at a time. The **`CH-Page`** buttons switch to the next/previous channel page. **`SHIFT + CH-PAGE`** selects the previous/next device in the selected channel. The **`MAIN Fader`** = Master Volume at any time.

### Selecting what controls what
In default mode (_**"Type mode"**_, as opposed to _**Mix mode**_), the **upper three button rows** determine what *"type of value"* is controlled by each of the three main control groups: 
* **Top buttons** --> determine value type of **Top encoders**, 
* **Middle buttons --> Right encoders** 
* **Bottom buttons --> Faders**

In each button row, the first 6 buttons define the assigned *type*, while the last two buttons can switch forth/back a *page* (where applicable). If you select a type that is already used for another control group, the two groups will *swap* their value types.
The types in detail:

* **Volume** (8 channels at a time)
* **Pan** (8 channels at a time)
* **Send** (8 channels at a time)
  - The **`<<`** and **`>>`** buttons select the next/previous send.
* **MultiSend** (all **sends of the selected channel**; lockable)  
  - Initially, you're controlling "Send 1 - 8" of the selected channel. The **`<<`** and **`>>`** buttons switch one send up/down, e.g. "Sends 2 - 9" after pressing **`>>`** first time.
  -  You can **lock MultiSend to the selected channel** ("pinning" in Bitwig speak) by **double-clicking** a **`MultiSend`** button, so you keep control over that channel's sends even when selecting a different channel.
  -  A blinking **`MultiSend`** button indicates it is locked.
* **Param** (alias **Remote Controls** of the currently selected device; 2x lockable)  
  - You can **lock (pin) to the device** by **double-clicking** this button, so you stay in control over that particular device even after navigating to a different device or channel. 
  - A blinking **`Param`** button means it is locked to a device.
  - The **`<<`** and **`>>`** buttons select the previous/next Remote Control Page.
  - Pressing **`Param + <<`** will **lock (pin) to the device AND the remote control page**, i.e. it will stick to the current page instead of following what gets selected in the GUI.
  - Pressing **`Param + >>`** reveals the device's remote controls panel.
  - Pressing **two** **`Param`** buttons simultaneously **opens the device's GUI** (for VSTs or Bitwig devices like Phase4)
* **UserControls** 
 - **48 freely mappable User Controls** in 6 pages of 8 UCs each
 - The **`<<`** and **`>>`** buttons select the previous/next page.
 - each user control mappable in Bitwig via `Rightclick -> Map to Controller or Key`, then moving the desired fader/encoder

### Mix mode

[![][buttonModeImage]][buttonModeImage]

Pressing **`SHIFT + Type/Mix`** changes the mode of the top button rows. In **Mix mode**, each button column corresponds to one channel, with the buttons meaning **Solo, Mute, Arm** (from to bottom). 

### Buttons below faders
[![][bottomButtonsImage]][bottomButtonsImage]
Normally, the buttons below the faders are **Channel Select** buttons.  
When holding **`SHIFT`**, they become *Config* buttons with different meanings:
* `Button 1-3`: **Punch In**, **Punch Out** and **Punch Auto-Reset** which if enabled turns off PunchIn / PunchOut whenever transport stops.
* `Button 4-5` *no useful idea yet*
* `Button 6`: **VU Meter** on the top encoders' LED rings (I will likely remove this as it uselessly eats resources even when inactive. Plus it's ugly on LED rings in PAN mode)
* `Button 7`: Keep Config - if enabled, the bottom buttons stay in their state **as if `SHIFT`** was still pressed even it really isn't 
   (useful when *Punch* buttons etc are currently more important than *Channel Select* ones)
* `Button 8`: Toggles the top button rows between **Type mode** and **Mix mode**

### What else..

#### High precision changes through Push & Twist
All rotatries are **Push encoders**. Holding them pushed while rotating them allows for **4 times finer value adjustments**.

#### Mute noisy faders
If you have lots of automation going on, you can "mute" the faders temporarily by pressing **`SHIFT+STOP`**, so they won't follow value changes in Bitwig anymore but still will send MIDI data when YOU move them. When un-muting them, they'll move back to the correct position immediately.

#### Replacement caps (highly recommended)
IMHO, Behringer's fader caps and encoder caps are complete garbage, being slick as Teflon. I've found perfect replacements for them though, and I'd recommend them (no affiliate links):
- [Fader caps from Alps](https://www.reichelt.de/Schiebepotis/KNOPF-18-5X1-5VC/3/index.html?ACTION=3&LA=446&ARTICLE=73957)  (T-Lever, inner 18.5 x 1.5 mm, outer 25x13mm, chrome). 0.99 €/piece
- [Encoder caps](https://www.reichelt.de/Potiknoepfe/KNOPF-13-164B/3/index.html?ACTION=3&LA=517&ARTICLE=73963&GROUPID=3139) (6mm axis, 13mm diameter, 16mm height) 0.46 €/piece

----
## Download & Installation <a name="dlinstall"></a>
#### Layer A, default config required

The script is written for the X-Touch Compact's Layer A in default configuration. If you need the config, you can [download LayerA.bin here](https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20X-Touch%20Compact/LayerA.bin), then write it to your X-Touch Compact using Behringer's X-Touch Editor. (Tested with X-Touch Compact Firmware 1.12 / Editor Version 1.21).

#### Installation

1.  Download the latest ZIP file from the [stable-versions-for-download/][stableFolder] directory and extract it to your Bitwig controller scripts folder:
    * **Windows:** ~Documents\Bitwig Studio\Controller Scripts
    * **Linux/Mac:** ~Documents/Bitwig Studio/Controller Scripts
2.  Open the preferences in Bitwig and go to Controllers
3.  Add the Controller script **Behringer** > **X-Touch Compact (by Lennart Pegel)** and choose "X-Touch Compact" for both input and output.


[overviewImage]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20X-Touch%20Compact/img/total.jpg
[buttonModeImage]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20X-Touch%20Compact/img/top-button-modes.jpg
[bottomButtonsImage]: https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20X-Touch%20Compact/img/bottom-buttons.jpg? 

