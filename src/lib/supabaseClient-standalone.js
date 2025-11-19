/**
 * Supabase Client for Maiz Educativo (Plain JavaScript Version)
 * This version works without a build tool by loading Supabase from CDN
 * 
 * IMPORTANT: Do not commit SUPABASE_URL or SUPABASE_ANON_KEY to the repository
 * Set these as environment variables in your deployment platform (Vercel, Netlify, etc.)
 * 
 * For static deployment, you can set these in a separate config file that's not committed
 * or inject them at build/deployment time.
 */

(function(window) {
  'use strict';

  // Configuration - these should be set via environment variables or build-time injection
  // DO NOT hardcode actual values here!
  const SUPABASE_CONFIG = {
    url: window.ENV?.SUPABASE_URL || null,
    key: window.ENV?.SUPABASE_ANON_KEY || null
  };

  // Warn if environment variables are not set
  if (!SUPABASE_CONFIG.url) {
    console.warn('⚠️ SUPABASE_URL is not defined. Supabase features will not work.');
    console.warn('Set window.ENV.SUPABASE_URL or configure environment variables.');
  }

  if (!SUPABASE_CONFIG.key) {
    console.warn('⚠️ SUPABASE_ANON_KEY is not defined. Supabase features will not work.');
    console.warn('Set window.ENV.SUPABASE_ANON_KEY or configure environment variables.');
  }

  // Supabase client will be initialized when the library loads
  let supabaseClient = null;

  /**
   * Initialize Supabase client
   * This will be called automatically when the Supabase JS library is loaded
   */
  function initSupabase() {
    if (!window.supabase?.createClient) {
      console.error('Supabase library not loaded. Include the CDN script first.');
      return false;
    }

    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) {
      console.error('Supabase configuration missing.');
      return false;
    }

    try {
      supabaseClient = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.key
      );
      console.log('✅ Supabase client initialized');
      return true;
    } catch (error) {
      console.error('Error initializing Supabase:', error);
      return false;
    }
  }

  /**
   * Save a quiz score to the rankings table
   * @param {Object} scoreData - Score data to save
   * @param {string} scoreData.name - Player name
   * @param {number} scoreData.score - Number of correct answers
   * @param {Object} scoreData.meta - Additional metadata (total questions, mode, etc.)
   * @returns {Promise<{success: boolean, error?: string, data?: any}>}
   */
  async function saveScore({ name, score, meta }) {
    // Try to initialize if not already done
    if (!supabaseClient && window.supabase?.createClient) {
      initSupabase();
    }

    if (!supabaseClient) {
      console.error('Supabase client not initialized.');
      return { 
        success: false, 
        error: 'No se pudo conectar con la base de datos. Las puntuaciones se guardarán solo localmente.' 
      };
    }

    try {
      const { data, error } = await supabaseClient
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
          error: 'No se pudo guardar la puntuación en línea. Se guardó localmente.' 
        };
      }

      console.log('✅ Score saved to Supabase:', data);
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
  async function getTopScores(limit = 10) {
    // Try to initialize if not already done
    if (!supabaseClient && window.supabase?.createClient) {
      initSupabase();
    }

    if (!supabaseClient) {
      console.warn('Supabase client not initialized. Returning empty results.');
      return { 
        success: false, 
        error: 'No se pudo conectar con la base de datos.',
        data: []
      };
    }

    try {
      const { data, error } = await supabaseClient
        .from('rankings')
        .select('*')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching top scores from Supabase:', error);
        return { 
          success: false, 
          error: 'No se pudieron cargar las puntuaciones en línea.',
          data: []
        };
      }

      console.log(`✅ Fetched ${data?.length || 0} top scores from Supabase`);
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

  // Export functions to window object for use in other scripts
  window.MaizSupabase = {
    initSupabase,
    saveScore,
    getTopScores,
    isConfigured: () => !!(SUPABASE_CONFIG.url && SUPABASE_CONFIG.key)
  };

  // Auto-initialize when Supabase library is loaded
  if (window.supabase?.createClient) {
    initSupabase();
  } else {
    // Wait for Supabase library to load
    window.addEventListener('load', () => {
      if (window.supabase?.createClient) {
        initSupabase();
      }
    });
  }

})(window);
