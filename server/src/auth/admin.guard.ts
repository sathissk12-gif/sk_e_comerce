import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DatabaseStore } from '../data/db';
import { JWT_SECRET } from './jwt.guard';

export const AUTHORIZED_ADMIN_EMAILS: string[] = [
  'skenterprise2k21@gmail.com',
  'sathissk12@gmail.com'
];

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token required for Administrator access');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const db = DatabaseStore.getInstance();
      const user = db.users.find(u => u.id === decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Administrator account not found');
      }

      const email = user.email?.trim().toLowerCase();
      if (!isAuthorizedAdminEmail(email)) {
        throw new ForbiddenException(
          `Access Denied: Only authorized administrators (${AUTHORIZED_ADMIN_EMAILS.join(', ')}) have permission to access the Admin system.`
        );
      }

      const { passwordHash, ...safeUser } = user;
      request.user = safeUser;
      return true;
    } catch (err) {
      if (err instanceof ForbiddenException || err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired Administrator session');
    }
  }
}
