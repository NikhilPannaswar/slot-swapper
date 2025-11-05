const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const Event = require('../models/Event');
const SwapRequest = require('../models/SwapRequest');

// GET /api/swappable-slots
router.get('/swappable-slots', checkAuth, async (req, res) => {
  try {
    const swappableSlots = await Event.find({
      status: 'SWAPPABLE',
      user: { $ne: req.userId },
    });

    res.status(200).json(swappableSlots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// POST /api/swap-request
router.post('/swap-request', checkAuth, async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;

  try {
    // Verify mySlot
    const mySlot = await Event.findById(mySlotId);
    if (!mySlot || mySlot.user.toString() !== req.userId || mySlot.status !== 'SWAPPABLE') {
      return res.status(400).json({ message: 'Invalid mySlot' });
    }

    // Verify theirSlot
    const theirSlot = await Event.findById(theirSlotId);
    if (!theirSlot || theirSlot.user.toString() === req.userId || theirSlot.status !== 'SWAPPABLE') {
      return res.status(400).json({ message: 'Invalid theirSlot' });
    }

    // Create SwapRequest
    const swapRequest = new SwapRequest({
      status: 'PENDING',
      requester: req.userId,
      receiver: theirSlot.user,
      requesterSlot: mySlotId,
      receiverSlot: theirSlotId,
    });

    await swapRequest.save();

    // Update slot statuses
    mySlot.status = 'SWAP_PENDING';
    theirSlot.status = 'SWAP_PENDING';
    await mySlot.save();
    await theirSlot.save();

    res.status(201).json(swapRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// POST /api/swap-response/:requestId
router.post('/swap-response/:requestId', checkAuth, async (req, res) => {
  const { requestId } = req.params;
  const { accepted } = req.body;

  try {
    const swapRequest = await SwapRequest.findById(requestId);

    if (!swapRequest || swapRequest.receiver.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized or invalid request' });
    }

    if (!accepted) {
      // Reject the swap
      swapRequest.status = 'REJECTED';
      await swapRequest.save();

      const requesterSlot = await Event.findById(swapRequest.requesterSlot);
      const receiverSlot = await Event.findById(swapRequest.receiverSlot);

      requesterSlot.status = 'SWAPPABLE';
      receiverSlot.status = 'SWAPPABLE';

      await requesterSlot.save();
      await receiverSlot.save();

      return res.status(200).json({ message: 'Swap rejected' });
    }

    // Accept the swap
    swapRequest.status = 'ACCEPTED';
    await swapRequest.save();

    const requesterSlot = await Event.findById(swapRequest.requesterSlot);
    const receiverSlot = await Event.findById(swapRequest.receiverSlot);

    // Swap users
    const tempUser = requesterSlot.user;
    requesterSlot.user = receiverSlot.user;
    receiverSlot.user = tempUser;

    requesterSlot.status = 'BUSY';
    receiverSlot.status = 'BUSY';

    await requesterSlot.save();
    await receiverSlot.save();

    res.status(200).json({ message: 'Swap accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/swap-requests/incoming
router.get('/swap-requests/incoming', checkAuth, async (req, res) => {
  try {
    const incomingRequests = await SwapRequest.find({
      receiver: req.userId,
      status: 'PENDING',
    }).populate('requester', 'name email').populate('requesterSlot receiverSlot');

    res.status(200).json(incomingRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/swap-requests/outgoing
router.get('/swap-requests/outgoing', checkAuth, async (req, res) => {
  try {
    const outgoingRequests = await SwapRequest.find({
      requester: req.userId,
    }).populate('receiver', 'name email').populate('requesterSlot receiverSlot');

    res.status(200).json(outgoingRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;