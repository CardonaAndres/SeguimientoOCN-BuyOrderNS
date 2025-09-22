import * as mssql from 'mssql';
import * as queries from './queries/npo.queries';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/app/database/database.service';
import { PaginationDto } from 'src/app/dtos/pagination.dto';
import { SearchDTO } from 'src/app/dtos/search.dto';
import { Time } from 'src/app/types/global.types';
import { UtilClass } from '../app/utils/util';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly dbService: DatabaseService){}

  async getAll(pagination: PaginationDto){
    const conn = await this.dbService.connect(process.env.DB_COMP_NAME || 'localhost');

    const results = await conn?.request()
     .input('page', mssql.Int, pagination.page)
     .input('limit', mssql.Int, pagination.limit)
     .query(`${queries.getAllNpOrders} 
       ORDER BY t_docto.f420_consec_docto 
       OFFSET (@page - 1) * @limit ROWS FETCH NEXT @limit ROWS ONLY;
      `);

    results?.recordset.map(order => order.emails = UtilClass.parseEmailList(order.EmailProveedor));

    const npoTotal = await conn?.request().query(`${queries.getTotalNpOrders}`);

    return {
      results: results?.recordset,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total: npoTotal?.recordset[0].totalNPO,
        totalPages: Math.ceil((npoTotal?.recordset[0].totalNPO || 0) / pagination.limit)
      }
    }
  }

  async searchNpo(filters: SearchDTO){
    let where = '';
    const params: Record<string, any> = {};
    const { page, limit, ...queryFilters } = filters;
    
    const allEmpty = Object.values(queryFilters).every(value => {
      if (value === undefined || value === null) return true;
      if (typeof value === 'string' && value.trim() === '') return true;
      if (Array.isArray(value) && value.length === 0) return true;
      return false;
    });

    if(allEmpty) throw new BadRequestException('No se han proporcionado filtros.');

    const buildDateFilter = (field: string, paramName: string, date?: Date, type?: Time) => {
      if (!date || !type) return '';
      const sign = type === 'before' ? '<=' : '>=';
      params[paramName] = date.toISOString().split('T')[0];
      return ` AND CAST(${field} AS DATE) ${sign} @${paramName}`;
    };

    where += buildDateFilter(
      't_docto.f420_fecha', 
      'orderDate', 
      queryFilters.orderDate, 
      queryFilters.orderDateType
    );

    where += buildDateFilter(
      't_ord_movto.f421_fecha_entrega', 
      'arrivalDate', 
      queryFilters.arrivalDate, 
      queryFilters.arrivalDateType
    );

    if (queryFilters.value) {
      params['value'] = `%${queryFilters.value.trim()}%`;
      where += `
        AND (
          t_docto.f420_consec_docto LIKE @value OR proveedor.f200_id LIKE @value OR
          proveedor.f200_razon_social LIKE @value OR contacto.f015_email LIKE @value
        )
      `;
    }

    const conn = await this.dbService.connect(process.env.DB_COMP_NAME || 'localhost');
    const request = conn?.request();
    const totalRequest = conn?.request();

    for (const [key, val] of Object.entries(params)) {
      request?.input(key, val);
      totalRequest?.input(key, val);
    }

    request?.input('page', mssql.Int, page).input('limit', mssql.Int, limit)

    const npoTotal = await totalRequest?.query(queries.getTotalNpOrders.replace('/**MORE_WHERE_CLAUSE**/', where));
    const results = await request?.query(`
      ${queries.getAllNpOrders} 
      ${where} 
      ORDER BY FechaEntrega ASC
      OFFSET (@page - 1) * @limit ROWS FETCH NEXT @limit ROWS ONLY;
    `);

    return {
      message: 'Ordenes de compra encontradas',
      results: results?.recordset,
      meta: {
        page,
        limit,
        total: npoTotal?.recordset[0].totalNPO ?? 0,
        totalPages: Math.ceil((npoTotal?.recordset[0].totalNPO || 0) / limit)
      }
    }
  }

  async getOrderItems(id: string){
    const conn = await this.dbService.connect(process.env.DB_COMP_NAME || 'localhost');
    const resultsItems = await conn?.request()
    .input('consecDocto', mssql.VarChar, id)
    .query(`${queries.getOrdersItems} AND t_docto.f420_consec_docto = @consecDocto ORDER BY items.f120_referencia;`);

    resultsItems?.recordset.map(item => {
      item.Referencia = item.Referencia.trim();
      item.CodigoProveedor = item.CodigoProveedor.trim();
      item.CodigoBodega = item.CodigoBodega.trim();
      item.emails = UtilClass.parseEmailList(item.EmailProveedor)
    });

    return {
      message: `Todos los items de la orden: ${id}`,
      items: resultsItems?.recordset,
      meta: {
        total: resultsItems?.recordset.length
      }
    }
  }

}
