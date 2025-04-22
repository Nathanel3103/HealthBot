// validators.js

/**
 * Validates if a given string is a valid phone number format.
 * @param {string} phoneNumber - The phone number to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function isValidPhoneNumber(phoneNumber) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
  return phoneRegex.test(phoneNumber);
}

/**
 * Validates if a given date string is in the format YYYY-MM-DD.
 * @param {string} date - The date string to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function isValidDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

module.exports = { isValidPhoneNumber, isValidDate }; 