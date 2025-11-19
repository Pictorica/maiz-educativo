/**
 * Supabase Client for Maiz Educativo
 * Handles quiz rankings storage
 * 
 * IMPORTANT: Set environment variables before using:
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 * 
 * For local development, these can be set via build tools or loaded from .env
 * For production (Vercel), set them in the deployment environment variables
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 
                    process.env?.SUPABASE_URL || 
                    window.ENV?.SUPABASE_URL || 
                    '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 
                        process.env?.SUPABASE_ANON_KEY || 
                        window.ENV?.SUPABASE_ANON_KEY || 
                        '';

// Warnings for missing configuration
if (!supabaseUrl) {
  console.warn('⚠️ SUPABASE_URL is not defined. Supabase features will not work.');
  console.warn('Please set SUPABASE_URL in your environment variables.');
}

if (!supabaseAnonKey) {
  console.warn('⚠️ SUPABASE_ANON_KEY is not defined. Supabase features will not work.');
  console.warn('Please set SUPABASE_ANON_KEY in your environment variables.');
}

// Create Supabase client (will be null if credentials are missing)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Save a quiz score to the rankings table
 * @param {Object} params - Score parameters
 * @param {string} params.name - Player name
 * @param {number} params.score - Score achieved
 * @param {Object} params.meta - Additional metadata (mode, total, etc.)
 * @returns {Promise<Object>} - Result with data or error
 */
export async function saveScore({ name, score, meta = {} }) {
  if (!supabase) {
    console.error('❌ Cannot save score: Supabase client not initialized');
    return { 
      error: 'Supabase not configured. Please set environment variables.', 
      data: null 
    };
  }

  try {
    const { data, error } = await supabase
      .from('rankings')
      .insert([
        {
          name: name.trim(),
          score: score,
          meta: meta
        }
      ])
      .select();

    if (error) {
      console.error('Error saving score:', error);
      return { error: error.message, data: null };
    }

    console.log('✅ Score saved successfully:', data);
    return { error: null, data };
  } catch (err) {
    console.error('Exception saving score:', err);
    return { error: err.message, data: null };
  }
}

/**
 * Get top scores from the rankings table
 * @param {number} limit - Number of top scores to retrieve (default: 10)
 * @returns {Promise<Object>} - Result with data or error
 */
export async function getTopScores(limit = 10) {
  if (!supabase) {
    console.error('❌ Cannot get scores: Supabase client not initialized');
    return { 
      error: 'Supabase not configured. Please set environment variables.', 
      data: [] 
    };
  }

  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching top scores:', error);
      return { error: error.message, data: [] };
    }

    console.log(`✅ Retrieved ${data?.length || 0} top scores`);
    return { error: null, data: data || [] };
  } catch (err) {
    console.error('Exception fetching top scores:', err);
    return { error: err.message, data: [] };
  }
}

/**
 * Check if Supabase is configured and available
 * @returns {boolean} - True if Supabase is ready to use
 */
export function isSupabaseConfigured() {
  return supabase !== null;
}
