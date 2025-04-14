import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "abcd1234";

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const admin = await prisma.user.findFirst({
      where: {
        email,
        role: 'ADMIN'
      }
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify admin token
router.get('/verify', isAdmin, (req, res) => {
  res.json({ verified: true, user: req.user });
});

// Get all users (excluding admins)
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'USER' // Only get users with role USER
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        gender: true,
        role: true,
        shares: {
          select: {
            id: true,
            origin: true,
            destination: true,
            departureTime: true
          }
        }
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all trips
router.get('/trips', isAdmin, async (req, res) => {
  try {
    const trips = await prisma.share.findMany({
      include: {
        driver: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        requests: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 