import { Router } from 'express';
import auth from '../middleware/auth';
import { getDashboard } from '../controllers/dashboardControlle';

const router = Router();

router.get('/', auth, getDashboard);

export default router;
