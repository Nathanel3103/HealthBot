// models/Booking.js

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  patientName: String,
  reason: {
    type: String,
    required: false,
    default: "General Consultation",
    maxlength: 500
  },
  phoneNumber: String,
  service: String,
  doctor: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    specialization: String,
  },
  date: String, // formatted as "YYYY-MM-DD"
  time: String, // formatted as "HH:mm"
  source: { type: String, enum: ["Web", "WhatsApp"], required: true, default: "WhatsApp" },  // <-- easy identification in databse

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add unique index to prevent duplicate bookings
bookingSchema.index(
  { date: 1, time: 1, service: 1 },
  { unique: true, name: 'booking_slot_unique' }
);

module.exports = mongoose.model("Booking", bookingSchema);