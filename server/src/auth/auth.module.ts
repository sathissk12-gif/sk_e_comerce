import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { AdminGuard } from './admin.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, AdminGuard],
  exports: [AuthService, JwtAuthGuard, AdminGuard]
})
export class AuthModule {}
