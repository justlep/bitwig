# Beatstep Pro controller script for Bitwig

How to install:

1.  Download this project as a ZIP file (button on the right) and extract it to your Bitwig controller scripts folder:
    *   **Windows:** ~Documents\Bitwig Studio\Controller Scripts
    *   **Mac:** ~Documents/Bitwig Studio/Controller Scripts
    *   **Linux:** ~Documents/Bitwig Studio/Controller Scripts
2.  Open the preferences dialog in Bitwig and go to Controllers
3.  Either click "Detect available controllers" which should automatically add the BSP version with four inputs (S1, S2, DRUM and ALL).
     Or add one of the controllers manually:
    *   **Arturia Beatstep Pro -> BSP** ... adds BSP with three inputs + OMNI (this is the autodetectable version)
    *   **Arturia Beatstep Pro (All channels) -> BSP** ... adds BSP with all 16 MIDI channels + OMNI
4.  In the end the dialog should look something like this (ignore TouchOSC):![](https://raw.githubusercontent.com/justlep/bitwig/master/ArturiaBeatstepPro/BeatstepPro-autodetect.png)
    (Note that for Mackie Control you don't need the controller script - it's comes with Bitwig. Assigning Mackie MCU PRO to BeatStepPro's MIDI-IN2/OUT2 allows you to switch control mode to MCU/HUI mode and then control track volumes, pan, mute and solo via BSP's knobs and buttons.)
5.  After that, you can select MIDI track inputs of BeatStep's sequencers..![](https://raw.githubusercontent.com/justlep/bitwig/master/ArturiaBeatstepPro/BeatstepPro.control.png)

Put your Beatstep Pro in sync mode "USB" to make it start/stop synchronously with Bitwig.

Have fun :)