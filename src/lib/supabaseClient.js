/**
 * Supabase Client for maiz-educativo
 * Handles rankings storage and retrieval
 */

import { createClient } from '@supabase/supabase-js';

// Read environment variables
const SUPABASE_URL = import.meta.env?.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.SUPABASE_ANON_KEY || '';

// Warn if environment variables are missing
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️ Supabase credentials not configured. ' +
    'Rankings will not be saved to the cloud. ' +
    'Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.'
  );
}

// Create Supabase client (will be null if credentials are missing)
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Save a score to the rankings table
 * @param {Object} params - Score parameters
 * @param {string} params.name - Player name
 * @param {number} params.score - Score achieved
 * @param {Object} params.meta - Additional metadata (mode, total questions, etc.)
 * @returns {Promise<Object>} Result object with success/error
 */
export async function saveScore({ name, score, meta = {} }) {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase not configured'
    };
  }

  try {
    const { data, error } = await supabase
      .from('rankings')
      .insert([
        {
          name: name || 'Anónimo',
          score: score,
          meta: meta
        }
      ])
      .select();

    if (error) {
      console.error('Error saving score to Supabase:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data
    };
  } catch (err) {
    console.error('Error saving score:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Get top scores from the rankings table
 * @param {number} limit - Number of top scores to retrieve (default: 10)
 * @returns {Promise<Array>} Array of top scores
 */
export async function getTopScores(limit = 10) {
  if (!supabase) {
    console.warn('Supabase not configured, returning empty rankings');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching rankings from Supabase:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching rankings:', err);
    return [];
  }
}
