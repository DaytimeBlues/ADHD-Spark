/**
 * SECRETS EXAMPLE
 * ----------------
 * Copy this file to secrets.ts and fill in your actual API keys.
 *
 * To get these keys:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create or select a project
 * 3. Enable APIs: Google Tasks API, Google Calendar API
 * 4. Create OAuth 2.0 Client ID (for user auth)
 * 5. Create API Key (for direct API calls)
 */

export const SECRETS = {
  // Google OAuth Client ID
  // From: APIs & Services → Credentials → OAuth 2.0 Client IDs
  GOOGLE_CLIENT_ID: 'your-client-id.apps.googleusercontent.com',

  // Google API Key
  // From: APIs & Services → Credentials → API Keys
  GOOGLE_API_KEY: 'AIzaSy...',
};

export default SECRETS;
