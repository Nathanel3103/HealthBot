const Booking = require("../models/Booking");
const Doctor = require("../models/Doctor");
const mongoose = require('mongoose'); // mongoose is required for transactions
const { isValidPhoneNumber, isValidDate } = require("../utils/validators");

async function createBooking(bookingData, { useTransaction = false } = {}) {
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
//validate reason
  if (bookingData.reason) {
    if (bookingData.reason.length > 500) {
      throw new Error('Reason must be less than 500 characters');
    }
    if (bookingData.reason.length < 5) {
      throw new Error('Reason must be at least 5 characters');
    }
  }

  const session = useTransaction ? await mongoose.startSession() : null;
  if (session) session.startTransaction();

  try {
    // Create and save booking
    const booking = new Booking({
      ...bookingData,
      reason: bookingData.reason || "Not specified" // Default value
    });
    
    const options = session ? { session } : {};
    const savedBooking = await booking.save(options);

    // Atomically pull the booked slot from the doctor's availability
    await Doctor.findByIdAndUpdate(
      bookingData.doctor._id || bookingData.doctor,
      { $pull: { availableSlots: bookingData.time } },
      options
    );
    
    if (session) {
      await session.commitTransaction();
      session.endSession();
    }
    
    return savedBooking;
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    
    if (error.code === 11000) { // Duplicate key error
      throw new Error('This time slot is already booked');
    }
    throw error; // Re-throw other errors
  }
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

// Cancel booking helper – pushes slot back to doctor's availability in the same transaction
async function cancelBooking(bookingId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) throw new Error('Booking not found');

    await Doctor.findByIdAndUpdate(
      booking.doctor,
      { $addToSet: { availableSlots: booking.time } },
      { session }
    );

    await Booking.findByIdAndDelete(bookingId, { session });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

module.exports = {
  createBooking,
  getBookingsByPhone,
  isSlotBooked,
  getBookedSlots,
  cancelBooking
};