#!/usr/bin/env node

/**
 * Generate config.js at build time for Vercel deployment
 * 
 * This script reads Supabase credentials from environment variables
 * and generates a config.js file that exposes them to the browser
 * via window.CONFIG.
 * 
 * Environment variables required:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 * 
 * Usage:
 *   node scripts/generate-config.js
 * 
 * For Vercel:
 *   Set environment variables in Vercel dashboard and add
 *   "vercel-build": "node scripts/generate-config.js" to package.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// Generate config.js content
const configContent = `/**
 * Configuration file for environment variables
 * 
 * IMPORTANT: This file is auto-generated during build.
 * Do not edit manually - changes will be overwritten.
 * 
 * For local development, copy config.example.js to config.js
 * For production (Vercel), this is generated from environment variables.
 */

const CONFIG = {
  SUPABASE_URL: '${SUPABASE_URL}',
  SUPABASE_ANON_KEY: '${SUPABASE_ANON_KEY}'
};

// Export for use in browser
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
`;

// Write config.js to project root
const configPath = path.join(__dirname, '..', 'config.js');

try {
  fs.writeFileSync(configPath, configContent, 'utf8');
  console.log('✓ Generated config.js successfully');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠ Warning: SUPABASE_URL or SUPABASE_ANON_KEY environment variables not set');
    console.warn('  The application will use empty values for Supabase configuration');
    console.warn('  Set these variables in your Vercel dashboard for production deployment');
  } else {
    console.log('✓ Supabase configuration loaded from environment variables');
  }
} catch (error) {
  console.error('✗ Error generating config.js:', error.message);
  process.exit(1);
}
