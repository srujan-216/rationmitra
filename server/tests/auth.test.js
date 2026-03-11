const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../src/config/db', () => jest.fn());

const app = express();
app.use(express.json());

// Import after mocking
const authRoutes = require('../src/routes/auth');
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'invalid', phone: '9876543210', password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('should reject registration with invalid phone', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', phone: '123', password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('should reject short passwords', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', phone: '9876543210', password: 'short' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });

    it('should reject login with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid', password: 'password123' });

      expect(res.status).toBe(400);
    });
  });
});

describe('Validators', () => {
  const { registerValidation, loginValidation } = require('../src/utils/validators');

  it('should export register validation array', () => {
    expect(Array.isArray(registerValidation)).toBe(true);
    expect(registerValidation.length).toBeGreaterThan(0);
  });

  it('should export login validation array', () => {
    expect(Array.isArray(loginValidation)).toBe(true);
    expect(loginValidation.length).toBeGreaterThan(0);
  });
});

describe('Encryption Utils', () => {
  const { encrypt, decrypt } = require('../src/utils/encryption');

  it('should encrypt and decrypt text correctly', () => {
    const original = 'Hello RationMitra';
    const encrypted = encrypt(original);
    expect(encrypted).not.toBe(original);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should encrypt JSON data', () => {
    const data = JSON.stringify({ test: 123, arr: [1, 2, 3] });
    const encrypted = encrypt(data);
    const decrypted = decrypt(encrypted);
    expect(JSON.parse(decrypted)).toEqual({ test: 123, arr: [1, 2, 3] });
  });
});

describe('RBAC Middleware', () => {
  const authorize = require('../src/middleware/rbac');

  it('should return 401 if no user', () => {
    const middleware = authorize('admin');
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if wrong role', () => {
    const middleware = authorize('admin');
    const req = { user: { role: 'cardholder' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should call next if correct role', () => {
    const middleware = authorize('admin', 'shopowner');
    const req = { user: { role: 'admin' } };
    const res = {};
    const next = jest.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('Models', () => {
  it('should export User model', () => {
    const User = require('../src/models/User');
    expect(User.modelName).toBe('User');
  });

  it('should export Shop model', () => {
    const Shop = require('../src/models/Shop');
    expect(Shop.modelName).toBe('Shop');
  });

  it('should export Queue model', () => {
    const Queue = require('../src/models/Queue');
    expect(Queue.modelName).toBe('Queue');
  });

  it('should export Inventory model', () => {
    const Inventory = require('../src/models/Inventory');
    expect(Inventory.modelName).toBe('Inventory');
  });

  it('should export Feedback model', () => {
    const Feedback = require('../src/models/Feedback');
    expect(Feedback.modelName).toBe('Feedback');
  });

  it('should export FraudAlert model', () => {
    const FraudAlert = require('../src/models/FraudAlert');
    expect(FraudAlert.modelName).toBe('FraudAlert');
  });

  it('should export AuditLog model', () => {
    const AuditLog = require('../src/models/AuditLog');
    expect(AuditLog.modelName).toBe('AuditLog');
  });
});
