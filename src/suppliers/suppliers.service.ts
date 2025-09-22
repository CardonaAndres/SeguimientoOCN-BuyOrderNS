import * as mssql from 'mssql';
import * as queries from './queries/queries';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/app/database/database.service';
import { PaginationDto } from 'src/app/dtos/pagination.dto'
import { UtilClass } from 'src/app/utils/util';
import { SearchSuppliersDto } from './dto/search-suppliers.dto';

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

  async getSearchSuppliers(searchSuppliersDto: SearchSuppliersDto){
    const conn = await this.dbService.connect(process.env.DB_COMP_NAME || 'localhost'); 
    const results = await conn?.request()
     .input('page', mssql.Int, searchSuppliersDto.page)
     .input('limit', mssql.Int, searchSuppliersDto.limit)
     .input('value', mssql.VarChar, searchSuppliersDto.value)
     .query(`USE UNOEE ${queries.getAllSuppliers} 
        AND ( cto.f015_email LIKE '%' + @value + '%' OR 
         proveedor.f200_razon_social LIKE '%' + @value + '%' )
        ORDER BY RazonSocial OFFSET (@page - 1) * @limit ROWS FETCH NEXT @limit ROWS ONLY;
    `);

    const totalResults = await conn?.request()
     .input('value', mssql.VarChar, searchSuppliersDto.value)
     .query(`SELECT COUNT(*) AS totalSuppliers FROM (
        ${queries.getAllSuppliers} AND ( 
          cto.f015_email LIKE '%' + @value + '%' 
          OR proveedor.f200_razon_social LIKE '%' + @value + '%'
         )) AS sub
    `);

    results?.recordset.map(supplier => supplier.emails =  UtilClass.parseEmailList(supplier.EmailsString));

    return {
      message: 'Tarea ejecutada correctamente',
      results: results?.recordset,
      meta: {
        page: searchSuppliersDto.page,
        limit: searchSuppliersDto.limit,
        total: totalResults?.recordset[0].totalSuppliers,
        totalPages: Math.ceil((totalResults?.recordset[0].totalSuppliers || 0) / searchSuppliersDto.limit)
      }
    }
  }
}
