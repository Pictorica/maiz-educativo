/**
 * Configuration file for environment variables
 * 
 * IMPORTANT: This file should NOT be committed to the repository!
 * Copy this file to config.js and fill in your actual credentials.
 * 
 * For production (Vercel), set these as environment variables in the dashboard.
 */

// Example configuration - replace with your actual values
const CONFIG = {
  SUPABASE_URL: '',  // e.g., 'https://your-project-id.supabase.co'
  SUPABASE_ANON_KEY: ''  // Your Supabase anon/public key
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
