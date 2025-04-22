// models/Doctor.js

const mongoose = require("mongoose");

const workingHourSchema = new mongoose.Schema({
  day: String, // e.g., "Monday"
  startTime: String, // e.g., "09:00"
  endTime: String,   // e.g., "17:00"
});

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true, enum: ['Cardiology', 'Dermatology', 'Neurology', 'Pediatrics'] }, // Example specializations
  availableSlots: { type: [String], required: true },
  workingHours: [workingHourSchema],
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);
