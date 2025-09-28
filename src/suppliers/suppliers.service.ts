import * as mssql from 'mssql';
import { Injectable } from '@nestjs/common';
import * as queries from './queries/queries';
import { UtilClass } from 'src/app/utils/util';
import { PaginationDto } from 'src/app/dtos/pagination.dto'
import { SearchSuppliersDto } from './dto/search-suppliers.dto';
import { DatabaseService } from 'src/app/database/database.service';
import * as npoQueries from '../purchase-orders/queries/npo.queries';

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

  async getSupplierOrders(supplier: string){
    const conn = await this.dbService.connect(process.env.DB_COMP_NAME || 'localhost');
    const npos = await conn?.request()
    .input('supplier', mssql.VarChar, supplier)
    .query(`${npoQueries.getAllNpOrders} 
      AND proveedor.f200_razon_social = @supplier
    `);

    npos?.recordset.map(order => order.emails = UtilClass.parseEmailList(order.EmailProveedor));

    return {
      supplierName: supplier,
      npos: npos?.recordset
    }
  }

  async getSuppliersMessages(pagination: PaginationDto){
    const conn = await this.dbService.connect(process.env.DB_BUYORDER_NAME || 'localhost'); 
    const results = await conn?.request()
      .input('page', mssql.Int, pagination.page)
      .input('limit', mssql.Int, pagination.limit)
      .query(`SELECT  
            ic.mensaje_id,
            ic.item_comentario_id,
            ic.item_id,
            ic.comentario,
            FORMAT(ic.fecha, 'yyyy-MM-dd hh:mm:ss tt') AS fecha,
            me.nombre AS tipoMensaje,
            me.descripcion AS descripcionTipoMensaje
        FROM buyorder_db.dbo.item_comentarios ic
        INNER JOIN buyorder_db.dbo.mensajes me 
        ON ic.mensaje_id = me.mensaje_id 
        ORDER BY ic.fecha DESC 
        OFFSET (@page - 1) * @limit ROWS FETCH NEXT @limit ROWS ONLY;
      `);

    const totalResults = await conn?.request()
      .query(`
        SELECT COUNT(*) as total FROM buyorder_db.dbo.item_comentarios ic
        INNER JOIN buyorder_db.dbo.mensajes me ON ic.mensaje_id = me.mensaje_id;
      `);

    return {
      message: 'Los mensajes de nuestros proveedores',
      comments: results?.recordset,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total: totalResults?.recordset[0].total ?? 0,
        totalPages: Math.ceil(totalResults?.recordset[0].total / pagination.limit),
      }
    }
  }

  async getSuppliersMessagesBySearch(searchSupplierMessages: SearchSuppliersDto){
    const { page, limit, value } = searchSupplierMessages;
    const conn = await this.dbService.connect(process.env.DB_BUYORDER_NAME || 'localhost');

    const results = await conn?.request()
    .input('page', mssql.Int, page)
    .input('limit', mssql.Int, limit)
    .input('value', mssql.VarChar, `%${value}%`)
    .query(`
      SELECT  
          ic.mensaje_id,
          ic.item_comentario_id,
          ic.item_id,
          ic.comentario,
          FORMAT(ic.fecha, 'yyyy-MM-dd hh:mm:ss tt') AS fecha,
          me.nombre AS tipoMensaje,
          me.descripcion AS descripcionTipoMensaje
      FROM buyorder_db.dbo.item_comentarios ic
      INNER JOIN buyorder_db.dbo.mensajes me 
          ON ic.mensaje_id = me.mensaje_id 
      WHERE 
          CAST(ic.item_id AS NVARCHAR) LIKE @value OR
          ic.comentario LIKE @value OR
          FORMAT(ic.fecha, 'yyyy-MM-dd hh:mm:ss tt') LIKE @value OR
          me.nombre LIKE @value OR
          me.descripcion LIKE @value
      ORDER BY ic.fecha DESC 
      OFFSET (@page - 1) * @limit ROWS FETCH NEXT @limit ROWS ONLY;
    `);

    const totalResults = await conn?.request()
    .input('value', mssql.VarChar, `%${value}%`)
    .query(`
      SELECT COUNT(*) as total 
      FROM buyorder_db.dbo.item_comentarios ic
      INNER JOIN buyorder_db.dbo.mensajes me 
          ON ic.mensaje_id = me.mensaje_id
      WHERE 
          CAST(ic.item_id AS NVARCHAR) LIKE @value OR
          ic.comentario LIKE @value OR
          FORMAT(ic.fecha, 'yyyy-MM-dd hh:mm:ss tt') LIKE @value OR
          me.nombre LIKE @value OR
          me.descripcion LIKE @value;
    `);

   return {
      message: `Resultados de búsqueda para "${value}"`,
      comments: results?.recordset,
      meta: {
        page,
        limit,
        total: totalResults?.recordset[0].total ?? 0,
        totalPages: Math.ceil(totalResults?.recordset[0].total / limit),
      }
    }
  }

}
