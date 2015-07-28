# Beatstep Pro controller script for Bitwig

How to install:

1.  Download this project as a ZIP file (button on the right) and extract it to your Bitwig controller scripts folder:
    *   **Windows:** ~Documents\Bitwig Studio\Controller Scripts
    *   **Linux/Mac:** ~Documents/Bitwig Studio/Controller Scripts
2.  Open the preferences dialog in Bitwig and go to Controllers
3.  Either click "Detect available controllers" which should automatically add the BSP version with four inputs (S1, S2, DRUM and ALL), or add one of the controllers manually:
    *   **Arturia Beatstep Pro -> BSP** ... adds BSP with three inputs + OMNI (this is the autodetectable version)
    *   **Arturia Beatstep Pro (All channels) -> BSP** ... adds BSP with all 16 MIDI channels + OMNI
    * Additionally, you can add a **Mackie MCU PRO** using BeatStep's MIDI-IN2/OUT2 (Mackie support comes with Bitwig - you don't need my controller script for that). This allows you to control track volume, pan, mute and solo via BSP's knobs and buttons after switching its control mode to "MCU/HUI". You can switch between HUI and CC mode anytime.
4.  Finally, the dialog should look something like this (ignore TouchOSC):
    ![](https://raw.githubusercontent.com/justlep/bitwig/master/ArturiaBeatstepPro/BeatstepPro-autodetect.png)
5.  Close the settings. Now you can select MIDI track inputs of BeatStep's sequencers:
    ![](https://raw.githubusercontent.com/justlep/bitwig/master/ArturiaBeatstepPro/BeatstepPro.control.png)

It's useful to put Beatstep in **sync mode "USB"** to make it start/stop synchronously with Bitwig, as the latest version of Bitwig (v1.1.10) is yet unable to be controlled by external clocks.

Hope that helped. Have fun :)