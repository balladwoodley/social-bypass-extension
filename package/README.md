# Social Wall Bypass — Chrome Extension

Browse Instagram, Twitter/X, and Facebook without being forced to log in.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select this folder (`social-bypass-extension`)
5. The extension is now active! Visit any supported site.

## How to Use

- Visit **instagram.com**, **twitter.com / x.com**, or **facebook.com**
- Login walls, modals, and overlays will be automatically removed
- If a wall appears briefly, click the extension icon → **↺ Reload Tab**

## What It Does

| Technique | Description |
|---|---|
| CSS injection | Hides login walls before the page renders (no flash) |
| DOM observer | Removes modals as they're dynamically inserted by JS |
| Scroll unlock | Restores scroll when pages lock `<body>` overflow |
| Auto-retry | Clears any newly injected walls every 1.5 seconds |

## Limitations

- These sites frequently update their CSS class names and DOM structure. If something stops working, the selectors in `content.js` and `bypass.css` may need updating.
- Some content (e.g. DMs, Stories) is only accessible when logged in — this extension only removes the forced login *walls*, not authentication requirements for private content.
- Facebook's login wall is the most aggressive and may not always be fully removed.

## Files

```
social-bypass-extension/
├── manifest.json     # Extension config (MV3)
├── content.js        # Main bypass logic per platform
├── bypass.css        # CSS-level wall removal (runs at document_start)
├── popup.html        # Extension popup UI
├── popup.js          # Popup reload button
└── icons/            # Extension icons
```
