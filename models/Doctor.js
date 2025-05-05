// models/Doctor.js
const mongoose = require("mongoose");

const workingHourSchema = new mongoose.Schema({
  day: String, 
  startTime: String, 
  endTime: String,   
});

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true, enum: ['Cardiology', 'Dermatology', 'Neurology', 'Pediatrics'] },
  availableSlots: { type: [String], required: true },
  workingHours: [workingHourSchema],
  appointmentsBooked: [{
    bookingId: mongoose.Schema.Types.ObjectId,
    date: String, 
    time: String, 
    source: { type: String, enum: ["Web", "WhatsApp"], required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);