import mssql from 'mssql';
import { Injectable } from '@nestjs/common';
import { UtilClass } from 'src/app/utils/util';
import { DatabaseService } from 'src/app/database/database.service';
import * as npoQueries from '../purchase-orders/queries/npo.queries';
import { SupplierRequest } from './interfaces/supplier-request.interface';

@Injectable()
export class SupplierOrdersService {
  constructor(private readonly dbService: DatabaseService){}

  async findAllNPOByToken(req: SupplierRequest) {
    const { razonSocial } = req.supplier;

    const conn = await this.dbService.connect(process.env.DB_COMP_NAME || 'localhost');
    const npos = await conn?.request()
    .input('supplierName', mssql.VarChar, razonSocial)
    .query(`${npoQueries.getAllNpOrders} 
      AND proveedor.f200_razon_social = @supplierName
    `);

    npos?.recordset.map(order => order.emails = UtilClass.parseEmailList(order.EmailProveedor));

    return {
      supplierName: razonSocial,
      npos: npos?.recordset
    }
  }

  async getNpoItems(id: string) {
      const conn = await this.dbService.connect(process.env.DB_COMP_NAME || 'localhost');
      const resultsItems = await conn?.request()
       .input('consecDocto', mssql.VarChar, id)
       .query(`
         ${npoQueries.getOrdersItems} AND t_docto.f420_consec_docto = @consecDocto 
         ORDER BY items.f120_referencia;
       `);
    
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
