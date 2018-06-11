/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
'use strict';

// Defined in a classic script source, and we can read these as global variables. 
/* global
  Promise: false,
  Configs: false,
  uneval: false,
 */

import {
  kNOTIFICATION_DEFAULT_ICON,
  kTABBAR_POSITION_LEFT,
  kTABBAR_DIRECTION_LTR,
  kTABBAR_SCROLLBAR_POSITION_AUTO,
  kCOUNTER_ROLE_CONTAINED_TABS,
  kDEFAULT_MIN_INDENT,
  kTABBAR_SCROLLBAR_MODE_OVERLAY,
  kTABBAR_SCROLLBAR_MODE_NARROW,
  kCONTEXTUAL_IDENTITY_SELECTOR,
  kPARENT_TAB_BEHAVIOR_ALWAYS,
  kDROPLINK_ASK,
  kINSERT_END,
  kINSERT_NO_CONTROL,
  kSCROLL_TO_NEW_TAB_IF_POSSIBLE,
  kNEWTAB_OPEN_AS_CHILD,
  kNEWTAB_OPEN_AS_ORPHAN,
  kNEWTAB_OPEN_AS_NEXT_SIBLING,
  kCLOSE_PARENT_BEHAVIOR_PROMOTE_FIRST_CHILD
} from './constants.js';

let configs;

export function log(aMessage, ...aArgs)
{
  const useConsole = configs && configs.debug;
  const logging    = useConsole || log.forceStore;
  if (!logging)
    return;

  const nest = (new Error()).stack.split('\n').length;
  let indent = '';
  for (let i = 0; i < nest; i++) {
    indent += ' ';
  }
  const line = `tst<${log.context}>: ${indent}${aMessage}`;
  if (useConsole)
    console.log(line, ...aArgs);

  log.logs.push(`${line} ${aArgs.map(aArg => uneval(aArg)).join(', ')}`);
  log.logs = log.logs.slice(-log.max);
}
log.context = '?';
log.max  = 1000;
log.logs = [];
log.forceStore = true;

export function dumpTab(aTab) {
  if (!configs || !configs.debug)
    return '';
  if (!aTab || !aTab.apiTab)
    return '<NULL>';
  return `#${aTab.id}`;
}

export async function wait(aTask = 0, aTimeout = 0) {
  if (typeof aTask != 'function') {
    aTimeout = aTask;
    aTask    = null;
  }
  return new Promise((aResolve, _aReject) => {
    setTimeout(async () => {
      if (aTask)
        await aTask();
      aResolve();
    }, aTimeout);
  });
}

export function nextFrame() {
  return new Promise((aResolve, _aReject) => {
    window.requestAnimationFrame(aResolve);
  });
}

export async function notify(aParams = {}) {
  var id = await browser.notifications.create({
    type:    'basic',
    iconUrl: aParams.icon || kNOTIFICATION_DEFAULT_ICON,
    title:   aParams.title,
    message: aParams.message
  });

  var timeout = aParams.timeout;
  if (typeof timeout != 'number')
    timeout = configs.notificationTimeout;
  if (timeout >= 0)
    await wait(timeout);

  await browser.notifications.clear(id);
}


