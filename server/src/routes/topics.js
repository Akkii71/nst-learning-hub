const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET /api/topics/:subjectId - List topics for a specific subject
router.get('/:subjectId', async (req, res) => {
  try {
    const subjectId = parseInt(req.params.subjectId, 10);
    if (isNaN(subjectId)) {
      return res.status(400).json({ error: 'Invalid subject ID' });
    }

    const topics = await prisma.topic.findMany({
      where: { subjectId },
      orderBy: { id: 'asc' },
    });

    const formatted = topics.map((t) => ({
      id: String(t.id),
      numericId: t.id,
      name: t.name,
      subjectId: String(t.subjectId),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

module.exports = router;
