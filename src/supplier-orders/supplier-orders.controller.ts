import { errorHandler } from 'src/app/handlers/error.handler';
import { SupplierOrdersService } from './supplier-orders.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('supplier-orders')
export class SupplierOrdersController {
  constructor(private readonly supplierOrdersService: SupplierOrdersService) {}

  @Get('/:token')
  findAllByToken(@Param('token') token: string) {
    try {
      return this.supplierOrdersService.findAllByToken(token);
    } catch (err) {
      errorHandler(err);
    }
  }

}
