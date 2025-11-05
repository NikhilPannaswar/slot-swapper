const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const Event = require('../models/Event');

// POST /api/events
router.post('/', checkAuth, async (req, res) => {
  const { title, startTime, endTime, status } = req.body;

  try {
    const newEvent = new Event({
      title,
      startTime,
      endTime,
      status,
      user: req.userId,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/events
router.get('/', checkAuth, async (req, res) => {
  try {
    const events = await Event.find({ user: req.userId });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// PUT /api/events/:id
router.put('/:id', checkAuth, async (req, res) => {
  const { id } = req.params;
  const { title, startTime, endTime, status } = req.body;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    event.title = title || event.title;
    event.startTime = startTime || event.startTime;
    event.endTime = endTime || event.endTime;
    event.status = status || event.status;

    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;