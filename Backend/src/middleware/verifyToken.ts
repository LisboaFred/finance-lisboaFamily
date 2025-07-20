// src/middleware/verifyToken.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  // Pode estar em minúsculo ou maiúsculo
  const authHeader = req.headers['authorization'];
  // Tem que ser "Bearer <token>", então split e pega a parte 1
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    // Use o mesmo segredo do login!
    const secret = process.env.JWT_SECRET || 'Fred1201';
    const decoded = jwt.verify(token, secret);
    // Guarde o user (pode ser user.id, depende de como assinou no login)
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}
