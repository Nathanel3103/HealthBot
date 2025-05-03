const Doctor = require("../models/Doctor");
const { getBookedSlots } = require("./bookingService");

async function getAllDoctors() {
  return await Doctor.find().lean();
}

async function getDoctorById(doctorId) {
  return await Doctor.findById(doctorId).lean();
}

async function getDoctorsByDate(date) {
  const doctors = await Doctor.find().lean();
  
  // Get available slots for each doctor
  const doctorsWithAvailability = await Promise.all(doctors.map(async doctor => {
    const bookedSlots = await getBookedSlots(doctor._id, date);
    const availableSlots = doctor.availableSlots.filter(
      slot => !bookedSlots.includes(slot)
    );
    
    return {
      ...doctor,
      availableSlots
    };
  }));
  
  return doctorsWithAvailability.filter(doctor => doctor.availableSlots.length > 0);
}

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorsByDate
};