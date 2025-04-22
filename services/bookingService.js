const Booking = require("../models/Booking");
const { isValidPhoneNumber, isValidDate } = require("../utils/validators");

async function createBooking(bookingData) {
  // Validate required fields
  const requiredFields = ['patientName', 'phoneNumber', 'doctor', 'date', 'time'];
  const missingFields = requiredFields.filter(field => !bookingData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate field formats
  if (!isValidPhoneNumber(bookingData.phoneNumber)) {
    throw new Error('Invalid phone number format');
  }

  if (!isValidDate(bookingData.date)) {
    throw new Error('Invalid date format (YYYY-MM-DD required)');
  }

  // Check slot availability
  const isAlreadyBooked = await Booking.exists({
    doctor: bookingData.doctor,
    date: bookingData.date,
    time: bookingData.time
  });

  if (isAlreadyBooked) {
    throw new Error('This time slot is already booked');
  }

  // Create and save booking
  const booking = new Booking(bookingData);
  return await booking.save();
}

async function getBookingsByPhone(phoneNumber) {
  return await Booking.find({ phoneNumber })
    .populate('doctor', 'name specialization')
    .lean();
}

async function isSlotBooked(doctorId, date, time) {
  return await Booking.exists({
    doctor: doctorId,
    date,
    time
  });
}

// Helper for timeslot service
async function getBookedSlots(doctorId, date) {
  const bookings = await Booking.find(
    { doctor: doctorId, date },
    { time: 1, _id: 0 }
  ).lean();
  
  return bookings.map(b => b.time);
}

module.exports = {
  createBooking,
  getBookingsByPhone,
  isSlotBooked,
  getBookedSlots
};