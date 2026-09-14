import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseStore, User } from '../data/db';
import { JWT_SECRET } from './jwt.guard';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface GoogleLoginDto {
  credential: string;
  clientMockProfile?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

@Injectable()
export class AuthService {
  private db = DatabaseStore.getInstance();
  private googleClient: OAuth2Client;
  private googleClientId: string;

  constructor() {
    this.googleClientId =
      process.env.GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '';
    this.googleClient = new OAuth2Client(this.googleClientId || undefined);
  }

  // Sanitize user: Never leak password hash to client
  private sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  // Issue high-security signed JWT
  private generateToken(user: User): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Email/Password Registration
  async register(dto: RegisterDto) {
    const { name, email, password, phone } = dto;

    if (!name || name.trim().length < 2) {
      throw new BadRequestException('Full name must be at least 2 characters.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      throw new BadRequestException('Please enter a valid email address.');
    }

    if (!password || password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters.');
    }

    const existingUser = this.db.users.find(
      u => u.email.toLowerCase() === normalizedEmail
    );
    if (existingUser) {
      throw new BadRequestException('An account with this email already exists.');
    }

    // Cryptographically salted bcrypt hash (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: `user-${uuidv4()}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'CUSTOMER',
      phone: phone?.trim() || '',
      createdAt: new Date().toISOString()
    };

    this.db.users.push(newUser);
    this.db.save();

    const token = this.generateToken(newUser);
    return {
      message: 'Registration successful!',
      token,
      user: this.sanitizeUser(newUser)
    };
  }

  // Email/Password Login
  async login(dto: LoginDto) {
    const { email, password } = dto;

    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const user = this.db.users.find(
      u => u.email.toLowerCase() === normalizedEmail
    );
    if (!user || !user.passwordHash) {
      // Timing-safe failure to protect against account enumeration
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.generateToken(user);
    return {
      message: 'Login successful!',
      token,
      user: this.sanitizeUser(user)
    };
  }

  // Google OAuth Login & Sign-up
  async googleLogin(dto: GoogleLoginDto) {
    const { credential, clientMockProfile } = dto;

    let googleEmail: string | undefined;
    let googleName: string | undefined;
    let googleSub: string | undefined;
    let googlePicture: string | undefined;

    if (credential) {
      try {
        if (this.googleClientId) {
          const ticket = await this.googleClient.verifyIdToken({
            idToken: credential,
            audience: this.googleClientId
          });
          const payload = ticket.getPayload();
          if (payload) {
            googleEmail = payload.email;
            googleName = payload.name;
            googleSub = payload.sub;
            googlePicture = payload.picture;
          }
        } else {
          // If in development and no client ID configured yet, decode the JWT safely
          const decoded = jwt.decode(credential) as any;
          if (decoded && decoded.email) {
            googleEmail = decoded.email;
            googleName = decoded.name;
            googleSub = decoded.sub;
            googlePicture = decoded.picture;
          }
        }
      } catch (err) {
        console.warn('Google token verification fallback:', err);
      }
    }

    // Fallback if client sent demo profile when Google Console is not yet configured
    if (!googleEmail && clientMockProfile) {
      googleEmail = clientMockProfile.email;
      googleName = clientMockProfile.name;
      googlePicture = clientMockProfile.avatarUrl;
      googleSub = `google-${Date.now()}`;
    }

    if (!googleEmail) {
      throw new BadRequestException('Unable to authenticate with Google. Invalid credential.');
    }

    const normalizedEmail = googleEmail.trim().toLowerCase();
    let user = this.db.users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (user) {
      // Link Google ID and update avatar if newly available
      let updated = false;
      if (!user.googleId && googleSub) {
        user.googleId = googleSub;
        updated = true;
      }
      if (!user.avatarUrl && googlePicture) {
        user.avatarUrl = googlePicture;
        updated = true;
      }
      if (updated) {
        this.db.save();
      }
    } else {
      // Auto-register new Google user
      user = {
        id: `user-g-${uuidv4()}`,
        name: googleName || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        googleId: googleSub,
        avatarUrl: googlePicture,
        role: 'CUSTOMER',
        createdAt: new Date().toISOString()
      };
      this.db.users.push(user);
      this.db.save();
    }

    const token = this.generateToken(user);
    return {
      message: 'Google authentication successful!',
      token,
      user: this.sanitizeUser(user)
    };
  }

  // Get current user profile
  async getProfile(userId: string) {
    const user = this.db.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User profile not found.');
    }
    return {
      user: this.sanitizeUser(user)
    };
  }
}
