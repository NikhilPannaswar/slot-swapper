const mongoose = require('mongoose');

const SwapRequestSchema = new mongoose.Schema({
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  receiverSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
}, { timestamps: true });

module.exports = mongoose.model('SwapRequest', SwapRequestSchema);