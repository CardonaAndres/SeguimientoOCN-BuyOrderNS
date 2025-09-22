import mssql from 'mssql';
import { Injectable } from '@nestjs/common';
import { MagicTokenUtil } from 'src/email/utils/magic-token.util';
import { DatabaseService } from 'src/app/database/database.service';
import * as npoQueries from '../purchase-orders/queries/npo.queries';

@Injectable()
export class SupplierOrdersService {
  constructor(private readonly dbService: DatabaseService){}

  async findAllByToken(token: string) {
    const { razonSocial } = MagicTokenUtil.verifyToken(token);

    const conn = await this.dbService.connect(process.env.DB_COMP_NAME || 'localhost');
    const npos = await conn?.request()
    .input('supplierName', mssql.VarChar, razonSocial)
    .query(`${npoQueries.getAllNpOrders} 
      AND proveedor.f200_razon_social = @supplierName
    `);

    return {
      supplierName: razonSocial,
      npos: npos?.recordset
    }
  }

}
