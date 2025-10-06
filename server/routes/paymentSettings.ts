import { Router } from 'express';

const router = Router();

// In-memory payment settings (replace with DB in future)
let paymentSettings = {
  manualPayment: true,
  bkashPayment: false,
};

// GET current payment settings
router.get('/', (req, res) => {
  res.json(paymentSettings);
});

// POST update payment settings
router.post('/', (req, res) => {
  const { manualPayment, bkashPayment } = req.body;
  if (typeof manualPayment === 'boolean') paymentSettings.manualPayment = manualPayment;
  if (typeof bkashPayment === 'boolean') paymentSettings.bkashPayment = bkashPayment;
  res.json(paymentSettings);
});

export default router; 