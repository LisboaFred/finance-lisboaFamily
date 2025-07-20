import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'] as string | undefined;
  if (!authHeader) {
    res.status(401).json('Você não está autenticado!');
    return;
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET ?? 'Fred1201', (err, decoded) => {
    if (err) {
      res.status(403).json('Token inválido!');
    } else {
      req.user = (decoded as JwtPayload).user;
      next();
    }
  });
};

export default auth;
