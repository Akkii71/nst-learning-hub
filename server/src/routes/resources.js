const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// Helper to format a resource for API responses
function formatResource(r) {
  const ratings = r.ratings || [];
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, item) => sum + item.stars, 0) / ratings.length
    : 0;

  return {
    id: String(r.id),
    numericId: r.id,
    title: r.title,
    description: r.description,
    url: r.url,
    type: r.type ? r.type.toLowerCase() : 'other',
    rawType: r.type,
    status: r.status,
    subject: r.subject ? r.subject.name : '',
    subjectCode: r.subject ? r.subject.code : '',
    subjectId: String(r.subjectId),
    topic: r.topic ? r.topic.name : '',
    topicId: String(r.topicId),
    rating: parseFloat(avgRating.toFixed(1)),
    ratingCount: ratings.length,
    submittedBy: r.submission?.user?.name || 'NST Student',
    createdAt: r.createdAt.toISOString().split('T')[0],
  };
}

// GET /api/resources - List resources with optional filters (subjectId, topicId, type, search)
router.get('/', async (req, res) => {
  try {
    const { subjectId, topicId, type, search, status = 'APPROVED' } = req.query;

    const where = {};

    // Filter by approval status (default to APPROVED so students only see approved resources)
    if (status !== 'ALL') {
      where.status = status;
    }

    if (subjectId) {
      const parsedSub = parseInt(subjectId, 10);
      if (!isNaN(parsedSub)) where.subjectId = parsedSub;
    }

    if (topicId) {
      const parsedTopic = parseInt(topicId, 10);
      if (!isNaN(parsedTopic)) where.topicId = parsedTopic;
    }

    if (type && type !== 'All') {
      where.type = type.toUpperCase();
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const resources = await prisma.resource.findMany({
      where,
      include: {
        subject: true,
        topic: true,
        ratings: true,
        submission: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(resources.map(formatResource));
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// GET /api/resources/:id - Get resource details by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid resource ID' });
    }

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        subject: true,
        topic: true,
        ratings: true,
        feedbacks: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
        submission: {
          include: { user: true },
        },
      },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const formatted = formatResource(resource);
    formatted.feedbacks = (resource.feedbacks || []).map((f) => ({
      id: f.id,
      user: f.user.name,
      comment: f.comment,
      createdAt: f.createdAt.toISOString().split('T')[0],
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching resource details:', error);
    res.status(500).json({ error: 'Failed to fetch resource details' });
  }
});

module.exports = router;
