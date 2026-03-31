/**
 * Seed script — populates the database with demo data.
 * Run: node src/scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { mongoUri, bcryptSaltRounds } = require('../config/env');

const User = require('../models/User');
const Shop = require('../models/Shop');
const Queue = require('../models/Queue');
const Inventory = require('../models/Inventory');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');

const seed = async () => {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Shop.deleteMany({}),
    Queue.deleteMany({}),
    Inventory.deleteMany({}),
    Feedback.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  const plainPassword = 'password123';

  // --- Users ---
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@rationmitra.in',
    phone: '9000000001',
    password: plainPassword,
    role: 'admin',
    isActive: true,
    aadharVerified: true,
  });

  const sysadmin = await User.create({
    name: 'System Admin',
    email: 'sysadmin@rationmitra.in',
    phone: '9000000002',
    password: plainPassword,
    role: 'sysadmin',
    isActive: true,
    aadharVerified: true,
  });

  const shopOwner1 = await User.create({
    name: 'Ramesh Kumar',
    email: 'ramesh@rationmitra.in',
    phone: '9000000003',
    password: plainPassword,
    role: 'shopowner',
    isActive: true,
    aadharVerified: true,
  });

  const shopOwner2 = await User.create({
    name: 'Suresh Patel',
    email: 'suresh@rationmitra.in',
    phone: '9000000004',
    password: plainPassword,
    role: 'shopowner',
    isActive: true,
    aadharVerified: true,
  });

  const cardholders = [];
  const cardholderNames = [
    'Priya Sharma', 'Amit Singh', 'Lakshmi Devi', 'Ravi Teja',
    'Anita Kumari', 'Sunil Reddy', 'Meena Bai', 'Vikram Rao',
    'Kavitha Nair', 'Deepak Verma',
  ];

  for (let i = 0; i < cardholderNames.length; i++) {
    const ch = await User.create({
      name: cardholderNames[i],
      email: `user${i + 1}@rationmitra.in`,
      phone: `98765${String(i).padStart(5, '0')}`,
      password: plainPassword,
      role: 'cardholder',
      rationCardNumber: `TS-${String(1000 + i)}`,
      isActive: true,
      aadharVerified: i < 7,
    });
    cardholders.push(ch);
  }

  console.log(`Created ${2 + 2 + cardholders.length} users`);

  // --- Shops ---
  const shop1 = await Shop.create({
    name: 'FPS Kukatpally - Ward 12',
    code: 'FPS-HYD-012',
    address: { street: 'KPHB Colony', city: 'Hyderabad', state: 'Telangana', pincode: '500072', coordinates: { lat: 17.4947, lng: 78.3996 } },
    owner: shopOwner1._id,
    operatingHours: { open: '08:00', close: '18:00' },
    slotsPerDay: 5,
    slotDurationMinutes: 120,
    maxCapacityPerSlot: 30,
    counters: 2,
    rating: 4.2,
    totalRatings: 15,
  });

  const shop2 = await Shop.create({
    name: 'FPS Ameerpet - Ward 7',
    code: 'FPS-HYD-007',
    address: { street: 'SR Nagar', city: 'Hyderabad', state: 'Telangana', pincode: '500038', coordinates: { lat: 17.4375, lng: 78.4483 } },
    owner: shopOwner2._id,
    operatingHours: { open: '09:00', close: '19:00' },
    slotsPerDay: 5,
    slotDurationMinutes: 120,
    maxCapacityPerSlot: 40,
    counters: 3,
    rating: 3.8,
    totalRatings: 10,
  });

  const shop3 = await Shop.create({
    name: 'FPS Secunderabad - Ward 3',
    code: 'FPS-HYD-003',
    address: { street: 'Trimulgherry', city: 'Secunderabad', state: 'Telangana', pincode: '500015', coordinates: { lat: 17.4660, lng: 78.5268 } },
    owner: shopOwner1._id,
    operatingHours: { open: '08:00', close: '17:00' },
    slotsPerDay: 4,
    slotDurationMinutes: 120,
    maxCapacityPerSlot: 25,
    counters: 2,
    rating: 4.5,
    totalRatings: 8,
  });

  // Assign shops to owners
  shopOwner1.shopAssignedTo = shop1._id;
  shopOwner2.shopAssignedTo = shop2._id;
  await shopOwner1.save();
  await shopOwner2.save();

  // Assign a shop to some cardholders
  for (const ch of cardholders) {
    ch.shopAssignedTo = [shop1._id, shop2._id, shop3._id][Math.floor(Math.random() * 3)];
    await ch.save();
  }

  console.log('Created 3 shops');

  // --- Inventory ---
  const items = [
    { name: 'Rice', stock: 450, unit: 'kg', reorder: 100 },
    { name: 'Wheat', stock: 300, unit: 'kg', reorder: 80 },
    { name: 'Sugar', stock: 80, unit: 'kg', reorder: 50 },
    { name: 'Kerosene Oil', stock: 200, unit: 'liter', reorder: 50 },
    { name: 'Toor Dal', stock: 60, unit: 'kg', reorder: 30 },
  ];

  for (const shop of [shop1, shop2, shop3]) {
    for (const item of items) {
      const stockVariation = Math.floor(Math.random() * 100) - 50;
      const currentStock = Math.max(10, item.stock + stockVariation);
      const history = [];

      // Generate 30 days of stock history
      for (let d = 30; d >= 1; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        // Some inward
        if (d % 7 === 0) {
          history.push({ timestamp: date, quantity: Math.floor(Math.random() * 100) + 50, transactionType: 'inward', remarks: 'Weekly supply' });
        }
        // Daily outward
        history.push({ timestamp: date, quantity: Math.floor(Math.random() * 20) + 5, transactionType: 'outward', remarks: 'Daily distribution' });
      }

      await Inventory.create({
        shopId: shop._id,
        itemName: item.name,
        currentStock,
        unit: item.unit,
        reorderLevel: item.reorder,
        reorderQuantity: item.reorder * 5,
        stockHistory: history,
        isLowStock: currentStock <= item.reorder,
        lastStockUpdate: new Date(),
      });
    }
  }

  console.log('Created inventory for all shops (5 items each)');

  // --- Queues (today) ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const shop of [shop1, shop2]) {
    const slots = [
      { slotId: 'SLOT-1', startTime: '08:00', endTime: '10:00' },
      { slotId: 'SLOT-2', startTime: '10:00', endTime: '12:00' },
      { slotId: 'SLOT-3', startTime: '12:00', endTime: '14:00' },
    ];

    for (const slotConfig of slots) {
      const entries = [];
      const numEntries = Math.floor(Math.random() * 6) + 2;
      for (let i = 0; i < Math.min(numEntries, cardholders.length); i++) {
        const statuses = ['completed', 'completed', 'waiting', 'waiting', 'in_service'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        entries.push({
          userId: cardholders[i]._id,
          userName: cardholders[i].name,
          ticketNumber: `T${Date.now().toString(36).toUpperCase()}${i}`,
          status,
          joinedAt: new Date(today.getTime() + i * 600000),
          servedAt: status !== 'waiting' ? new Date(today.getTime() + (i + 1) * 600000) : undefined,
          completedAt: status === 'completed' ? new Date(today.getTime() + (i + 2) * 600000) : undefined,
          serviceTime: status === 'completed' ? Math.floor(Math.random() * 10) + 3 : undefined,
        });
      }

      await Queue.create({
        shopId: shop._id,
        date: today,
        slot: { ...slotConfig, capacity: shop.maxCapacityPerSlot, currentCount: entries.length },
        queueEntries: entries,
      });
    }
  }

  console.log('Created queue entries for today');

  // --- Feedback ---
  const feedbackTexts = [
    { text: 'Very good service, staff was helpful and polite', rating: 5 },
    { text: 'Long queue time but product quality was good', rating: 3 },
    { text: 'Terrible experience, shop was dirty and staff rude', rating: 1 },
    { text: 'Fast service, no waiting. Excellent!', rating: 5 },
    { text: 'Rice quality was bad, seemed stale', rating: 2 },
    { text: 'Accha tha, sab sahi mila. Dhanyawad', rating: 4 },
    { text: 'Bahut der lagi queue mein, pareshani hui', rating: 2 },
    { text: 'Clean shop, good hygiene, friendly staff', rating: 5 },
    { text: 'Sugar was unavailable, stock shortage again', rating: 2 },
    { text: 'Smooth process, quick service. Happy with RationMitra', rating: 4 },
  ];

  for (let i = 0; i < feedbackTexts.length; i++) {
    const fb = feedbackTexts[i];
    const shop = [shop1, shop2, shop3][i % 3];

    // Simple sentiment
    let sentiment = 'neutral';
    let score = 0;
    if (fb.rating >= 4) { sentiment = 'positive'; score = 0.8; }
    else if (fb.rating <= 2) { sentiment = 'negative'; score = -0.7; }

    await Feedback.create({
      userId: cardholders[i % cardholders.length]._id,
      shopId: shop._id,
      rating: fb.rating,
      textFeedback: fb.text,
      sentiment,
      sentimentScore: score,
      topics: fb.rating >= 4 ? ['staff behavior', 'queue time'] : ['product quality', 'hygiene'],
    });
  }

  console.log('Created 10 feedback entries');

  // --- Notifications ---
  for (let i = 0; i < 5; i++) {
    await Notification.create({
      userId: cardholders[i]._id,
      notificationType: ['slot_booked', 'turn_approaching', 'service_complete', 'low_stock_alert', 'slot_booked'][i],
      channel: ['sms', 'push', 'push', 'push', 'email'][i],
      message: [
        'Your slot is confirmed! Ticket: T123ABC, Time: 10:00-12:00',
        'Your turn is approaching! Please be ready at the counter.',
        'Your ration has been collected successfully. Thank you!',
        'Low stock alert: Sugar has approximately 4 days of supply remaining.',
        'Your slot is confirmed! Ticket: T456DEF, Time: 14:00-16:00',
      ][i],
      status: 'sent',
      sentAt: new Date(),
    });
  }

  console.log('Created 5 sample notifications');

  // --- Print login credentials ---
  console.log('\n========================================');
  console.log('  SEED COMPLETE — Demo Credentials');
  console.log('========================================');
  console.log('Password for all accounts: password123\n');
  console.log('Admin:      admin@rationmitra.in');
  console.log('Sysadmin:   sysadmin@rationmitra.in');
  console.log('Shop Owner: ramesh@rationmitra.in');
  console.log('Shop Owner: suresh@rationmitra.in');
  console.log('Cardholder: user1@rationmitra.in');
  console.log('Cardholder: user2@rationmitra.in');
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
