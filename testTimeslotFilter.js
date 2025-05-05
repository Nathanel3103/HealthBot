const { normalizeTime } = require('./utils/timeUtils'); // adjust path if needed

const doctorAvailableSlots = [
  "08:00 AM - 08:30 AM",
  "09:00 AM - 09:30 AM",
  "11:00 AM - 11:30 AM",
  "02:00 PM - 02:30 PM"
];

const rawBookedSlots = [
  "2:00 PM - 2:30 PM"
];

const bookedSlots = rawBookedSlots.map(normalizeTime);
const normalizedAvailable = doctorAvailableSlots.map(normalizeTime);

const availableSlots = normalizedAvailable.filter(
  slot => !bookedSlots.includes(slot)
);

console.log("Normalized Available Slots:", normalizedAvailable);
console.log("Normalized Booked Slots:", bookedSlots);
console.log("Filtered Available Slots:", availableSlots);
