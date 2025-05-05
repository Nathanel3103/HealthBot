const { getBookedSlots } = require("./bookingService");
const { getDoctorById } = require("./doctorService");

// Utility to normalize time format
function normalizeTime(timeStr) {
  return timeStr.trim().padStart(5, '0');
}

async function getAvailableTimeSlots(doctorId, date) {
  try {
    const [doctor, bookedSlots] = await Promise.all([
      getDoctorById(doctorId),
      getBookedSlots(doctorId, date)
    ]);

    if (!doctor) {
      throw new Error('Doctor not found in database');
    }

    console.log('Doctor available slots:', doctor.availableSlots);
    console.log('Booked slots:', bookedSlots);

    const normalizedAvailable = doctor.availableSlots.map(normalizeTime);
    const normalizedBooked = bookedSlots.map(normalizeTime);

    const availableSlots = normalizedAvailable.filter(
      slot => !bookedSlots.includes(slot)
    );

    console.log('Filtered available slots:', availableSlots);
    return availableSlots;
  } catch (error) {
    console.error('Timeslot error:', error);
    throw new Error('Failed to get available slots');
  }
}

module.exports = {
  getAvailableTimeSlots
};
