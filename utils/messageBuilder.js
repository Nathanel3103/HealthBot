// TODO: implement logic

/**
 * Builds a confirmation message for an appointment.
 * @param {Object} booking - The booking details.
 * @param {string} booking.doctor.name - The doctor's name.
 * @param {string} booking.date - The appointment date.
 * @param {string} booking.time - The appointment time.
 * @returns {string} - The formatted confirmation message.
 */
function buildAppointmentConfirmation(booking) {
  return `Your appointment with Dr. ${booking.doctor.name} is confirmed for ${booking.date} at ${booking.time}.`;
}

module.exports = { buildAppointmentConfirmation };
