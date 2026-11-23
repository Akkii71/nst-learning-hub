const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

// Allowed resource types
const VALID_TYPES = ['VIDEO', 'NOTES', 'TUTORIAL', 'EXTERNAL'];

// POST /api/submissions - Submit a new learning resource
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      url,
      type,
      subjectId,
      topicId,
      studentName,
      studentEmail,
      userId,
    } = req.body;

    // 1. Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Resource title is required' });
    }

    if (!url || !url.trim()) {
      return res.status(400).json({ error: 'Resource URL is required' });
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return res.status(400).json({ error: 'URL must start with http:// or https://' });
    }

    if (!type || !type.trim()) {
      return res.status(400).json({ error: 'Resource type is required' });
    }

    const upperType = type.trim().toUpperCase();
    if (!VALID_TYPES.includes(upperType)) {
      return res.status(400).json({
        error: `Invalid resource type. Must be one of: ${VALID_TYPES.join(', ')}`,
      });
    }

    if (!subjectId) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    if (!topicId) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const parsedSubjectId = parseInt(subjectId, 10);
    const parsedTopicId = parseInt(topicId, 10);

    if (isNaN(parsedSubjectId) || isNaN(parsedTopicId)) {
      return res.status(400).json({ error: 'Invalid subject or topic ID' });
    }

    // Check subject & topic exist
    const subject = await prisma.subject.findUnique({ where: { id: parsedSubjectId } });
    if (!subject) {
      return res.status(404).json({ error: 'Selected subject does not exist' });
    }

    const topic = await prisma.topic.findUnique({ where: { id: parsedTopicId } });
    if (!topic) {
      return res.status(404).json({ error: 'Selected topic does not exist' });
    }

    // 2. Identify or create the submitting student user
    let user;
    if (req.user) {
      user = req.user;
    } else if (userId) {
      user = await prisma.user.findUnique({ where: { id: parseInt(userId, 10) } });
    }

    if (!user) {
      const email = (studentEmail && studentEmail.trim()) || 'student@nst.edu';
      const name = (studentName && studentName.trim()) || 'Akash Kumar';

      user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          name,
          email,
          password: 'default-student-pwd',
          role: 'STUDENT',
          studentId: 'NST2024001',
          department: 'Computer Science',
        },
      });
    }

    // 3. Create Resource with PENDING status
    const resource = await prisma.resource.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : '',
        url: url.trim(),
        type: upperType,
        status: 'PENDING',
        subjectId: parsedSubjectId,
        topicId: parsedTopicId,
        submission: {
          create: {
            userId: user.id,
            status: 'PENDING',
          },
        },
      },
      include: {
        submission: true,
        subject: true,
        topic: true,
      },
    });

    res.status(201).json({
      message: 'Resource submitted successfully and is pending review',
      resource: {
        id: String(resource.id),
        title: resource.title,
        url: resource.url,
        type: resource.type.toLowerCase(),
        status: resource.status,
        subject: resource.subject.name,
        topic: resource.topic.name,
        submissionId: resource.submission?.id,
      },
    });
  } catch (error) {
    console.error('Error submitting resource:', error);
    res.status(500).json({ error: 'Failed to submit resource' });
  }
});

// GET /api/submissions - Get all submissions (or filter by user)
router.get('/', async (req, res) => {
  try {
    const { userId, status } = req.query;
    const where = {};

    if (userId) {
      const parsedUserId = parseInt(userId, 10);
      if (!isNaN(parsedUserId)) where.userId = parsedUserId;
    }

    if (status) {
      where.status = status;
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        resource: {
          include: { subject: true, topic: true },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(
      submissions.map((s) => ({
        id: s.id,
        status: s.status,
        note: s.note,
        submittedAt: s.createdAt.toISOString().split('T')[0],
        studentName: s.user.name,
        resource: {
          id: String(s.resource.id),
          title: s.resource.title,
          url: s.resource.url,
          type: s.resource.type.toLowerCase(),
          subject: s.resource.subject.name,
          topic: s.resource.topic.name,
        },
      }))
    );
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

module.exports = router;
