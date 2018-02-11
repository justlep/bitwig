# AKAI APC mini controller script for Bitwig

Provides following features:
* Clip matrix with variable orientation (Scenes x Tracks vs. Tracks x Scenes)
* Takeover mode for all faders (can be disabled in the config mode)
* configurable step size to be used when scrolling the clip matrix by scenes and tracks
* Faders controlling Volume / Pan / Sends (up to 6) / Device Remote controls (any number of RC pages)
* Holding any mode button longer than ~0.5sec will switch back to the previous mode upon button release
* Auto-reset Punch-In/Out upon stop (configurable)

## In simple pictures...
### Overview
![](https://github.com/justlep/bitwig/blob/master/doc/APCmini/overview.jpg)
### Mix Mode
![](https://github.com/justlep/bitwig/blob/master/doc/APCmini/mixmode.jpg)
### Clip Matrix mode
![](https://github.com/justlep/bitwig/blob/master/doc/APCmini/matrixmode.jpg)
### Config mode
![](https://github.com/justlep/bitwig/blob/master/doc/APCmini/configmode.jpg)


### Download & Installation

1.  Download the latest ZIP file from the [stable-versions-for-download][stableFolder] folder and unpack it as described on the page
2.  Open the preferences dialog in Bitwig and go to Controllers
3.  Add the controller manually **Akai > APC mini (by Lennart Pegel)**

[stableFolder]: https://github.com/justlep/bitwig/tree/master/stable-version-for-download/
