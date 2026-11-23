const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Helper to generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register - Register a new Student
// IMPORTANT: Role is strictly locked to STUDENT. Reviewers cannot be self-registered.
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, studentId, department, year } = req.body;

    // 1. Basic validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check for existing user by email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // 3. Check for existing student ID if provided
    if (studentId && studentId.trim()) {
      const existingStudentId = await prisma.user.findUnique({
        where: { studentId: studentId.trim() },
      });
      if (existingStudentId) {
        return res.status(400).json({ error: 'This Student ID is already registered.' });
      }
    }

    // 4. Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create user with strictly enforced STUDENT role
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        studentId: studentId ? studentId.trim() : null,
        department: department ? department.trim() : 'Computer Science',
        year: year ? year.trim() : '1st Year',
        role: 'STUDENT', // Enforced: users cannot register as REVIEWER
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        department: true,
        year: true,
        createdAt: true,
      },
    });

    // 6. Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Student account registered successfully.',
      token,
      user: newUser,
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Failed to register account. Please try again.' });
  }
});

// POST /api/auth/login - Student & Reviewer login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 2. Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 3. Generate JWT token
    const token = generateToken(user);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department,
      year: user.year,
    };

    res.json({
      message: 'Login successful.',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to process login. Please try again.' });
  }
});

// GET /api/auth/me - Get current authenticated user profile
router.get('/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
