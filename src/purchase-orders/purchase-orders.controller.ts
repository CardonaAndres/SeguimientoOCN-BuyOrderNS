import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { errorHandler } from 'src/app/handlers/error.handler';
import { PaginationDto } from 'src/app/dtos/pagination.dto';
import { SearchDTO } from 'src/app/dtos/search.dto';
import { ApiResponse } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@Controller('np-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Listado paginado de órdenes de compra nacionales.' })
  async findAll(@Query() pagination: PaginationDto) {
    try {
      return await this.purchaseOrdersService.getAll(pagination)
    } catch (err) {
      errorHandler(err);
    }
  }

  @Get('/search')
  @ApiResponse({ status: 200, description: 'Listado filtrado de órdenes de compra nacionales.' })
  async findOrders(@Query() filters: SearchDTO){
    try {
      return await this.purchaseOrdersService.searchNpo(filters);
    } catch (err) {
      errorHandler(err);
    }
  }

  @Get('/one/items/:consec_docto')
  @ApiResponse({ status: 200, description: 'Listado de los items de una órden de compra nacional.' })
  async findItemsByOrder(@Param('consec_docto') id: string){
    try {
      return await this.purchaseOrdersService.getOrderItems(id);
    } catch (err) {
      errorHandler(err);
    }
  }

}
