const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: String, default: 'admin' },
  note: { type: String, default: '' }
});

const partSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Frame', 'Tyre', 'Gear Set', 'Seat', 'Brakes', 'Handlebar', 'Pedal', 'Chain', 'Wheel', 'Other']
  },
  description: { type: String, default: '' },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  sku: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: true },
  priceHistory: [priceHistorySchema]
}, { timestamps: true });

// whenever price changes, log the old value before overwriting
// note: on first save (isNew) we also push so history always has at least one entry
partSchema.pre('save', function(next) {
  if (this.isNew) {
    this.priceHistory.push({
      price: this.currentPrice,
      changedAt: new Date(),
      changedBy: 'system',
      note: 'initial price'
    });
  } else if (this.isModified('currentPrice')) {
    this.priceHistory.push({
      price: this.currentPrice,
      changedAt: new Date(),
      changedBy: 'admin'
    });
  }
  next();
});

module.exports = mongoose.model('Part', partSchema);
