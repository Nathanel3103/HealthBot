const { getBookedSlots } = require("./bookingService");
const { getDoctorById } = require("./doctorService");
const { normalizeTime } = require("../utils/timeUtils"); 

async function getAvailableTimeSlots(doctorId, date) {
  try {
    const [doctor, rawBookedSlots] = await Promise.all([
      getDoctorById(doctorId),
      getBookedSlots(doctorId, date)
    ]);

    if (!doctor) {
      throw new Error('Doctor not found in database');
    }

    const normalizedAvailable = doctor.availableSlots.map(normalizeTime);
    const normalizedBooked = rawBookedSlots.map(normalizeTime);

    const availableSlots = normalizedAvailable.filter(
      slot => !normalizedBooked.includes(slot)
    );

    console.log('Doctor available slots:', doctor.availableSlots);
    console.log('Booked slots:', rawBookedSlots);
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
