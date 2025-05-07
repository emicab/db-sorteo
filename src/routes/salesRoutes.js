import express from 'express';
import { getSaleByPaymentId, getSales } from '../controllers/salesController.js';

const router = express.Router();

router.get('/:raffleId', getSales)
router.get('/payment/:paymentId', getSaleByPaymentId)


export default router;