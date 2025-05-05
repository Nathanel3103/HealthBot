const Booking = require("../models/Booking");
const Doctor = require("../models/Doctor");
const mongoose = require('mongoose');
const { isValidPhoneNumber, isValidDate } = require("../utils/validators");

// Utility to normalize time format
function normalizeTime(timeStr) {
  return timeStr.trim().padStart(5, '0');
}

async function createBooking(bookingData, { useTransaction = false } = {}) {
  const requiredFields = ['patientName', 'phoneNumber', 'doctor', 'date', 'time'];
  const missingFields = requiredFields.filter(field => !bookingData[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (!isValidPhoneNumber(bookingData.phoneNumber)) {
    throw new Error('Invalid phone number format');
  }

  if (!isValidDate(bookingData.date)) {
    throw new Error('Invalid date format (YYYY-MM-DD required)');
  }

  if (bookingData.reason) {
    if (bookingData.reason.length > 500) {
      throw new Error('Reason must be less than 500 characters');
    }
    if (bookingData.reason.length < 5) {
      throw new Error('Reason must be at least 5 characters');
    }
  }

  // Normalize time before checking
  const normalizedTime = normalizeTime(bookingData.time);

  if (await isSlotBooked(bookingData.doctor._id || bookingData.doctor, bookingData.date, normalizedTime)) {
    throw new Error('This time slot is already booked');
  }

  const session = useTransaction ? await mongoose.startSession() : null;
  if (session) session.startTransaction();

  try {
    const booking = new Booking({
      ...bookingData,
      time: normalizedTime,
      reason: bookingData.reason || "Not specified",
      source: "WhatsApp"
    });

    const options = session ? { session } : {};
    const savedBooking = await booking.save(options);

    await Doctor.findByIdAndUpdate(
      bookingData.doctor._id || bookingData.doctor,
      {
        $addToSet: {
          appointmentsBooked: {
            bookingId: savedBooking._id,
            date: bookingData.date,
            time: normalizedTime,
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
    time: normalizeTime(time)
  });
}

async function getBookedSlots(doctorId, date) {
  try {
    const bookings = await Booking.find({ doctor: doctorId, date }, { time: 1, _id: 0 }).lean();
    return bookings.map(b => normalizeTime(b.time));
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    throw new Error('Failed to retrieve booked slots');
  }
}

async function cancelBooking(bookingId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) throw new Error('Booking not found');

    await Booking.findByIdAndDelete(bookingId, { session });
    await Doctor.findByIdAndUpdate(
      booking.doctor,
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
