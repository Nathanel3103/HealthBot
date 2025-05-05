const Doctor = require("../models/Doctor");
const { getBookedSlots } = require("./bookingService");


async function getAllDoctors() {
  return await Doctor.find().lean();
}


async function getDoctorById(doctorId) {
  return await Doctor.findById(doctorId).lean();
}

// Get available doctors on a specific date
async function getDoctorsByDate(date) {
  const doctors = await Doctor.find().lean();

  const targetDate = new Date(date);

  
  const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

  const doctorsWithAvailability = await Promise.all(
    doctors.map(async (doctor) => {
      
      const worksOnThisDay = doctor.workingHours.some(
        (wh) => wh.day === dayOfWeek
      );

      if (!worksOnThisDay) {
        return { ...doctor, availableSlots: [] };
      }

      
      const bookedSlots = await getBookedSlots(doctor._id, date);

      // Filter out booked slots from available ones
      const availableSlots = doctor.availableSlots.filter(
        (slot) => !bookedSlots.includes(slot)
      );

      return {
        ...doctor,
        availableSlots,
      };
    })
  );

  // Only return doctors with at least one available slot
  return doctorsWithAvailability.filter(
    (doctor) => doctor.availableSlots.length > 0
  );
}

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorsByDate,
};
