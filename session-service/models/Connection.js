const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  senderId:     { type: String, required: true },
  senderName:   { type: String, required: true },
  receiverId:   { type: String, required: true },
  receiverName: { type: String, required: true },
  status:       { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Connection', connectionSchema);
