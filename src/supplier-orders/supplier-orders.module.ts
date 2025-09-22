import { Module } from '@nestjs/common';
import { SupplierOrdersService } from './supplier-orders.service';
import { SupplierOrdersController } from './supplier-orders.controller';

@Module({
  controllers: [SupplierOrdersController],
  providers: [SupplierOrdersService],
})
export class SupplierOrdersModule {}
