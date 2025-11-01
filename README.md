# Screenshot Browser Extension

[<img src="src/assets/img/icon-128.png" height="40"/>](https://github.com/dheerajthota0531/screenshot-extension)

![package.json version](https://img.shields.io/github/package-json/v/dheerajthota0531/screenshot-extension/master)
[![MIT License](https://img.shields.io/github/license/dheerajthota0531/screenshot-extension)](LICENSE)

![last commit](https://img.shields.io/github/last-commit/dheerajthota0531/screenshot-extension/master)
![commit freq](https://img.shields.io/github/commit-activity/w/dheerajthota0531/screenshot-extension)

<!--
[![users](https://img.shields.io/chrome-web-store/users/hmkbkbpdnembpeadgpcmjekihjmckdjh)](https://chrome.google.com/webstore/detail/screenshot-extension/hmkbkbpdnembpeadgpcmjekihjmckdjh)
-->

Based on [Chrome Extension Boilerplate with React 17 and Webpack 5](https://github.com/lxieyang/chrome-extension-boilerplate-react)

![preview](preview/preview-original.png)

## To install

### From Chrome store

[<img src="preview/chrome-web-store-img.png" height="40"/>](https://chrome.google.com/webstore/detail/screenshot-extension/hmkbkbpdnembpeadgpcmjekihjmckdjh)

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/hmkbkbpdnembpeadgpcmjekihjmckdjh)](https://chrome.google.com/webstore/detail/screenshot-extension/hmkbkbpdnembpeadgpcmjekihjmckdjh)

### From Github Releases

1. Download the latest `build.zip` from the [Release](https://github.com/dheerajthota0531/screenshot-extension/releases) page.
2. Unzip
3. Go to `chrome://extensions/` (or `edge://extensions/` if you're using MS Edge) and enable `Developer mode`.
4. Click `Load Unpacked`, then select the unzipped folder (which contains a file called `manifest.json`).

### Build from the source

1. Clone this git repo
2. Run `npm install`.
3. Run `npm run build`, which will generate a `build` folder.
4. Go to `chrome://extensions/` (or `edge://extensions/` if you're using MS Edge) and enable `Developer mode`.
5. Click `Load Unpacked`, then select the `build` folder (which contains a file called `manifest.json`).

## To use

### Quick Start:
1. **IMPORTANT:** After loading the extension, **refresh any open tabs** where you want to use it (`Cmd+R`)
2. **For Partial Screenshots:** Hold **Option/Alt** key and drag your mouse to select an area
3. **For Full Screenshots:** Click the extension icon in your toolbar

### Keyboard Shortcuts:
- `Alt+Shift+C` - Start crop mode
- `Alt+Shift+F` - Capture full page
- `Alt+Shift+E` - Export to Excel

### ⚠️ Troubleshooting
If the crop feature isn't working, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed help.

**Most common fix:** Refresh the page after loading the extension!

---

Based on the original work by [Michael Xieyang Liu](https://lxieyang.github.io)  
Forked and maintained by [dheerajthota0531](https://github.com/dheerajthota0531)
