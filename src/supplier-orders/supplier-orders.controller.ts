import { errorHandler } from 'src/app/handlers/error.handler';
import { SupplierOrdersService } from './supplier-orders.service';
import { Controller, Get, Param } from '@nestjs/common';
import { MagicTokenUtil } from 'src/email/utils/magic-token.util';

@Controller('supplier-orders')
export class SupplierOrdersController {
  constructor(private readonly supplierOrdersService: SupplierOrdersService) {}

  @Get('validate/:token')
  async validateToken(@Param('token') token: string) {
    try {
      const { razonSocial } = MagicTokenUtil.verifyToken(token);
      return { valid: true, supplier: razonSocial };
    } catch (err) {
      errorHandler(err)
    }
  }

  @Get('/pending/:token')
  async findAllByToken(@Param('token') token: string) {
    try {
      return await this.supplierOrdersService.findAllNPOByToken(token);
    } catch (err) {
      errorHandler(err);
    }
  }

}
