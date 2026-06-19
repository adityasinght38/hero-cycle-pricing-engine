const mongoose = require('mongoose');

// snapshot of a part at the time the config was saved
// we store name/category here so the config still makes sense
// even if someone deletes the part later
const configPartSchema = new mongoose.Schema({
  partId: { type: mongoose.Schema.Types.ObjectId, ref: 'Part' },
  partName: String,
  category: String,
  priceAtTime: Number
});

const configurationSchema = new mongoose.Schema({
  cycleName: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  targetAudience: {
    type: String,
    enum: ['Kids', 'Youth', 'Adult', 'Professional'],
    default: 'Adult'
  },
  parts: [configPartSchema],
  totalPrice: { type: Number, default: 0 },
  createdBy: { type: String, default: 'Salesperson' },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Archived'],
    default: 'Active'
  }
}, { timestamps: true });

configurationSchema.pre('save', function(next) {
  this.totalPrice = this.parts.reduce((sum, p) => sum + p.priceAtTime, 0);
  next();
});

module.exports = mongoose.model('Configuration', configurationSchema);
