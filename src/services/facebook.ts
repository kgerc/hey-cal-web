/**
 * Facebook SDK Integration
 * Provides Facebook Send Dialog for sharing events via Messenger
 */

// Initialize Facebook SDK
export function initFacebookSDK(appId: string): Promise<void> {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.FB) {
      resolve();
      return;
    }

    // Load Facebook SDK script
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      resolve();
    };

    document.body.appendChild(script);
  });
}

/**
 * Open Facebook Send Dialog to share event via Messenger
 * This opens a native Facebook popup where user can select friends
 */
export async function shareEventViaMessenger(eventUrl: string, eventTitle: string): Promise<void> {
  if (!window.FB) {
    throw new Error('Facebook SDK not initialized');
  }

  return new Promise((resolve, reject) => {
    window.FB.ui({
      method: 'send',
      link: eventUrl,
      // Optional: Add a redirect URL after sharing
      redirect_uri: window.location.origin + '/dashboard',
    }, (response: any) => {
      if (response && !response.error_message) {
        resolve();
      } else {
        reject(new Error(response?.error_message || 'Share cancelled'));
      }
    });
  });
}

/**
 * Share event link (general share dialog, not just Messenger)
 */
export async function shareEventOnFacebook(eventUrl: string, eventTitle: string, eventDescription?: string): Promise<void> {
  if (!window.FB) {
    throw new Error('Facebook SDK not initialized');
  }

  return new Promise((resolve, reject) => {
    window.FB.ui({
      method: 'share',
      href: eventUrl,
      quote: eventDescription,
    }, (response: any) => {
      if (response && !response.error_message) {
        resolve();
      } else {
        reject(new Error(response?.error_message || 'Share cancelled'));
      }
    });
  });
}

// TypeScript type declarations for Facebook SDK
declare global {
  interface Window {
    FB: {
      init: (params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      ui: (
        params: {
          method: string;
          link?: string;
          href?: string;
          quote?: string;
          redirect_uri?: string;
        },
        callback: (response: any) => void
      ) => void;
    };
  }
}
