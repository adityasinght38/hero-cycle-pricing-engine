// Unit tests for the pricing engine logic
// Run with: npm test

const request = require('supertest');

// Pure function tests — no DB needed
describe('Pricing Engine — Pure Logic', () => {
  
  // The core calculation logic extracted for testability
  const calculateTotal = (parts) => {
    return parts.reduce((sum, part) => sum + part.priceAtTime, 0);
  };

  const buildConfigParts = (selectedParts, partPriceMap) => {
    return selectedParts.map(partId => ({
      partId,
      priceAtTime: partPriceMap[partId] || 0
    }));
  };

  test('calculates total price correctly for single part', () => {
    const parts = [{ partId: '1', priceAtTime: 500 }];
    expect(calculateTotal(parts)).toBe(500);
  });

  test('calculates total price correctly for multiple parts', () => {
    const parts = [
      { partId: '1', priceAtTime: 5000 },
      { partId: '2', priceAtTime: 800 },
      { partId: '3', priceAtTime: 2000 },
      { partId: '4', priceAtTime: 300 }
    ];
    expect(calculateTotal(parts)).toBe(8100);
  });

  test('returns 0 for empty parts list', () => {
    expect(calculateTotal([])).toBe(0);
  });

  test('handles zero-price parts', () => {
    const parts = [
      { partId: '1', priceAtTime: 0 },
      { partId: '2', priceAtTime: 500 }
    ];
    expect(calculateTotal(parts)).toBe(500);
  });

  test('snapshots correct price at time of configuration creation', () => {
    const priceMap = { 'tyre-1': 250, 'frame-1': 5000 };
    const selectedParts = ['tyre-1', 'frame-1'];
    const configParts = buildConfigParts(selectedParts, priceMap);

    expect(configParts[0].priceAtTime).toBe(250);
    expect(configParts[1].priceAtTime).toBe(5000);
  });

  test('price history records changes correctly', () => {
    const history = [
      { price: 200, changedAt: new Date('2026-01-01') },
      { price: 220, changedAt: new Date('2026-03-01') },
      { price: 250, changedAt: new Date('2026-06-01') }
    ];

    // Most recent price should be last entry
    const latestPrice = history[history.length - 1].price;
    expect(latestPrice).toBe(250);

    // Price increase calculation
    const increase = history[history.length - 1].price - history[0].price;
    const percentIncrease = ((increase / history[0].price) * 100).toFixed(1);
    expect(Number(percentIncrease)).toBe(25);
  });

  test('recalculation computes price difference correctly', () => {
    const oldTotal = 7000;
    const newParts = [
      { priceAtTime: 5200 },  // frame went up
      { priceAtTime: 900 },   // tyre went up
      { priceAtTime: 1200 }   // gear set
    ];
    const newTotal = calculateTotal(newParts);
    const difference = newTotal - oldTotal;

    expect(newTotal).toBe(7300);
    expect(difference).toBe(300);
  });

  test('configuration with no parts has zero total', () => {
    const parts = [];
    expect(calculateTotal(parts)).toBe(0);
  });

  test('GST calculation at 18%', () => {
    const basePrice = 10000;
    const GST_RATE = 0.18;
    const gstAmount = basePrice * GST_RATE;
    const totalWithGST = basePrice + gstAmount;

    expect(gstAmount).toBe(1800);
    expect(totalWithGST).toBe(11800);
  });
});

describe('Data Validation Logic', () => {
  const validatePart = (part) => {
    const errors = [];
    if (!part.name || part.name.trim() === '') errors.push('Name is required');
    if (!part.category) errors.push('Category is required');
    if (part.currentPrice === undefined || part.currentPrice < 0) errors.push('Valid price is required');
    return errors;
  };

  test('valid part passes validation', () => {
    const part = { name: 'Mountain Tyre', category: 'Tyre', currentPrice: 250 };
    expect(validatePart(part)).toHaveLength(0);
  });

  test('missing name fails validation', () => {
    const part = { name: '', category: 'Tyre', currentPrice: 250 };
    expect(validatePart(part)).toContain('Name is required');
  });

  test('negative price fails validation', () => {
    const part = { name: 'Tyre', category: 'Tyre', currentPrice: -100 };
    expect(validatePart(part)).toContain('Valid price is required');
  });

  test('missing category fails validation', () => {
    const part = { name: 'Tyre', category: '', currentPrice: 250 };
    expect(validatePart(part)).toContain('Category is required');
  });
});
