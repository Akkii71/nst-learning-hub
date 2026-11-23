const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { optionalAuth, authenticateToken, requireReviewer } = require('../middleware/auth');

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

    // Check for duplicate submission (same URL under the same syllabus topic)
    const existingResource = await prisma.resource.findFirst({
      where: {
        topicId: parsedTopicId,
        url: {
          equals: url.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existingResource) {
      return res.status(400).json({
        error: 'This resource URL has already been submitted for this topic.',
      });
    }

    // 2. Identify submitting student user
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

    // 3. Create Resource with PENDING status (hidden from public discovery)
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

// GET /api/submissions/pending - Reviewer endpoint to view all pending submissions
router.get('/pending', authenticateToken, requireReviewer, async (req, res) => {
  try {
    const pendingSubmissions = await prisma.submission.findMany({
      where: { status: 'PENDING' },
      include: {
        resource: {
          include: { subject: true, topic: true },
        },
        user: {
          select: { id: true, name: true, email: true, studentId: true, department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(
      pendingSubmissions.map((s) => ({
        id: s.id,
        status: s.status,
        note: s.note,
        submittedAt: s.createdAt.toISOString().split('T')[0],
        student: s.user,
        resource: {
          id: String(s.resource.id),
          numericId: s.resource.id,
          title: s.resource.title,
          description: s.resource.description,
          url: s.resource.url,
          type: s.resource.type.toLowerCase(),
          subject: s.resource.subject.name,
          topic: s.resource.topic.name,
        },
      }))
    );
  } catch (error) {
    console.error('Error fetching pending submissions:', error);
    res.status(500).json({ error: 'Failed to fetch pending submissions' });
  }
});

// GET /api/submissions/my - Student endpoint to track their own submissions
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const mySubmissions = await prisma.submission.findMany({
      where: { userId: req.user.id },
      include: {
        resource: {
          include: { subject: true, topic: true },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(
      mySubmissions.map((s) => ({
        id: s.id,
        status: s.status,
        note: s.note || s.reviews[0]?.note || null,
        submittedAt: s.createdAt.toISOString().split('T')[0],
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
    console.error('Error fetching student submissions:', error);
    res.status(500).json({ error: 'Failed to fetch your submissions' });
  }
});

// PUT /api/submissions/:id/approve - Reviewer approves a submission
router.put('/:id/approve', authenticateToken, requireReviewer, async (req, res) => {
  try {
    const submissionId = parseInt(req.params.id, 10);
    if (isNaN(submissionId)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { resource: true },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const { note } = req.body || {};

    // Transaction: update submission status, resource status, and log review
    const updated = await prisma.$transaction([
      // 1. Update submission
      prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: 'APPROVED',
          note: note || 'Approved by reviewer',
          reviewedAt: new Date(),
        },
      }),
      // 2. Make resource visible for student discovery
      prisma.resource.update({
        where: { id: submission.resourceId },
        data: { status: 'APPROVED' },
      }),
      // 3. Log reviewer action in Review table
      prisma.review.create({
        data: {
          submissionId: submission.id,
          reviewerId: req.user.id,
          action: 'APPROVED',
          note: note || 'Approved for syllabus learning',
        },
      }),
    ]);

    res.json({
      message: 'Submission approved successfully. Resource is now visible to students.',
      submission: updated[0],
    });
  } catch (error) {
    console.error('Error approving submission:', error);
    res.status(500).json({ error: 'Failed to approve submission' });
  }
});

// PUT /api/submissions/:id/reject - Reviewer rejects a submission
router.put('/:id/reject', authenticateToken, requireReviewer, async (req, res) => {
  try {
    const submissionId = parseInt(req.params.id, 10);
    if (isNaN(submissionId)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { resource: true },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const { note } = req.body || {};
    const rejectionNote = note && note.trim()
      ? note.trim()
      : 'Resource does not meet NST syllabus requirements or quality standards.';

    // Transaction: update submission, keep resource rejected (hidden), log review
    const updated = await prisma.$transaction([
      prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: 'REJECTED',
          note: rejectionNote,
          reviewedAt: new Date(),
        },
      }),
      prisma.resource.update({
        where: { id: submission.resourceId },
        data: { status: 'REJECTED' },
      }),
      prisma.review.create({
        data: {
          submissionId: submission.id,
          reviewerId: req.user.id,
          action: 'REJECTED',
          note: rejectionNote,
        },
      }),
    ]);

    res.json({
      message: 'Submission rejected.',
      submission: updated[0],
    });
  } catch (error) {
    console.error('Error rejecting submission:', error);
    res.status(500).json({ error: 'Failed to reject submission' });
  }
});

// GET /api/submissions - Get all submissions (optionally filtered)
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
