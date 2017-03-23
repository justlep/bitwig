/**
 * Represents a simple helper for simultaneously controlling one or multiple remote control pages of a device.
 *
 * Limitations:
 *   - no bidirectional updates
 *   - no takeover behavior
 *
 * @param totalSimultaneousPages (number)
 * @param [optControlsPerPage] (number) optional number of controls per page (default: 8)
 * @param [optCursorDevice] (CursorDevice) optional explicit cursorDevice (default: a new editorCursorDevice)
 * @constructor
 */
function MultiRcPages(totalSimultaneousPages, optControlsPerPage, optCursorDevice) {
    var LOG_ENABLED = true,
        instanceId = Date.now().toString(36),
        controlsPerPage = optControlsPerPage || 8,
        cursorDevice = optCursorDevice || host.createEditorCursorDevice(0),
        rcPages = [],
        pageIndexes = (function(_firstSelected, _lastSelectable) {
            return {
                get firstSelected() {return _firstSelected},
                set firstSelected(uncheckedNewFirstPage) {
                    _firstSelected = Math.max(0, Math.min(uncheckedNewFirstPage, _lastSelectable - totalSimultaneousPages + 1));
                },
                get lastSelectable() {return _lastSelectable},
                set lastSelectable(v) {
                    _lastSelectable = v;
                    this.firstSelected = _firstSelected; // ensure firstSelected remains optimal
                }
            }
        })(0, 0),
        refreshRcPage = function(rcPage, rcPageIndex) {
            var pageIndexToSelect = pageIndexes.firstSelected + rcPageIndex;
            if (pageIndexToSelect <= pageIndexes.lastSelectable) {
                rcPage.selectedPageIndex().set(pageIndexToSelect);
            }
        },
        addRcPage = function() {
            var rcPageName = 'RcPage__' + instanceId + '__' + rcPages.length,
                rcPage = cursorDevice.createCursorRemoteControlsPage(rcPageName, controlsPerPage, ''),
                ownIndex = rcPages.push(rcPage) - 1,
                pageNamesValue = rcPage.pageNames();

            pageNamesValue.addValueObserver(function(pageNames) {
                LOG_ENABLED && println('PageNamesObserver of ' + rcPageName + ' reports ' + pageNames.length + ' pages');
                pageIndexes.lastSelectable = pageNames.length - 1;
                refreshRcPage(rcPage, ownIndex);
            });

            // pageNamesValue.markInterested(); // ? no idea if needed - documentation is insufficient

            rcPage.selectedPageIndex().addValueObserver(function(newPage) {
                LOG_ENABLED && println(rcPageName + ' is now mapped to page ' + newPage);
                for (var i=0; i<controlsPerPage; i++) {
                    rcPage.getParameter(i).setIndication(true);
                }
            }, -1);
        },
        moveSelectionBy = function(offset) {
            pageIndexes.firstSelected += offset;
            rcPages.forEach(refreshRcPage);
        };

    this.pageUp = function(single) {
        moveSelectionBy(single ? 1 : totalSimultaneousPages);
    };

    this.pageDown = function(single) {
        moveSelectionBy(single ? -1 : -totalSimultaneousPages);
    };

    this.setRcValue = function(rcIndexWithinAllPages, val) {
        var rcPageIndex = Math.floor(rcIndexWithinAllPages / controlsPerPage),
            parameterIndexInRcPage = rcIndexWithinAllPages % controlsPerPage;

        rcPages[rcPageIndex].getParameter(parameterIndexInRcPage).set(val, 128);
    };

    for (var i=0; i<totalSimultaneousPages; i++) {
        addRcPage();
    }
}