configs = new Configs({
  optionsExpandedSections: ['section-appearance'],

  // appearance
  sidebarPosition: kTABBAR_POSITION_LEFT,
  sidebarDirection: kTABBAR_DIRECTION_LTR,
  sidebarScrollbarPosition: kTABBAR_SCROLLBAR_POSITION_AUTO,

  style:
    /^Linux/i.test(navigator.platform) ? 'plain' :
      /^Mac/i.test(navigator.platform) ? 'sidebar' :
        'mixed',
  colorScheme: /^Linux/i.test(navigator.platform) ? 'system-color' : 'photon' ,

  faviconizePinnedTabs: true,
  faviconizedTabScale: 1.75,

  counterRole: kCOUNTER_ROLE_CONTAINED_TABS,

  baseIndent: 12,
  minIndent: kDEFAULT_MIN_INDENT,
  maxTreeLevel: -1,
  indentAutoShrink: true,
  indentAutoShrinkOnlyForVisible: true,

  scrollbarMode: /^Mac/i.test(navigator.platform) ? kTABBAR_SCROLLBAR_MODE_OVERLAY : kTABBAR_SCROLLBAR_MODE_NARROW,
  narrowScrollbarSize: 8,

  showContextualIdentitiesSelector: false,
  showNewTabActionSelector: true,
  longPressOnNewTabButton: kCONTEXTUAL_IDENTITY_SELECTOR,
  zoomable: false,
  showCollapsedDescendantsByTooltip: true,


  // context menu
  fakeContextMenu: true,
  context_reloadTree: true,
  context_reloadDescendants: false,
  context_closeTree: true,
  context_closeDescendants: false,
  context_closeOthers: false,
  context_collapseAll: true,
  context_expandAll: true,
  context_bookmarkTree: true,


  // tree behavior
  shouldDetectClickOnIndentSpaces: true,

  autoCollapseExpandSubtreeOnAttach: true,
  autoCollapseExpandSubtreeOnSelect: true,
  autoCollapseExpandSubtreeOnSelectExceptCurrentTabRemove: true,

  collapseExpandSubtreeByDblClick: false,

  autoExpandIntelligently: true,
  autoExpandOnCollapsedChildFocused: true,
  autoExpandOnTabSwitchingShortcuts: true,
  autoExpandOnTabSwitchingShortcutsDelay: 800,
  autoExpandOnLongHover: true,
  autoExpandOnLongHoverDelay: 500,
  autoExpandOnLongHoverRestoreIniitalState: true,

  skipCollapsedTabsForTabSwitchingShortcuts: false,

  parentTabBehaviorForChanges: kPARENT_TAB_BEHAVIOR_ALWAYS,

  syncParentTabAndOpenerTab: true,

  dropLinksOnTabBehavior: kDROPLINK_ASK,


  // grouping
  autoGroupNewTabs: true,
  autoGroupNewTabsTimeout: 100,
  autoGroupNewTabsDelayOnNewWindow: 500,
  autoGroupNewTabsFromPinned: true,


  // behavior around newly opened tabs
  insertNewChildAt: kINSERT_END,
  insertNewTabFromPinnedTabAt: kINSERT_NO_CONTROL,

  scrollToNewTabMode: kSCROLL_TO_NEW_TAB_IF_POSSIBLE,
  scrollLines: 3,

  autoAttach: true,
  autoAttachOnOpenedWithOwner: kNEWTAB_OPEN_AS_CHILD,
  autoAttachOnNewTabCommand: kNEWTAB_OPEN_AS_ORPHAN,
  autoAttachOnNewTabButtonMiddleClick: kNEWTAB_OPEN_AS_CHILD,
  autoAttachOnDuplicated: kNEWTAB_OPEN_AS_NEXT_SIBLING,
  autoAttachSameSiteOrphan: kNEWTAB_OPEN_AS_CHILD,
  guessNewOrphanTabAsOpenedByNewTabCommand: true,
  guessNewOrphanTabAsOpenedByNewTabCommandUrl: 'about:newtab',
  inheritContextualIdentityToNewChildTab: false,
  inheritContextualIdentityToSameSiteOrphan: true,


  // behavior around closed tab
  closeParentBehavior: kCLOSE_PARENT_BEHAVIOR_PROMOTE_FIRST_CHILD,
  promoteFirstChildForClosedRoot: true,
  moveTabsToBottomWhenDetachedFromClosedParent: false,
  promoteAllChildrenWhenClosedParentIsLastChild: true,
  moveFocusInTreeForClosedCurrentTab: true,
  warnOnCloseTabs: true,
  lastConfirmedToCloseTabs: 0,


  // animation
  animation: true,
  smoothScrollEnabled:  true,
  smoothScrollDuration: 150,
  burstDuration:    375,
  indentDuration:   200,
  collapseDuration: 150,
  outOfViewTabNotifyDuration: 750,
  subMenuOpenDelay: 300,
  subMenuCloseDelay: 300,


  // misc.
  acceleratedTabOperations: true,
  acceleratedTabCreation: false,
  acceleratedTabDuplication: false,
  enableWorkaroundForBug1409262: false,
  maximumAcceptableDelayForTabDuplication: 10 * 1000,
  acceptableDelayForInternalFocusMoving: 150,
  preventTearOffTabsTimeout: 100,
  notificationTimeout: 10 * 1000,
  startDragTimeout: 400,
  minimumIntervalToProcessDragoverEvent: 50,
  moveDroppedTabToNewWindowForUnhandledDragEvent: true, // see also: https://github.com/piroor/treestyletab/issues/1646
  autoDiscardTabForUnexpectedFocus: false,
  knownExternalAddons: [
    'multipletab@piro.sakura.ne.jp'
  ],
  cachedExternalAddons: [],
  notifiedFeaturesVersion: 0,

  useCachedTree: true,

  // This should be removed after https://bugzilla.mozilla.org/show_bug.cgi?id=1388193
  // or https://bugzilla.mozilla.org/show_bug.cgi?id=1421329 become fixed.
  // Otherwise you need to set "svg.context-properties.content.enabled"="true" via "about:config".
  simulateSVGContextFill: true,

  requestingPermissions: null,

  // https://dxr.mozilla.org/mozilla-central/rev/2535bad09d720e71a982f3f70dd6925f66ab8ec7/browser/base/content/browser.css#137
  newTabAnimationDuration: 100,

  userStyleRules: `
/* Show title of unread tabs with red and italic font */
/*
.tab.unread .label {
  color: red !important;
  font-style: italic !important;
}
*/

/* Add private browsing indicator per tab */
/*
.tab.private-browsing .label:before {
  content: "🕶";
}
*/
`.trim(),

  debug:     false,
  logOnUpdated: false,
  logOnMouseEvent: false,
  logOnScroll: false,
  logOnCollapseExpand: false,
  logOnCache: false,
  logOnFakeContextMenu: false,

  importedConfigsFromLegacy: null,
  legacyConfigsNextMigrationVersion: 0,
  importedTreeStructureFromLegacy: null,
  migrateLegacyTreeStructure: true
}, {
  localKeys: `
    optionsExpandedSections
    sidebarPosition
    sidebarDirection
    style
    colorScheme
    faviconizedTabScale
    baseIndent
    minIndent
    scrollbarMode
    narrowScrollbarSize
    lastConfirmedToCloseTabs
    subMenuOpenDelay
    subMenuCloseDelay
    minimumIntervalToProcessDragoverEvent
    cachedExternalAddons
    notifiedFeaturesVersion
  `.trim().split('\n').map(aKey => aKey.trim()).filter(aKey => aKey && aKey.indexOf('//') != 0)
});

configs.$loaded.then(() => {
  log.forceStore = false;
  if (!configs.debug)
    log.logs = [];
});

export { configs };