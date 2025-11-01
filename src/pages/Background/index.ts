import '../../assets/img/icon-34.png';
import '../../assets/img/icon-128.png';
import '../../assets/img/cross-32.png';
import { defaults } from '../../shared/defaults';
import { exportScreenshotToExcel, exportMultipleScreenshots } from '../../services/excelExport';
import { CropData } from '../../types/excel';
// @ts-ignore
import imageClipper from './image-clipper';

interface ImageDimension {
  w: number;
  h: number;
}

chrome.storage.sync.set({ openInTab: defaults.openInTab });
chrome.storage.sync.set({ download: defaults.download });
chrome.storage.local.set({ batchCrops: [] });
chrome.storage.sync.set({ includeMetadata: true });
chrome.storage.sync.set({ defaultExportFormat: 'excel' });

// Initialize batch crops storage
let batchCrops: CropData[] = [];

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
  } else if (request.msg === 'SCREENSHOT_TO_EXCEL') {
    // Handle single screenshot export to Excel
    try {
      const { dataUrl, pageUrl, width, height, x, y, filename, includeMetadata } = request;

      const metadata = {
        pageUrl,
        width,
        height,
        x,
        y
      };

      exportScreenshotToExcel(
        dataUrl,
        {
          includeMetadata,
          filename: filename || `screenshot_${Date.now()}.xlsx`,
          timestamp: Date.now()
        },
        metadata
      );

      // Send success response to content script
      sendResponse({ success: true, message: 'Exported to Excel successfully' });
      console.log('Screenshot exported to Excel');
    } catch (error) {
      console.error('Excel export failed:', error);
      sendResponse({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to export to Excel'
      });
    }
  } else if (request.msg === 'STORE_CROP_FOR_BATCH') {
    // Store crop for batch export
    try {
      const crop: CropData = {
        dataUrl: request.dataUrl,
        timestamp: request.timestamp || Date.now(),
        pageUrl: request.pageUrl,
        width: request.width,
        height: request.height,
        x: request.x,
        y: request.y
      };

      batchCrops.push(crop);

      // Also store in chrome storage for persistence
      chrome.storage.local.set({ batchCrops });

      console.log(`Crop stored for batch export. Total crops: ${batchCrops.length}`);
      sendResponse({ success: true, cropsCount: batchCrops.length });
    } catch (error) {
      console.error('Failed to store crop:', error);
      sendResponse({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to store crop'
      });
    }
  } else if (request.msg === 'BATCH_EXPORT_EXCEL') {
    // Export all stored crops to Excel
    try {
      if (batchCrops.length === 0) {
        sendResponse({
          success: false,
          message: 'No crops to export'
        });
        return;
      }

      const { filename, includeMetadata } = request;

      exportMultipleScreenshots(
        batchCrops,
        {
          includeMetadata,
          filename: filename || `screenshots_batch_${Date.now()}.xlsx`,
          timestamp: Date.now()
        }
      );

      // Clear batch crops after successful export
      batchCrops = [];
      chrome.storage.local.set({ batchCrops: [] });

      console.log('Batch exported to Excel successfully');
      sendResponse({ success: true, message: `Exported ${batchCrops.length} crops to Excel` });
    } catch (error) {
      console.error('Batch export failed:', error);
      sendResponse({
        success: false,
        message: error instanceof Error ? error.message : 'Batch export failed'
      });
    }
  } else if (request.msg === 'GET_BATCH_CROPS_COUNT') {
    // Get count of stored crops
    sendResponse({ count: batchCrops.length });
  } else if (request.msg === 'CLEAR_BATCH_CROPS') {
    // Clear batch crops
    batchCrops = [];
    chrome.storage.local.set({ batchCrops: [] });
    sendResponse({ success: true, message: 'Batch crops cleared' });
  }
});

// Handle keyboard shortcuts/commands
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'start-crop-mode':
      // Send message to active tab to activate crop mode
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id || 0, {
            type: 'ACTIVATE_CROP_MODE',
            message: 'Crop mode activated via hotkey'
          }).catch((error) => {
            console.error('Failed to activate crop mode:', error);
          });
        }
      });
      break;

    case 'full-page-screenshot':
      // Capture full page screenshot
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.captureVisibleTab((screenshotUrl) => {
            if (!screenshotUrl) {
              console.error('Failed to capture screenshot');
              return;
            }

            chrome.storage.sync.get(['download', 'openInTab'], (result) => {
              if (result.download) {
                chrome.downloads.download({
                  url: screenshotUrl,
                  filename: `screenshot_fullpage_${new Date().getTime().toString()}.jpg`,
                });
              }

              if (result.openInTab) {
                chrome.tabs.create({
                  url: screenshotUrl,
                });
              }
            });

            // Notify user
            if (tabs[0].id) {
              chrome.tabs.sendMessage(tabs[0].id, {
                type: 'SHOW_NOTIFICATION',
                message: 'Full page screenshot captured ✓',
                notificationType: 'success'
              }).catch(() => {
                console.log('Content script not available for notification');
              });
            }
          });
        }
      });
      break;

    case 'export-batch':
      // Trigger batch export
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (batchCrops.length === 0) {
          if (tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'SHOW_NOTIFICATION',
              message: 'No crops to export. Capture screenshots first.',
              notificationType: 'error'
            }).catch(() => {
              console.log('Content script not available for notification');
            });
          }
          return;
        }

        chrome.storage.sync.get(['includeMetadata'], (result) => {
          exportMultipleScreenshots(batchCrops, {
            includeMetadata: result.includeMetadata || true,
            filename: `batch_export_${Date.now()}.xlsx`,
            timestamp: Date.now()
          });

          // Clear crops after export
          batchCrops = [];
          chrome.storage.local.set({ batchCrops: [] });

          if (tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'SHOW_NOTIFICATION',
              message: `Exported batch to Excel ✓`,
              notificationType: 'success'
            }).catch(() => {
              console.log('Content script not available for notification');
            });
          }
        });
      });
      break;
  }
});
