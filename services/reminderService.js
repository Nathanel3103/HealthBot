// reminderService.js

const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Sends a reminder message to a patient.
 * @param {string} phoneNumber - The patient's phone number.
 * @param {string} message - The reminder message to send.
 * @returns {Promise<void>} - A promise that resolves when the message is sent.
 */
async function sendReminder(phoneNumber, message) {
  try {
    await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
      to: `whatsapp:${phoneNumber}`
    });
    console.log(`Reminder sent to ${phoneNumber}`);
  } catch (error) {
    console.error(`Failed to send reminder to ${phoneNumber}:`, error);
  }
}

module.exports = {
  sendReminder
}; 