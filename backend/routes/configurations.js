const express = require('express');
const router = express.Router();
const Configuration = require('../models/Configuration');
const Part = require('../models/Part');

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const configs = await Configuration.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: configs.length, data: configs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const config = await Configuration.findById(req.params.id);
    if (!config) return res.status(404).json({ success: false, message: 'not found' });
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { cycleName, description, targetAudience, partIds, createdBy } = req.body;

    if (!partIds || partIds.length === 0) {
      return res.status(400).json({ success: false, message: 'select at least one part' });
    }

    const parts = await Part.find({ _id: { $in: partIds }, isActive: true });
    if (parts.length !== partIds.length) {
      return res.status(400).json({ success: false, message: 'one or more parts not found' });
    }

    // snapshot prices now — so this config isn't affected by future price changes
    const configParts = parts.map(p => ({
      partId: p._id,
      partName: p.name,
      category: p.category,
      priceAtTime: p.currentPrice
    }));

    const config = new Configuration({ cycleName, description, targetAudience, parts: configParts, createdBy });
    await config.save();
    res.status(201).json({ success: true, data: config });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const config = await Configuration.findById(req.params.id);
    if (!config) return res.status(404).json({ success: false, message: 'not found' });

    ['cycleName', 'description', 'targetAudience', 'status'].forEach(f => {
      if (req.body[f] !== undefined) config[f] = req.body[f];
    });

    await config.save();
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const config = await Configuration.findByIdAndDelete(req.params.id);
    if (!config) return res.status(404).json({ success: false, message: 'not found' });
    res.json({ success: true, message: 'deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// refresh a saved config with latest part prices
// useful when you want to re-quote at current prices
router.post('/:id/recalculate', async (req, res) => {
  try {
    const config = await Configuration.findById(req.params.id);
    if (!config) return res.status(404).json({ success: false, message: 'not found' });

    const oldTotal = config.totalPrice;

    const partIds = config.parts.map(p => p.partId);
    const freshParts = await Part.find({ _id: { $in: partIds } });
    const priceMap = Object.fromEntries(freshParts.map(p => [p._id.toString(), p.currentPrice]));

    config.parts = config.parts.map(p => ({
      ...p.toObject(),
      priceAtTime: priceMap[p.partId.toString()] ?? p.priceAtTime
    }));

    await config.save();

    res.json({
      success: true,
      data: config,
      oldTotal,
      newTotal: config.totalPrice,
      difference: config.totalPrice - oldTotal
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
