import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { errorHandler } from 'src/app/handlers/error.handler';
import { PaginationDto } from 'src/app/dtos/pagination.dto';
import { SearchDTO } from 'src/app/dtos/search.dto';

@UseGuards(AuthGuard)
@Controller('np-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    try {
      return await this.purchaseOrdersService.getAll(pagination)
    } catch (err) {
      errorHandler(err);
    }
  }

  @Get('/search')
  async findOrders(@Query() filters: SearchDTO){
    try {
      return await this.purchaseOrdersService.searchNpo(filters);
    } catch (err) {
      errorHandler(err);
    }
  }

}
