import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/app/database/database.service';
import { PaginationDto } from 'src/app/dtos/pagination.dto';
import * as queries from './queries/queries';
import * as mssql from 'mssql';
import { UtilClass } from 'src/purchase-orders/utils/util';

@Injectable()
export class SuppliersService {
  constructor(private readonly dbService: DatabaseService){}

  async getAllSuppliers(pagination: PaginationDto){
    const conn = await this.dbService.connect(process.env.DB_COMP_NAME || 'localhost'); 
    const results = await conn?.request()
      .input('page', mssql.Int, pagination.page)
      .input('limit', mssql.Int, pagination.limit)
      .query(`USE UNOEE ${queries.getAllSuppliers} ORDER BY RazonSocial
       OFFSET (@page - 1) * @limit ROWS FETCH NEXT @limit ROWS ONLY;
      `);

    const totalResults = await conn?.request().query(`
      SELECT COUNT(*) AS totalSuppliers FROM (${queries.getAllSuppliers}) AS sub
    `);

    results?.recordset.map(supplier => supplier.emails =  UtilClass.parseEmailList(supplier.EmailsString));

    return {
      message: 'Tarea ejecutada correctamente',
      results: results?.recordset,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total: totalResults?.recordset[0].totalSuppliers,
        totalPages: Math.ceil((totalResults?.recordset[0].totalSuppliers || 0) / pagination.limit)
      }
    }
  }

  
}
