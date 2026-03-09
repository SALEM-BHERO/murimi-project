const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const { requireAuth } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'development_secret_change_me';

exports.register = async (req, res, next) => {
  try {
    const { phone_number, full_name, password } = req.body;
    if (!phone_number || !password) {
      return res.status(400).json({ message: 'phone_number and password are required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (phone_number, full_name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, phone_number, full_name, created_at`,
      [phone_number, full_name || null, passwordHash]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { phone_number, password } = req.body;
    if (!phone_number || !password) {
      return res.status(400).json({ message: 'phone_number and password are required' });
    }

    const result = await db.query(
      'SELECT id, phone_number, full_name, password_hash FROM users WHERE phone_number = $1',
      [phone_number]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        phone_number: user.phone_number,
        full_name: user.full_name
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'SELECT id, phone_number, full_name, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.requireAuth = requireAuth;

