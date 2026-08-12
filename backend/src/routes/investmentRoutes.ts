import express from 'express';
import { getInvestments, getInvestmentById } from '../controllers/investmentController.js';

const router = express.Router();

router.get('/', getInvestments);
router.get('/:id', getInvestmentById);

export default router;
