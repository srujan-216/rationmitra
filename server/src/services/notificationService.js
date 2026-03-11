const Notification = require('../models/Notification');

/**
 * Create and "send" a notification.
 * In production: integrate Twilio (SMS), SendGrid (email), FCM (push).
 * Currently: logs to DB and marks as sent.
 */
const sendNotification = async ({ userId, type, channel = 'push', message }) => {
  const notification = await Notification.create({
    userId,
    notificationType: type,
    channel,
    message,
    status: 'sent',
    sentAt: new Date(),
  });
  return notification;
};

const notifySlotBooked = async (userId, ticketNumber, slotTime) => {
  return sendNotification({
    userId,
    type: 'slot_booked',
    channel: 'sms',
    message: `Your slot is confirmed! Ticket: ${ticketNumber}, Time: ${slotTime}. - RationMitra`,
  });
};

const notifyTurnApproaching = async (userId, ticketNumber) => {
  return sendNotification({
    userId,
    type: 'turn_approaching',
    channel: 'push',
    message: `Your turn is approaching! Ticket: ${ticketNumber}. Please be ready at the counter.`,
  });
};

const notifyServiceComplete = async (userId) => {
  return sendNotification({
    userId,
    type: 'service_complete',
    channel: 'push',
    message: 'Your ration has been collected successfully. Thank you! Please share your feedback.',
  });
};

const notifyLowStock = async (userId, itemName, daysLeft) => {
  return sendNotification({
    userId,
    type: 'low_stock_alert',
    channel: 'push',
    message: `Low stock alert: ${itemName} has approximately ${daysLeft} days of supply remaining. Please reorder.`,
  });
};

const notifyFraudAlert = async (userId, alertType) => {
  return sendNotification({
    userId,
    type: 'fraud_alert',
    channel: 'push',
    message: `Security alert: ${alertType}. Please review in the admin dashboard.`,
  });
};

module.exports = {
  sendNotification,
  notifySlotBooked,
  notifyTurnApproaching,
  notifyServiceComplete,
  notifyLowStock,
  notifyFraudAlert,
};
