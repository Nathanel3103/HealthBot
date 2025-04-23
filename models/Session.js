const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  step: {
    type: String,
    required: true,
    enum: [
      'greeting',
      'select_service',
      'select_date',
      'select_doctor',
      'select_slot',
      'get_reason',
      'get_name',
      'confirm_booking'
    ],
    default: 'greeting'
  },
  date: String,
  doctorId: mongoose.Schema.Types.ObjectId,
  doctorName: String,
  availableSlots: [String],
  selectedSlot: String,
  reason: String,
  patientName: String,
  service: String,
  availableDoctors: [{
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    slots: [String]
  }]
}, {
  timestamps: true,
  minimize: false // Store empty objects
});

module.exports = mongoose.model("Session", sessionSchema);