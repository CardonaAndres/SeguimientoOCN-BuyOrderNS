import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports : [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [],
  providers: [AuthGuard],
  exports: [AuthGuard, JwtModule]
})

export class AuthModule {}