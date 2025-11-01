import '../../assets/img/icon-34.png';
import '../../assets/img/icon-128.png';
import '../../assets/img/cross-32.png';
import { defaults } from '../../shared/defaults';
// @ts-ignore
import imageClipper from './image-clipper';

interface ImageDimension {
  w: number;
  h: number;
}

chrome.storage.sync.set({ openInTab: defaults.openInTab });
chrome.storage.sync.set({ download: defaults.download });

const getImageDimensions = (file: string): Promise<ImageDimension> => {
  return new Promise(function (resolved, rejected) {
    var img = new Image();
    img.onload = function () {
      resolved({ w: img.width, h: img.height });
    };
    img.onerror = function () {
      rejected(new Error('Failed to load image dimensions (CORS/blob URL issue)'));
    };
    img.src = file;
  });
};

chrome.action.setTitle({
  title:
    'Hold the Option/Alt key and drag the mouse to create partial screenshots.\nClick the icon to create full-page screenshots.',
});

chrome.action.onClicked.addListener(function () {
  chrome.tabs.captureVisibleTab(function (screenshotUrl) {
    if (!screenshotUrl) {
      return;
    }
    chrome.storage.sync.get(['download', 'openInTab'], (result) => {
      // download image
      if (result.download) {
        chrome.downloads.download({
          url: screenshotUrl,
          filename: `${new Date().getTime().toString()}.jpg`,
        });
      }

      // see for yourself the screenshot during testing
      if (result.openInTab) {
        chrome.tabs.create({
          url: screenshotUrl,
        });
      }
    });
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.msg === 'SCREENSHOT_WITH_COORDINATES') {
    let rect = request.rect;
    let windowSize = request.windowSize;
    chrome.tabs.captureVisibleTab(function (screenshotUrl) {
      if (!screenshotUrl) {
        return;
      }
      getImageDimensions(screenshotUrl).then(
        (imageDimensions: ImageDimension) => {
          let scale = imageDimensions.w / windowSize.width;
          // Account for scroll position when calculating crop coordinates
          let scrollX = (windowSize as any).scrollX || 0;
          let scrollY = (windowSize as any).scrollY || 0;
          let x = Math.floor((rect.x + scrollX) * scale);
          let y = Math.floor((rect.y + scrollY) * scale);
          let width = Math.floor(rect.width * scale);
          let height = Math.floor(rect.height * scale);
          imageClipper(screenshotUrl, () => {
            // @ts-ignore
            this.crop(x, y, width, height).toDataURL((dataUrl: string) => {
              chrome.storage.sync.get(['download', 'openInTab'], (result) => {
                // download image
                if (result.download) {
                  chrome.downloads.download({
                    url: dataUrl,
                    filename: `${new Date().getTime().toString()}.jpg`,
                  });
                }

                // see for yourself the screenshot during testing
                if (result.openInTab) {
                  chrome.tabs.create({
                    url: dataUrl,
                  });
                }
              });

              // get dimensions
              // getImageDimensions(dataUrl).then((croppedImageDimensions) => {
              //   let dimensions = {
              //     trueWidth: croppedImageDimensions.w,
              //     trueHeight: croppedImageDimensions.h,
              //     rectWidth: rect.width,
              //     rectHeight: rect.height,
              //     rectX: rect.x,
              //     rectY: rect.y,
              //   };
              //   console.log(dimensions);
              // });
            });
          });
        }
      ).catch((error) => {
        console.error('Screenshot capture failed:', error);
        // User notification would go here in future iterations
      });
    });
  }
});
