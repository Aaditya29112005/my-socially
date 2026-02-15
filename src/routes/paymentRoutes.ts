import express, { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Webhook must use express.raw for signature verification
// This is handled in server.ts for this specific path
router.post('/webhook', express.raw({ type: 'application/json' }), PaymentController.handleWebhook);

// Protected payment routes
router.use(protect);
router.post('/checkout', PaymentController.createCheckout);
router.post('/refund', PaymentController.triggerRefund);

export default router;
