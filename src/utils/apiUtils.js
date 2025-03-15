import axios from 'axios';

// Stała dla proxy CORS Anywhere - można łatwo włączyć/wyłączyć proxy zmieniając tę wartość
export const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
export const USE_CORS_PROXY = true; // Ustaw na false, aby wyłączyć proxy

/**
 * Dodaje proxy do URL jeśli USE_CORS_PROXY jest true
 * @param {string} url - URL do API
 * @returns {string} URL z lub bez proxy
 */
export const withProxy = (url) => {
  return USE_CORS_PROXY ? `${CORS_PROXY}${url}` : url;
};

/**
 * Tworzy podstawowe nagłówki dla żądań CORS
 * @returns {Object} Obiekt z nagłówkami
 */
export const getCorsHeaders = () => {
  return {
    'Origin': window.location.origin,
    'X-Requested-With': 'XMLHttpRequest'
  };
};

/**
 * Wykonuje żądanie GET z obsługą CORS
 * @param {string} url - URL bez proxy
 * @param {Object} options - Opcje dla axios
 * @returns {Promise} Promise z wynikiem zapytania
 */
export const fetchWithCors = async (url, options = {}) => {
  const headers = {
    ...getCorsHeaders(),
    ...options.headers
  };

  return axios({
    ...options,
    url: withProxy(url),
    headers
  });
};

/**
 * Pomocnik dla żądań POST z obsługą CORS
 * @param {string} url - URL bez proxy
 * @param {Object} data - Dane do wysłania
 * @param {Object} options - Opcje dla axios
 * @returns {Promise} Promise z wynikiem zapytania
 */
export const postWithCors = async (url, data, options = {}) => {
  const headers = {
    ...getCorsHeaders(),
    ...options.headers
  };

  return axios.post(withProxy(url), data, {
    ...options,
    headers
  });
};

export default {
  withProxy,
  getCorsHeaders,
  fetchWithCors,
  postWithCors
}; 