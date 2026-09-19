// PWA Service Worker Registration & Install Prompt Management

let deferredPrompt: any = null;

export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[SulfSense PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[SulfSense PWA] Service Worker registration failed:', err);
        });
    });
  }
}

export function initPwaInstallListener(onInstallable: (canInstall: boolean) => void) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    onInstallable(true);
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    onInstallable(false);
    console.log('[SulfSense PWA] App installed successfully');
  });
}

export async function promptPwaInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    alert('PWA installation is supported directly in Google Chrome / Edge / Mobile browsers. Tap the browser menu and select "Install App" or "Add to Home Screen".');
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
}
