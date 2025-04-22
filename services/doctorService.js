const Doctor = require("../models/Doctor");
const Booking = require("../models/Booking");

async function getAllDoctors() {
  return await Doctor.find().lean();
}

async function getDoctorById(doctorId) {
  return await Doctor.findById(doctorId).lean();
}

async function getDoctorsByDate(date) {
  // Get all bookings for the requested date
  const bookings = await Booking.find({ date }).lean();
  
  // Create map of booked slots per doctor
  const bookedSlotsMap = bookings.reduce((acc, booking) => {
    const doctorId = booking.doctor.toString();
    if (!acc[doctorId]) acc[doctorId] = new Set();
    acc[doctorId].add(booking.time);
    return acc;
  }, {});

  // Get all doctors with their availability
  const doctors = await Doctor.find().lean();
  
  // Calculate available slots for each doctor
  return doctors.map(doctor => {
    const doctorId = doctor._id.toString();
    const bookedSlots = bookedSlotsMap[doctorId] || new Set();
    
    return {
      ...doctor,
      availableSlots: doctor.availableSlots.filter(
        slot => !bookedSlots.has(slot)
      )
    };
  }).filter(doctor => doctor.availableSlots.length > 0); // Only show doctors with availability
}

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorsByDate
};