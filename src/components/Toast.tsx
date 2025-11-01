/**
 * Toast Notification Component
 * Displays temporary notifications for success, error, and info messages
 */

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

class Toast {
  private toastContainer: HTMLElement | null = null;

  constructor() {
    this.initializeContainer();
  }

  private initializeContainer(): void {
    // Check if container already exists
    const existingContainer = document.getElementById('screenshot-toast-container');
    if (existingContainer) {
      this.toastContainer = existingContainer;
      return;
    }

    // Create container
    const container = document.createElement('div');
    container.id = 'screenshot-toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      pointer-events: none;
    `;

    document.body.appendChild(container);
    this.toastContainer = container;
  }

  private getPositionStyles(position: string): Partial<CSSStyleDeclaration> {
    const styles: any = {
      position: 'fixed',
      zIndex: '9999999',
      margin: '10px',
      padding: '12px 16px',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '300px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      animation: 'slideIn 0.3s ease-out',
      pointerEvents: 'auto'
    };

    // Position adjustments
    switch (position) {
      case 'top-right':
        styles.top = '20px';
        styles.right = '20px';
        break;
      case 'top-center':
        styles.top = '20px';
        styles.left = '50%';
        styles.transform = 'translateX(-50%)';
        break;
      case 'top-left':
        styles.top = '20px';
        styles.left = '20px';
        break;
      case 'bottom-right':
        styles.bottom = '20px';
        styles.right = '20px';
        break;
      case 'bottom-center':
        styles.bottom = '20px';
        styles.left = '50%';
        styles.transform = 'translateX(-50%)';
        break;
      case 'bottom-left':
        styles.bottom = '20px';
        styles.left = '20px';
        break;
      default:
        styles.top = '20px';
        styles.right = '20px';
    }

    return styles;
  }

  private getTypeStyles(type: ToastType): Partial<CSSStyleDeclaration> {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#10b981',
          color: '#ffffff'
        };
      case 'error':
        return {
          backgroundColor: '#ef4444',
          color: '#ffffff'
        };
      case 'info':
        return {
          backgroundColor: '#3b82f6',
          color: '#ffffff'
        };
      default:
        return {
          backgroundColor: '#6b7280',
          color: '#ffffff'
        };
    }
  }

  show(options: ToastOptions): void {
    if (!this.toastContainer) {
      this.initializeContainer();
    }

    const {
      message,
      type = 'info',
      duration = 3000,
      position = 'top-right'
    } = options;

    // Create toast element
    const toastElement = document.createElement('div');
    toastElement.className = 'screenshot-toast';
    toastElement.textContent = message;

    // Apply styles
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: '9999999',
      margin: '10px',
      padding: '12px 16px',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '300px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      wordWrap: 'break-word' as const,
      pointerEvents: 'auto' as const,
      ...this.getPositionStyles(position),
      ...this.getTypeStyles(type)
    };

    Object.assign(toastElement.style, baseStyles);

    // Add animation styles if not already present
    if (!document.getElementById('screenshot-toast-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'screenshot-toast-styles';
      styleSheet.textContent = `
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        .screenshot-toast {
          animation: slideIn 0.3s ease-out;
        }

        .screenshot-toast.hide {
          animation: slideOut 0.3s ease-out forwards;
        }
      `;
      document.head.appendChild(styleSheet);
    }

    // Add to container
    this.toastContainer!.appendChild(toastElement);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        toastElement.classList.add('hide');
        setTimeout(() => {
          toastElement.remove();
        }, 300);
      }, duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }
}

// Export singleton instance
export const toast = new Toast();

export default Toast;
