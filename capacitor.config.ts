import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.toneelevate.mobile', // Your unique Bundle ID
  appName: 'ToneElevate',          // Your app name
  webDir: 'dist',                  // Your web build output directory
  bundledWebRuntime: false,      // Load from server URL, not local files
  server: {
    url: 'https://toneelevate.com', // URL of your deployed web app
    cleartext: true              // Allow HTTP for local development if needed
  }
};

export default config; 