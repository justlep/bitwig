# Behringer CMD DC-1 controller script for Bitwig

Written for generating Program Change (and Bank change) messages, enabling you to quickly 
browse Banks and Presets of Softsynths like Reaktor, Microtonic, Z3TA, Morphine, Toxic Biohazard etc.

* Three modes: Bank Mode, Preset Mode, Snapshot Mode ("snapshot" meaning a saved combination of bank+preset). 
* In each mode, you have 8 pages (numeric buttons) à 16 pads, hence 128 banks, 128 programs, 128 snapshots in total. 
* To switch a bank/preset/snapshot, you can either press the pads OR twist the big Push-Encoder on top. Clicking the Push-Encoder 
  will reset the bank or preset to 0 (depending on the mode).
* In Snapshot Mode, hold the Shift-Button and one of the 16 pads to save the current bank+program  to a snapshot slot. 
  (Value are lost when Bitwig is closed).
* If you hold a mode buttons pressed, the mode will switch back automatically after button release.

![](https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20CMD%20DC-1/img/DC-1-ProgramChange.png)

### Routing

The best routing in Bitwig for me was to create a seperate MIDI channel for the DC-1, switching its "track monitoring" on and routing its MIDI output to the channel containing the Synth I want to send ProgramChanges to. That way, the target channel doesn't need to be armed to receive the messages.

![](https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20CMD%20DC-1/img/routing.png)

### Download & Installation

1.  Download the latest ZIP file from the [stable-versions-for-download][stableFolder] folder and unpack it as described on the page
2.  Open the preferences dialog in Bitwig and go to Controllers
3.  Autodetect the DC-1 or add it  manually **Behringer > CMD DC-1 (LeP)**
4.  You can open the script preferences via the left-most icon to configure some behavior:
    ![](https://raw.githubusercontent.com/justlep/bitwig/master/doc/Behringer%20CMD%20DC-1/img/prefs.png)

[stableFolder]: https://github.com/justlep/bitwig/tree/master/stable-version-for-download/
