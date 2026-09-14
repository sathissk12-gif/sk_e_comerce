import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DatabaseStore } from '../data/db';

export const JWT_SECRET =
  process.env.JWT_SECRET || 'homely_super_secure_jwt_secret_festive_2026_key!#';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const db = DatabaseStore.getInstance();
      const user = db.users.find(u => u.id === decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User account no longer exists');
      }

      // Attach sanitized user to request (strip passwordHash)
      const { passwordHash, ...safeUser } = user;
      request.user = safeUser;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }
}
