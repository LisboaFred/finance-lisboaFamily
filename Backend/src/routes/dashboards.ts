import { Router } from 'express';
import auth from '../middleware/auth';
import { getDashboard, getRecentTransactions } from '../controllers/dashboardControlle';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

router.get('/', verifyToken, getDashboard);
router.get('/recent', verifyToken, getRecentTransactions);

export default router;
