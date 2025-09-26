import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UsersAllowedService } from './users-allowed.service';
import { errorHandler } from 'src/app/handlers/error.handler';
import { CreateUsersAllowedDto } from './dto/create-users-allowed.dto';
import { UpdateUsersAllowedDto } from './dto/update-users-allowed.dto';
import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe } from '@nestjs/common';

UseGuards(AuthGuard)
@Controller('users-allowed')
export class UsersAllowedController {
  constructor(private readonly usersAllowedService: UsersAllowedService) {}

  @Get()
  async findAll() {
    try {
      return this.usersAllowedService.findAll();
    } catch (err) {
      errorHandler(err);
    }
  }

  @Post()
  async create(@Body() createUsersAllowedDto: CreateUsersAllowedDto) {
    try {
      return await this.usersAllowedService.create(createUsersAllowedDto);
    } catch (err) {
      errorHandler(err);
    }
  }

  @Patch(':userID')
  async update(
    @Param('userID', ParseIntPipe) userID: number, 
    @Body() updateUsersAllowedDto: UpdateUsersAllowedDto
  ) {
    try {
      return await this.usersAllowedService.update(userID, updateUsersAllowedDto);
    } catch (err) {
      errorHandler(err);
    }
  }
}
