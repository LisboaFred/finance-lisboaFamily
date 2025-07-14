import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.status(401).send('Access Denied');
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'secretkey') as JwtPayload;
    req.user = decoded.user;
    next();
  } catch (err: any) {
    res.status(400).send('Invalid Token');
  }
};

export default verifyToken;
