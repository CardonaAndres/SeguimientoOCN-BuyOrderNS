import { Module } from '@nestjs/common';
import { UsersAllowedService } from './users-allowed.service';
import { UsersAllowedController } from './users-allowed.controller';

@Module({
  controllers: [UsersAllowedController],
  providers: [UsersAllowedService],
})
export class UsersAllowedModule {}
