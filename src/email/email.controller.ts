import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PaginationDto } from 'src/app/dtos/pagination.dto';
import { errorHandler } from 'src/app/handlers/error.handler';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('/logs')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener registros de correos enviados' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página para paginación' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Cantidad de registros por página' })
  @ApiResponse({ status: 200, description: 'Lista de logs de correos obtenida correctamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado. Token inválido o ausente.' })
  async getEmailLogs(@Query() pagination: PaginationDto) {
    try {
      return await this.emailService.getEmailLogs(pagination);
    } catch (err) {
      errorHandler(err);
    }
  }
}
