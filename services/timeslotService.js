const { getBookedSlots } = require("./bookingService");
const { getDoctorById } = require("./doctorService");

async function getAvailableTimeSlots(doctorId, date) {
  try {
    const [doctor, bookedSlots] = await Promise.all([
      getDoctorById(doctorId),
      getBookedSlots(doctorId, date)
    ]);

    if (!doctor) {
      throw new Error('Doctor not found in database');
    }

    // Filter available slots that aren't booked
    return doctor.availableSlots.filter(
      slot => !bookedSlots.includes(slot)
    );
  } catch (error) {
    console.error('Timeslot error:', error);
    throw new Error('Failed to get available slots');
  }
}

module.exports = {
  getAvailableTimeSlots
};