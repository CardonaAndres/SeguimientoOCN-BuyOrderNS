import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { errorHandler } from 'src/app/handlers/error.handler';
import { PaginationDto } from 'src/app/dtos/pagination.dto';
import { SearchDTO } from 'src/app/dtos/search.dto';
import { ApiBearerAuth, ApiResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('np-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener órdenes de compra nacionales',
    description: 'Devuelve un listado paginado de todas las órdenes de compra nacionales registradas.',
  })
  @ApiResponse({ status: 200, description: 'Listado paginado de órdenes de compra nacionales.' })
  async findAll(@Query() pagination: PaginationDto) {
    try {
      return await this.purchaseOrdersService.getAll(pagination);
    } catch (err) {
      errorHandler(err);
    }
  }

  @Get('/search')
  @ApiOperation({
    summary: 'Buscar órdenes de compra nacionales',
    description: 'Permite filtrar las órdenes de compra nacionales según criterios de búsqueda.',
  })
  @ApiResponse({ status: 200, description: 'Listado filtrado de órdenes de compra nacionales.' })
  async findOrders(@Query() filters: SearchDTO) {
    try {
      return await this.purchaseOrdersService.searchNpo(filters);
    } catch (err) {
      errorHandler(err);
    }
  }

  @Get('/one/items/:consec_docto')
  @ApiOperation({
    summary: 'Obtener ítems de una orden de compra nacional',
    description: 'Devuelve el listado completo de ítems asociados a una orden de compra nacional específica.',
  })
  @ApiParam({
    name: 'consec_docto',
    description: 'Consecutivo de la orden de compra nacional',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Listado de los ítems de una orden de compra nacional.' })
  async findItemsByOrder(@Param('consec_docto') id: string) {
    try {
      return await this.purchaseOrdersService.getOrderItems(id);
    } catch (err) {
      errorHandler(err);
    }
  }

  @Get('/one/item/:itemID')
  @ApiOperation({
    summary: 'Obtener un ítem de una orden de compra nacional',
    description: 'Devuelve la información de un ítem específico dentro de una orden de compra nacional.',
  })
  @ApiParam({
    name: 'itemID',
    description: 'Identificador único del ítem en la orden de compra nacional',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Detalle de un ítem de una orden de compra nacional.' })
  async findItemByID(@Param('itemID') itemID: string) {
    try {
      return await this.purchaseOrdersService.findItemByID(itemID);
    } catch (err) {
      errorHandler(err);
    }
  }
}
