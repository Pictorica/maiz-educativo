/**
 * Supabase Client for maiz-educativo (Browser-compatible version)
 * Uses Supabase SDK from CDN
 * Include this AFTER loading Supabase SDK:
 * <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 */

const SupabaseRankings = (function() {
  'use strict';

  // Supabase client instance
  let supabase = null;
  let isConfigured = false;

  /**
   * Initialize Supabase client with credentials
   * Call this with your environment variables
   * @param {string} url - Supabase project URL
   * @param {string} anonKey - Supabase anonymous key
   */
  function init(url, anonKey) {
    if (!url || !anonKey) {
      console.warn(
        '⚠️ Supabase credentials not configured. ' +
        'Rankings will not be saved to the cloud. ' +
        'Please provide SUPABASE_URL and SUPABASE_ANON_KEY.'
      );
      return false;
    }

    if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient === 'undefined') {
      console.error(
        '❌ Supabase SDK not loaded. ' +
        'Please include: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>'
      );
      return false;
    }

    try {
      supabase = window.supabase.createClient(url, anonKey);
      isConfigured = true;
      console.log('✅ Supabase client initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing Supabase:', error);
      return false;
    }
  }

  /**
   * Save a score to the rankings table
   * @param {Object} params - Score parameters
   * @param {string} params.name - Player name
   * @param {number} params.score - Score achieved
   * @param {Object} params.meta - Additional metadata (mode, total questions, etc.)
   * @returns {Promise<Object>} Result object with success/error
   */
  async function saveScore({ name, score, meta = {} }) {
    if (!isConfigured || !supabase) {
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

      console.log('✅ Score saved to Supabase:', data);
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
  async function getTopScores(limit = 10) {
    if (!isConfigured || !supabase) {
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

      console.log(`✅ Fetched ${data?.length || 0} rankings from Supabase`);
      return data || [];
    } catch (err) {
      console.error('Error fetching rankings:', err);
      return [];
    }
  }

  /**
   * Check if Supabase is configured and ready
   * @returns {boolean}
   */
  function isReady() {
    return isConfigured && supabase !== null;
  }

  // Public API
  return {
    init,
    saveScore,
    getTopScores,
    isReady
  };
})();

// Expose as window.SupabaseRankings for easier access
if (typeof window !== 'undefined') {
  window.SupabaseRankings = SupabaseRankings;
}
