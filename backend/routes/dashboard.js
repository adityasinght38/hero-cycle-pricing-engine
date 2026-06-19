const express = require('express');
const router = express.Router();
const Part = require('../models/Part');
const Configuration = require('../models/Configuration');

router.get('/stats', async (req, res) => {
  try {
    const [totalParts, totalConfigs, activeParts, activeConfigs] = await Promise.all([
      Part.countDocuments(),
      Configuration.countDocuments(),
      Part.countDocuments({ isActive: true }),
      Configuration.countDocuments({ status: 'Active' })
    ]);

    // Category breakdown
    const categoryBreakdown = await Part.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$currentPrice' } } },
      { $sort: { count: -1 } }
    ]);

    // Most expensive configurations
    const topConfigs = await Configuration.find({ status: 'Active' })
      .sort({ totalPrice: -1 })
      .limit(5)
      .select('cycleName totalPrice targetAudience createdAt');

    res.json({
      success: true,
      data: {
        totalParts,
        totalConfigs,
        activeParts,
        activeConfigs,
        categoryBreakdown,
        topConfigs
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
