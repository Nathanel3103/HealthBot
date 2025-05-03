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
  source: { type: String, enum: ["Web", "WhatsApp"], required: true, default: "WhatsApp" },  

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Improved unique index for better double-booking prevention
bookingSchema.index(
  { 'doctor._id': 1, date: 1, time: 1 },
  { unique: true, name: 'booking_doctor_slot_unique' }
);

module.exports = mongoose.model("Booking", bookingSchema);