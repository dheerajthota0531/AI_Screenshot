/**
 * Toast notification utility for content script
 */
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // Create toast element
  const toast = document.createElement('div');
  const toastId = `screenshot-toast-${Date.now()}`;
  toast.id = toastId;

  // Define styles
  const typeStyles: Record<string, string> = {
    success: 'background-color: #10b981; color: white;',
    error: 'background-color: #ef4444; color: white;',
    info: 'background-color: #3b82f6; color: white;'
  };

  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999999;
    padding: 12px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    word-wrap: break-word;
    opacity: 0;
    transition: opacity 0.3s ease-out;
    ${typeStyles[type]}
  `;

  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      const element = document.getElementById(toastId);
      if (element) {
        element.remove();
      }
    }, 300);
  }, 3000);
};

const bboxAnchor = document.body.appendChild(document.createElement('div'));
bboxAnchor.id = 'screenshot-bbox';
bboxAnchor.style.zIndex = '9999999';
bboxAnchor.style.position = 'fixed';
bboxAnchor.style.top = '0px';
bboxAnchor.style.left = '0px';
bboxAnchor.style.width = `0px`;
bboxAnchor.style.height = `0px`;

let hotKeyIsDown = false,
  mouseIsDown = false;
let startingX: number | undefined = undefined,
  startingY: number | undefined = undefined;

const resetBBoxAnchor = () => {
  bboxAnchor.style.removeProperty('top');
  bboxAnchor.style.removeProperty('left');
  bboxAnchor.style.removeProperty('bottom');
  bboxAnchor.style.removeProperty('right');
  bboxAnchor.style.removeProperty('width');
  bboxAnchor.style.removeProperty('height');
};

const resetEverything = () => {
  hotKeyIsDown = false;
  mouseIsDown = false;
  startingX = undefined;
  startingY = undefined;
  document.body.classList.remove('no-select');
  // document.body.style.removeProperty('cursor');
  resetBBoxAnchor();
  bboxAnchor.classList.remove('active');
};

window.addEventListener('mousedown', (event) => {
  if (event.altKey) {
    // Alt / Option key is down
    document.body.classList.add('no-select');
    // document.body.style.cursor = `url(${chrome.extension.getURL(
    //   'cross-32.png'
    // )}), auto`;

    mouseIsDown = true;
    startingX = event.clientX;
    startingY = event.clientY;

    bboxAnchor.style.top = `${startingY}px`;
    bboxAnchor.style.left = `${startingX}px`;
    bboxAnchor.style.width = `0px`;
    bboxAnchor.style.height = `0px`;

    bboxAnchor.classList.add('active');
  }
});

const rectifyCursorCoordinates = (clientX: number, clientY: number) => {
  let currX = clientX < 0 ? 0 : clientX,
    currY = clientY < 0 ? 0 : clientY;
  return [currX, currY];
};

window.addEventListener('mousemove', (event) => {
  if (mouseIsDown && startingX !== undefined && startingY !== undefined) {
    const [currX, currY] = rectifyCursorCoordinates(
      event.clientX,
      event.clientY
    );

    const width = Math.abs(currX - startingX),
      height = Math.abs(currY - startingY);

    resetBBoxAnchor();

    if (startingY <= currY && startingX <= currX) {
      bboxAnchor.style.top = `${startingY}px`;
      bboxAnchor.style.left = `${startingX}px`;
    } else if (startingY <= currY && startingX >= currX) {
      bboxAnchor.style.top = `${startingY}px`;
      bboxAnchor.style.right = `${document.body.clientWidth - startingX}px`;
    } else if (startingY >= currY && startingX <= currX) {
      bboxAnchor.style.bottom = `${window.innerHeight - startingY}px`;
      bboxAnchor.style.left = `${startingX}px`;
    } else if (startingY >= currY && startingX >= currX) {
      bboxAnchor.style.bottom = `${window.innerHeight - startingY}px`;
      bboxAnchor.style.right = `${document.body.clientWidth - startingX}px`;
    }

    bboxAnchor.style.width = `${width}px`;
    bboxAnchor.style.height = `${height}px`;
  }
});

window.addEventListener('mouseup', (event) => {
  if (!mouseIsDown || startingX === undefined || startingY === undefined) {
    return;
  }

  const [currX, currY] = rectifyCursorCoordinates(event.clientX, event.clientY);
  const rect = {
    x: Math.min(startingX, currX),
    y: Math.min(startingY, currY),
    width: Math.abs(startingX - currX),
    height: Math.abs(startingY - currY),
  };
  const windowSize = {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX || document.documentElement.scrollLeft,
    scrollY: window.scrollY || document.documentElement.scrollTop
  };

  resetEverything();

  // avoid screenshoting the bbox
  setTimeout(() => {
    chrome.runtime.sendMessage({
      msg: 'SCREENSHOT_WITH_COORDINATES',
      rect,
      windowSize,
    });
  }, 1);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    resetEverything();
  } else if (event.altKey) {
    hotKeyIsDown = true;
    document.body.classList.add('no-select');
    // document.body.style.cursor = `url(${chrome.extension.getURL(
    //   'cross-32.png'
    // )}), auto`;
  }
});

window.addEventListener('keyup', (event) => {
  if (hotKeyIsDown && !event.altKey) {
    hotKeyIsDown = false;
    if (!mouseIsDown) {
      document.body.classList.remove('no-select');
      // document.body.style.removeProperty('cursor');
    }
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SHOW_NOTIFICATION') {
    const { message, notificationType } = request;
    showToast(message, notificationType || 'info');
    sendResponse({ success: true });
  }
});
