/**
 * Supabase Client for Maiz Educativo
 * Handles ranking storage and retrieval
 * 
 * IMPORTANT: Do not commit SUPABASE_URL or SUPABASE_ANON_KEY to the repository
 * Set these as environment variables in your deployment platform (Vercel, Netlify, etc.)
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables - set these in your deployment platform
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 
                     process.env?.SUPABASE_URL || 
                     window?.ENV?.SUPABASE_URL;

const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 
                          process.env?.SUPABASE_ANON_KEY || 
                          window?.ENV?.SUPABASE_ANON_KEY;

// Warn if environment variables are not set
if (!SUPABASE_URL) {
  console.warn('⚠️ SUPABASE_URL is not defined. Supabase features will not work.');
  console.warn('Set SUPABASE_URL in your environment variables.');
}

if (!SUPABASE_ANON_KEY) {
  console.warn('⚠️ SUPABASE_ANON_KEY is not defined. Supabase features will not work.');
  console.warn('Set SUPABASE_ANON_KEY in your environment variables.');
}

// Create Supabase client (will be null if env vars not set)
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Save a quiz score to the rankings table
 * @param {Object} scoreData - Score data to save
 * @param {string} scoreData.name - Player name
 * @param {number} scoreData.score - Number of correct answers
 * @param {Object} scoreData.meta - Additional metadata (total questions, mode, etc.)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function saveScore({ name, score, meta }) {
  if (!supabase) {
    console.error('Supabase client not initialized. Check environment variables.');
    return { 
      success: false, 
      error: 'Database connection not configured. Please contact the site administrator.' 
    };
  }

  try {
    const { data, error } = await supabase
      .from('rankings')
      .insert([
        {
          name: name || 'Anónimo',
          score: score,
          meta: meta || {}
        }
      ])
      .select();

    if (error) {
      console.error('Error saving score to Supabase:', error);
      return { 
        success: false, 
        error: 'No se pudo guardar la puntuación. Por favor, inténtalo de nuevo.' 
      };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error saving score:', err);
    return { 
      success: false, 
      error: 'Error inesperado al guardar la puntuación.' 
    };
  }
}

/**
 * Get top scores from the rankings table
 * @param {number} limit - Number of top scores to retrieve (default: 10)
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export async function getTopScores(limit = 10) {
  if (!supabase) {
    console.error('Supabase client not initialized. Check environment variables.');
    return { 
      success: false, 
      error: 'Database connection not configured.',
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
      console.error('Error fetching top scores from Supabase:', error);
      return { 
        success: false, 
        error: 'No se pudieron cargar las puntuaciones.',
        data: []
      };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Unexpected error fetching scores:', err);
    return { 
      success: false, 
      error: 'Error inesperado al cargar las puntuaciones.',
      data: []
    };
  }
}
