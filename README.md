# WhatsApp Doctor Booking Chatbot

A WhatsApp chatbot for doctor appointment booking and healthcare services, mirroring the functionality of our web application.

## Features
- Doctor appointment scheduling
- Session management
- Doctor profile management
- Booking services

## Prerequisites

- Node.js (v14 or higher)
- WhatsApp Business API account
- Twilio account (for WhatsApp API integration)
- MongoDB (for data storage)

## Installation

1. Clone the repository:
   ```bash
   git clone https:
   ```

2. Navigate to the project directory:
   ```bash
   cd HealthBot/whatsapp-chatbot
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add your configuration:
   ```
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_whatsapp_number
   MONGODB_URI=your_mongodb_connection_string
   ```

5. Start the server:
   ```bash
   npm start
   ```

## Usage

Once the bot is set up and running, users can interact with it by sending messages to the configured WhatsApp number. The bot will respond based on the implemented conversation flows and commands.

## Project Structure
```
whatsapp-chatbot/
├── controllers/    # whatsappController.js
├── models/         # Doctor.js, Session.js
├── services/       # doctorService.js, bookingService.js
└── app.js          # Application entry point
```

## Key Components
- `whatsappController.js`: Handles incoming WhatsApp messages
- `doctorService.js`: Manages doctor-related operations
- `bookingService.js`: Handles appointment scheduling
- `Doctor.js`: Doctor data model
- `Session.js`: Session management model

- `app.js`: Application entry point and server setup