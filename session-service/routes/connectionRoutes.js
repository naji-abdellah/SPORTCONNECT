const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');

// POST /connections/send
router.post('/send', async (req, res) => {
  try {
    const { senderId, senderName, receiverId, receiverName } = req.body;
    if (!senderId || !receiverId) return res.status(400).json({ error: 'Missing fields' });

    const existing = await Connection.findOne({ senderId, receiverId, status: 'pending' });
    if (existing) return res.status(409).json({ error: 'Request already sent' });

    const conn = await Connection.create({ senderId, senderName, receiverId, receiverName });
    res.status(201).json(conn);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /connections/incoming/:uid
router.get('/incoming/:uid', async (req, res) => {
  try {
    const requests = await Connection.find({ receiverId: req.params.uid, status: 'pending' });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /connections/friends/:uid
router.get('/friends/:uid', async (req, res) => {
  try {
    const uid = String(req.params.uid).trim();
    const conns = await Connection.find({
      status: 'accepted',
      $or: [{ senderId: uid }, { receiverId: uid }]
    });
    const friends = conns.map(c => {
      const isSender = String(c.senderId).trim() === uid;
      return {
        id: c._id,
        uid:  isSender ? c.receiverId : c.senderId,
        name: isSender ? c.receiverName : c.senderName,
        connectedAt: c.updatedAt,
      };
    });
    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /connections/:id/accept
router.patch('/:id/accept', async (req, res) => {
  try {
    const conn = await Connection.findByIdAndUpdate(req.params.id, { status: 'accepted' }, { new: true });
    if (!conn) return res.status(404).json({ error: 'Not found' });
    res.json(conn);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /connections/:id/decline
router.patch('/:id/decline', async (req, res) => {
  try {
    const conn = await Connection.findByIdAndUpdate(req.params.id, { status: 'declined' }, { new: true });
    if (!conn) return res.status(404).json({ error: 'Not found' });
    res.json(conn);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
