import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PaginationDto } from 'src/app/dtos/pagination.dto';
import { errorHandler } from 'src/app/handlers/error.handler';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('/logs')
  @UseGuards(AuthGuard)
  async getEmailLogs(@Query() pagination: PaginationDto) {
    try {
      return await this.emailService.getEmailLogs(pagination)
    } catch (err) {
      errorHandler(err);
    }
  }

}
