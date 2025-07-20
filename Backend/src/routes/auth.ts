import { Router } from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth';
import {
  register,
  login,
  getProfile,
} from '../controllers/authController';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').exists().withMessage('Senha é obrigatória'),
  ],
  login
);

router.get('/profile', auth, getProfile);

export default router;
