const express = require('express');
const router = express.Router();
const Part = require('../models/Part');

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const parts = await Part.find(filter).sort({ category: 1, name: 1 });
    res.json({ success: true, count: parts.length, data: parts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) return res.status(404).json({ success: false, message: 'Part not found' });
    res.json({ success: true, data: part });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const part = new Part(req.body);
    await part.save();
    res.status(201).json({ success: true, data: part });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'SKU already exists' });
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) return res.status(404).json({ success: false, message: 'Part not found' });

    // have to manually push old price before changing it
    // because the pre-save hook runs after the value is already set
    if (req.body.currentPrice !== undefined && Number(req.body.currentPrice) !== part.currentPrice) {
      part.priceHistory.push({
        price: part.currentPrice,
        changedAt: new Date(),
        changedBy: 'admin',
        note: req.body.note || ''
      });
      part.currentPrice = Number(req.body.currentPrice);
    }

    const fields = ['name', 'category', 'description', 'sku', 'isActive'];
    fields.forEach(f => { if (req.body[f] !== undefined) part[f] = req.body[f]; });

    await part.save();
    res.json({ success: true, data: part });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const part = await Part.findByIdAndDelete(req.params.id);
    if (!part) return res.status(404).json({ success: false, message: 'Part not found' });
    res.json({ success: true, message: 'deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id/price-history', async (req, res) => {
  try {
    const part = await Part.findById(req.params.id).select('name currentPrice priceHistory');
    if (!part) return res.status(404).json({ success: false, message: 'Part not found' });
    res.json({ success: true, data: part });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
