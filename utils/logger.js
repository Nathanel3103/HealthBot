// logger.js

/**
 * Logs an informational message.
 * @param {string} message - The message to log.
 */
function info(message) {
  console.log(`INFO: ${message}`);
}

/**
 * Logs a warning message.
 * @param {string} message - The message to log.
 */
function warn(message) {
  console.warn(`WARN: ${message}`);
}

/**
 * Logs an error message.
 * @param {string} message - The message to log.
 * @param {Error} [error] - An optional error object to log.
 */
function error(message, error) {
  console.error(`ERROR: ${message}`);
  if (error) {
    console.error(error.stack);
  }
}

module.exports = { info, warn, error }; 