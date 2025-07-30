import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

import userRoutes from './routes/User';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/Transaction';
import categoryRoutes from './routes/categories';
import dashboardRoutes from './routes/dashboards';

dotenv.config();

const app: Application = express();

// Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", 'https:'],
      imgSrc:     ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc:    ["'self'", 'https:'],
      objectSrc:  ["'none'"]
    }
  }
}));
app.use(cors({origin: [
    'https://finance-lisboa-family.vercel.app'
  ],
  credentials: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Conexão com MongoDB
mongoose
  .connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/finance_bot')
  .then(() => console.log('MongoDB conectado'))
  .catch((err: Error) => console.error('Erro ao conectar MongoDB:', err.message));

const PORT = process.env.PORT ?? '3000';
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
