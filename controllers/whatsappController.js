// controllers/whatsappController.js
const twilio = require("twilio");
const MessagingResponse = twilio.twiml.MessagingResponse;

const { createBooking } = require("../services/bookingService");
const { getSessionByPhone, upsertSession, clearSession } = require("../services/sessionService");
const { getDoctorsByDate } = require("../services/doctorService");
const { getAvailableTimeSlots } = require("../services/timeslotService");

exports.handleIncoming = async (req, res) => {
  const twiml = new MessagingResponse();
  const rawMsg = req.body.Body.trim();
  const phone = req.body.From.replace("whatsapp:", "");
  const msg = rawMsg.toLowerCase();

  try {
    // Retrieve or initialize session
    let session = await getSessionByPhone(phone) || {
      phoneNumber: phone,
      step: "greeting"
    };

    // Handle session initialization
    if (["hi", "hello", "hey", "start"].includes(msg)) {
      await upsertSession(phone, { step: "select_service" });
      twiml.message(`🏥 Welcome to Health Care Booking Clinic! Please choose:\n1. Book Appointment\n2. Help`);
      return res.type('text/xml').send(twiml.toString());
    }

    // Main conversation flow
    switch (session.step) {
      case "select_service":
        if (msg === '1') {
          await upsertSession(phone, { 
            step: "select_date",
            service: "General Consultation"
          });
          twiml.message("📅 Please enter your preferred date (YYYY-MM-DD):");
        } else {
          twiml.message("❌ Invalid option. Please type 1 to book appointment.");
        }
        break;

      case "select_date":
        if (/^\d{4}-\d{2}-\d{2}$/.test(rawMsg)) {
          const doctors = await getDoctorsByDate(rawMsg);
          
          if (doctors.length === 0) {
            twiml.message("⚠️ No doctors available on this date. Please try another (YYYY-MM-DD):");
            break;
          }

          await upsertSession(phone, {
            step: "select_doctor",
            date: rawMsg,
            availableDoctors: doctors.map(d => ({
              id: d._id.toString(),
              name: d.name,
              slots: d.availableSlots
            }))
          });

          const doctorList = doctors.map((d, i) => 
            `${i + 1}. ${d.name} (Available Slots: ${d.availableSlots.join(', ')})`
          ).join('\n');
          
          twiml.message(`👨⚕️ Available Doctors:\n${doctorList}\nReply with doctor number:`);
        } else {
          twiml.message("❌ Invalid date format. Please use YYYY-MM-DD:");
        }
        break;

      case "select_doctor":
        const doctorIndex = parseInt(rawMsg) - 1;
        if (!session.availableDoctors || isNaN(doctorIndex) || doctorIndex < 0 || doctorIndex >= session.availableDoctors.length) {
          twiml.message("❌ Invalid selection. Please choose from the list:");
          break;
        }
        
        const selectedDoctor = session.availableDoctors[doctorIndex];
        const availableSlots = await getAvailableTimeSlots(selectedDoctor.id, session.date);
        
        if (availableSlots.length === 0) {
          twiml.message(`⚠️ No slots available for ${selectedDoctor.name}. Please choose another doctor:`);
          break;
        }

        await upsertSession(phone, {
          step: "select_slot",
          doctorId: selectedDoctor.id,
          doctorName: selectedDoctor.name,
          doctorSpecialization: selectedDoctor.specialization, // Store specialization
          availableSlots: availableSlots
        });
        
        twiml.message(`⏰ Available Slots for ${selectedDoctor.name}:\n${
          availableSlots.map((s, i) => `${i + 1}. Slot ${s}`).join('\n')
        }\nReply with slot number:`);
        break;

      case "select_slot":
        const slotIndex = parseInt(rawMsg) - 1;
        if (!session.availableSlots || isNaN(slotIndex) || slotIndex < 0 || slotIndex >= session.availableSlots.length) {
          twiml.message("❌ Invalid slot selection. Please choose from the list:");
          break;
        }

        

        
        await upsertSession(phone, {
          
          step: "get_reason",
          selectedSlot: session.availableSlots[slotIndex]
        });
        
        twiml.message("📝 Please enter the reason for your appointment:");
        break;

      case "get_reason":
        // Validate reason length (at least 5 characters)
        if (rawMsg.length < 5) {
          twiml.message("❌ The reason must be at least 5 characters long. Please provide a more detailed reason for your appointment:");
          break; // Keep the user in the same step
        }

        await upsertSession(phone, {
          step: "get_name",
          reason: rawMsg
        });
        twiml.message("👤 Please enter your full name for the booking:");
        break;

      case "get_name":
        await upsertSession(phone, {
          step: "confirm_booking",
          patientName: rawMsg
        });
        
        twiml.message(`📝 Please confirm your booking:\n
          Doctor: ${session.doctorName}
          Date: ${session.date}
          Slot: ${session.selectedSlot}
          Name: ${rawMsg}
          Reason: ${session.reason}
          
          Reply:\n1. Confirm\n2. Cancel`);
        break;

      case "confirm_booking":
        if (msg === '1') {
          await createBooking({
            phoneNumber: phone,
            patientName: session.patientName,
            reason: session.reason,
            doctor: {
              _id: session.doctorId,
              name: session.doctorName,
              specialization: session.doctorSpecialization
            },
            date: session.date,
            time: session.selectedSlot
          }, { useTransaction: true }); // Enable transaction for critical operations
          
          await clearSession(phone);
          twiml.message(`✅ Booking confirmed!\n
            📍 Clinic Address: 123 Ganges Street Belvedere
            📅 Date: ${session.date}
            ⏰ Slot: ${session.selectedSlot}
            👨⚕️ Doctor: ${session.doctorName}
            📝 Reason: ${session.reason || 'General Consultation'}
            
            You'll receive a reminder 1 hour before your appointment.`);
        } else {
          await clearSession(phone);
          twiml.message("❌ Booking canceled. Type START to begin again.");
        }
        break;

      default:
        twiml.message("❌ Invalid input. Type START to begin booking.");
        break;
    }

    
    // The session is already updated in each case above
    res.type('text/xml').send(twiml.toString());

  } catch (error) {
    console.error('Controller Error:', error);
    const errorTwiml = new MessagingResponse();
    errorTwiml.message("⚠️ We're experiencing technical difficulties. Please try again later.");
    res.type('text/xml').send(errorTwiml.toString());
  }
};