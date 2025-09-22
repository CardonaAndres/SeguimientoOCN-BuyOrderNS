import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { PaginationDto } from 'src/app/dtos/pagination.dto';
import { errorHandler } from 'src/app/handlers/error.handler';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { SearchSuppliersDto } from './dto/search-suppliers.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los proveedores con pendientes',
    description: 'Devuelve un listado paginado de proveedores que tienen órdenes o procesos pendientes.',
  })
  async getAllSuppliers(@Query() pagination: PaginationDto) {
    try {
      return await this.suppliersService.getAllSuppliers(pagination);
    } catch (err) {
      errorHandler(err);
    }
  }

  @Get("/search")
  @ApiOperation({
    summary: 'Buscar proveedores con pendientes',
    description: 'Permite buscar proveedores que tengan órdenes o procesos pendientes, usando criterios de búsqueda.',
  })
  async getSearchSuppliers(@Query() searchSuppliersDto: SearchSuppliersDto){
    try {
       return await this.suppliersService.getSearchSuppliers(searchSuppliersDto);
    } catch (err) {
      errorHandler(err);
    }
  }

}
