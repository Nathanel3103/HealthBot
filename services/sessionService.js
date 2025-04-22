const Session = require("../models/Session");

async function getSessionByPhone(phoneNumber) {
  try {
    return await Session.findOne({ phoneNumber }).lean();
  } catch (error) {
    console.error('Session fetch error:', error);
    throw new Error('Failed to retrieve session');
  }
}

async function upsertSession(phoneNumber, updates) {
  try {
    return await Session.findOneAndUpdate(
      { phoneNumber },
      { $set: updates },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    ).lean();
  } catch (error) {
    console.error('Session update error:', error);
    throw new Error('Failed to update session');
  }
}

async function clearSession(phoneNumber) {
  try {
    return await Session.deleteOne({ phoneNumber });
  } catch (error) {
    console.error('Session deletion error:', error);
    throw new Error('Failed to clear session');
  }
}

module.exports = {
  getSessionByPhone,
  upsertSession,
  clearSession
};