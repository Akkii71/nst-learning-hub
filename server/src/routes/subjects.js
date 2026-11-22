const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET /api/subjects - List all subjects with topic counts
router.get('/', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: { topics: true, resources: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    const formatted = subjects.map((s) => ({
      id: String(s.id),
      numericId: s.id,
      name: s.name,
      code: s.code,
      icon: s.icon || 'book-outline',
      color: s.color || '#1565C0',
      topicCount: s._count.topics,
      resourceCount: s._count.resources,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// GET /api/subjects/:id - Get a single subject with its topics
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid subject ID' });
    }

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        topics: {
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json({
      id: String(subject.id),
      numericId: subject.id,
      name: subject.name,
      code: subject.code,
      icon: subject.icon,
      color: subject.color,
      topics: subject.topics.map((t) => ({
        id: String(t.id),
        numericId: t.id,
        name: t.name,
        subjectId: String(t.subjectId),
      })),
    });
  } catch (error) {
    console.error('Error fetching subject by ID:', error);
    res.status(500).json({ error: 'Failed to fetch subject details' });
  }
});

module.exports = router;
