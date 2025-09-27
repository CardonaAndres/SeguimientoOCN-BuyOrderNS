import mssql from 'mssql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UtilClass } from 'src/app/utils/util';
import { DatabaseService } from 'src/app/database/database.service';
import * as npoQueries from '../purchase-orders/queries/npo.queries';
import { SupplierRequest } from './interfaces/supplier-request.interface';
import { SendCommentDTO } from './dto/send-comment.dto';

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

  async sendComment(comment: SendCommentDTO, req: SupplierRequest){
    const { razonSocial } = req.supplier;
    const { itemID, messageID, commentText } = comment;

    let conn = await this.dbService.connect(process.env.DB_COMP_NAME || 'localhost');

    const resultsItem = await conn?.request()
      .input('itemID', mssql.VarChar, itemID)
      .input('razonSocial', mssql.VarChar, razonSocial)
      .query(`
        ${npoQueries.getOrdersItems} 
        AND f120_rowid = @itemID
        AND proveedor.f200_razon_social = @razonSocial
      `);

    const itemExist = resultsItem?.recordset[0];

    if(!itemExist)
      throw new NotFoundException('El item no ha sido encontrado')

    conn = await this.dbService.connect(process.env.DB_BUYORDER_NAME || 'localhost');

    const resultMessageType = await conn?.request()
    .input('messageID', mssql.Int, messageID)
    .query(`SELECT * FROM buyorder_db.dbo.mensajes WHERE mensaje_id = @messageID`)

    const messageTypeExist = resultMessageType?.recordset[0];

    if(!messageTypeExist)
      throw new NotFoundException('El tipo de mensaje no ha sido encontrado')

    await conn?.request()
    .input('itemID', mssql.VarChar, itemID)
    .input('comment', mssql.VarChar, commentText)
    .input('messageID', mssql.Int, messageID)
    .query(`INSERT INTO buyorder_db.dbo.item_comentarios 
      (item_id, comentario, mensaje_id) VALUES (@itemID, @comment, @messageID)
    `)

    return {
      message: 'Tu comentario ha sido registrado correctamente'
    }
  }
}
