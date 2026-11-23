const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

// Helper to format a resource for API responses
function formatResource(r, currentUserId = null) {
  const ratings = r.ratings || [];
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, item) => sum + item.stars, 0) / ratings.length
    : 0;

  const userRating = currentUserId
    ? ratings.find((item) => item.userId === currentUserId)?.stars || 0
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
    userRating,
    submittedBy: r.submission?.user?.name || 'NST Student',
    createdAt: r.createdAt.toISOString().split('T')[0],
  };
}

// GET /api/resources/top-videos - Top three eligible YouTube/video resources per topic
router.get('/top-videos', async (req, res) => {
  try {
    const { topicId, subjectId } = req.query;
    const where = {
      status: 'APPROVED',
      type: 'VIDEO',
    };

    if (topicId) {
      const parsedTopic = parseInt(topicId, 10);
      if (!isNaN(parsedTopic)) where.topicId = parsedTopic;
    }

    if (subjectId) {
      const parsedSub = parseInt(subjectId, 10);
      if (!isNaN(parsedSub)) where.subjectId = parsedSub;
    }

    const videos = await prisma.resource.findMany({
      where,
      include: {
        subject: true,
        topic: true,
        ratings: true,
        submission: {
          include: { user: true },
        },
      },
    });

    // Format and rank by rating descending, then rating count descending
    const formatted = videos.map((v) => formatResource(v));
    formatted.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.ratingCount - a.ratingCount;
    });

    // Return top 3
    res.json(formatted.slice(0, 3));
  } catch (error) {
    console.error('Error fetching top videos:', error);
    res.status(500).json({ error: 'Failed to fetch top videos' });
  }
});

// GET /api/resources - List resources with optional filters (subjectId, topicId, type, search)
router.get('/', optionalAuth, async (req, res) => {
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

    const currentUserId = req.user?.id || null;
    res.json(resources.map((r) => formatResource(r, currentUserId)));
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// GET /api/resources/:id - Get resource details by ID (with feedback & ratings)
router.get('/:id', optionalAuth, async (req, res) => {
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

    const currentUserId = req.user?.id || null;
    const formatted = formatResource(resource, currentUserId);
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

// POST /api/resources/:id/rate - Submit or update star rating (1 to 5)
router.post('/:id/rate', authenticateToken, async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    if (isNaN(resourceId)) {
      return res.status(400).json({ error: 'Invalid resource ID' });
    }

    const { stars } = req.body;
    const parsedStars = parseInt(stars, 10);

    if (isNaN(parsedStars) || parsedStars < 1 || parsedStars > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5 stars.' });
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Upsert rating in database: updates existing rating or creates new one
    const ratingRecord = await prisma.rating.upsert({
      where: {
        userId_resourceId: {
          userId: req.user.id,
          resourceId,
        },
      },
      update: {
        stars: parsedStars,
      },
      create: {
        userId: req.user.id,
        resourceId,
        stars: parsedStars,
      },
    });

    // Compute updated average rating
    const allRatings = await prisma.rating.findMany({
      where: { resourceId },
    });
    const avgRating = allRatings.reduce((sum, item) => sum + item.stars, 0) / allRatings.length;

    res.json({
      message: 'Rating saved successfully.',
      rating: parsedStars,
      averageRating: parseFloat(avgRating.toFixed(1)),
      ratingCount: allRatings.length,
    });
  } catch (error) {
    console.error('Error rating resource:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// POST /api/resources/:id/feedback - Submit written feedback / comment
router.post('/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    if (isNaN(resourceId)) {
      return res.status(400).json({ error: 'Invalid resource ID' });
    }

    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Feedback comment cannot be empty.' });
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: req.user.id,
        resourceId,
        comment: comment.trim(),
      },
      include: {
        user: { select: { name: true } },
      },
    });

    res.status(201).json({
      message: 'Feedback submitted successfully.',
      feedback: {
        id: feedback.id,
        user: feedback.user.name,
        comment: feedback.comment,
        createdAt: feedback.createdAt.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;
