/**
 * Seed script — populates the database with demo data.
 * Run: node src/scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { mongoUri, bcryptSaltRounds } = require('../config/env');

const crypto = require('crypto');

const User = require('../models/User');
const Shop = require('../models/Shop');
const Queue = require('../models/Queue');
const Inventory = require('../models/Inventory');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const RationCard = require('../models/RationCard');
const FamilyRequest = require('../models/FamilyRequest');
const Distribution = require('../models/Distribution');
const Grievance = require('../models/Grievance');
const Allocation = require('../models/Allocation');
const { CARD_TYPES, COMMODITIES, TELANGANA_DISTRICTS, ENTITLEMENT_RULES, COMMODITY_RATES } = require('../utils/telangana');
const { TELANGANA_FPS_SHOPS } = require('../utils/telanganaShops');

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
    RationCard.deleteMany({}),
    FamilyRequest.deleteMany({}),
    Distribution.deleteMany({}),
    Grievance.deleteMany({}),
    Allocation.deleteMany({}),
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

  // --- Shops (real Telangana FPS dataset) ---
  const allShops = [];
  for (let i = 0; i < TELANGANA_FPS_SHOPS.length; i++) {
    const s = TELANGANA_FPS_SHOPS[i];
    // Rotate owner between shopOwner1 & shopOwner2; remaining shops have shopOwner1 as default
    const owner = i % 2 === 0 ? shopOwner1._id : shopOwner2._id;
    const doc = await Shop.create({
      name: s.name,
      code: s.code,
      address: {
        street: s.street,
        city: s.city,
        state: 'Telangana',
        pincode: s.pincode,
        coordinates: { lat: s.lat, lng: s.lng },
      },
      owner,
      operatingHours: { open: '08:00', close: '18:00' },
      slotsPerDay: 5,
      slotDurationMinutes: 120,
      maxCapacityPerSlot: 30 + (i % 3) * 10,
      counters: 2 + (i % 2),
      rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
      totalRatings: Math.floor(Math.random() * 50) + 5,
      isActive: true,
    });
    allShops.push(doc);
  }

  // Shortcut references to first three shops (used by inventory/queues/allocations below)
  const shop1 = allShops[0];
  const shop2 = allShops[1];
  const shop3 = allShops[2];

  // Assign shops to owners
  shopOwner1.shopAssignedTo = shop1._id;
  shopOwner2.shopAssignedTo = shop2._id;
  await shopOwner1.save();
  await shopOwner2.save();

  // Assign a shop to some cardholders — spread across first 10 shops for realism
  for (const ch of cardholders) {
    const pickFrom = allShops.slice(0, Math.min(10, allShops.length));
    ch.shopAssignedTo = pickFrom[Math.floor(Math.random() * pickFrom.length)]._id;
    await ch.save();
  }

  console.log(`Created ${allShops.length} shops across Telangana`);

  // --- Inventory ---
  const items = [
    { name: 'Rice', stock: 450, unit: 'kg', reorder: 100 },
    { name: 'Wheat', stock: 300, unit: 'kg', reorder: 80 },
    { name: 'Sugar', stock: 80, unit: 'kg', reorder: 50 },
    { name: 'Kerosene Oil', stock: 200, unit: 'liter', reorder: 50 },
    { name: 'Toor Dal', stock: 60, unit: 'kg', reorder: 30 },
  ];

  // Seed inventory for ALL shops (bulk insert for performance)
  const inventoryDocs = [];
  for (const shop of allShops) {
    for (const item of items) {
      const stockVariation = Math.floor(Math.random() * 100) - 50;
      const currentStock = Math.max(10, item.stock + stockVariation);
      const history = [];

      // 14 days of stock history (trimmed from 30 to keep seed fast across 60 shops)
      for (let d = 14; d >= 1; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        if (d % 7 === 0) {
          history.push({
            timestamp: date,
            quantity: Math.floor(Math.random() * 100) + 50,
            transactionType: 'inward',
            remarks: 'Weekly supply',
          });
        }
        history.push({
          timestamp: date,
          quantity: Math.floor(Math.random() * 20) + 5,
          transactionType: 'outward',
          remarks: 'Daily distribution',
        });
      }

      inventoryDocs.push({
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
  await Inventory.insertMany(inventoryDocs);
  console.log(`Created inventory for ${allShops.length} shops (${inventoryDocs.length} item records)`);

  // --- Queues (today) ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create queues for first 15 shops (realistic activity profile; demo doesn't need 60)
  const queueShops = allShops.slice(0, 15);
  const queueDocs = [];
  for (const shop of queueShops) {
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
          ticketNumber: `T${Date.now().toString(36).toUpperCase()}${i}${shop._id.toString().slice(-3)}`,
          status,
          joinedAt: new Date(today.getTime() + i * 600000),
          servedAt: status !== 'waiting' ? new Date(today.getTime() + (i + 1) * 600000) : undefined,
          completedAt: status === 'completed' ? new Date(today.getTime() + (i + 2) * 600000) : undefined,
          serviceTime: status === 'completed' ? Math.floor(Math.random() * 10) + 3 : undefined,
        });
      }

      queueDocs.push({
        shopId: shop._id,
        date: today,
        slot: { ...slotConfig, capacity: shop.maxCapacityPerSlot, currentCount: entries.length },
        queueEntries: entries,
      });
    }
  }
  await Queue.insertMany(queueDocs);
  console.log(`Created queue entries for ${queueShops.length} shops (today)`);

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

  // --- Ration Cards ---
  const cardConfigs = [
    { idx: 0, cardType: 'AAY', district: 'Hyderabad', mandal: 'Kukatpally', shop: shop1 },
    { idx: 1, cardType: 'PHH', district: 'Hyderabad', mandal: 'Ameerpet', shop: shop2 },
    { idx: 2, cardType: 'AAY', district: 'Rangareddy', mandal: 'Rajendranagar', shop: shop3 },
    { idx: 3, cardType: 'PHH', district: 'Medchal-Malkajgiri', mandal: 'Medchal', shop: shop1 },
    { idx: 4, cardType: 'PHH', district: 'Hyderabad', mandal: 'Secunderabad', shop: shop2 },
    { idx: 5, cardType: 'APL', district: 'Rangareddy', mandal: 'Shamshabad', shop: shop3 },
    { idx: 6, cardType: 'AAY', district: 'Hyderabad', mandal: 'Charminar', shop: shop1 },
    { idx: 7, cardType: 'PHH', district: 'Medchal-Malkajgiri', mandal: 'Kompally', shop: shop2 },
    { idx: 8, cardType: 'Annapurna', district: 'Hyderabad', mandal: 'Begumpet', shop: shop3 },
    { idx: 9, cardType: 'PHH', district: 'Rangareddy', mandal: 'Miyapur', shop: shop1 },
  ];

  const familyData = [
    [
      { name: 'Priya Sharma', relation: 'self', dob: '1985-03-12', gender: 'female' },
      { name: 'Rajesh Sharma', relation: 'spouse', dob: '1982-07-20', gender: 'male' },
      { name: 'Aarav Sharma', relation: 'son', dob: '2010-11-05', gender: 'male' },
    ],
    [
      { name: 'Amit Singh', relation: 'self', dob: '1990-06-15', gender: 'male' },
      { name: 'Neha Singh', relation: 'spouse', dob: '1992-01-22', gender: 'female' },
      { name: 'Riya Singh', relation: 'daughter', dob: '2015-08-10', gender: 'female' },
      { name: 'Arjun Singh', relation: 'son', dob: '2018-04-30', gender: 'male' },
    ],
    [
      { name: 'Lakshmi Devi', relation: 'self', dob: '1975-12-01', gender: 'female' },
      { name: 'Venkatesh Rao', relation: 'spouse', dob: '1972-09-18', gender: 'male' },
    ],
    [
      { name: 'Ravi Teja', relation: 'self', dob: '1988-02-28', gender: 'male' },
      { name: 'Swathi Teja', relation: 'spouse', dob: '1990-05-14', gender: 'female' },
      { name: 'Pranav Teja', relation: 'son', dob: '2014-07-22', gender: 'male' },
      { name: 'Saanvi Teja', relation: 'daughter', dob: '2017-12-03', gender: 'female' },
      { name: 'Kamala Devi', relation: 'mother', dob: '1960-08-10', gender: 'female' },
    ],
    [
      { name: 'Anita Kumari', relation: 'self', dob: '1993-09-25', gender: 'female' },
      { name: 'Manoj Kumar', relation: 'spouse', dob: '1991-04-11', gender: 'male' },
      { name: 'Divya Kumari', relation: 'daughter', dob: '2019-06-15', gender: 'female' },
    ],
    [
      { name: 'Sunil Reddy', relation: 'self', dob: '1980-11-07', gender: 'male' },
      { name: 'Padma Reddy', relation: 'spouse', dob: '1983-03-19', gender: 'female' },
      { name: 'Karthik Reddy', relation: 'son', dob: '2008-01-25', gender: 'male' },
      { name: 'Sravani Reddy', relation: 'daughter', dob: '2012-10-08', gender: 'female' },
    ],
    [
      { name: 'Meena Bai', relation: 'self', dob: '1970-04-20', gender: 'female' },
      { name: 'Srinivas Rao', relation: 'spouse', dob: '1968-08-15', gender: 'male' },
      { name: 'Harsha Rao', relation: 'son', dob: '1995-12-30', gender: 'male' },
    ],
    [
      { name: 'Vikram Rao', relation: 'self', dob: '1986-07-14', gender: 'male' },
      { name: 'Jyothi Rao', relation: 'spouse', dob: '1989-02-05', gender: 'female' },
      { name: 'Tanvi Rao', relation: 'daughter', dob: '2016-09-12', gender: 'female' },
      { name: 'Aditya Rao', relation: 'son', dob: '2020-03-01', gender: 'male' },
    ],
    [
      { name: 'Kavitha Nair', relation: 'self', dob: '1965-01-30', gender: 'female' },
      { name: 'Gopal Nair', relation: 'spouse', dob: '1960-06-22', gender: 'male' },
    ],
    [
      { name: 'Deepak Verma', relation: 'self', dob: '1992-10-18', gender: 'male' },
      { name: 'Pooja Verma', relation: 'spouse', dob: '1994-05-08', gender: 'female' },
      { name: 'Ishaan Verma', relation: 'son', dob: '2021-01-15', gender: 'male' },
      { name: 'Ramesh Verma', relation: 'father', dob: '1962-11-20', gender: 'male' },
      { name: 'Sunita Verma', relation: 'mother', dob: '1965-04-05', gender: 'female' },
    ],
  ];

  const rationCards = [];
  for (let i = 0; i < 10; i++) {
    const cfg = cardConfigs[i];
    const members = familyData[i].map((m) => ({
      name: m.name,
      relation: m.relation,
      dob: new Date(m.dob),
      gender: m.gender,
      aadhaarNumber: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      status: 'active',
    }));

    const rc = await RationCard.create({
      cardNumber: `TS-2026-${String(i + 1).padStart(3, '0')}`,
      cardType: cfg.cardType,
      headOfFamily: cardholders[cfg.idx]._id,
      familyMembers: members,
      district: cfg.district,
      mandal: cfg.mandal,
      assignedFPS: cfg.shop._id,
      isActive: true,
      aadhaarLinked: i < 7,
    });
    rationCards.push(rc);
  }

  console.log('Created 10 ration cards');

  // --- Family Requests ---
  await FamilyRequest.create({
    type: 'addition',
    rationCardId: rationCards[0]._id,
    requestedBy: cardholders[0]._id,
    memberDetails: {
      name: 'Baby Sharma',
      relation: 'daughter',
      dob: new Date('2025-12-15'),
      gender: 'female',
    },
    reason: 'Newborn baby addition to ration card',
    certificateUrl: '/uploads/certificates/birth_cert_001.pdf',
    status: 'pending',
  });

  await FamilyRequest.create({
    type: 'addition',
    rationCardId: rationCards[1]._id,
    requestedBy: cardholders[1]._id,
    memberDetails: {
      name: 'Sneha Gupta',
      relation: 'spouse',
      dob: new Date('1993-04-10'),
      gender: 'female',
    },
    reason: 'Spouse addition after marriage',
    certificateUrl: '/uploads/certificates/marriage_cert_002.pdf',
    status: 'approved',
    reviewedBy: admin._id,
    reviewNotes: 'Marriage certificate verified. Approved.',
    reviewedAt: new Date('2026-03-20'),
  });

  await FamilyRequest.create({
    type: 'deletion',
    rationCardId: rationCards[2]._id,
    requestedBy: cardholders[2]._id,
    memberIndex: 1,
    memberDetails: {
      name: 'Venkatesh Rao',
      relation: 'spouse',
      dob: new Date('1972-09-18'),
      gender: 'male',
    },
    reason: 'Deceased — requesting removal from ration card',
    certificateUrl: '/uploads/certificates/death_cert_003.pdf',
    status: 'pending',
  });

  console.log('Created 3 family requests');

  // --- Distributions (March 2026) ---
  const distributionConfigs = [
    { rcIdx: 0, verification: 'face' },
    { rcIdx: 1, verification: 'aadhaar' },
    { rcIdx: 3, verification: 'face' },
    { rcIdx: 4, verification: 'manual' },
    { rcIdx: 6, verification: 'aadhaar' },
  ];

  for (const dc of distributionConfigs) {
    const rc = rationCards[dc.rcIdx];
    const rules = ENTITLEMENT_RULES[rc.cardType];
    const rates = COMMODITY_RATES[rc.cardType];
    const memberCount = rc.familyMembers.length;

    const commodities = COMMODITIES
      .map((name) => {
        const base = rules[name] || 0;
        if (base === 0) return null;
        const entitled = rules.perMember ? base * memberCount : base;
        return {
          name,
          entitledQty: entitled,
          distributedQty: entitled,
          rate: rates[name],
        };
      })
      .filter(Boolean);

    const signaturePayload = `${rc.cardNumber}-2026-03-${dc.verification}`;
    const digitalSignatureHash = crypto.createHash('sha256').update(signaturePayload).digest('hex');

    await Distribution.create({
      rationCardId: rc._id,
      shopId: rc.assignedFPS,
      month: 3,
      year: 2026,
      commodities,
      distributedBy: rc.assignedFPS.equals(shop1._id) ? shopOwner1._id : shopOwner2._id,
      verificationMethod: dc.verification,
      digitalSignatureHash,
      remarks: 'Monthly distribution completed',
    });
  }

  console.log('Created 5 distributions for March 2026');

  // --- Grievances ---
  await Grievance.create({
    userId: cardholders[0]._id,
    type: 'quality',
    description: 'Rice supplied at the FPS last week was of very poor quality — broken grains and foul smell. Please investigate and ensure quality standards are met.',
    shopId: shop1._id,
    status: 'open',
    priority: 'medium',
    timeline: [],
  });

  await Grievance.create({
    userId: cardholders[2]._id,
    type: 'quantity',
    description: 'Received only 3 kg of rice instead of the entitled 5 kg per member. The shopkeeper claimed limited stock but I suspect diversion.',
    shopId: shop2._id,
    status: 'under_review',
    priority: 'high',
    assignedTo: admin._id,
    timeline: [
      {
        status: 'under_review',
        updatedBy: admin._id,
        notes: 'Complaint received and assigned for investigation. Checking shop inventory records.',
        timestamp: new Date('2026-03-25'),
      },
    ],
  });

  await Grievance.create({
    userId: cardholders[4]._id,
    type: 'denial',
    description: 'I was denied ration distribution despite having a valid PHH card and Aadhaar. The shopkeeper refused service without explanation.',
    shopId: shop2._id,
    status: 'resolved',
    priority: 'high',
    assignedTo: admin._id,
    resolution: 'Investigation confirmed the denial was due to a biometric device malfunction. Manual verification was allowed and ration has been distributed. Shopkeeper has been instructed to use fallback verification methods.',
    resolvedAt: new Date('2026-03-22'),
    timeline: [
      {
        status: 'under_review',
        updatedBy: admin._id,
        notes: 'Investigating denial report. Contacted FPS owner for clarification.',
        timestamp: new Date('2026-03-18'),
      },
      {
        status: 'resolved',
        updatedBy: admin._id,
        notes: 'Issue resolved — biometric device failure confirmed. Manual override applied and ration distributed.',
        timestamp: new Date('2026-03-22'),
      },
    ],
  });

  await Grievance.create({
    userId: cardholders[5]._id,
    type: 'corruption',
    description: 'The FPS dealer is demanding extra money (Rs 50) per visit for distributing ration. This has been happening for the past 3 months. Other beneficiaries can confirm.',
    shopId: shop3._id,
    status: 'escalated',
    priority: 'critical',
    assignedTo: sysadmin._id,
    timeline: [],
  });

  console.log('Created 4 grievances');

  // --- Allocations (March 2026) ---
  const allocationBase = COMMODITIES.map((name) => ({
    name,
    allocatedQty: { Rice: 500, Wheat: 300, Sugar: 100, Kerosene: 200, Dal: 80, 'Palm Oil': 60 }[name],
    rate: COMMODITY_RATES.PHH[name],
  }));

  // Allocations for ALL shops — mix of statuses for realistic analytics
  const allocationDocs = [];
  for (let i = 0; i < allShops.length; i++) {
    const shop = allShops[i];
    // Status distribution: ~60% received, ~25% partially_received, ~10% dispatched, ~5% planned
    let status, commodities, dispatchDate, receiptDate, receiptAcknowledgedBy, remarks;
    const roll = Math.random();
    if (roll < 0.60) {
      status = 'received';
      commodities = allocationBase.map((c) => ({ ...c, receivedQty: c.allocatedQty }));
      dispatchDate = new Date('2026-03-01');
      receiptDate = new Date('2026-03-03');
      receiptAcknowledgedBy = shop.owner;
      remarks = 'All commodities received in full';
    } else if (roll < 0.85) {
      status = 'partially_received';
      commodities = allocationBase.map((c) => ({
        ...c,
        receivedQty: ['Rice', 'Wheat', 'Sugar'].includes(c.name) ? c.allocatedQty : 0,
      }));
      dispatchDate = new Date('2026-03-02');
      receiptDate = new Date('2026-03-05');
      receiptAcknowledgedBy = shop.owner;
      remarks = 'Kerosene, Dal, and Palm Oil pending delivery';
    } else if (roll < 0.95) {
      status = 'dispatched';
      commodities = allocationBase.map((c) => ({ ...c, receivedQty: 0 }));
      dispatchDate = new Date('2026-03-04');
      remarks = 'In transit from district warehouse';
    } else {
      status = 'planned';
      commodities = allocationBase.map((c) => ({ ...c, receivedQty: 0 }));
      remarks = 'Awaiting dispatch from district warehouse';
    }

    allocationDocs.push({
      month: 3,
      year: 2026,
      district: shop.address.city === 'Hyderabad' || shop.address.city === 'Secunderabad' ? 'Hyderabad' : shop.address.city,
      shopId: shop._id,
      commodities,
      status,
      dispatchDate,
      receiptDate,
      receiptAcknowledgedBy,
      remarks,
    });
  }
  await Allocation.insertMany(allocationDocs);
  console.log(`Created ${allocationDocs.length} allocations for March 2026`);

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
