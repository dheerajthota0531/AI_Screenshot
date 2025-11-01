# 🔧 Troubleshooting Guide

## Extension Not Working / Crop Feature Not Working

### Issue: Clicking extension icon opens a tab but crop doesn't work

**Root Cause:** The content script is only injected into NEW pages after the extension is loaded. Pages that were already open don't have the content script.

**Solution:**

1. **After loading/reloading the extension**, you MUST refresh any open tabs where you want to use the screenshot feature
2. Go to each tab and press `Cmd+R` (or `Ctrl+R`) to reload the page
3. Now the Option+drag functionality should work

### Step-by-Step Setup:

1. **Load the Extension:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `build` folder

2. **IMPORTANT: Reload All Open Tabs**
   - After loading the extension, refresh ALL tabs where you want to use it
   - Press `Cmd+R` (Mac) or `Ctrl+R` (Windows/Linux) on each tab
   - Or close and reopen the tabs

3. **Test the Extension:**
   - Hold **Option** (Alt) key
   - Click and drag to select an area
   - Release to capture

### Features:

#### ✅ Partial Screenshots (Region Selection)
- **Mac:** Hold **Option** key + drag mouse
- **Windows/Linux:** Hold **Alt** key + drag mouse
- **Keyboard Shortcut:** `Alt+Shift+C` (then drag)

#### ✅ Full Page Screenshots
- Click the extension icon in toolbar
- **Keyboard Shortcut:** `Alt+Shift+F`

#### ✅ Export to Excel
- **Keyboard Shortcut:** `Alt+Shift+E`

### Common Issues:

#### 1. "Nothing happens when I hold Option and drag"
- ❌ **Problem:** Page wasn't refreshed after loading extension
- ✅ **Solution:** Refresh the page (`Cmd+R`)

#### 2. "Extension opens a new tab every time"
- ❌ **Problem:** Default setting is to open in tab
- ✅ **Solution 1:** Change defaults (I've already updated this to download instead)
- ✅ **Solution 2:** Right-click extension icon → Options → Uncheck "Open in Tab", Check "Download"

#### 3. "Works on some sites but not others"
- ❌ **Problem:** Some sites (like `chrome://` pages or Chrome Web Store) block extensions
- ✅ **Solution:** This is normal browser security. Use on regular websites only.

#### 4. "Keyboard shortcuts don't work"
- ❌ **Problem:** Shortcuts might conflict with other extensions or browser shortcuts
- ✅ **Solution:** Go to `chrome://extensions/shortcuts` to customize

#### 5. "Service Worker Inactive" error in console
- ❌ **Problem:** Manifest V3 service workers go inactive when not in use
- ✅ **Solution:** This is normal behavior. The service worker activates when needed.

### Where are screenshots saved?

By default (after my update):
- **Screenshots are automatically downloaded** to your Downloads folder
- Filename format: `timestamp.jpg` (e.g., `1730486720000.jpg`)

### Testing Checklist:

- [ ] Extension loaded in `chrome://extensions/`
- [ ] Developer mode is enabled
- [ ] Current tab has been refreshed after loading extension
- [ ] You're on a regular website (not chrome:// pages)
- [ ] Holding Option/Alt key while dragging
- [ ] Crosshair cursor appears when holding Option

### Debug Mode:

To check if the content script is loaded:

1. Open the tab where you want to screenshot
2. Press `F12` to open Developer Tools
3. Go to "Console" tab
4. Type: `document.getElementById('screenshot-bbox')`
5. If it returns an element, content script is loaded ✅
6. If it returns `null`, refresh the page ❌

### Still Not Working?

Check the browser console for errors:
1. Press `F12` to open DevTools
2. Check the "Console" tab for red error messages
3. Also check `chrome://extensions/` → Click "Errors" on your extension

### Pro Tips:

- 🎨 You can see the selection area with a dashed orange border
- ⌨️ Press `Escape` to cancel a selection
- 📦 The extension works on most websites (HTTP/HTTPS)
- 🚫 Won't work on: chrome:// pages, chrome web store, or file:// URLs
- 💾 Check your Downloads folder for saved screenshots
