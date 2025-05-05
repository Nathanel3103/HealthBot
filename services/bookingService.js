const Booking = require("../models/Booking");
const Doctor = require("../models/Doctor");
const mongoose = require('mongoose');
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

  // Validate reason
  if (bookingData.reason) {
    if (bookingData.reason.length > 500) {
      throw new Error('Reason must be less than 500 characters');
    }
    if (bookingData.reason.length < 5) {
      throw new Error('Reason must be at least 5 characters');
    }
  }

  // Double-booking check
  if (await isSlotBooked(bookingData.doctor._id || bookingData.doctor, bookingData.date, bookingData.time)) {
    throw new Error('This time slot is already booked');
  }

  const session = useTransaction ? await mongoose.startSession() : null;
  if (session) session.startTransaction();

  try {
    const booking = new Booking({
      ...bookingData,
      reason: bookingData.reason || "Not specified",
      source: "WhatsApp"  // Added source tracking
    });
    
    const options = session ? { session } : {};
    const savedBooking = await booking.save(options);

    // NEW: Update doctor's appointments
    await Doctor.findByIdAndUpdate(
      bookingData.doctor._id,
      { 
        $addToSet: { 
          appointmentsBooked: { 
            bookingId: savedBooking._id,
            date: bookingData.date,
            time: bookingData.time,
            source: "WhatsApp"
          }
        }
      },
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
    
    if (error.code === 11000) {
      throw new Error('This time slot is already booked');
    }
    throw error;
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

async function getBookedSlots(doctorId, date) {
  const bookings = await Booking.find(
    { doctor: doctorId, date },
    { time: 1, _id: 0 }
  ).lean();
  
  return bookings.map(b => b.time);
}

async function cancelBooking(bookingId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) throw new Error('Booking not found');

    // Remove from both collections
    await Booking.findByIdAndDelete(bookingId, { session });
    await Doctor.findByIdAndUpdate(
      booking.doctor._id,
      { $pull: { appointmentsBooked: { bookingId: booking._id } } },
      { session }
    );

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